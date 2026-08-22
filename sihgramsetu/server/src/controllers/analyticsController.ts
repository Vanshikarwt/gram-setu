import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middlewares/auth';

/**
 * GET /api/analytics/provider
 * Calculates business performance metrics for the authenticated provider using DB aggregate & count queries.
 * Returns { totalRevenue, jobsCompleted, activeListingsCount }.
 */
export const getProviderAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.user?.id;
    if (!providerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [revenueAggregate, jobsCompletedCount, activeListingsCount] = await Promise.all([
      // Sum revenue from successful transactions linked to provider's bookings
      prisma.transaction.aggregate({
        where: {
          status: 'success',
          booking: {
            providerId,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      // Count completed jobs/bookings for this provider
      prisma.booking.count({
        where: {
          providerId,
          status: 'completed',
        },
      }),

      // Count active listings owned by this provider
      prisma.listing.count({
        where: {
          providerId,
          status: 'active',
        },
      }),
    ]);

    const totalRevenue = revenueAggregate._sum.amount ?? 0;

    return res.status(200).json({
      totalRevenue,
      jobsCompleted: jobsCompletedCount,
      activeListingsCount,
    });
  } catch (err: any) {
    console.error('Get Provider Analytics Error:', err);
    return res.status(500).json({ error: 'Server error calculating provider analytics' });
  }
};

/**
 * GET /api/analytics/provider/idle-stats
 * Returns per-listing availability + booking + idle date calculations for the authenticated provider.
 * Only machinery listings with availabilityDates are included.
 * Only active/paid/completed bookings count as occupied dates. Rejected/cancelled bookings are ignored.
 */
export const getProviderIdleStats = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.user?.id;
    if (!providerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch provider's machinery listings that have availability dates
    const listings = await prisma.listing.findMany({
      where: { providerId },
    });

    // Fetch all non-rejected bookings for this provider
    const bookings = await prisma.booking.findMany({
      where: {
        providerId,
        status: { in: ['pending', 'accepted', 'paid', 'active', 'completed'] },
      },
    });

    const listingStats = listings.map((listing: any) => {
      // Parse availability dates
      let availableDates: string[] = [];
      if (listing.availabilityDates) {
        try {
          const parsed = JSON.parse(listing.availabilityDates);
          if (Array.isArray(parsed)) {
            availableDates = parsed.map((d: string) => d.trim()).filter(Boolean);
          }
        } catch {
          availableDates = [];
        }
      }

      // Collect all booked dates from non-rejected bookings for this listing
      const bookedDatesSet = new Set<string>();
      bookings
        .filter((b: any) => b.listingId === listing.id)
        .forEach((b: any) => {
          const start = new Date(b.startDate);
          const end = b.endDate ? new Date(b.endDate) : start;
          const cur = new Date(start);
          while (cur <= end) {
            bookedDatesSet.add(cur.toISOString().split('T')[0]);
            cur.setDate(cur.getDate() + 1);
          }
        });

      // Idle = available date that has no booking
      const idleDates = availableDates.filter((d) => !bookedDatesSet.has(d));
      // Booked = available date that IS booked (intersection)
      const bookedAvailableDates = availableDates.filter((d) => bookedDatesSet.has(d));

      const totalAvailable = availableDates.length;
      const totalBooked = bookedAvailableDates.length;
      const totalIdle = idleDates.length;
      const utilizationPct = totalAvailable > 0
        ? Math.round((totalBooked / totalAvailable) * 100)
        : 0;

      return {
        listingId: listing.id,
        listingTitle: listing.title,
        listingType: listing.type,
        availableDates,
        bookedDates: bookedAvailableDates,
        idleDates,
        totalAvailable,
        totalBooked,
        totalIdle,
        utilizationPct,
      };
    });

    return res.status(200).json({ listingStats });
  } catch (err: any) {
    console.error('Get Provider Idle Stats Error:', err);
    return res.status(500).json({ error: 'Server error calculating idle stats' });
  }
};

