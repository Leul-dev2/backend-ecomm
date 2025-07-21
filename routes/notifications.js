// routes/notifications.js
const express = require('express');
const router = express.Router();
const { firestore } = require('../firebaseAdmin');

// Send notification to a user
router.post('/send', async (req, res) => {
  try {
    const { userId, title, message, iconPath, route, routeArgs } = req.body;
    if (!userId || !title || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const notifRef = firestore
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .doc();

    await notifRef.set({
      title,
      message,
      iconPath: iconPath || '',
      timestamp: firestore.FieldValue.serverTimestamp(),
      isRead: false,
      route: route || null,
      routeArgs: routeArgs || null,
    });

    res.status(200).json({ success: true, id: notifRef.id });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notifications for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const notifsSnapshot = await firestore
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .orderBy('timestamp', 'desc')
      .get();

    const notifications = [];
    notifsSnapshot.forEach(doc => {
      notifications.push({ id: doc.id, ...doc.data() });
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
router.patch('/:userId/:notifId/read', async (req, res) => {
  try {
    const { userId, notifId } = req.params;

    const notifRef = firestore
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .doc(notifId);

    await notifRef.update({ isRead: true });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
