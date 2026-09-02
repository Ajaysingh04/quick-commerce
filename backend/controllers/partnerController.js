import Order from '../models/Order.js';
import Store from '../models/Store.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

// Helper to get partner's store
const getPartnerStore = async (userId) => {
  let store = await Store.findOne({ owner: userId });
  if (!store) {
    // Automatically provision a default store for the partner
    store = await Store.create({
      name: 'My Quick Commerce Store',
      owner: userId,
      description: 'Welcome to your new store dashboard.',
      isActive: true,
      category: 'Grocery',
      cuisineTypes: ['Essentials'],
      deliveryTime: 30, // Default required field
      bannerImage: '/assets/res_default.jpg' // Default required field
    });
  }
  return store;
};

// @desc    Get Partner Dashboard Stats
// @route   GET /api/partner/dashboard-stats
// @access  Private (Partner)
export const getDashboardStats = async (req, res) => {
  try {
    const store = await getPartnerStore(req.user._id);

    const orders = await Order.find({ store: store._id });
    
    let totalRevenue = 0;
    let pendingOrders = 0;
    let completedOrders = 0;

    orders.forEach(order => {
      if (order.status === 'delivered') {
        totalRevenue += order.billDetails.grandTotal;
        completedOrders += 1;
      }
      if (['placed', 'preparing', 'out-for-delivery'].includes(order.status)) {
        pendingOrders += 1;
      }
    });

    res.json({
      totalOrders: orders.length,
      totalRevenue,
      pendingOrders,
      completedOrders,
      storeRating: store.rating
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Partner Orders
// @route   GET /api/partner/orders
// @access  Private (Partner)
export const getOrders = async (req, res) => {
  try {
    const store = await getPartnerStore(req.user._id);
    const orders = await Order.find({ store: store._id })
      .populate('user', 'name email phone')
      .populate('items.product', 'name image isVeg')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Partner Menu
// @route   GET /api/partner/menu
// @access  Private (Partner)
export const getMenu = async (req, res) => {
  try {
    const store = await getPartnerStore(req.user._id);
    const products = await Product.find({ store: store._id }).populate('category');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Product Stock
// @route   PUT /api/partner/menu/:id/stock
// @access  Private (Partner)
export const updateProductStock = async (req, res) => {
  try {
    const { inStock } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.inStock = inStock;
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a New Product
// @route   POST /api/partner/menu
// @access  Private (Partner)
export const addProduct = async (req, res) => {
  try {
    const store = await getPartnerStore(req.user._id);
    const { name, description, price, originalPrice, stockQuantity, weight, sku, category, image, isVeg, isBestseller, inStock } = req.body;

    let categoryName = category || 'General';
    let categoryObj = await Category.findOne({ name: categoryName });
    if (!categoryObj) {
      categoryObj = await Category.create({ name: categoryName, isActive: true });
    }

    const newProduct = await Product.create({
      name,
      description,
      price,
      originalPrice,
      stockQuantity,
      weight,
      sku,
      category: categoryObj._id,
      image: image || '/assets/Fruits%20&%20Vegetables.jpg', // Fallback image
      isVeg,
      isPopular: isBestseller,
      inStock,
      store: store._id,
    });

    // Populate category before returning
    await newProduct.populate('category');

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an Existing Product
// @route   PUT /api/partner/menu/:id
// @access  Private (Partner)
export const updateProduct = async (req, res) => {
  try {
    const store = await getPartnerStore(req.user._id);
    const product = await Product.findOne({ _id: req.params.id, store: store._id });
    
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, description, price, originalPrice, stockQuantity, weight, sku, category, image, isVeg, isBestseller, inStock } = req.body;

    if (category) {
      let categoryObj = await Category.findOne({ name: category });
      if (!categoryObj) {
        categoryObj = await Category.create({ name: category, isActive: true });
      }
      product.category = categoryObj._id;
    }

    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (originalPrice !== undefined) product.originalPrice = originalPrice;
    if (stockQuantity !== undefined) product.stockQuantity = stockQuantity;
    if (weight !== undefined) product.weight = weight;
    if (sku !== undefined) product.sku = sku;
    if (image !== undefined && image !== '') product.image = image;
    if (isVeg !== undefined) product.isVeg = isVeg;
    if (isBestseller !== undefined) product.isPopular = isBestseller;
    if (inStock !== undefined) product.inStock = inStock;

    await product.save();
    await product.populate('category');

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a Product
// @route   DELETE /api/partner/menu/:id
// @access  Private (Partner)
export const deleteProduct = async (req, res) => {
  try {
    const store = await getPartnerStore(req.user._id);
    const product = await Product.findOneAndDelete({ _id: req.params.id, store: store._id });
    
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Partner Profile
// @route   GET /api/partner/profile
// @access  Private (Partner)
export const getProfile = async (req, res) => {
  try {
    const store = await getPartnerStore(req.user._id);
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Partner Profile
// @route   PUT /api/partner/profile
// @access  Private (Partner)
export const updateProfile = async (req, res) => {
  try {
    const store = await getPartnerStore(req.user._id);
    
    // Update allowed fields
    const { name, description, address, bankDetails, gstDetails, openingHours, bannerImage } = req.body;
    
    if (name) store.name = name;
    if (description) store.description = description;
    if (address) store.address = { ...store.address, ...address };
    if (bankDetails) store.bankDetails = { ...store.bankDetails, ...bankDetails };
    if (gstDetails) store.gstDetails = { ...store.gstDetails, ...gstDetails };
    if (openingHours) store.openingHours = { ...store.openingHours, ...openingHours };
    if (bannerImage) store.bannerImage = bannerImage;

    await store.save();
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get staff list and pending invites
// @route   GET /api/partner/staff
// @access  Private/Partner
export const getStaff = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id })
      .populate('staff.user', 'name email avatar');
      
    if (!store) {
      return res.status(404).json({ message: 'No store found for this partner' });
    }

    res.json({
      staff: store.staff,
      invites: store.staffInvites
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Invite new staff via email
// @route   POST /api/partner/staff/invite
// @access  Private/Partner
export const inviteStaff = async (req, res) => {
  const { email, role } = req.body;
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if already invited or already staff
    if (store.staffInvites.some(inv => inv.email === email)) {
      return res.status(400).json({ message: 'Invite already sent to this email' });
    }

    // Generate unique token
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    store.staffInvites.push({
      email,
      role,
      token,
      expiresAt
    });

    await store.save();

    // Send email
    const { default: sendEmail } = await import('../utils/sendEmail.js');
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const joinLink = `${clientUrl}/staff/join/${token}`;
    
    await sendEmail({
      email,
      subject: `Invitation to join ${store.name} on RoseDash`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #f43f5e; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">RoseDash</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #0f172a; margin-top: 0;">You've been invited!</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.5;">
              <strong>${store.name}</strong> has invited you to join their team as a <strong>${role}</strong> on the RoseDash Partner platform.
            </p>
            <div style="margin: 32px 0; text-align: center;">
              <a href="${joinLink}" style="background-color: #f43f5e; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">
                Accept & Join Now
              </a>
            </div>
            <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">
              If you don't have an RoseDash account, you'll be prompted to create one. This link expires in 7 days.
            </p>
          </div>
        </div>
      `
    });

    res.json({ message: 'Invite sent successfully', token }); // Only returning token for dev debugging
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept staff invite
// @route   POST /api/partner/staff/accept
// @access  Public (Requires Auth Context)
export const acceptStaffInvite = async (req, res) => {
  const { token } = req.body;
  const userId = req.user._id;
  try {
    const store = await Store.findOne({ 'staffInvites.token': token });
    if (!store) {
      return res.status(404).json({ message: 'Invalid or expired invite link' });
    }

    const inviteIndex = store.staffInvites.findIndex(inv => inv.token === token);
    const invite = store.staffInvites[inviteIndex];

    if (new Date() > invite.expiresAt) {
      // Remove expired invite
      store.staffInvites.splice(inviteIndex, 1);
      await store.save();
      return res.status(400).json({ message: 'This invite link has expired' });
    }

    // Ensure the user doesn't already exist in staff
    if (store.staff.some(s => s.user && s.user.toString() === userId)) {
      store.staffInvites.splice(inviteIndex, 1);
      await store.save();
      return res.status(400).json({ message: 'You are already a staff member here' });
    }

    // Add to staff
    store.staff.push({
      user: userId,
      role: invite.role,
      status: 'Active'
    });

    // Remove invite
    store.staffInvites.splice(inviteIndex, 1);

    await store.save();

    res.json({ 
      message: 'Successfully joined the store!', 
      storeName: store.name,
      role: invite.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get partner reviews
// @route   GET /api/partner/reviews
// @access  Private/Partner
export const getPartnerReviews = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(404).json({ message: 'Store not found' });
    
    const { default: Review } = await import('../models/Review.js');
    
    const reviews = await Review.find({ store: store._id }).populate('user', 'name avatar').sort('-createdAt');
      
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
