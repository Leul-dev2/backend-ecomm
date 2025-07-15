import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountJson) {
  throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_KEY in environment variables');
}

const serviceAccount = JSON.parse(serviceAccountJson);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export { admin, db };
