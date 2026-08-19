import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  inStock: { type: Boolean, default: true },
  stockQuantity: { type: Number, default: 100 },
  weight: { type: String },
  originalPrice: { type: Number },
  discount: { type: String },
  sku: { type: String, index: true },
  brand: { type: String, default: '' },
  arModelUrl: { type: String, default: '' }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
