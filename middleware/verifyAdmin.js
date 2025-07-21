// middlewares/verifyAdmin.js
import admin from '../firebaseAdmin.js';

export default async function verifyAdmin(req, res, next) {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    console.log('✅ Verified user:', decoded.uid);

    if (!decoded.admin) return res.status(403).json({ error: 'Not authorized' });

    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Token verify failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}
