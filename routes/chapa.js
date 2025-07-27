// routes/chapa.js
import express from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

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
        callback_url: "https://yourdomain.com/chapa/callback",
        return_url: "https://yourdomain.com/chapa/return",
        customization: {
          title: "Your Shop Name",
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

export default router;
