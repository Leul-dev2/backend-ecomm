const express = require('express');
const router = express.Router();
const db = require('../firebaseAdmin');

// Get all chats
router.get('/all', async (req, res) => {
  try {
    const snapshot = await db.collection('chats').get();
    const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
});

// Get messages in a chat
router.get('/:chatId/messages', async (req, res) => {
  const { chatId } = req.params;
  try {
    const snapshot = await db.collection('chats').doc(chatId).collection('messages').orderBy('createdAt').get();
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Send admin reply
router.post('/:chatId/messages', async (req, res) => {
  const { chatId } = req.params;
  const { message } = req.body;

  try {
    const ref = db.collection('chats').doc(chatId).collection('messages').doc();
    await ref.set({
      senderId: 'admin',
      message,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

module.exports = router;
