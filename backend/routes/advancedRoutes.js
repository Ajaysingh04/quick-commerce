import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getAIRecommendations,
  getFilteredProducts,
  getSurpriseProduct,
  handleChatBot
} from '../controllers/aiController.js';
import {
  createGroupCart,
  joinGroupCart,
  addToGroupCart,
  splitBill,
  lockGroupCart
} from '../controllers/groupController.js';
import {
  spinWheel,
  getRewardsInfo
} from '../controllers/rewardsController.js';
import {
  toggleFollowUser,
  toggleLikeReview,
  addCommentToReview,
  getSocialFeed,
  createSocialReview
} from '../controllers/socialController.js';
import User from '../models/User.js';

const router = express.Router();

// --- AI & Recommendations ---
router.get('/ai/recommendations', protect, getAIRecommendations);
router.get('/ai/filter', getFilteredProducts);
router.get('/ai/surprise', getSurpriseProduct);
router.post('/ai/chatbot', protect, handleChatBot);

// --- Group Ordering ---
router.post('/group/create', protect, createGroupCart);
router.post('/group/join', protect, joinGroupCart);
router.post('/group/add', protect, addToGroupCart);
router.get('/group/split/:code', protect, splitBill);
router.post('/group/lock', protect, lockGroupCart);

// --- Rewards & Spin Wheel ---
router.post('/rewards/spin', protect, spinWheel);
router.get('/rewards/info', protect, getRewardsInfo);

// --- Social Features ---
router.post('/social/follow', protect, toggleFollowUser);
router.post('/social/like', protect, toggleLikeReview);
router.post('/social/comment', protect, addCommentToReview);
router.get('/social/feed', getSocialFeed);
router.post('/social/review', protect, createSocialReview);

// --- Subscription Plan ---
router.post('/subscription/subscribe', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.subscription.plan = 'monthly_premium';
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 30);
    user.subscription.expiresAt = expireDate;

    if (!user.loyalty.badges.includes('Pro Member')) {
      user.loyalty.badges.push('Pro Member');
    }

    await user.save();
    res.status(200).json({
      success: true,
      message: 'Subscribed to RoseDash Pro successfully!',
      subscription: user.subscription
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
