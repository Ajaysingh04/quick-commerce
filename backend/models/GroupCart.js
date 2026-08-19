import mongoose from 'mongoose';

const groupCartSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  code: { type: String, required: true, unique: true, index: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String }
  }],
  items: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  status: { type: String, enum: ['active', 'locked', 'ordered'], default: 'active' }
}, { timestamps: true });

const GroupCart = mongoose.model('GroupCart', groupCartSchema);
export default GroupCart;
