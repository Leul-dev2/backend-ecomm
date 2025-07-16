import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Add a new product
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product by SKU
router.get('/:sku', async (req, res) => {
  try {
    const { sku } = req.params;
    const product = await Product.findOne({ sku: sku.trim() });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product by SKU (this is missing in your code)
router.put('/:sku', async (req, res) => {
  try {
    const { sku } = req.params;
    const updated = await Product.findOneAndUpdate(
      { sku: sku.trim() },
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
});

// Delete product by SKU
router.delete('/:sku', async (req, res) => {
  try {
    const { sku } = req.params;
    const deleted = await Product.findOneAndDelete({ sku: sku.trim() });
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
