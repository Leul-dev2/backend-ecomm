// src/controllers/paymentController.js
import { stripe } from '../controllers/stripeClient.js';  // <-- fix import path!

export async function createPaymentIntent(req, res) {
  try {
    const { amount, currency = 'usd', customerId, paymentMethodId } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount (in cents) is required.' });
    }

    let paymentIntent;

    if (customerId && paymentMethodId) {
      // Confirm an off-session payment with saved card
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
      });
    } else {
      // New card payment
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        payment_method_types: ['card'],
      });
    }

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe PaymentIntent creation error:', error);
    return res.status(500).json({ error: error.message });
  }
}

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
    res.status(200).json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error('Stripe SetupIntent creation error:', error);
    res.status(500).json({ error: error.message });
  }
}

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
    res.status(200).json(paymentMethods.data);
  } catch (error) {
    console.error('Stripe listPaymentMethods error:', error);
    res.status(500).json({ error: error.message });
  }
}
