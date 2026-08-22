import { Router } from 'express';
import {
  createOrGetConversation,
  getConversations,
  getMessages,
  sendMessage,
} from '../controllers/chatController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// Protect all chat routes with JWT auth middleware
router.use(verifyToken);

router.post('/conversations', createOrGetConversation);
router.get('/conversations', getConversations);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', sendMessage);

export default router;
