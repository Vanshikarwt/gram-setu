import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import listingRoutes from './routes/listingRoutes';
import bazaarRoutes from './routes/bazaarRoutes';
import chatRoutes from './routes/chatRoutes';
import bookingRoutes from './routes/bookingRoutes';
import paymentRoutes from './routes/paymentRoutes';
import reviewRoutes from './routes/reviewRoutes';
import notificationRoutes from './routes/notificationRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import insightsRoutes from './routes/insightsRoutes';
import { setupSocketIO } from './socket';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// HTTP Server instance
const server = http.createServer(app);

// Socket.io instance attached to HTTP Server
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Setup Socket.io event listeners & auth middleware
setupSocketIO(io);

// Express Middlewares
app.use(cors());
app.use(express.json());

// Express REST Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bazaar', bazaarRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/insights', insightsRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'GramSetu Backend API is running' });
});

// Start HTTP & Socket.io Server
server.listen(PORT, () => {
  console.log(`🚀 Server & Socket.io running on http://localhost:${PORT}`);
});
