//routes/stripe.js

import express from "express";
import Stripe from "stripe";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});
 // Use secret key!

router.post("/create-payment-intent", async (req, res) => {
  const { amount, currency, customerEmail } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // in cents
      currency: currency,
      receipt_email: customerEmail,
      payment_method_types: ['card'],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

export default router;
