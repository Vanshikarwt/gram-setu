import { Router } from 'express';
import {
  createBazaarPost,
  getBazaarPosts,
  deleteBazaarPost,
} from '../controllers/bazaarController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// Protect all Bazaar endpoints with JWT auth
router.use(verifyToken);

router.post('/', createBazaarPost);
router.get('/', getBazaarPosts);
router.delete('/:id', deleteBazaarPost);

export default router;
