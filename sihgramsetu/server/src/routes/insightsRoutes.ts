import { Router } from 'express';
import { suggestPrice } from '../controllers/insightsController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.use(verifyToken);

router.get('/suggest-price', suggestPrice);

export default router;
