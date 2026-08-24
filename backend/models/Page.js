import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Page = mongoose.model('Page', pageSchema);
export default Page;
