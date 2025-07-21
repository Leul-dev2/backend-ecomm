import { paymentIntents, setupIntents, paymentMethods as _paymentMethods } from './stripeClient';

export async function createPaymentIntent(req, res) {
  try {
    const { amount, currency = 'usd', customerId, paymentMethodId } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount (in cents) is required.' });
    }

    // If customerId and paymentMethodId are provided, create a payment intent for saved card
    if (customerId && paymentMethodId) {
      const paymentIntent = await paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
      });
      return res.status(200).json({ clientSecret: paymentIntent.client_secret });
    }

    // Otherwise create a regular payment intent without saved card
    const paymentIntent = await paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
    });

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
    const setupIntent = await setupIntents.create({
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
    const paymentMethods = await _paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    res.status(200).json(paymentMethods.data);
  } catch (error) {
    console.error('Stripe listPaymentMethods error:', error);
    res.status(500).json({ error: error.message });
  }
}
