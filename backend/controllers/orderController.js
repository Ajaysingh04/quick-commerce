import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Store from '../models/Store.js';
import Coupon from '../models/Coupon.js';
import Settings from '../models/Settings.js';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Initialize Stripe & Razorpay (with mock fallbacks)
const stripe = process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('mock')
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const razorpay = process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('mock')
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID.trim(),
      key_secret: process.env.RAZORPAY_KEY_SECRET.trim()
    })
  : null;

// @desc    Create Razorpay Intent (without saving DB order)
// @route   POST /api/orders/razorpay-intent
// @access  Private (JWT Access)
import mongoose from 'mongoose';

export const createRazorpayIntent = async (req, res) => {
  let { storeId, items, paymentMethod, couponCode } = req.body;

  try {
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID?.trim();
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!razorpayKeyId || !razorpayKeySecret || razorpayKeyId.includes('your_') || razorpayKeySecret.includes('your_')) {
      return res.status(400).json({
        message: 'Razorpay payment is not configured for this environment. Please add valid Razorpay keys.'
      });
    }

    // Prevent CastError for mock data
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      storeId = new mongoose.Types.ObjectId().toString();
    }
    
    let subtotal = 0;
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        subtotal += (item.price || 300) * item.quantity;
        continue;
      }
      const productItem = await Product.findById(item.productId);
      if (productItem) subtotal += productItem.price * item.quantity;
    }

    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        const now = new Date();
        if (now >= coupon.validFrom && now <= coupon.validTo && subtotal >= coupon.minOrderValue) {
          discount = Math.round((subtotal * coupon.discountPercent) / 100);
          if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
        }
      }
    }

    let distance = 20;
    if (mongoose.Types.ObjectId.isValid(storeId)) {
      const store = await Store.findById(storeId);
      if (store) distance = store.distance || 2;
    }
    const deliveryFee = subtotal >= 500 ? 0 : 40;
    const codCharge = paymentMethod === 'cod' ? Math.ceil(distance) * 5 : 0;
    const extraDistanceSurcharge = distance > 5 ? Math.ceil(distance - 5) * 4.75 : 0;
    
    // Fetch custom charges from settings
    const settings = await Settings.findOne();
    const customCharges = settings?.customCharges?.filter(c => c.isActive && (c.season === 'all' || c.season === settings.activeSeason)) || [];
    let customChargesTotal = 0;
    customCharges.forEach(charge => {
      if (charge.type === 'percentage') {
        customChargesTotal += Math.round(subtotal * (charge.value / 100));
      } else {
        customChargesTotal += charge.value;
      }
    });

    const grandTotal = subtotal + deliveryFee + codCharge + extraDistanceSurcharge + customChargesTotal - discount;

    if (razorpay) {
      const rzpOrder = await razorpay.orders.create({
        amount: Math.round(grandTotal * 100), // paise
        currency: 'INR',
        receipt: `intent_${Date.now()}`
      });
      return res.status(200).json({
        razorpayOrderId: rzpOrder.id,
        amount: Math.round(grandTotal * 100),
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID.trim()
      });
    } else {
      return res.status(200).json({
        mockOrderId: `mock_rzp_${Date.now()}`
      });
    }
  } catch (error) {
    console.error("Razorpay Intent Error: ", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Place a new checkout order and save verification details
// @route   POST /api/orders
// @access  Private (JWT Access)
export const createOrder = async (req, res) => {
  let { storeId, items, deliveryAddress, paymentMethod, couponCode, preVerified, razorpayPaymentDetails } = req.body;

  try {
    // Prevent CastError and handle deleted mock stores from frontend cache
    if (mongoose.Types.ObjectId.isValid(storeId)) {
      const exists = await Store.findById(storeId);
      if (!exists) {
        const fallback = await Store.findOne({});
        if (fallback) storeId = fallback._id.toString();
      }
    } else {
      const fallback = await Store.findOne({});
      if (fallback) {
        storeId = fallback._id.toString();
      } else {
        storeId = new mongoose.Types.ObjectId().toString();
      }
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // 1. Calculate subtotals and pull product item details
    let subtotal = 0;
    const dbItems = [];

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        subtotal += (item.price || 300) * item.quantity;
        dbItems.push({
          product: new mongoose.Types.ObjectId(),
          quantity: item.quantity,
          price: item.price || 300
        });
        continue;
      }
      
      const productItem = await Product.findById(item.productId);
      if (!productItem) {
        return res.status(404).json({ message: `Product item ${item.productId} not found` });
      }
      subtotal += productItem.price * item.quantity;
      dbItems.push({
        product: productItem._id,
        quantity: item.quantity,
        price: productItem.price
      });
    }

    // 2. Coupon Validation
    let discount = 0;
    let couponAppliedId = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        const now = new Date();
        if (now >= coupon.validFrom && now <= coupon.validTo && subtotal >= coupon.minOrderValue) {
          discount = Math.round((subtotal * coupon.discountPercent) / 100);
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
          couponAppliedId = coupon._id;
        }
      }
    }

    let distance = 2;
    if (mongoose.Types.ObjectId.isValid(storeId)) {
      const store = await Store.findById(storeId);
      if (store) distance = store.distance || 2;
    }
    
    const deliveryFee = subtotal >= 500 ? 0 : 40; // Free delivery above 500
    
    // Calculate COD Charge (5 rupees per km)
    const codCharge = paymentMethod === 'cod' ? Math.ceil(distance) * 5 : 0;
    const extraDistanceSurcharge = distance > 5 ? Math.ceil(distance - 5) * 4.75 : 0;
    
    // Calculate Custom Charges (incl GST)
    const settings = await Settings.findOne();
    const activeCustomCharges = settings?.customCharges?.filter(c => c.isActive && (c.season === 'all' || c.season === settings.activeSeason)) || [];
    let customChargesTotal = 0;
    const appliedCharges = [];
    
    activeCustomCharges.forEach(charge => {
      let amt = 0;
      if (charge.type === 'percentage') {
        amt = Math.round(subtotal * (charge.value / 100));
      } else {
        amt = charge.value;
      }
      customChargesTotal += amt;
      appliedCharges.push({ name: charge.name, amount: amt });
    });

    const grandTotal = subtotal + deliveryFee + codCharge + extraDistanceSurcharge + customChargesTotal - discount;

    // 4. Create Order database record
    const order = await Order.create({
      user: req.user._id,
      store: storeId,
      items: dbItems,
      deliveryAddress,
      billDetails: {
        subtotal,
        deliveryFee,
        tax: 0, // Migrated to appliedCharges
        codCharge,
        extraDistanceSurcharge,
        appliedCharges,
        discount,
        grandTotal
      },
      couponApplied: couponAppliedId,
      paymentDetails: {
        method: paymentMethod,
        status: (paymentMethod === 'cod' || !preVerified) ? 'pending' : 'paid',
        gateway: paymentMethod === 'cod' ? 'none' : 'razorpay',
        paymentId: preVerified ? `mock_rzp_${Date.now()}` : undefined
      }
    });

    // 4b. Quick Commerce: Decrement Inventory Stock
    for (const item of dbItems) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: -item.quantity }
        });
        
        // Check if out of stock
        const updatedProduct = await Product.findById(item.product);
        if (updatedProduct && updatedProduct.stockQuantity <= 0) {
          updatedProduct.inStock = false;
          await updatedProduct.save();
        }
      }
    }

    // 5. Payment Details Assignment
    if (preVerified && razorpayPaymentDetails) {
      if (razorpayPaymentDetails.razorpay_signature && razorpay) {
        // Real Razorpay signature verification
        const sign = razorpayPaymentDetails.razorpay_order_id + "|" + razorpayPaymentDetails.razorpay_payment_id;
        const expectedSign = crypto
          .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
          .update(sign.toString())
          .digest("hex");

        if (razorpayPaymentDetails.razorpay_signature !== expectedSign) {
          return res.status(400).json({ message: "Invalid payment signature" });
        }
        order.paymentDetails.paymentId = razorpayPaymentDetails.razorpay_payment_id;
      } else {
        // Mock payment flow
        order.paymentDetails.paymentId = razorpayPaymentDetails.razorpay_payment_id || `mock_rzp_${Date.now()}`;
      }
      await order.save();
    }

    // Trigger websocket for delivery partners and admins to pick it up
    if (global.io && order.status === 'placed') {
      // populate the order slightly to send to drivers
      const populatedOrder = await Order.findById(order._id)
        .populate('store', 'name distance owner')
        .populate('user', 'name phone');
      
      global.io.to('delivery_partners').emit('newOrderAvailable', populatedOrder);
      // Emit to admin dashboard
      global.io.emit('newOrderReceived', populatedOrder);
      global.io.emit('adminNotification', {
        title: 'New Order Received',
        message: `Order #${populatedOrder._id.toString().slice(-6).toUpperCase()} received from ${populatedOrder.user?.name || 'Customer'}.`,
        date: new Date().toISOString()
      });
      
      // Emit specifically to the store owner if connected
      if (populatedOrder.store?.owner) {
        global.io.emit(`newOrderPartner_${populatedOrder.store.owner.toString()}`, populatedOrder);
      }
    }

    // Cash on delivery redirect
    res.status(201).json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private (JWT Access)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('store', 'name bannerImage description distance deliveryTime')
      .populate('items.product', 'name image isVeg')
      .populate('deliveryPartner', 'name phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Auth restriction
    if (req.user.role === 'user' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to order logs' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private (JWT Access)
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('store', 'name bannerImage')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('store', 'name bannerImage')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders for Store Partner
// @route   GET /api/orders/partner
// @access  Private/Partner
export const getPartnerOrders = async (req, res) => {
  try {
    // 1. Find all stores owned by this partner
    const stores = await Store.find({ owner: req.user._id });
    const storeIds = stores.map(r => r._id);
    
    // 2. Find all orders belonging to those stores
    const orders = await Order.find({ store: { $in: storeIds } })
      .populate('user', 'name email phone')
      .populate('deliveryPartner', 'name phone')
      .populate('items.product', 'name image isVeg')
      .sort({ createdAt: -1 });
      
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get delivery partner assigned orders
// @route   GET /api/delivery/assigned
// @access  Private/Delivery
export const getAssignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { deliveryPartner: req.user._id },
        { status: { $in: ['preparing', 'ready'] }, deliveryPartner: { $exists: false } } // Unassigned pool
      ]
    })
    .populate('store', 'name bannerImage coordinates deliveryAddress')
    .populate('user', 'name phone')
    .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin or Delivery
export const updateOrderStatus = async (req, res) => {
  const { status, paymentStatus, deliveryPartnerId, codPaidViaQr } = req.body;

  try {
    const order = await Order.findById(req.params.id)
      .populate('store', 'name bannerImage coordinates deliveryAddress')
      .populate('user', 'name phone');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Role safety restrictions
    if (req.user.role === 'delivery') {
      // Delivery partners can claim or change transitions
      if (['confirmed', 'out-for-delivery', 'delivered'].includes(status)) {
        order.status = status;
        if (status === 'out-for-delivery' && !order.pickedUpAt) order.pickedUpAt = new Date();
        if (status === 'delivered') {
          order.deliveredAt = new Date();
          if (codPaidViaQr) {
            order.codPaidViaQr = true;
            order.paymentDetails.status = 'completed';
          }
        }
      }
      if (!order.deliveryPartner) {
        order.deliveryPartner = req.user._id;
      }
    } else if (req.user.role === 'admin' || req.user.role === 'partner') {
      if (status) {
        order.status = status;
        if (status === 'out-for-delivery' && !order.pickedUpAt) order.pickedUpAt = new Date();
        if (status === 'delivered') {
          order.deliveredAt = new Date();
          if (codPaidViaQr) {
            order.codPaidViaQr = true;
            order.paymentDetails.status = 'completed';
          }
        }
      }
      if (paymentStatus) order.paymentDetails.status = paymentStatus;
      if (deliveryPartnerId) order.deliveryPartner = deliveryPartnerId;
    }

    await order.save();

    // Trigger websocket status dispatch hook
    if (global.io) {
      global.io.to(`order_${order._id}`).emit('orderStatusUpdated', {
        orderId: order._id,
        status: order.status,
        paymentStatus: order.paymentDetails.status,
        deliveryPartner: order.deliveryPartner,
        pickedUpAt: order.pickedUpAt,
        deliveredAt: order.deliveredAt,
        codPaidViaQr: order.codPaidViaQr
      });

      // Emit to admin dashboard
      global.io.emit('adminOrderUpdate', {
        orderId: order._id,
        status: order.status,
        paymentStatus: order.paymentDetails.status,
        pickedUpAt: order.pickedUpAt,
        deliveredAt: order.deliveredAt,
        deliveryPartner: order.deliveryPartner,
        codPaidViaQr: order.codPaidViaQr
      });

      // Send live notification popup to Admin
      const riderName = req.user?.name || 'Delivery Partner';
      let notifTitle = 'Order Update';
      let notifMsg = `Order #${String(order._id).slice(-6)} is now ${order.status}`;

      if (order.status === 'confirmed') {
        notifTitle = 'Order Claimed';
        notifMsg = `${riderName} accepted order #${String(order._id).slice(-6)}`;
      } else if (order.status === 'out-for-delivery') {
        notifTitle = 'Out For Delivery';
        notifMsg = `${riderName} picked up order #${String(order._id).slice(-6)} and is on the way!`;
      } else if (order.status === 'delivered') {
        notifTitle = 'Order Delivered';
        notifMsg = `${riderName} successfully delivered order #${String(order._id).slice(-6)}`;
      }

      global.io.emit('adminNotification', {
        title: notifTitle,
        message: notifMsg,
        orderId: order._id,
        status: order.status,
        date: new Date()
      });

      // If it became preparing or ready, let delivery partners know!
      if (['preparing', 'ready'].includes(order.status) && !order.deliveryPartner) {
        global.io.to('delivery_partners').emit('newOrderAvailable', order);
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Store Pickup QR Scan by Delivery Partner
// @route   POST /api/orders/:id/pickup-scan
// @access  Private/Delivery or Admin or Partner
export const pickupScanOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('store', 'name bannerImage coordinates deliveryAddress')
      .populate('user', 'name phone email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.pickedUpAt = order.pickedUpAt || new Date();
    order.status = 'out-for-delivery';
    if (!order.deliveryPartner && req.user.role === 'delivery') {
      order.deliveryPartner = req.user._id;
    }

    await order.save();

    const riderName = req.user?.name || 'Delivery Partner';

    if (global.io) {
      global.io.to(`order_${order._id}`).emit('orderStatusUpdated', {
        orderId: order._id,
        status: 'out-for-delivery',
        pickedUpAt: order.pickedUpAt,
        deliveryPartner: order.deliveryPartner
      });

      global.io.to(`order_${order._id}`).emit('orderPickedUp', {
        orderId: order._id,
        pickedUpAt: order.pickedUpAt,
        deliveryPartner: order.deliveryPartner
      });

      global.io.emit('adminOrderUpdate', {
        orderId: order._id,
        status: 'out-for-delivery',
        pickedUpAt: order.pickedUpAt,
        deliveryPartner: order.deliveryPartner
      });

      global.io.emit('adminNotification', {
        title: 'Order Picked Up',
        message: `${riderName} picked up order #${String(order._id).slice(-6)} from store`,
        orderId: order._id,
        status: 'out-for-delivery',
        date: new Date()
      });
    }

    res.json({
      message: 'Pickup verified successfully. Customer details unlocked.',
      order
    });
  } catch (error) {
    console.error('Pickup scan error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit 2-way rating for order (Rider or Customer)
// @route   POST /api/orders/:id/rate
// @access  Private (User or Delivery or Admin)
export const rateOrder = async (req, res) => {
  const { riderRating, customerRating, feedback } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.rating) {
      order.rating = {};
    }

    if (riderRating !== undefined) {
      order.rating.riderRating = Number(riderRating);
    }
    if (customerRating !== undefined) {
      order.rating.customerRating = Number(customerRating);
    }
    if (feedback) {
      order.rating.feedback = feedback;
    }

    await order.save();

    if (global.io) {
      global.io.to(`order_${order._id}`).emit('orderRated', {
        orderId: order._id,
        rating: order.rating
      });

      global.io.emit('adminOrderUpdate', {
        orderId: order._id,
        rating: order.rating
      });
    }

    res.json({ message: 'Rating submitted successfully', rating: order.rating });
  } catch (error) {
    console.error('Rating submission error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update delivery live GPS coordinates
// @route   PUT /api/delivery/coordinates
// @access  Private/Delivery
export const updateDeliveryCoordinates = async (req, res) => {
  const { orderId, lat, lng } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.deliveryCoordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };
    await order.save();

    // Broadcast GPS location via Socket
    if (global.io) {
      global.io.to(`order_${orderId}`).emit('coordinatesUpdated', {
        orderId,
        coordinates: order.deliveryCoordinates
      });
    }

    res.json({ message: 'Coordinates shared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private (JWT Access)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to cancel order' });
    }

    if (['out-for-delivery', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ message: `Cannot cancel order in ${order.status} state` });
    }

    order.status = 'cancelled';
    
    // Automatically trigger refund request if payment was completed
    if (order.paymentDetails.method !== 'cod' && ['paid', 'completed'].includes(order.paymentDetails.status)) {
      order.paymentDetails.status = 'refund_requested';
    }

    await order.save();

    // Notify others via socket
    if (global.io) {
      global.io.to(`order_${order._id}`).emit('orderStatusUpdated', {
        orderId: order._id,
        status: order.status,
        paymentStatus: order.paymentDetails.status
      });
      global.io.emit('adminOrderUpdate', {
        orderId: order._id,
        status: order.status,
        paymentStatus: order.paymentDetails.status
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request a refund for a cancelled order
// @route   PUT /api/orders/:id/refund
// @access  Private (JWT Access)
export const requestRefund = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (order.status !== 'cancelled') {
      return res.status(400).json({ message: 'Order must be cancelled first' });
    }

    if (order.paymentDetails.method === 'cod') {
      return res.status(400).json({ message: 'COD orders cannot be refunded' });
    }

    if (!['paid', 'completed'].includes(order.paymentDetails.status)) {
      return res.status(400).json({ message: 'Payment must be completed to request a refund' });
    }

    order.paymentDetails.status = 'refund_requested';
    await order.save();

    if (global.io) {
      global.io.to(`order_${order._id}`).emit('orderStatusUpdated', {
        orderId: order._id,
        status: order.status,
        paymentStatus: order.paymentDetails.status
      });
      global.io.emit('adminOrderUpdate', {
        orderId: order._id,
        status: order.status,
        paymentStatus: order.paymentDetails.status
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/orders/verify-payment
// @access  Private (JWT Access)
export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  try {
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentDetails.status = 'completed';
        order.paymentDetails.paymentId = razorpay_payment_id;
        await order.save();
        return res.status(200).json({ message: "Payment verified successfully", order });
      } else {
        return res.status(404).json({ message: "Order not found" });
      }
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.deleteOne();

    if (global.io) {
      global.io.emit('adminOrderDelete', { orderId: req.params.id });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
