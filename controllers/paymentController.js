// src/controllers/paymentController.js

import { stripe } from '../controllers/stripeClient.js'; // ✅ fix import if needed

/**
 * POST /create-payment-intent
 * Creates a PaymentIntent.
 * If `customerId` and `paymentMethodId` are provided, attempts an off-session payment.
 * Otherwise, creates a standard PaymentIntent for new card payments.
 */
export async function createPaymentIntent(req, res) {
  try {
    const { amount, currency = 'usd', customerId, paymentMethodId } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount (in cents) is required.' });
    }

    let paymentIntent;

    if (customerId && paymentMethodId) {
      // ✅ Saved card flow — off-session
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
      });
    } else {
      // ✅ New card flow
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        payment_method_types: ['card'],
      });
    }

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe PaymentIntent creation error:', error);

    if (error.code === 'authentication_required') {
      // ⚡️ Optional: handle special 3DS failure
      return res.status(402).json({
        error: 'Authentication required. Customer must complete payment manually.',
      });
    }

    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

/**
 * POST /create-setup-intent
 * Creates a SetupIntent for saving a new card.
 */
export async function createSetupIntent(req, res) {
  const { customerId } = req.body;

  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID is required.' });
  }

  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });

    return res.status(200).json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error('Stripe SetupIntent creation error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

/**
 * GET /list-payment-methods
 * Lists saved payment methods (cards) for a given customer.
 */
export async function listPaymentMethods(req, res) {
  const { customerId } = req.query;

  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID is required.' });
  }

  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return res.status(200).json(paymentMethods.data);
  } catch (error) {
    console.error('Stripe listPaymentMethods error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
