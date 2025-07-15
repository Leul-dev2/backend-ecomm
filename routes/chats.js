// routes/chats.js
import express from 'express';
import ChatMessage from '../models/ChatMessage.js'; // You’ll create this next
import { io } from '../server.js'; // We’ll set up Socket.IO in server.js

const router = express.Router();

// This route is called by your Firebase Function when a new chat arrives
router.post('/sync', async (req, res) => {
  const { messageId, text, participants, timestamp } = req.body;

  if (!participants || participants.length < 2) {
    return res.status(400).json({ error: 'Invalid participants' });
  }

  // Save to MongoDB (upsert = insert or update)
  await ChatMessage.findOneAndUpdate(
    { messageId },
    { messageId, text, participants, timestamp },
    { upsert: true, new: true }
  );

  // Push to Socket.IO so connected clients get it instantly
  io.emit('new_message', { messageId, text, participants, timestamp });

  res.json({ success: true });
});

export default router;
