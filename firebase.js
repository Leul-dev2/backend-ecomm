import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables from a .env file
dotenv.config();

// Get the service account key from environment variables
const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

// Check if the environment variable is set
if (!serviceAccountJson) {
  // Use a clear and helpful error message
  console.error('Missing GOOGLE_SERVICE_ACCOUNT_KEY in environment variables.');
  console.error('Please add the service account key as a JSON string to your .env file.');
  // Exit with an error code
  process.exit(1);
}

// Parse the JSON string into a JavaScript object
let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountJson);
} catch (error) {
  console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY JSON string:', error);
  process.exit(1);
}

// Initialize Firebase Admin SDK only if it hasn't been initialized already
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // You can optionally add other configuration here if needed,
    // like databaseURL or storageBucket
  });

  console.log('Firebase Admin SDK initialized successfully.');
}

// Export both the admin SDK and the firestore database instance for use in other files
const db = admin.firestore();

export { admin, db };