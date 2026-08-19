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

    // Calculate Discount
    let discountAmount = Math.round((subtotal * coupon.discountPercent) / 100);
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }

    res.json({
      message: 'Coupon code applied successfully!',
      couponId: coupon._id,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
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
    const coupons = await Coupon.find({ 
      isActive: true, 
      validTo: { $gte: new Date() } 
    });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new Coupon
// @route   POST /api/admin/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  const { code, discountPercent, maxDiscount, minOrderValue, validFrom, validTo } = req.body;

  try {
    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountPercent: parseFloat(discountPercent),
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
      minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
      validFrom: validFrom ? new Date(validFrom) : undefined,
      validTo: new Date(validTo)
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
