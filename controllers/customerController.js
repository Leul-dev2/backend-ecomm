const stripe = require('../controllers/stripeClient.js').default;

// In-memory store, replace with DB in prod
const customers = {};

exports.createOrGetCustomer = async (req, res) => {
  const { userId, email } = req.body;
  try {
    if (customers[userId]) return res.json({ customerId: customers[userId] });

    const customer = await stripe.customers.create({ email });
    customers[userId] = customer.id;
    res.json({ customerId: customer.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
