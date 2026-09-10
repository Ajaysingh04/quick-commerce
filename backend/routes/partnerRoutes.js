import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import upload, { uploadMultipleToCloudinary } from '../middleware/uploadMiddleware.js';
import {
  getDashboardStats,
  getOrders,
  getMenu,
  addProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getProfile,
  updateProfile,
  getStaff,
  inviteStaff,
  getPartnerReviews,
  getPromos,
  addPromo,
  deletePromo,
  acceptStaffInvite,
  getPartnerAccessStatus,
  purchaseFranchise,
  submitPartnerOnboarding
} from '../controllers/partnerController.js';
import { updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

// Public / Token-based route (staff accepts invite via email link, but requires user to be logged in)
router.post('/staff/accept', protect, acceptStaffInvite);

// Access check + onboarding purchase flow
router.get('/access-status', protect, restrictTo('partner'), getPartnerAccessStatus);
router.post('/purchase', protect, restrictTo('partner'), purchaseFranchise);
router.post('/onboarding', protect, restrictTo('partner'), upload.fields([
  { name: 'panCard', maxCount: 1 },
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'shopFrontPhoto', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 },
  { name: 'bankProof', maxCount: 1 }
]), uploadMultipleToCloudinary, submitPartnerOnboarding);

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
router.post('/menu', addProduct);
router.put('/menu/:id', updateProduct);
router.delete('/menu/:id', deleteProduct);
router.put('/menu/:id/stock', updateProductStock);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/reviews', getPartnerReviews);

// Promos
router.get('/promos', getPromos);
router.post('/promos', addPromo);
router.delete('/promos/:id', deletePromo);

export default router;
