import { Router } from 'express';
import { getProviderAnalytics } from '../controllers/analyticsController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.use(verifyToken);

router.get('/provider', getProviderAnalytics);

export default router;
