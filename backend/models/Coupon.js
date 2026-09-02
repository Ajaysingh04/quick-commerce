import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  discountType: { type: String, enum: ['percentage', 'flat', 'bogo'], default: 'percentage' },
  discountValue: { type: Number }, // percentage or flat amount. Nullable for bogo.
  discountPercent: { type: Number }, // legacy support if needed
  maxDiscount: { type: Number }, // max discount limit in INR
  minOrderValue: { type: Number, default: 0 },
  usageLimit: { type: Number }, // Max times this coupon can be used total
  usedCount: { type: Number, default: 0 },
  validFrom: { type: Date, default: Date.now },
  validTo: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' } // If null, applies platform-wide
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
