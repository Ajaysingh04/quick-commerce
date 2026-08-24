import express from 'express';
import {
  createOrder,
  createRazorpayIntent,
  getOrderById,
  getMyOrders,
  getAssignedOrders,
  updateOrderStatus,
  updateDeliveryCoordinates,
  verifyPayment,
  cancelOrder,
  requestRefund,
  getAllOrders,
  getPartnerOrders,
  deleteOrder
} from '../controllers/orderController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.post('/razorpay-intent', protect, createRazorpayIntent);
router.post('/verify-payment', protect, verifyPayment);
router.get('/myorders', protect, getMyOrders);
router.get('/admin/all', protect, restrictTo('admin'), getAllOrders);
router.get('/partner', protect, restrictTo('partner', 'admin'), getPartnerOrders);
router.get('/:id', protect, getOrderById);
router.delete('/:id', protect, restrictTo('admin'), deleteOrder);

// User Order actions
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/refund', protect, requestRefund);

// Delivery partner assignments and locations
router.get('/delivery/assigned', protect, restrictTo('delivery'), getAssignedOrders);
router.put('/delivery/coordinates', protect, restrictTo('delivery'), updateDeliveryCoordinates);

// Status modifier (used by Admins, Partners & Delivery Partners)
router.put('/:id/status', protect, restrictTo('admin', 'delivery', 'partner'), updateOrderStatus);

export default router;
