import express from 'express';
import { createPaymentIntent } from '../controllers/paymentController.js';

const router = express.Router();

// POST /api/payment/create-payment-intent
router.post('/create-payment-intent', createPaymentIntent);

export default router;
