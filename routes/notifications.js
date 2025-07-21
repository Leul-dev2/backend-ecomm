import express from 'express';
import admin from '../firebaseAdmin.js';
import verifyAdmin from '../middlewares/verifyAdmin.js'; // ✅ correct import

const router = express.Router();
const firestore = admin.firestore();

router.post('/send-to-all', verifyAdmin, async (req, res) => {
  try {
    const { title, message, iconPath, route, routeArgs } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Missing title or message' });
    }

    const allUsers = [];
    let result = await admin.auth().listUsers(1000);
    allUsers.push(...result.users);

    while (result.pageToken) {
      result = await admin.auth().listUsers(1000, result.pageToken);
      allUsers.push(...result.users);
    }

    console.log(`📦 Found ${allUsers.length} users`);

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
        iconPath: iconPath || '',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        isRead: false,
        route: route || null,
        routeArgs: routeArgs || null,
      });
    });

    await batch.commit();

    res.json({ success: true, sent: allUsers.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
