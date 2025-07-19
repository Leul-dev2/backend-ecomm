import express from 'express';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

const router = express.Router();

// 1. Get pending reviews (Admin dashboard)
router.get('/pending', async (req, res) => {
  try {
    const pendingReviews = await Review.find({ approved: false }).populate('product');
    res.json(pendingReviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2a. Get reviews for a product — new route pattern (Admin dashboard or new frontend)
router.get('/product/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate('reviews').exec();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product.reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2b. Get reviews for a product — legacy Flutter route pattern (optional)
router.get('/products/:productId/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate('reviews').exec();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product.reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3a. Add review for a product — new route pattern (Admin dashboard or new frontend)
router.post('/product/:productId', async (req, res) => {
  try {
    const { userId, name, avatarUrl, rating, comment } = req.body;
    if (!rating || !userId) return res.status(400).json({ message: 'Rating and userId required' });

    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

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

// 3b. Add review for a product — legacy Flutter route pattern (optional)
router.post('/products/:productId/reviews', async (req, res) => {
  try {
    const { userId, name, avatarUrl, rating, comment } = req.body;
    if (!rating || !userId) return res.status(400).json({ message: 'Rating and userId required' });

    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

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

// 3c. Add review for a product — **Flutter required route** (fixes 404 on Flutter POST)
// Matches POST /api/products/:productId/reviews exactly (no double products)
router.post('/:productId/reviews', async (req, res) => {
  try {
    const { userId, name, avatarUrl, rating, comment } = req.body;
    if (!rating || !userId) return res.status(400).json({ message: 'Rating and userId required' });

    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

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

// 4. Approve a review (Admin dashboard)
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
