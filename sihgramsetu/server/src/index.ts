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

// Allow any Vercel deployment URL, localhost (dev), Railway, and Render origins
const allowedOrigins = [
  /^https?:\/\/localhost(:\d+)?$/,          // all localhost ports (dev)
  /^https:\/\/.*\.vercel\.app$/,            // any *.vercel.app deployment
  /^https:\/\/.*\.up\.railway\.app$/,       // Railway preview URLs
  /^https:\/\/.*\.onrender\.com$/,          // Render preview/production URLs
];

// Express Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, Postman)
    if (!origin) return callback(null, true);
    if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL.replace(/\/+$/, '')) {
      return callback(null, true);
    }
    const allowed = allowedOrigins.some((pattern) => pattern.test(origin));
    callback(allowed ? null : new Error(`CORS: origin ${origin} not allowed`), allowed);
  },
  credentials: true,
}));
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
