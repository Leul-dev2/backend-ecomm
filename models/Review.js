import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  avatarUrl: String,
  timeAgo: String,
  rating: Number,
  comment: String,
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
