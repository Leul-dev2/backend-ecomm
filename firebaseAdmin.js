// firebaseAdmin.js
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountJson) {
  throw new Error('❌ Missing GOOGLE_SERVICE_ACCOUNT_KEY in environment variables.');
}

const serviceAccount = JSON.parse(serviceAccountJson);

// 🟢 IMPORTANT: Replace escaped \n with real newlines
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
