// 📂 routes/chatRoutes.js
import express from "express";
import admin from "firebase-admin";

const router = express.Router();

// ✅ Make sure Firebase Admin is initialized
const firestore = admin.firestore();

// ✅ Get ALL chats
router.get("/all", async (req, res) => {
  try {
    const snapshot = await firestore.collection("chats").orderBy("createdAt", "desc").get();
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      status: "success",
      count: chats.length,
      chats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ✅ Get MESSAGES for one chat
router.get("/:chatId/messages", async (req, res) => {
  const { chatId } = req.params;

  try {
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

    res.json({
      status: "success",
      count: messages.length,
      messages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ✅ Admin REPLY to a chat (create new message)
router.post("/:chatId/messages", async (req, res) => {
  const { chatId } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ status: "error", message: "Message body is required." });
  }

  try {
    await firestore
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .add({
        senderId: "admin",
        message,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.json({ status: "success", message: "Message sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;
