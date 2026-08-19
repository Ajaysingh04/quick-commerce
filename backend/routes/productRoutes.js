import express from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory
} from '../controllers/productController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import upload, { uploadToCloudinary } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Categories routes
router.get('/categories', getCategories);
router.post('/categories', protect, restrictTo('admin'), createCategory);

// Dishes routes
router.get('/', getProducts);

router.post(
  '/', 
  protect, 
  restrictTo('admin'), 
  upload.single('image'), 
  uploadToCloudinary, 
  createProduct
);

router.put(
  '/:id', 
  protect, 
  restrictTo('admin'), 
  upload.single('image'), 
  uploadToCloudinary, 
  updateProduct
);

router.delete('/:id', protect, restrictTo('admin'), deleteProduct);

export default router;
