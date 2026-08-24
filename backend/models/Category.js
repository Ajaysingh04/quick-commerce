import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String }, // Emoji or icon code (e.g. '🍕', '🍔')
  image: { type: String }, // For Home page cards
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;
