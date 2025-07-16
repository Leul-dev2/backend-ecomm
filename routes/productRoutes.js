import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const router = express.Router();

// Get all products (optionally filtered by category title)
router.get('/', async (req, res) => {
  try {
    let filter = {};
    if (req.query.category) {
      const category = await Category.findOne({ title: req.query.category });
      if (category) filter.category = category._id;
      else filter.category = null; // no products if category doesn't exist
    }
    // Populate category details in products
    const products = await Product.find(filter).populate('category');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get product by SKU
router.get('/:sku', async (req, res) => {
  try {
    const product = await Product.findOne({ sku: req.params.sku.trim() }).populate('category');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new product with category link
router.post('/', async (req, res) => {
  try {
    const category = await Category.findOne({ title: req.body.categoryTitle });
    if (!category) return res.status(400).json({ message: 'Category not found' });

    const productData = {
      ...req.body,
      category: category._id,
    };
    delete productData.categoryTitle; // remove temporary field

    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update product by SKU, including category update
router.put('/:sku', async (req, res) => {
  try {
    const product = await Product.findOne({ sku: req.params.sku.trim() });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (req.body.categoryTitle) {
      const category = await Category.findOne({ title: req.body.categoryTitle });
      if (!category) return res.status(400).json({ message: 'Category not found' });
      req.body.category = category._id;
      delete req.body.categoryTitle;
    }

    Object.assign(product, req.body);
    await product.save();

    const updatedProduct = await Product.findById(product._id).populate('category');
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete product by SKU
router.delete('/:sku', async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ sku: req.params.sku.trim() });
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
