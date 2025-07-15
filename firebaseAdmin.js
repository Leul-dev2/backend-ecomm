// firebaseAdmin.js
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// ✅ 1️⃣ Make sure the env variable exists
if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
  throw new Error('❌ Missing GOOGLE_SERVICE_ACCOUNT_KEY in environment variables');
}

// ✅ 2️⃣ Parse the JSON string from .env
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

// ✅ 3️⃣ Fix private_key newlines
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

// ✅ 4️⃣ (Optional) Debug check - remove in production
console.log('====== ✅ Firebase private key loaded: first 50 chars ======');
console.log(serviceAccount.private_key.slice(0, 50));
console.log('============================================================');

// ✅ 5️⃣ Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
