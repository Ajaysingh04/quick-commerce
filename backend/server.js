import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import dotenv from 'dotenv';
import path from 'path';

import connectDB from './config/db.js';
import configurePassport from './config/passport.js';
import socketHandler from './utils/socketHandler.js';

import authRoutes from './routes/authRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import productRoutes from './routes/productRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import advancedRoutes from './routes/advancedRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Initialize env loads
dotenv.config();

// Connect Database
connectDB();

// Initialize passport Oauth settings
configurePassport();

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Bind io to global variable for controller access
global.io = io;
socketHandler(io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(passport.initialize());

// Serve static uploads
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Active Routes
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/advanced', advancedRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/upload', uploadRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('RoseDash Product Delivery Platform Backend API is running...');
});

// Catch NotFound & Exceptions
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
