import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middlewares/auth';

/**
 * GET /api/notifications
 * Fetch all notifications for the authenticated user (newest first).
 */
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ notifications });
  } catch (err: any) {
    console.error('Get Notifications Error:', err);
    return res.status(500).json({ error: 'Server error fetching notifications' });
  }
};

/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read.
 * Security Check: Ensure notification belongs to the authenticated user (403 Forbidden).
 */
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Security Check: ownership check
    if (notification.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You cannot modify another user notification' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.status(200).json({
      message: 'Notification marked as read',
      notification: updated,
    });
  } catch (err: any) {
    console.error('Mark Notification Read Error:', err);
    return res.status(500).json({ error: 'Server error updating notification' });
  }
};
