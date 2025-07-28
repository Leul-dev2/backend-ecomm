import express from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import admin from "../firebaseAdmin.js"; // Your configured firebase-admin

const router = express.Router();

// 1️⃣ Create payment and create order in Firestore
router.post("/create-payment", async (req, res) => {
  try {
    const { amount, email, phone, firstName, lastName, currency } = req.body;

    // ✅ Basic validations
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const txRef = uuidv4();

    // ✅ Save order to Firestore immediately
    const orderData = {
      tx_ref: txRef,
      amount: amountNum,
      email,
      phone: phone || "0000000000",
      firstName: firstName || "First",
      lastName: lastName || "Last",
      currency: currency || "ETB",
      paymentStatus: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection("orders").add(orderData);
    console.log(`✅ Order created with tx_ref: ${txRef}`);

    // ✅ Chapa payload
    const payload = {
      amount: amountNum,
      currency: orderData.currency,
      email,
      first_name: orderData.firstName,
      last_name: orderData.lastName,
      phone_number: orderData.phone,
      tx_ref: txRef,
      callback_url: process.env.CHAPA_CALLBACK_URL,
      return_url: process.env.CHAPA_RETURN_URL,
      customization: {
        title: "Luxcart",
        description: "Order Payment",
      },
    };

    console.log("➡️ Sending to Chapa:", JSON.stringify(payload, null, 2));

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

    console.log("✅ Chapa response:", chapaRes.data);

    res.json({
      checkoutUrl: chapaRes.data.data.checkout_url,
      txRef,
    });
  } catch (error) {
    console.error("❌ Create payment error:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data?.message || "Something went wrong",
    });
  }
});

// 2️⃣ Chapa callback — verify transaction & update order
router.post("/callback", async (req, res) => {
  const { tx_ref } = req.body;

  console.log(`🔔 Chapa callback received: tx_ref=${tx_ref}`);

  try {
    // ✅ Always verify transaction with Chapa
    const verifyRes = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      }
    );

    const paymentData = verifyRes.data.data;
    const verifiedStatus = paymentData.status;

    console.log("✅ Verified payment data:", paymentData);

    // ✅ Find order by tx_ref
    const ordersRef = admin.firestore().collection("orders");
    const snapshot = await ordersRef.where("tx_ref", "==", tx_ref).limit(1).get();

    if (snapshot.empty) {
      console.warn(`⚠️ Order with tx_ref ${tx_ref} not found.`);
      return res.status(404).send("Order not found");
    }

    const orderDoc = snapshot.docs[0];

    // ✅ Update order
    await orderDoc.ref.update({
      paymentStatus: verifiedStatus,
      paymentVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      chapaPaymentData: paymentData,
    });

    console.log(`✅ Order ${orderDoc.id} updated with payment status: ${verifiedStatus}`);

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Callback verification failed:", error.response?.data || error.message);
    res.sendStatus(500);
  }
});

// 3️⃣ Return URL — show simple success page
router.get("/return", (req, res) => {
  const txRef = req.query.tx_ref || "unknown";

  res.send(`
    <html>
      <head><title>Payment Completed</title></head>
      <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
        <h1>🎉 Payment Completed Successfully!</h1>
        <p>Your transaction reference: <strong>${txRef}</strong></p>
        <a href="/">Back to Home</a>
      </body>
    </html>
  `);
});

export default router;
