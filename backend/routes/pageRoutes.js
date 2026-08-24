import express from 'express';
import { getPages, getPageBySlug, createPage, updatePage, deletePage } from '../controllers/pageController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getPages)
  .post(protect, restrictTo('admin'), createPage);

router.get('/slug/:slug', getPageBySlug);

router.route('/:id')
  .put(protect, restrictTo('admin'), updatePage)
  .delete(protect, restrictTo('admin'), deletePage);

export default router;
