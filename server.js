import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import morgan from 'morgan';

import logger from './logger.js';
import './firebaseAdmin.js';

import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import returnPolicyRoutes from './routes/returnPolicy.js';
import notifcatonsRoutes from './routes/notifications.js'; // ✅ Correct split
import adminReviewRoutes from './routes/adminReviewRoutes.js'; // ✅ Correct split
import productReviewRoutes from './routes/productReviewRoutes.js'; // ✅ Correct split

import { verifyToken } from './middleware/firebaseAuth.js';
import { auth } from './middleware/auth.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categories.js';
import ordersRouter from './routes/orders.js';
import chatRoutes from './routes/chatRoutes.js';
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.STRIPE_SECRET_KEY) {
  logger.error("❌ ERROR: STRIPE_SECRET_KEY is not set in environment variables.");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

app.use(cors());
app.use(express.json());

app.use(morgan('combined', {
  stream: { write: message => logger.info(message.trim()) },
}));

app.get('/', (req, res) => {
  res.send('✅ Backend server is running');
});

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    logger.error(`Stripe Payment Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// ✅ ✅ ✅ CORRECT: split + clean mounts — no conflict!
app.use('/api/products', productRoutes);
app.use('/api/products', productReviewRoutes); // only product review GET/POST
app.use('/api/reviews', adminReviewRoutes);    // only admin pending/approve
app.use('/api/chats', chatRoutes);
app.use('/api/return-policy', returnPolicyRoutes);
app.use('/api', authRoutes);
app.use('/api/orders', ordersRouter);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/notifications', notificationRoutes);

app.get('/api', (req, res) => {
  res.send('✅ Backend is up!');
});

app.get('/api/orders', auth, (req, res) => {
  // Protected route example
});

app.get('/api/orders', verifyToken, (req, res) => {
  res.json({ message: "This is a protected orders route", user: req.user });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info('✅ MongoDB Connected');
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error(`❌ MongoDB connection failed: ${err.message}`);
  });

app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.stack || err.message || err}`);
  res.status(500).json({ error: 'Internal Server Error' });
});
