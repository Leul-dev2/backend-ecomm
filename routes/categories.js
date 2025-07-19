import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new category
router.post('/', async (req, res) => {
  try {
    const { title, image, svgSrc, thumbnail, label, subCategories } = req.body;

    const category = new Category({
      title,
      image,
      svgSrc,
      thumbnail,
      label,
      subCategories: subCategories || []
    });

    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add subcategories
router.post('/:id/subcategories', async (req, res) => {
  try {
    const { subCategories } = req.body;
    if (!Array.isArray(subCategories)) {
      return res.status(400).json({ message: 'subCategories must be an array' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    category.subCategories.push(...subCategories);
    await category.save();

    res.status(200).json(category); // ✅ returns updated category
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update subcategory
router.put('/:categoryId/subcategories/:subCategoryId', async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.params;
    const { title, thumbnail } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const sub = category.subCategories.id(subCategoryId);
    if (!sub) return res.status(404).json({ message: 'Subcategory not found' });

    if (title) sub.title = title;
    if (thumbnail) sub.thumbnail = thumbnail;

    await category.save();
    res.json(category); // ✅ updated category returned
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete subcategory
router.delete('/:categoryId/subcategories/:subCategoryId', async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const sub = category.subCategories.id(subCategoryId);
    if (!sub) return res.status(404).json({ message: 'Subcategory not found' });

    sub.remove();
    await category.save();

    res.json(category); // ✅ updated category returned
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
