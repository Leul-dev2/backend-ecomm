// routes/categories.js

import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

// Add multiple categories
router.post('/seed', async (req, res) => {
  try {
    const categories = req.body.categories;

    // Insert many documents at once
    await Category.insertMany(categories);

    res.status(201).json({ message: 'Categories seeded successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to seed categories' });
  }
});

export default router;
