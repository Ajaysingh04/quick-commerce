import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  imageUrl: { type: String, required: true },
  linkUrl: { type: String, default: '' },
  position: { type: String, enum: ['hero', 'promotional'], default: 'promotional' },
  category: { type: String, enum: ['home', 'offer', 'about'], default: 'home' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
