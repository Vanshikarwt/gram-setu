import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middlewares/auth';
import { decrementListingStock } from './listingController';

const VALID_METHODS = ['UPI', 'Card', 'Cash'];

/**
 * POST /api/payments/checkout
 * Mock payment gateway — verifies booking is 'accepted', atomically creates
 * a Transaction and flips the Booking status to 'paid'.
 */
export const checkout = async (req: AuthRequest, res: Response) => {
  try {
    const consumerId = req.user?.id;
    if (!consumerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { bookingId, method } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required' });
    }

    if (!method || !VALID_METHODS.includes(String(method).trim())) {
      return res.status(400).json({ error: "method must be one of: 'UPI', 'Card', 'Cash'" });
    }

    // Fetch booking from DB
    const booking = await prisma.booking.findUnique({
      where: { id: String(bookingId).trim() },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Security: only the consumer who made the booking can pay
    if (booking.consumerId !== consumerId) {
      return res.status(403).json({ error: 'Forbidden: This booking does not belong to you' });
    }

    // Booking must be in 'accepted' state to be payable
    if (booking.status !== 'accepted') {
      return res.status(400).json({
        error: `Cannot process payment: booking status is '${booking.status}'. Only 'accepted' bookings can be paid.`,
      });
    }

    // Atomic operation: create Transaction + update Booking status to 'paid'
    const [transaction, _updatedBooking] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalPrice, // server-side amount — never trust client
          method: String(method).trim(),
          status: 'success',
        },
        include: {
          booking: {
            include: {
              listing: true,
              consumer: { select: { id: true, name: true, phone: true } },
              provider: { select: { id: true, name: true, phone: true } },
            },
          },
        },
      }),
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'paid' },
      }),
    ]);

    // After payment, decrement stock for agri_product / crop_residue listings
    const paidListing = transaction.booking.listing;
    if (paidListing && (paidListing.type === 'agri_product' || paidListing.type === 'crop_residue')) {
      await decrementListingStock(paidListing.id, booking.quantity);
    }

    return res.status(201).json({
      message: 'Payment processed successfully',
      transaction,
    });
  } catch (err: any) {
    console.error('Checkout Error:', err);
    return res.status(500).json({ error: 'Server error processing payment' });
  }
};

/**
 * GET /api/payments/history
 * Returns all transactions where the user is either consumer or provider of the booking.
 */
export const getPaymentHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        booking: {
          OR: [
            { consumerId: userId },
            { providerId: userId },
          ],
        },
      },
      include: {
        booking: {
          include: {
            listing: true,
            consumer: { select: { id: true, name: true, phone: true } },
            provider: { select: { id: true, name: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      transactions,
    });
  } catch (err: any) {
    console.error('Payment History Error:', err);
    return res.status(500).json({ error: 'Server error fetching payment history' });
  }
};
