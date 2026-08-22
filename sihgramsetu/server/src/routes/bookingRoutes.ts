import { Router } from 'express';
import {
  createBooking,
  getMyRequests,
  getIncomingRequests,
  updateBookingStatus,
} from '../controllers/bookingController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// Protect all booking routes with JWT auth middleware
router.use(verifyToken);

router.post('/', createBooking);
router.get('/my-requests', getMyRequests);
router.get('/incoming', getIncomingRequests);
router.put('/:id/status', updateBookingStatus);

export default router;
