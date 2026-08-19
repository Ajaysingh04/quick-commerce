import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' }, // Work, Home, Other
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  phone: { type: String },
  alternatePhone: { type: String },
  role: { type: String, enum: ['user', 'admin', 'delivery', 'partner'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  otp: {
    code: { type: String },
    expiresAt: { type: Date }
  },
  googleId: { type: String },
  clerkId: { type: String, unique: true, sparse: true },
  avatar: { type: String },
  addresses: [addressSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  refreshToken: { type: String },
  searchHistory: [{ type: String }],
  loyalty: {
    coins: { type: Number, default: 0 },
    level: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
    badges: [{ type: String }],
    lastSpin: { type: Date }
  },
  subscription: {
    plan: { type: String, enum: ['free', 'monthly_premium'], default: 'free' },
    expiresAt: { type: Date }
  },
  kyc: {
    status: { type: String, enum: ['pending', 'pending_review', 'approved', 'rejected'], default: 'pending' },
    pan: { type: String },
    aadhar: { type: String },
    license: { type: String },
    selfieVideo: { type: String }
  },
  bankDetails: {
    bankName: { type: String },
    accountHolderName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String }
  },
  deliveryDetails: {
    vehicleType: { type: String, enum: ['bike', 'bicycle', 'car'], default: 'bike' },
    licensePlate: { type: String },
    preferences: {
      pushNotifications: { type: Boolean, default: true },
      autoAccept: { type: Boolean, default: false },
      soundAlerts: { type: Boolean, default: true },
      navigationApp: { type: String, enum: ['in-app', 'google-maps'], default: 'in-app' },
      twoFactor: { type: Boolean, default: false }
    }
  },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password helper
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
