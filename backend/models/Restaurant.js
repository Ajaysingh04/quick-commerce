import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String },
  bannerImage: { type: String, required: true }, // Cloudinary URL or local placeholder path
  cuisineTypes: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  deliveryTime: { type: Number, required: true }, // average in mins
  distance: { type: Number }, // in km from user coordinates
  costForTwo: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  staff: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['Manager', 'Kitchen Staff'] },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    addedOn: { type: Date, default: Date.now }
  }],
  staffInvites: [{
    email: { type: String, required: true },
    role: { type: String, required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    invitedOn: { type: Date, default: Date.now }
  }],
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String }
  },
  bankDetails: {
    bankName: { type: String },
    accountHolderName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String }
  },
  gstDetails: {
    gstNumber: { type: String },
    panNumber: { type: String }
  },
  openingHours: {
    open: { type: String, default: '10:00' },
    close: { type: String, default: '22:00' }
  },
  // Quick Commerce Fields
  inventoryManagement: { type: Boolean, default: true },
  deliveryRadius: { type: Number, default: 5 }, // in km for ultra-fast delivery
  storeType: { type: String, enum: ['grocery', 'pharmacy', 'electronics', 'food'], default: 'grocery' }
}, { timestamps: true });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
