import express from 'express';
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon
} from '../controllers/couponController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getCoupons);
router.post('/validate', protect, validateCoupon);

// Admin Coupon CRUD operations
router.post('/', protect, restrictTo('admin'), createCoupon);
router.delete('/:id', protect, restrictTo('admin'), deleteCoupon);

export default router;
