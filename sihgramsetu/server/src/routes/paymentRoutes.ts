import { Router } from 'express';
import { checkout, getPaymentHistory } from '../controllers/paymentController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.use(verifyToken);

router.post('/checkout', checkout);
router.get('/history', getPaymentHistory);

export default router;
