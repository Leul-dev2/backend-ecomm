// models/Review.js
import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  // ✅ FIXED: store Firebase UID as plain String, not ObjectId
  userId: { type: String, required: true },
  name: { type: String, required: true },
  avatarUrl: { type: String },
  rating: { type: Number, required: true, min: 0, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
  approved: { type: Boolean, default: false },
});

const Review = mongoose.model('Review', ReviewSchema);
export default Review;
