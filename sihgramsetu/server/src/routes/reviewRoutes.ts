import { Router } from 'express';
import { createReview } from '../controllers/reviewController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// POST /api/reviews — requires authentication
router.post('/', verifyToken, createReview);

export default router;
