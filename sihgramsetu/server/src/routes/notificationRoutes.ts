import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.use(verifyToken);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);

export default router;
