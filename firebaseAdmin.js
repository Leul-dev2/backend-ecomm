// firebaseAdmin.js
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();  // load env variables here in this module too

const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;

if (!serviceAccountPath) {
  throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_KEY_PATH in environment variables');
}

const absolutePath = path.resolve(serviceAccountPath);
const serviceAccount = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
