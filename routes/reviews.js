const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Review');

// Get product with reviews populated
router.get('/:productId/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
      .populate('reviews')
      .exec();

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product.reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new review
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
    });

    await review.save();

    product.reviews.push(review._id);
    await product.save();

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
