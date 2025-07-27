import express from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// ✅ 1️⃣ Create payment route
router.post("/create-payment", async (req, res) => {
  const { amount, email, phone, firstName, lastName, currency } = req.body;

  try {
    const txRef = uuidv4(); // unique transaction ID

    const chapaRes = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount,
        currency: currency || "ETB",
        email,
        first_name: firstName || "First",
        last_name: lastName || "Last",
        phone_number: phone,
        tx_ref: txRef,
        callback_url: "https://backend-ecomm-jol4.onrender.com/api/chapa/callback",
        return_url: "https://backend-ecomm-jol4.onrender.com/api/chapa/return",
        customization: {
          title: "Luxcart",
          description: "Order Payment",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.send({ checkoutUrl: chapaRes.data.data.checkout_url });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create Chapa payment" });
  }
});

// ✅ 2️⃣ Callback route (OUTSIDE of create-payment!)
router.post("/callback", async (req, res) => {
  const { tx_ref, status } = req.body;

  console.log(`🔔 Chapa callback: ${tx_ref} status: ${status}`);

  try {
    const verifyRes = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      }
    );

    const data = verifyRes.data.data;
    console.log("✅ Verified payment:", data);

    // 👉 TODO: Mark your order as paid in your DB using tx_ref

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Verification failed:", err.response?.data || err.message);
    res.sendStatus(500);
  }
});

// ✅ 3️⃣ Return URL route
router.get("/return", (req, res) => {
  const txRef = req.query.tx_ref;

  res.send(`
    <html>
      <head><title>Payment Success</title></head>
      <body>
        <h1>🎉 Payment Completed!</h1>
        <p>Thank you! Your transaction ref: ${txRef}</p>
        <a href="/">Back to Home</a>
      </body>
    </html>
  `);
});

export default router;
