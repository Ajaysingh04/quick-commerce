import Order from '../models/Order.js';
import Store from '../models/Store.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Coupon from '../models/Coupon.js';

// Helper to get partner's store
const getPartnerStore = async (userId) => {
  let store = await Store.findOne({ owner: userId });
  if (!store) {
    store = await Store.create({
      name: 'My Quick Commerce Store',
      owner: userId,
      description: 'Welcome to your new store dashboard.',
      isActive: true,
      status: 'pending',
      category: 'Grocery',
      cuisineTypes: ['Essentials'],
      deliveryTime: 30,
      bannerImage: '/assets/res_default.jpg'
    });
  }
  return store;
};

const ensureApprovedPartnerStore = async (userId) => {
  const store = await getPartnerStore(userId);
  if (store.franchisePurchaseStatus !== 'paid') {
    return { store, approved: false, reason: 'purchase_required' };
  }
  if (store.status !== 'approved') {
    return { store, approved: false, reason: 'approval_pending' };
  }
  return { store, approved: true, reason: 'approved' };
};

export const getPartnerAccessStatus = async (req, res) => {
  try {
    const store = await getPartnerStore(req.user._id);
    const kycStatus = store.kycStatus || 'not_submitted';
    const canAccessDashboard = store.franchisePurchaseStatus === 'paid' && store.status === 'approved' && kycStatus === 'approved';

    res.json({
      storeId: store._id,
      purchaseStatus: store.franchisePurchaseStatus || 'not_started',
      approvalStatus: store.status || 'pending',
      kycStatus,
      canAccessDashboard,
      needsPurchase: store.franchisePurchaseStatus !== 'paid',
      needsApproval: store.status !== 'approved',
      needsKycApproval: kycStatus !== 'approved',
      onboardingCompleted: !!store.onboardingCompleted,
      message: canAccessDashboard ? 'Store ready' : 'Partner onboarding is in progress.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitPartnerOnboarding = async (req, res) => {
  try {
    const store = await getPartnerStore(req.user._id);
    const fileUrls = req.fileUrls || {};
    const rawAddress = typeof req.body.address === 'string' ? JSON.parse(req.body.address) : req.body.address;
    const rawBankDetails = typeof req.body.bankDetails === 'string' ? JSON.parse(req.body.bankDetails) : req.body.bankDetails;
    const rawGstDetails = typeof req.body.gstDetails === 'string' ? JSON.parse(req.body.gstDetails) : req.body.gstDetails;
    const rawOpeningHours = typeof req.body.openingHours === 'string' ? JSON.parse(req.body.openingHours) : req.body.openingHours;
    const { name, description, bannerImage, distance, deliveryTime, costForTwo, category } = req.body;

    if (name) store.name = name;
    if (description !== undefined) store.description = description;
    if (category) store.category = category;
    if (rawAddress) store.address = { ...store.address, ...rawAddress };
    if (rawBankDetails) store.bankDetails = { ...store.bankDetails, ...rawBankDetails };
    if (rawGstDetails) store.gstDetails = { ...store.gstDetails, ...rawGstDetails };
    if (rawOpeningHours) store.openingHours = { ...store.openingHours, ...rawOpeningHours };
    if (bannerImage) store.bannerImage = bannerImage;
    if (distance !== undefined) store.distance = Number(distance);
    if (deliveryTime !== undefined) store.deliveryTime = Number(deliveryTime);
    if (costForTwo !== undefined) store.costForTwo = Number(costForTwo);

    const documentUrls = {
      panCard: fileUrls.panCard?.[0] || req.body.panCard || store.documents?.panCard,
      gstCertificate: fileUrls.gstCertificate?.[0] || req.body.gstCertificate || store.documents?.gstCertificate,
      shopFrontPhoto: fileUrls.shopFrontPhoto?.[0] || req.body.shopFrontPhoto || store.documents?.shopFrontPhoto,
      addressProof: fileUrls.addressProof?.[0] || req.body.addressProof || store.documents?.addressProof,
      bankProof: fileUrls.bankProof?.[0] || req.body.bankProof || store.documents?.bankProof
    };

    const hasAnyDocument = Object.values(documentUrls).some(Boolean);
    if (hasAnyDocument) {
      store.documents = { ...store.documents, ...documentUrls };
      store.kycStatus = 'pending_review';
    } else {
      store.kycStatus = 'not_submitted';
    }

    store.onboardingCompleted = true;
    if (store.status === 'rejected') store.status = 'pending';

    await store.save();

    res.json({
      message: hasAnyDocument
        ? 'Store profile and KYC documents submitted successfully. Waiting for admin approval.'
        : 'Store onboarding saved successfully. Waiting for admin approval.',
      store
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const purchaseFranchise = async (req, res) => {
  try {
    const { plan = 'starter', amount = 4999, paymentReference } = req.body;
    const store = await getPartnerStore(req.user._id);

    store.franchisePlan = plan;
    store.franchisePurchaseStatus = 'paid';
    store.onboardingCompleted = true;
    store.paymentReference = paymentReference || `mock-${Date.now()}`;
    if (!store.kycStatus || store.kycStatus === 'not_submitted') {
      store.kycStatus = 'not_submitted';
    }
    if (store.status === 'rejected') {
      store.status = 'pending';
    }

    await store.save();

    res.json({
      message: 'Franchise purchase completed. Your store is now waiting for admin approval.',
      store,
      nextStep: 'admin_approval'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Partner Dashboard Stats
// @route   GET /api/partner/dashboard-stats
// @access  Private (Partner)
export const getDashboardStats = async (req, res) => {
  try {
    const { store, approved, reason } = await ensureApprovedPartnerStore(req.user._id);
    if (!approved) {
      return res.status(403).json({
        message: reason === 'purchase_required' ? 'Please buy the franchise package to unlock your store dashboard.' : 'Store access is pending admin approval.'
      });
    }

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
    const { store, approved, reason } = await ensureApprovedPartnerStore(req.user._id);
    if (!approved) {
      return res.status(403).json({
        message: reason === 'purchase_required' ? 'Please buy the franchise package to unlock your store dashboard.' : 'Store access is pending admin approval.'
      });
    }
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
    const { store, approved, reason } = await ensureApprovedPartnerStore(req.user._id);
    if (!approved) {
      return res.status(403).json({
        message: reason === 'purchase_required' ? 'Please buy the franchise package to unlock your store dashboard.' : 'Store access is pending admin approval.'
      });
    }
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
    const { store, approved, reason } = await ensureApprovedPartnerStore(req.user._id);
    if (!approved) {
      return res.status(403).json({
        message: reason === 'purchase_required' ? 'Please buy the franchise package to unlock your store dashboard.' : 'Store access is pending admin approval.'
      });
    }
    let { name, description, price, originalPrice, stockQuantity, weight, sku, category, image, isVeg, isBestseller, inStock } = req.body;

    let categoryName = category || 'General';
    let categoryObj = await Category.findOne({ name: categoryName });
    if (!categoryObj) {
      categoryObj = await Category.create({ name: categoryName, isActive: true });
    }

    const newProduct = await Product.create({
      name,
      description,
      price: price ? Number(price) : undefined,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      stockQuantity: stockQuantity ? Number(stockQuantity) : 100,
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
    const { store, approved, reason } = await ensureApprovedPartnerStore(req.user._id);
    if (!approved) {
      return res.status(403).json({
        message: reason === 'purchase_required' ? 'Please buy the franchise package to unlock your store dashboard.' : 'Store access is pending admin approval.'
      });
    }
    const product = await Product.findOne({ _id: req.params.id, store: store._id });
    
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let { name, description, price, originalPrice, stockQuantity, weight, sku, category, image, isVeg, isBestseller, inStock } = req.body;

    if (category) {
      let categoryObj = await Category.findOne({ name: category });
      if (!categoryObj) {
        categoryObj = await Category.create({ name: category, isActive: true });
      }
      product.category = categoryObj._id;
    }

    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined && price !== '') product.price = Number(price);
    if (originalPrice !== undefined) product.originalPrice = originalPrice ? Number(originalPrice) : undefined;
    if (stockQuantity !== undefined && stockQuantity !== '') product.stockQuantity = Number(stockQuantity);
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
    const { store, approved, reason } = await ensureApprovedPartnerStore(req.user._id);
    if (!approved) {
      return res.status(403).json({
        message: reason === 'purchase_required' ? 'Please buy the franchise package to unlock your store dashboard.' : 'Store access is pending admin approval.'
      });
    }
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
    const { store, approved, reason } = await ensureApprovedPartnerStore(req.user._id);
    if (!approved) {
      return res.status(403).json({
        message: reason === 'purchase_required' ? 'Please buy the franchise package to unlock your store dashboard.' : 'Store access is pending admin approval.'
      });
    }
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
    const { store, approved, reason } = await ensureApprovedPartnerStore(req.user._id);
    if (!approved) {
      return res.status(403).json({
        message: reason === 'purchase_required' ? 'Please buy the franchise package to unlock your store dashboard.' : 'Store access is pending admin approval.'
      });
    }
    
    // Update allowed fields
    const { name, description, address, bankDetails, gstDetails, openingHours, bannerImage, distance, deliveryTime, costForTwo } = req.body;
    
    if (name) store.name = name;
    if (description !== undefined) store.description = description;
    if (address) store.address = { ...store.address, ...address };
    if (bankDetails) store.bankDetails = { ...store.bankDetails, ...bankDetails };
    if (gstDetails) store.gstDetails = { ...store.gstDetails, ...gstDetails };
    if (openingHours) store.openingHours = { ...store.openingHours, ...openingHours };
    if (bannerImage) store.bannerImage = bannerImage;
    if (distance !== undefined) store.distance = Number(distance);
    if (deliveryTime !== undefined) store.deliveryTime = Number(deliveryTime);
    if (costForTwo !== undefined) store.costForTwo = Number(costForTwo);
    if (bannerImage) store.bannerImage = bannerImage;

    await store.save();
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Promos
// @route   GET /api/partner/promos
// @access  Private (Partner)
export const getPromos = async (req, res) => {
  try {
    const store = await getPartnerStore(req.user._id);
    const coupons = await Coupon.find({ store: store._id }).sort('-createdAt');
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add Promo
// @route   POST /api/partner/promos
// @access  Private (Partner)
export const addPromo = async (req, res) => {
  try {
    const store = await getPartnerStore(req.user._id);
    const { code, type, value, expiry, usageLimit } = req.body;

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType: type,
      discountValue: value ? parseFloat(value) : undefined,
      validTo: new Date(expiry),
      usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
      store: store._id,
      isActive: true
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Promo
// @route   DELETE /api/partner/promos/:id
// @access  Private (Partner)
export const deletePromo = async (req, res) => {
  try {
    const store = await getPartnerStore(req.user._id);
    // Find and delete the promo ensuring it belongs to this partner's store
    const coupon = await Coupon.findOneAndDelete({ _id: req.params.id, store: store._id });
    
    if (!coupon) return res.status(404).json({ message: 'Promo not found or unauthorized' });

    res.json({ message: 'Promo deleted successfully' });
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
