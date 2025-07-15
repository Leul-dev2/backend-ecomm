const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

exports.syncChatToMongo = functions.firestore
  .document('chats/{chatId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const chatId = context.params.chatId;

    if (!data) return null;

    try {
      await axios.post('https://YOUR_BACKEND_URL/api/chats/sync', {
        messageId: chatId,
        text: data.text,
        participants: data.participants,
        timestamp: data.timestamp,
      });
      console.log(`Synced chat ${chatId} to backend`);
    } catch (error) {
      console.error('Failed to sync chat:', error.message);
    }

    return null;
  });
