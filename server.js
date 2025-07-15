import dotenv from 'dotenv';
dotenv.config();  // Must be first!

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';

// Import Firebase admin initialization AFTER dotenv.config()
import './firebaseAdmin.js';

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
  console.error("❌ ERROR: STRIPE_SECRET_KEY is not set in environment variables.");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

app.use(cors());
app.use(express.json());

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
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
  });
