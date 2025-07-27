import express from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import admin from "../firebaseAdmin.js"; // Make sure this exports default admin from firebase-admin

const router = express.Router();

// 1️⃣ Create payment route
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

// 2️⃣ Callback route — called by Chapa to notify payment status changes
router.post("/callback", async (req, res) => {
  const { tx_ref, status } = req.body;

  console.log(`🔔 Chapa callback received: tx_ref=${tx_ref}, status=${status}`);

  try {
    // Verify transaction status with Chapa
    const verifyRes = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      }
    );

    const paymentData = verifyRes.data.data;
    console.log("✅ Verified payment info:", paymentData);

    // Find order by tx_ref in Firestore
    const ordersRef = admin.firestore().collection("orders");
    const snapshot = await ordersRef.where("tx_ref", "==", tx_ref).limit(1).get();

    if (snapshot.empty) {
      console.warn(`⚠️ Order with tx_ref ${tx_ref} not found.`);
      return res.status(404).send("Order not found");
    }

    const orderDoc = snapshot.docs[0];

    // Update order document
    await orderDoc.ref.update({
      paymentStatus: status,
      paymentVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      chapaPaymentData: paymentData,
    });

    console.log(`Order ${orderDoc.id} updated with payment status: ${status}`);

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Payment verification failed:", error.response?.data || error.message);
    res.sendStatus(500);
  }
});

// 3️⃣ Return URL route — redirect after payment
router.get("/return", (req, res) => {
  const txRef = req.query.tx_ref;

  res.send(`
    <html>
      <head><title>Payment Completed</title></head>
      <body>
        <h1>🎉 Payment Completed Successfully!</h1>
        <p>Your transaction reference: <strong>${txRef}</strong></p>
        <a href="/">Back to Home</a>
      </body>
    </html>
  `);
});

export default router;
