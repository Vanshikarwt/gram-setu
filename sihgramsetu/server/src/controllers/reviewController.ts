import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middlewares/auth';

/**
 * POST /api/reviews
 * Consumer submits a review for a completed booking.
 * Guards:
 *   - User must be the consumer of the booking (403)
 *   - Booking must be 'completed' (400)
 *   - Booking must not already have a review (400)
 *   - Rating must be 1 – 5 (400)
 */
export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const consumerId = req.user?.id;
    if (!consumerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { bookingId, rating, comment } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required' });
    }

    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
    }

    // Fetch booking
    const booking = await prisma.booking.findUnique({
      where: { id: String(bookingId).trim() },
      include: { review: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Security Check 1: must be the consumer
    if (booking.consumerId !== consumerId) {
      return res.status(403).json({ error: 'Forbidden: You did not make this booking' });
    }

    // Security Check 2: booking must be completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        error: `Cannot review this booking: status is '${booking.status}'. Only 'completed' bookings can be reviewed.`,
      });
    }

    // Security Check 3: no duplicate review
    if (booking.review) {
      return res.status(400).json({ error: 'You have already submitted a review for this booking' });
    }

    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        listingId: booking.listingId,
        consumerId,
        rating: numericRating,
        comment: comment ? String(comment).trim() : null,
      },
      include: {
        consumer: { select: { id: true, name: true } },
        listing: { select: { id: true, title: true } },
      },
    });

    return res.status(201).json({
      message: 'Review submitted successfully',
      review,
    });
  } catch (err: any) {
    console.error('Create Review Error:', err);
    return res.status(500).json({ error: 'Server error submitting review' });
  }
};

/**
 * GET /api/listings/:id/reviews
 * Fetch all reviews for a specific listing, ordered newest-first.
 * Includes consumer name for display.
 * Public endpoint — no auth required.
 */
export const getListingReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify listing exists
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const reviews = await prisma.review.findMany({
      where: { listingId: id },
      include: {
        consumer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ reviews });
  } catch (err: any) {
    console.error('Get Listing Reviews Error:', err);
    return res.status(500).json({ error: 'Server error fetching reviews' });
  }
};
