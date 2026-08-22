import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middlewares/auth';

/**
 * Initiate or retrieve existing 1-on-1 conversation between authenticated user and target user.
 */
export const createOrGetConversation = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const { targetUserId } = req.body;

    if (!currentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!targetUserId || !String(targetUserId).trim()) {
      return res.status(400).json({ error: 'Target user ID is required' });
    }

    if (currentUserId === targetUserId) {
      return res.status(400).json({ error: 'You cannot start a conversation with yourself' });
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'Target user not found' });
    }

    // Check if conversation already exists between currentUserId and targetUserId
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: currentUserId, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: currentUserId },
        ],
      },
      include: {
        user1: { select: { id: true, name: true, phone: true, location: true } },
        user2: { select: { id: true, name: true, phone: true, location: true } },
      },
    });

    if (conversation) {
      return res.status(200).json({
        message: 'Conversation retrieved',
        conversation,
      });
    }

    // Create new conversation
    conversation = await prisma.conversation.create({
      data: {
        user1Id: currentUserId,
        user2Id: targetUserId,
      },
      include: {
        user1: { select: { id: true, name: true, phone: true, location: true } },
        user2: { select: { id: true, name: true, phone: true, location: true } },
      },
    });

    return res.status(201).json({
      message: 'Conversation created',
      conversation,
    });
  } catch (err: any) {
    console.error('Create Conversation Error:', err);
    return res.status(500).json({ error: 'Server error creating conversation' });
  }
};

/**
 * Get all conversations for authenticated user (ordered by updatedAt descending).
 */
export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: currentUserId },
          { user2Id: currentUserId },
        ],
      },
      include: {
        user1: { select: { id: true, name: true, phone: true, location: true } },
        user2: { select: { id: true, name: true, phone: true, location: true } },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Format output with otherUser helper field
    const formattedConversations = conversations.map((c: any) => {
      const otherUser = c.user1Id === currentUserId ? c.user2 : c.user1;
      return {
        ...c,
        otherUser,
      };
    });

    return res.status(200).json({
      conversations: formattedConversations,
    });
  } catch (err: any) {
    console.error('Get Conversations Error:', err);
    return res.status(500).json({ error: 'Server error fetching conversations' });
  }
};

/**
 * Fetch message history for a conversation (ordered chronologically).
 * Requires participant check (403 Forbidden if user is not in the conversation).
 */
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const { id } = req.params;

    if (!currentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Participant verification
    if (conversation.user1Id !== currentUserId && conversation.user2Id !== currentUserId) {
      return res.status(403).json({ error: 'Forbidden: You are not a participant in this conversation' });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      include: {
        sender: { select: { id: true, name: true } },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return res.status(200).json({
      messages,
    });
  } catch (err: any) {
    console.error('Get Messages Error:', err);
    return res.status(500).json({ error: 'Server error fetching message history' });
  }
};

/**
 * Send message to conversation.
 */
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const { id } = req.params;
    const { text } = req.body;

    if (!currentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.user1Id !== currentUserId && conversation.user2Id !== currentUserId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const trimmedText = String(text).trim();

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: id,
          senderId: currentUserId,
          text: trimmedText,
        },
        include: {
          sender: { select: { id: true, name: true } },
        },
      }),
      prisma.conversation.update({
        where: { id },
        data: { lastMessageText: trimmedText },
      }),
    ]);

    return res.status(201).json({
      message: 'Message sent',
      data: message,
    });
  } catch (err: any) {
    console.error('Send Message Error:', err);
    return res.status(500).json({ error: 'Server error sending message' });
  }
};
