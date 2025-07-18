import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true, trim: true },
  image: { type: String, required: true, trim: true },
  brandName: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  priceAfterDiscount: { type: Number, min: 0 },
  discountPercent: { type: Number, min: 0, max: 100 },
  description: { type: String, trim: true },
  rating: { type: Number, min: 0, max: 5 },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId }, // <--- add this
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
export default Product;
