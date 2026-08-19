import express from 'express';
import {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore
} from '../controllers/storeController.js';
import { getStoreMenu } from '../controllers/productController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import upload, { uploadToCloudinary } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getStores);
router.get('/:id', getStoreById);
router.get('/:storeId/menu', getStoreMenu);

// Admin-only management routes
router.post(
  '/', 
  protect, 
  restrictTo('admin'), 
  upload.single('banner'), 
  uploadToCloudinary, 
  createStore
);

router.put(
  '/:id', 
  protect, 
  restrictTo('admin'), 
  upload.single('banner'), 
  uploadToCloudinary, 
  updateStore
);

router.delete('/:id', protect, restrictTo('admin'), deleteStore);

export default router;
