import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  billDetails: {
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 40 },
    tax: { type: Number, required: true },
    codCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true }
  },
  couponApplied: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  paymentDetails: {
    method: { type: String, enum: ['cod', 'card', 'upi'], required: true },
    gateway: { type: String, enum: ['stripe', 'razorpay', 'none'], default: 'none' },
    paymentId: { type: String },
    status: { type: String, enum: ['pending', 'paid', 'completed', 'failed', 'refund_requested', 'refunded'], default: 'pending' }
  },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'placed',
    index: true
  },
  deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // role must be 'delivery'
  deliveryCoordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  deliveredAt: { type: Date }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
