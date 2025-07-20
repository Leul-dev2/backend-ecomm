// 📂 routes/chatRoutes.js
import express from "express";
import admin from "firebase-admin";

const router = express.Router();

// Make sure you initialized Firebase Admin SDK!
const firestore = admin.firestore();

// Get all chats (list only)
router.get("/all", async (req, res) => {
  try {
    const snapshot = await firestore.collection("chats").get();
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get messages for one chat
router.get("/:chatId/messages", async (req, res) => {
  try {
    const { chatId } = req.params;
    const snapshot = await firestore
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin reply -> create message in Firestore
router.post("/:chatId/messages", async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;

    await firestore.collection("chats").doc(chatId).collection("messages").add({
      senderId: "admin",
      message,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ status: "Message sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
