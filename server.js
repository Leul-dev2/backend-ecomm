// server.js
import dotenv from 'dotenv';
dotenv.config(); // Must be first!

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import morgan from 'morgan';

import logger from './logger.js';       // Winston logger
import './firebaseAdmin.js';             // Firebase admin init

import productRoutes from './routes/productRoutes.js';
import returnPolicyRoutes from './routes/returnPolicy.js';
import reviewRoutes from './routes/reviews.js';
import { verifyToken } from './middleware/firebaseAuth.js';
import { auth } from './middleware/auth.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categories.js';
import ordersRouter from './routes/orders.js';

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

// Morgan HTTP request logging integrated with Winston
app.use(morgan('combined', {
  stream: {
    write: message => logger.info(message.trim()),
  },
}));

// Root route to handle GET /
app.get('/', (req, res) => {
  res.send('✅ Backend server is running');
});

// Stripe payment intent endpoint
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    logger.error(`Stripe Payment Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// API routes
app.use('/api/products', productRoutes);
app.use('/api/return-policy', returnPolicyRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api', authRoutes);
app.use('/api/orders', ordersRouter);
app.use('/api/categories', categoryRoutes);

app.get('/api', (req, res) => {
  res.send('✅ Backend is up!');
});

app.get('/api/orders', auth, (req, res) => {
  // Protected route example
});

app.get("/api/orders", verifyToken, (req, res) => {
  res.json({ message: "This is a protected orders route", user: req.user });
});

// Connect to MongoDB and start server
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

// Centralized error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.stack || err.message || err}`);
  res.status(500).json({ error: 'Internal Server Error' });
});
