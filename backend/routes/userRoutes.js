import express from 'express';
import { updateProfilePicture, submitKyc, getProfile, updateProfile, getAllUsers, updateKycStatus, updatePassword } from '../controllers/userController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import upload, { uploadToCloudinary, uploadMultipleToCloudinary } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', protect, restrictTo('admin'), getAllUsers);
router.put('/:id/kyc', protect, restrictTo('admin'), updateKycStatus);

router.put('/profile/avatar', protect, upload.single('image'), uploadToCloudinary, updateProfilePicture);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/profile/password', protect, updatePassword);

router.post('/delivery/kyc', protect, upload.fields([
  { name: 'pan', maxCount: 1 },
  { name: 'aadhar', maxCount: 1 },
  { name: 'license', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), uploadMultipleToCloudinary, submitKyc);

export default router;
