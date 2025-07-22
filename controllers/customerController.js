// src/controllers/customerController.js

import { stripe } from './stripeClient.js'; // ✅ fix relative path if needed

// ⚡️ TEMP: In-memory store (use a real DB in production!)
const customers = {};

/**
 * POST /create-customer
 * Creates a Stripe Customer if one doesn't exist for this user.
 * Returns existing customer ID if found.
 */
export async function createOrGetCustomer(req, res) {
  const { userId, email } = req.body;

  if (!userId || !email) {
    return res.status(400).json({ error: 'userId and email are required.' });
  }

  try {
    // ✅ Reuse if exists
    if (customers[userId]) {
      return res.json({ customerId: customers[userId] });
    }

    // ✅ Create new
    const customer = await stripe.customers.create({ email });

    customers[userId] = customer.id;

    return res.status(200).json({ customerId: customer.id });
  } catch (error) {
    console.error('Stripe createOrGetCustomer error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
