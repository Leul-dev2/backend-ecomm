import express from 'express';
import Review from '../models/Review.js';
const router = express.Router();

router.get('/pending', async (req, res) => {
  try {
    const pendingReviews = await Review.find({ approved: false }).populate('product');
    res.json(pendingReviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:reviewId/approve', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.reviewId, { approved: true }, { new: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
