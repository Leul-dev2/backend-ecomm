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

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new category WITH optional subcategories
router.post('/', async (req, res) => {
  try {
    const { title, image, svgSrc, thumbnail, label, subCategories } = req.body;

    const category = new Category({
      title,
      image,
      svgSrc,
      thumbnail,
      label,
      subCategories: subCategories || [],
    });

    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add one or more subcategories to an existing category
router.post('/:id/subcategories', async (req, res) => {
  try {
    const { subCategories } = req.body;

    if (!subCategories || !Array.isArray(subCategories)) {
      return res.status(400).json({ message: 'subCategories must be an array' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    category.subCategories.push(...subCategories);

    await category.save();
    res.status(200).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update category by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCategory) return res.status(404).json({ message: 'Category not found' });
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete category by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a subcategory by ID inside a category
router.put('/:categoryId/subcategories/:subCategoryId', async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.params;
    const { title, thumbnail } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const subCat = category.subCategories.id(subCategoryId);
    if (!subCat) return res.status(404).json({ message: 'Subcategory not found' });

    if (title !== undefined) subCat.title = title;
    if (thumbnail !== undefined) subCat.thumbnail = thumbnail;

    await category.save();
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ Delete a subcategory by ID inside a category (returns updated category!)
router.delete('/:categoryId/subcategories/:subCategoryId', async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const subCat = category.subCategories.id(subCategoryId);
    if (!subCat) return res.status(404).json({ message: 'Subcategory not found' });

    subCat.remove();
    await category.save();

    res.json(category); // ✅ Return the updated category!
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
