import admin from "../firebaseAdmin.js";
// your firebase admin init file
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Authorization header missing" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    // Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);

    // decodedToken.uid contains Firebase UID
    req.firebaseUid = decodedToken.uid;

    // Check if user exists in your MongoDB, create if not
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user) {
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || "",
        // isAdmin: false (default)
      });
    }

    req.user = user; // attach user document to request

    next();
  } catch (error) {
    console.error("Firebase token verification failed", error);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
