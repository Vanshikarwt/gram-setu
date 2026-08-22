import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middlewares/auth';

/**
 * Create a new booking request (Consumer side).
 * Securely fetches Listing to calculate totalPrice (quantity * listing.price) and set providerId.
 */
export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const consumerId = req.user?.id;
    if (!consumerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { listingId, startDate, endDate, dates, quantity, hours, days, bookingType } = req.body;

    if (!listingId || (!startDate && (!dates || !dates.length))) {
      return res.status(400).json({ error: 'Required fields missing: listingId, startDate or dates' });
    }

    // Fetch listing from DB
    const listing = await prisma.listing.findUnique({
      where: { id: String(listingId).trim() },
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ error: 'Listing is currently inactive and cannot be booked' });
    }

    // Self-booking prevention
    if (listing.providerId === consumerId) {
      return res.status(400).json({ error: 'You cannot book your own listing' });
    }

    // Process dates
    let datesList: string[] = [];
    if (Array.isArray(dates) && dates.length > 0) {
      datesList = dates.map((d: any) => new Date(d).toISOString().split('T')[0]).filter(Boolean);
    } else if (startDate) {
      const sDateStr = new Date(startDate).toISOString().split('T')[0];
      const eDateStr = endDate ? new Date(endDate).toISOString().split('T')[0] : sDateStr;
      if (sDateStr === eDateStr) {
        datesList = [sDateStr];
      } else {
        const cur = new Date(sDateStr);
        const end = new Date(eDateStr);
        while (cur <= end) {
          datesList.push(cur.toISOString().split('T')[0]);
          cur.setDate(cur.getDate() + 1);
        }
      }
    }

    if (datesList.length === 0) {
      return res.status(400).json({ error: 'Invalid date selection' });
    }

    const firstDateObj = new Date(datesList[0]);
    const lastDateObj = new Date(datesList[datesList.length - 1]);

    // Determine booking type & server calculation
    let isHourly = false;
    if (datesList.length === 1) {
      isHourly = true;
    } else {
      isHourly = bookingType === 'hourly';
    }

    let bType: 'hourly' | 'daily' = isHourly ? 'hourly' : 'daily';
    let numHours: number | null = null;
    let numDays: number | null = null;
    let appliedRate = 0;
    let totalPrice = 0;
    let finalQuantity = 1;

    if (bType === 'hourly') {
      numHours = Math.max(1, parseInt(hours || quantity || 1));
      appliedRate = listing.hourlyPrice ?? listing.price;
      totalPrice = appliedRate * numHours;
      finalQuantity = numHours;
    } else {
      numDays = Math.max(1, datesList.length || parseInt(days || quantity || 1));
      appliedRate = listing.dailyPrice ?? (listing.hourlyPrice ? listing.hourlyPrice * 6 : listing.price * 6);
      totalPrice = appliedRate * numDays;
      finalQuantity = numDays;
    }

    // Availability validation check — prevent conflicting non-rejected bookings
    const existingConflicts = await prisma.booking.findMany({
      where: {
        listingId: listing.id,
        status: { in: ['pending', 'accepted', 'paid', 'active'] },
      },
    });

    const isConflict = existingConflicts.some((b: any) => {
      const bStartStr = new Date(b.startDate).toISOString().split('T')[0];
      const bEndStr = b.endDate ? new Date(b.endDate).toISOString().split('T')[0] : bStartStr;
      return datesList.some((dStr) => dStr >= bStartStr && dStr <= bEndStr);
    });

    if (isConflict) {
      return res.status(400).json({ error: 'Resource is not available on one or more of the selected dates' });
    }

    const booking = await prisma.booking.create({
      data: {
        listingId: listing.id,
        consumerId,
        providerId: listing.providerId,
        startDate: firstDateObj,
        endDate: lastDateObj,
        quantity: finalQuantity,
        totalPrice,
        bookingType: bType,
        hours: numHours,
        days: numDays,
        rate: appliedRate,
        status: 'pending',
      },
      include: {
        listing: true,
        consumer: { select: { id: true, name: true, phone: true, location: true } },
        provider: { select: { id: true, name: true, phone: true, location: true } },
      },
    });

    return res.status(201).json({
      message: 'Booking request created successfully',
      booking,
    });
  } catch (err: any) {
    console.error('Create Booking Error:', err);
    return res.status(500).json({ error: 'Server error creating booking request' });
  }
};

/**
 * Fetch all bookings submitted by the authenticated user as Consumer.
 */
export const getMyRequests = async (req: AuthRequest, res: Response) => {
  try {
    const consumerId = req.user?.id;
    if (!consumerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const bookings = await prisma.booking.findMany({
      where: { consumerId },
      include: {
        listing: true,
        provider: { select: { id: true, name: true, phone: true, location: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      bookings,
    });
  } catch (err: any) {
    console.error('Get My Requests Error:', err);
    return res.status(500).json({ error: 'Server error fetching consumer bookings' });
  }
};

/**
 * Fetch all incoming booking requests for listings owned by the authenticated user as Provider.
 */
export const getIncomingRequests = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.user?.id;
    if (!providerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const bookings = await prisma.booking.findMany({
      where: { providerId },
      include: {
        listing: true,
        consumer: { select: { id: true, name: true, phone: true, location: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      bookings,
    });
  } catch (err: any) {
    console.error('Get Incoming Requests Error:', err);
    return res.status(500).json({ error: 'Server error fetching provider bookings' });
  }
};

/**
 * Update status of a booking (Provider authorization required).
 * Valid transitions:
 *   pending  -> accepted | rejected
 *   paid     -> active
 *   active   -> completed
 */
export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.user?.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!providerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const ALLOWED_STATUSES = ['accepted', 'rejected', 'active', 'completed'];
    if (!status || !ALLOWED_STATUSES.includes(String(status).trim())) {
      return res.status(400).json({
        error: "Status must be one of: 'accepted', 'rejected', 'active', 'completed'",
      });
    }

    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!existingBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Provider ownership check
    if (existingBooking.providerId !== providerId) {
      return res.status(403).json({ error: 'Forbidden: Only the provider can update this booking status' });
    }

    // Validate state-machine transitions
    const validTransitions: Record<string, string[]> = {
      pending: ['accepted', 'rejected'],
      paid:    ['active'],
      active:  ['completed'],
    };

    const allowed = validTransitions[existingBooking.status] ?? [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        error: `Invalid transition: cannot move booking from '${existingBooking.status}' to '${status}'`,
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: String(status).trim() },
      include: {
        listing: true,
        consumer: { select: { id: true, name: true, phone: true, location: true } },
        provider: { select: { id: true, name: true, phone: true, location: true } },
      },
    });

    // Create Notification record for the consumer asynchronously/inline
    try {
      const listingTitle = updatedBooking.listing?.title || 'Listing';
      await prisma.notification.create({
        data: {
          userId: updatedBooking.consumerId,
          title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          message: `Your booking for "${listingTitle}" has been ${status}.`,
          type: 'booking',
        },
      });
    } catch (notifErr) {
      console.error('Failed to create notification on booking status update:', notifErr);
    }

    return res.status(200).json({
      message: `Booking status updated to '${status}' successfully`,
      booking: updatedBooking,
    });
  } catch (err: any) {
    console.error('Update Booking Status Error:', err);
    return res.status(500).json({ error: 'Server error updating booking status' });
  }
};

