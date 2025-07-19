import express from 'express';
import admin from '../firebaseAdmin.js';

const router = express.Router();

// ✅ GET /api/users/count - counts *all* Firebase Auth users, even if >1000
router.get('/count', async (req, res) => {
  try {
    let userCount = 0;
    let nextPageToken;

    do {
      const result = await admin.auth().listUsers(1000, nextPageToken);
      userCount += result.users.length;
      nextPageToken = result.pageToken;
    } while (nextPageToken);

    res.json({ count: userCount });
  } catch (error) {
    console.error("❌ Error fetching user count:", error);
    res.status(500).json({ error: "Failed to fetch user count" });
  }
});

export default router;
