import express from 'express';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

const router = express.Router();

// ✅ 1. Specific route FIRST!
router.get('/pending', async (req, res) => {
  try {
    const pendingReviews = await Review.find({ approved: false }).populate('product');
    res.json(pendingReviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ 2. Get all reviews for a specific product
router.get('/:productId/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
      .populate('reviews')
      .exec();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product.reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ 3. Add new review
router.post('/:productId/reviews', async (req, res) => {
  try {
    const { userId, name, avatarUrl, rating, comment } = req.body;

    if (!rating || !userId) {
      return res.status(400).json({ message: 'Rating and userId are required' });
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = new Review({
      product: product._id,
      userId,
      name,
      avatarUrl,
      rating,
      comment,
      approved: false,
    });

    await review.save();

    product.reviews.push(review._id);
    await product.save();

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ 4. Approve a review
router.patch('/:reviewId/approve', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { approved: true },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
