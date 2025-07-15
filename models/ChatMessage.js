// models/ChatMessage.js
import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  messageId: { type: String, unique: true },
  text: String,
  participants: [String],
  timestamp: Date,
});

export default mongoose.model('ChatMessage', chatMessageSchema);
