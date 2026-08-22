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
