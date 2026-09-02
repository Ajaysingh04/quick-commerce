import Coupon from '../models/Coupon.js';

// @desc    Validate and calculate coupon discount
// @route   POST /api/coupons/validate
// @access  Private (JWT Access)
export const validateCoupon = async (req, res) => {
  const { code, subtotal } = req.body;

  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon code is invalid' });
    }

    // Date range check
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validTo) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    // Min Order Value Check
    if (subtotal < coupon.minOrderValue) {
      return res.status(400).json({ 
        message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon.` 
      });
    }

    // Usage Limit Check
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit has been reached.' });
    }

    // Calculate Discount
    let discountAmount = 0;
    
    if (coupon.discountType === 'percentage' || coupon.discountPercent) {
      const val = coupon.discountValue || coupon.discountPercent || 0;
      discountAmount = Math.round((subtotal * val) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'flat') {
      discountAmount = coupon.discountValue || 0;
      if (discountAmount > subtotal) {
        discountAmount = subtotal; // Can't discount more than subtotal
      }
    } else if (coupon.discountType === 'bogo') {
      discountAmount = 0; // Handled differently in cart logic usually, but return 0 here
    }

    res.json({
      message: 'Coupon code applied successfully!',
      couponId: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue || coupon.discountPercent,
      discountAmount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all active coupons
// @route   GET /api/coupons
// @access  Public
export const getCoupons = async (req, res) => {
  try {
    // Both admin and public can get coupons. Public ones should be active.
    const coupons = await Coupon.find({ 
      isActive: true, 
      validTo: { $gte: new Date() } 
    }).populate('store', 'name');
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new Coupon
// @route   POST /api/admin/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  const { code, discountType, discountValue, discountPercent, maxDiscount, minOrderValue, usageLimit, validFrom, validTo, store } = req.body;

  try {
    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType: discountType || 'percentage',
      discountValue: discountValue ? parseFloat(discountValue) : undefined,
      discountPercent: discountPercent ? parseFloat(discountPercent) : undefined,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
      minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
      usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
      validFrom: validFrom ? new Date(validFrom) : undefined,
      validTo: new Date(validTo),
      store: store || undefined
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete (deactivate) Coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    coupon.isActive = false;
    await coupon.save();

    res.json({ message: 'Coupon deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Coupon
// @route   PUT /api/admin/coupons/:id
// @access  Private/Admin
export const updateCoupon = async (req, res) => {
  const { code, discountType, discountValue, discountPercent, maxDiscount, minOrderValue, usageLimit, validFrom, validTo, isActive } = req.body;

  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (code) {
      const couponExists = await Coupon.findOne({ code: code.toUpperCase(), _id: { $ne: req.params.id } });
      if (couponExists) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }
      coupon.code = code.toUpperCase();
    }
    
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = parseFloat(discountValue);
    if (discountPercent !== undefined) coupon.discountPercent = parseFloat(discountPercent);
    if (maxDiscount !== undefined) coupon.maxDiscount = parseFloat(maxDiscount);
    if (minOrderValue !== undefined) coupon.minOrderValue = parseFloat(minOrderValue);
    if (usageLimit !== undefined) coupon.usageLimit = parseInt(usageLimit);
    if (validFrom) coupon.validFrom = new Date(validFrom);
    if (validTo) coupon.validTo = new Date(validTo);
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
