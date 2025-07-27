import express from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import admin from "firebase-admin";

const router = express.Router();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // or use cert
  });
}

const firestore = admin.firestore();

// Create payment
router.post("/create-payment", async (req, res) => {
  const { amount, email, phone, firstName, lastName, currency } = req.body;

  try {
    const txRef = uuidv4();

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

    // Store order in Firestore with tx_ref for later verification
    await firestore.collection("orders").add({
      tx_ref: txRef,
      email,
      amount,
      currency,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.send({ checkoutUrl: chapaRes.data.data.checkout_url });
  } catch (error) {
  console.error('Create payment error:', error.response?.data || error.message || error);
  res.status(500).json({ error: "Failed to create Chapa payment" });
}

});

// Callback to verify payment & update Firestore
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

    const ordersRef = firestore.collection("orders");
    const snapshot = await ordersRef.where("tx_ref", "==", tx_ref).limit(1).get();

    if (snapshot.empty) {
      console.warn(`Order with tx_ref ${tx_ref} not found in Firestore`);
      return res.status(404).send("Order not found");
    }

    const orderDoc = snapshot.docs[0];
    await orderDoc.ref.update({
      paymentStatus: status,
      paymentVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      chapaPaymentData: data,
    });

    console.log(`Order ${orderDoc.id} marked as ${status}`);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Verification failed:", err.response?.data || err.message);
    res.sendStatus(500);
  }
});

// Return URL for frontend redirect after payment
router.get("/return", (req, res) => {
  const txRef = req.query.tx_ref;

  res.send(`
    <html>
      <head><title>Payment Success</title></head>
      <body>
        <h1>🎉 Payment Completed!</h1>
        <p>Thank you! Your transaction reference: ${txRef}</p>
        <a href="/">Back to Home</a>
      </body>
    </html>
  `);
});

export default router;
