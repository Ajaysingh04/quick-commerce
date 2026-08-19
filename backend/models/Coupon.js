import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  discountPercent: { type: Number, required: true, min: 0, max: 100 },
  maxDiscount: { type: Number }, // max discount limit in INR
  minOrderValue: { type: Number, default: 0 },
  validFrom: { type: Date, default: Date.now },
  validTo: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
