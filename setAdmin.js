// setAdmin.js
import admin from './firebaseAdmin.js';  // Adjust path if needed

async function setAdmin() {
  const uid = '7RZVIVSYo7T0DtHlKBjFeMxrRWI3'; // Replace with the user's UID who should be admin

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`User ${uid} is now admin!`);
  } catch (err) {
    console.error('Failed to set admin claim:', err);
  }
}

setAdmin();
