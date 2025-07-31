import express from "express";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Make sure Firebase Admin is initialized (use your service account)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}

router.post("/firebase", async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: "ID Token is required" });

  try {
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    // Find or create user in your DB
    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      user = new User({
        firebaseUid: uid,
        email: email || "",
        name: name || "",
      });
      await user.save();
    }

    // Create JWT for your app (include user ID, etc)
    const token = jwt.sign(
      { userId: user._id, firebaseUid: uid, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || "30d" }
    );

    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid Firebase ID Token" });
  }
});

export default router;
