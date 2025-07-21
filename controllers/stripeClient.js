import Stripe from 'stripe';
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Use environment variable

export default stripe;
