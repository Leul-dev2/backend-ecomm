// models/Category.js
import mongoose from 'mongoose';

const SubCategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  thumbnail: String,
});

const CategorySchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  image: String,
  svgSrc: String,
  thumbnail: String,
  label: String,
  subCategories: [SubCategorySchema],
});

export default mongoose.model('Category', CategorySchema);
