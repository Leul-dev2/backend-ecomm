import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const router = express.Router();

/* 
  ✅ GET ALL PRODUCTS 
  Supports ?category=... and ?subcategory=...
*/
router.get('/', async (req, res) => {
  try {
    let filter = {};
    let category = null;

    // 🌟 1) Match Category by title
    if (req.query.category) {
      category = await Category.findOne({ title: req.query.category });
      if (category) filter.category = category._id;
      else filter.category = null; // no match = empty result
    }

    // 🌟 2) If subcategory query, resolve its ID
    if (req.query.subcategory && category) {
      const subcat = category.subCategories.find(
        (sc) => sc.title.toLowerCase() === req.query.subcategory.toLowerCase()
      );
      if (subcat) {
        filter.subcategory = subcat._id;
      } else {
        filter.subcategory = null; // no match = empty result
      }
    }

    // 🌟 3) Fetch + populate
    const products = await Product.find(filter).populate('category');

    // 🌟 4) Append subcategoryTitle to response
    const productsWithSubs = products.map((prod) => {
      let subcategoryTitle = null;
      if (prod.subcategory && prod.category?.subCategories) {
        const sub = prod.category.subCategories.find((sc) =>
          sc._id.equals(prod.subcategory)
        );
        if (sub) subcategoryTitle = sub.title;
      }
      return { ...prod.toObject(), subcategoryTitle };
    });

    res.json(productsWithSubs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/*
  ✅ GET SINGLE PRODUCT BY SKU
*/
router.get('/:sku', async (req, res) => {
  try {
    const product = await Product.findOne({ sku: req.params.sku.trim() }).populate('category');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let subcategoryTitle = null;
    if (product.subcategory && product.category?.subCategories) {
      const sub = product.category.subCategories.find((sc) =>
        sc._id.equals(product.subcategory)
      );
      if (sub) subcategoryTitle = sub.title;
    }

    res.json({ ...product.toObject(), subcategoryTitle });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/*
  ✅ CREATE PRODUCT
  Expects: { ..., categoryTitle: "...", subcategoryTitle: "..." }
*/
router.post('/', async (req, res) => {
  try {
    const category = await Category.findOne({ title: req.body.categoryTitle });
    if (!category) return res.status(400).json({ message: 'Category not found' });

    let subcategoryId = undefined;
    if (req.body.subcategoryTitle) {
      const sub = category.subCategories.find(
        (s) => s.title.toLowerCase() === req.body.subcategoryTitle.toLowerCase()
      );
      if (!sub) return res.status(400).json({ message: 'Subcategory not found' });
      subcategoryId = sub._id;
    }

    const productData = {
      ...req.body,
      category: category._id,
      subcategory: subcategoryId,
    };

    delete productData.categoryTitle;
    delete productData.subcategoryTitle;

    const product = new Product(productData);
    await product.save();

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/*
  ✅ UPDATE PRODUCT BY SKU
*/
router.put('/:sku', async (req, res) => {
  try {
    const product = await Product.findOne({ sku: req.params.sku.trim() });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (req.body.categoryTitle) {
      const category = await Category.findOne({ title: req.body.categoryTitle });
      if (!category) return res.status(400).json({ message: 'Category not found' });

      req.body.category = category._id;

      if (req.body.subcategoryTitle) {
        const sub = category.subCategories.find(
          (s) => s.title.toLowerCase() === req.body.subcategoryTitle.toLowerCase()
        );
        if (!sub) return res.status(400).json({ message: 'Subcategory not found' });

        req.body.subcategory = sub._id;
      } else {
        req.body.subcategory = undefined;
      }

      delete req.body.categoryTitle;
      delete req.body.subcategoryTitle;
    }

    Object.assign(product, req.body);
    await product.save();

    const updated = await Product.findById(product._id).populate('category');

    let subcategoryTitle = null;
    if (updated.subcategory && updated.category?.subCategories) {
      const sub = updated.category.subCategories.find((sc) =>
        sc._id.equals(updated.subcategory)
      );
      if (sub) subcategoryTitle = sub.title;
    }

    res.json({ ...updated.toObject(), subcategoryTitle });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/*
  ✅ DELETE PRODUCT BY SKU
*/
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
