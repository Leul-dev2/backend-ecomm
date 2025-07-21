import express from 'express';
import admin from '../firebaseAdmin.js'; // your firebase-admin init

const router = express.Router();
const firestore = admin.firestore();

// ✅ Middleware to check Firebase ID Token (optional but important)
async function verifyAdmin(req, res, next) {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    console.log('✅ Authenticated user:', decoded.uid);

    // 🟢 Check admin claim (set custom claim in your auth panel)
    if (!decoded.admin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    next();
  } catch (error) {
    console.error('❌ Token verify failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ✅ Send to ALL USERS
router.post('/send-to-all', verifyAdmin, async (req, res) => {
  try {
    const { title, message, iconPath, route, routeArgs } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Missing title or message' });
    }

    // 1️⃣ List all users
    const allUsers = [];
    let result = await admin.auth().listUsers(1000);
    allUsers.push(...result.users);

    while (result.pageToken) {
      result = await admin.auth().listUsers(1000, result.pageToken);
      allUsers.push(...result.users);
    }

    console.log(`📦 Found ${allUsers.length} users`);

    // 2️⃣ Batch writes
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
