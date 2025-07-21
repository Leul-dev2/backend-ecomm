// routes/notifications.js
import express from 'express';
import admin from '../firebaseAdmin.js';

const router = express.Router();
const firestore = admin.firestore();

// Admin verification middleware
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
    console.error(error);
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ✅ Send to ALL USERS (Admin only)
router.post('/admin/send-to-all', verifyAdmin, async (req, res) => {
  const { title, message, iconPath = '', route = null, routeArgs = null } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message required' });
  }

  try {
    let allUsers = [];
    let result = await admin.auth().listUsers(1000);
    allUsers.push(...result.users);

    while (result.pageToken) {
      result = await admin.auth().listUsers(1000, result.pageToken);
      allUsers.push(...result.users);
    }

    console.log(`Found ${allUsers.length} users`);

    // Split into multiple batches of 500
    const chunks = [];
    for (let i = 0; i < allUsers.length; i += 500) {
      chunks.push(allUsers.slice(i, i + 500));
    }

    for (const chunk of chunks) {
      const batch = firestore.batch();
      chunk.forEach(user => {
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
    }

    res.json({ success: true, sent: allUsers.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

// ✅ Get notifications for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const snapshot = await firestore
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .orderBy('timestamp', 'desc')
      .get();

    const notifications = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate().toISOString() || null,
      };
    });

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// ✅ Mark as read
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

export default router;
