import express from 'express';
import admin from '../firebaseAdmin.js';

const router = express.Router();
const firestore = admin.firestore();

async function verifyAdmin(req, res, next) {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (!decodedToken.admin) return res.status(403).json({ error: 'Forbidden: Not admin' });
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const snapshot = await firestore.collection('users').doc(userId).collection('notifications').orderBy('timestamp', 'desc').get();
  const data = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate().toISOString() || null,
  }));
  res.json(data);
});

router.patch('/:userId/:notifId/read', async (req, res) => {
  const { userId, notifId } = req.params;
  await firestore.collection('users').doc(userId).collection('notifications').doc(notifId).update({ isRead: true });
  res.json({ success: true });
});

router.post('/send-to-all', verifyAdmin, async (req, res) => {
  const { title, message } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'Missing fields' });

  const allUsers = [];
  let result = await admin.auth().listUsers(1000);
  allUsers.push(...result.users);
  while (result.pageToken) {
    result = await admin.auth().listUsers(1000, result.pageToken);
    allUsers.push(...result.users);
  }

  const batch = firestore.batch();
  allUsers.forEach(user => {
    const ref = firestore.collection('users').doc(user.uid).collection('notifications').doc();
    batch.set(ref, {
      title,
      message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      isRead: false,
    });
  });

  await batch.commit();
  res.json({ success: true, sent: allUsers.length });
});

export default router;
