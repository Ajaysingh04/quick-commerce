import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import upload, { uploadToCloudinary } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getSettings)
  .put(protect, restrictTo('admin'), updateSettings);

router.post('/upload', protect, restrictTo('admin'), upload.single('image'), uploadToCloudinary, (req, res) => {
  if (req.fileUrl) {
    res.json({ url: req.fileUrl });
  } else {
    res.status(400).json({ message: 'Image upload failed' });
  }
});

export default router;
