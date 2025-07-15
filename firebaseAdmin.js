// firebaseAdmin.js (or firebase.js)
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountJson) {
  throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_KEY in environment variables');
}

// Parse the JSON string stored in env
const serviceAccount = JSON.parse(serviceAccountJson);

// Convert escaped newlines to real newlines in the private key
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
