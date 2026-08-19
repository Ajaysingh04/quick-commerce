import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String },
  bannerImage: { type: String, required: true },
  storeType: { type: String, enum: ['grocery', 'pharmacy', 'electronics', 'essentials', 'product'], default: 'grocery' },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  deliveryTime: { type: Number, required: true }, // average in mins
  distance: { type: Number }, // in km from user coordinates
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  staff: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['Manager', 'Staff'] },
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
    open: { type: String, default: '08:00' },
    close: { type: String, default: '22:00' }
  },
  inventoryManagement: { type: Boolean, default: true },
  deliveryRadius: { type: Number, default: 5 } // in km for ultra-fast delivery
}, { timestamps: true });

const Store = mongoose.model('Store', storeSchema);
export default Store;
