import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'gramsetu_super_secret_jwt_key_2026';

export interface AuthenticatedSocket extends Socket {
  data: {
    user?: {
      id: string;
      phone: string;
    };
  };
}

export function setupSocketIO(io: SocketIOServer) {
  // Socket.io JWT Authentication Middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const authHeader =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization;

    if (!authHeader) {
      return next(new Error('Authentication error: Token missing'));
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; phone: string };
      socket.data.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.data.user?.id;
    console.log(`🔌 Client connected to Socket.io: User ID ${userId} (Socket ID ${socket.id})`);

    // Event: join_conversation room
    socket.on('join_conversation', ({ conversationId }: { conversationId: string }) => {
      if (conversationId) {
        socket.join(conversationId);
        console.log(`👤 User ${userId} joined conversation room: ${conversationId}`);
      }
    });

    // Event: send_message
    socket.on(
      'send_message',
      async ({ conversationId, text }: { conversationId: string; text: string }) => {
        try {
          if (!userId) return;

          if (!conversationId || !text || !String(text).trim()) {
            socket.emit('error', { error: 'Conversation ID and text are required' });
            return;
          }

          // Verify conversation exists and sender is participant
          const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
          });

          if (!conversation) {
            socket.emit('error', { error: 'Conversation not found' });
            return;
          }

          if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
            socket.emit('error', { error: 'Forbidden: You are not a participant in this conversation' });
            return;
          }

          const trimmedText = String(text).trim();

          // Save message to DB
          const message = await prisma.message.create({
            data: {
              conversationId,
              senderId: userId,
              text: trimmedText,
            },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });

          // Update parent conversation's lastMessageText and updatedAt timestamp
          await prisma.conversation.update({
            where: { id: conversationId },
            data: {
              lastMessageText: trimmedText,
              updatedAt: new Date(),
            },
          });

          // Broadcast real-time event to all sockets in conversationId room
          io.to(conversationId).emit('receive_message', message);
        } catch (err: any) {
          console.error('Socket send_message error:', err);
          socket.emit('error', { error: 'Server error processing message' });
        }
      }
    );

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected from Socket.io: User ID ${userId}`);
    });
  });
}
