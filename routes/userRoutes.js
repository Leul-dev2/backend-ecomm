// routes/userRoutes.js
import express from 'express';
import admin from '../firebaseAdmin.js';

const router = express.Router();

router.get('/count', async (req, res) => {
  try {
    let userCount = 0;
    let nextPageToken;

    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      userCount += listUsersResult.users.length;
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    res.json({ count: userCount });
  } catch (error) {
    console.error("Error fetching user count:", error);
    res.status(500).json({ error: "Failed to fetch user count" });
  }
});

export default router;
