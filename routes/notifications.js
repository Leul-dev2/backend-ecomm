// backend/routes/notifications.js
import express from 'express';
import admin from '../firebaseAdmin.js';

const router = express.Router();
const firestore = admin.firestore();

// Middleware to verify admin token and claim (adjust to your project)
async function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!idToken) return res.status(401).json({ error: 'No token provided' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (!decodedToken.admin) return res.status(403).json({ error: 'Unauthorized' });

    req.user = decodedToken;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.post('/send-to-all', verifyAdmin, async (req, res) => {
  const { title, message, iconPath, route, routeArgs } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'Missing title or message' });

  try {
    // List all users (max 1000 per call, paginate if needed)
    let allUsers = [];
    let result = await admin.auth().listUsers(1000);
    allUsers = allUsers.concat(result.users);

    while (result.pageToken) {
      result = await admin.auth().listUsers(1000, result.pageToken);
      allUsers = allUsers.concat(result.users);
    }

    // Batch write notifications for all users
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

    res.json({ success: true, sent: allUsers.length });
  } catch (error) {
    console.error('Error sending notifications to all:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
