import { Router } from 'express';
import { getProviderAnalytics, getProviderIdleStats } from '../controllers/analyticsController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.use(verifyToken);

router.get('/provider', getProviderAnalytics);
router.get('/provider/idle-stats', getProviderIdleStats);

export default router;
