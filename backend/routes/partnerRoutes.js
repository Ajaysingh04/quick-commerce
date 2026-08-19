import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  getDashboardStats,
  getOrders,
  getMenu,
  updateProductStock,
  getProfile,
  updateProfile,
  getStaff,
  inviteStaff,
  acceptStaffInvite,
  getPartnerReviews
} from '../controllers/partnerController.js';
import { updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

// Public / Token-based route (staff accepts invite via email link, but requires user to be logged in)
router.post('/staff/accept', protect, acceptStaffInvite);

// All partner routes below require authentication and 'partner' role
router.use(protect, restrictTo('partner'));

// Staff Management (Partner restricted)
router.get('/staff', getStaff);
router.post('/staff/invite', inviteStaff);

// Dashboard Stats
router.get('/dashboard-stats', getDashboardStats);

// Orders
router.get('/orders', getOrders);
// Partners use the same status update logic as admin/delivery in orderController
router.put('/orders/:id/status', updateOrderStatus);

// Menu
router.get('/menu', getMenu);
router.put('/menu/:id/stock', updateProductStock);

// Profile

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/reviews', getPartnerReviews);

export default router;
