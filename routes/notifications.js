// routes/notifications.js
import express from 'express';
import admin from '../firebaseAdmin.js';

const router = express.Router();
const firestore = admin.firestore();

// Middleware to verify admin token and claims
async function verifyAdmin(req, res, next) {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (!decodedToken.admin) {
      return res.status(403).json({ error: 'Forbidden: Not admin' });
    }
    req.uid = decodedToken.uid;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Get notifications for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const snapshot = await firestore
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .orderBy('timestamp', 'desc')
      .get();

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate().toISOString() || null,
    }));

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Mark notification as read
router.patch('/:userId/:notifId/read', async (req, res) => {
  const { userId, notifId } = req.params;
  try {
    await firestore
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .doc(notifId)
      .update({ isRead: true });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Send notification to all users (Admin only)
router.post('/send-to-all', verifyAdmin, async (req, res) => {
  const { title, message, iconPath = '', route = null, routeArgs = null } = req.body;

  if (!title || !message) return res.status(400).json({ error: 'Title and message required' });

  try {
    let allUsers = [];
    let result = await admin.auth().listUsers(1000);
    allUsers.push(...result.users);

    while (result.pageToken) {
      result = await admin.auth().listUsers(1000, result.pageToken);
      allUsers.push(...result.users);
    }

    const batch = firestore.batch();
    allUsers.forEach(user => {
      const notifRef = firestore
        .collection('users')
        .doc(user.uid)
        .collection('notifications')
        .doc();

      batch.set(notifRef, {
        title,
        message,
        iconPath,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        isRead: false,
        route,
        routeArgs,
      });
    });

    await batch.commit();

    res.json({ success: true, sent: allUsers.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

export default router;
