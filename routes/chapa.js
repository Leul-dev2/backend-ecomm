import express from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.post("/create-payment", async (req, res) => {
  try {
    const { amount, email, phone, firstName, lastName, currency } = req.body;

    // Basic validations
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const txRef = uuidv4();

    const payload = {
      amount: amountNum,
      currency: currency || "ETB",
      email,
      first_name: firstName || "First",
      last_name: lastName || "Last",
      phone_number: phone || "0000000000",
      tx_ref: txRef,
      callback_url: "https://backend-ecomm-jol4.onrender.com/api/chapa/callback",
      return_url: "https://backend-ecomm-jol4.onrender.com/api/chapa/return",
      customization: {
        title: "Luxcart",
        description: "Order Payment",
      },
    };

    console.log("Sending to Chapa:", JSON.stringify(payload, null, 2));

    const chapaRes = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Chapa response:", chapaRes.data);

    res.json({ checkoutUrl: chapaRes.data.data.checkout_url, txRef });
  } catch (error) {
    console.error("Chapa create payment error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.message || error.message });
  }
});

export default router;
