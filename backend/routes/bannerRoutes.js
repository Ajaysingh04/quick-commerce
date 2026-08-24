import express from 'express';
import { getBanners, getActiveBanners, createBanner, updateBanner, deleteBanner } from '../controllers/bannerController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getBanners)
  .post(protect, restrictTo('admin'), createBanner);

router.get('/active', getActiveBanners);

router.route('/:id')
  .put(protect, restrictTo('admin'), updateBanner)
  .delete(protect, restrictTo('admin'), deleteBanner);

export default router;
