// routes/notifications.js
import express from 'express';
import admin from '../firebaseAdmin.js';
import verifyAdmin from '../middlewares/verifyAdmin.js';

const router = express.Router();
const firestore = admin.firestore();

// Send notification to all users (admin only)
router.post('/send-to-all', verifyAdmin, async (req, res) => {
  try {
    const { title, message, iconPath, route, routeArgs } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'Missing title or message' });

    // List all users (paginated)
    const allUsers = [];
    let result = await admin.auth().listUsers(1000);
    allUsers.push(...result.users);

    while (result.pageToken) {
      result = await admin.auth().listUsers(1000, result.pageToken);
      allUsers.push(...result.users);
    }

    console.log(`Found ${allUsers.length} users`);

    // Batch write notifications
    const batch = firestore.batch();

    allUsers.forEach(user => {
      const notifRef = firestore.collection('users').doc(user.uid).collection('notifications').doc();
      batch.set(notifRef, {
        title,
        message,
        iconPath: iconPath || '',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        isRead: false,
        route: route || null,
        routeArgs: routeArgs || null,
      });
    });

    await batch.commit();

    res.json({ success: true, sentTo: allUsers.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get notifications for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const notifsSnapshot = await firestore
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .orderBy('timestamp', 'desc')
      .get();

    const notifications = notifsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark a notification as read
router.patch('/:userId/:notifId/read', async (req, res) => {
  try {
    const { userId, notifId } = req.params;
    const notifRef = firestore.collection('users').doc(userId).collection('notifications').doc(notifId);
    await notifRef.update({ isRead: true });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
