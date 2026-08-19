import express from 'express';
import { requestWithdrawal, getWithdrawals, updateWithdrawalStatus, getWithdrawalAnalytics, getMyEarnings } from '../controllers/withdrawalController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Put this before /:id/status to avoid params clashing
router.get('/my-earnings', protect, restrictTo('delivery'), getMyEarnings);
router.post('/', protect, restrictTo('delivery'), requestWithdrawal);
router.get('/', protect, restrictTo('admin'), getWithdrawals);
router.put('/:id/status', protect, restrictTo('admin'), updateWithdrawalStatus);
router.get('/analytics/:partnerId', protect, restrictTo('admin'), getWithdrawalAnalytics);

export default router;
