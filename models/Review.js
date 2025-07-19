import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    avatarUrl: { type: String },
    rating: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true } // ✅ Proper auto `createdAt` + `updatedAt`
);

const Review = mongoose.model('Review', ReviewSchema);
export default Review;
