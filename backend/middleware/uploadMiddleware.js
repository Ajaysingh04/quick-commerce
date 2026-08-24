import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

// Setup local disk storage temporarily before dispatching to Cloudinary
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  }
});

// Middleware to upload files directly to Cloudinary
export const uploadToCloudinary = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'appsica',
      use_filename: true,
      unique_filename: true
    });

    // Remove local file after success upload
    fs.unlinkSync(req.file.path);

    // Inject secure URL to req
    req.fileUrl = result.secure_url;
    next();
  } catch (error) {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME.includes('mock')) {
      // Fallback for mock environments: use the local file
      const port = process.env.PORT || 5000;
      req.fileUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
      return next();
    }

    // Make sure to clean up local file on failure
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
  }
};


// Middleware to upload multiple files directly to Cloudinary
export const uploadMultipleToCloudinary = async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next();
  }

  req.fileUrls = {};
  
  try {
    for (const fieldname of Object.keys(req.files)) {
      const files = req.files[fieldname];
      req.fileUrls[fieldname] = [];
      
      for (const file of files) {
        const isVideo = file.mimetype.startsWith('video/');
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'appsica_kyc',
          resource_type: isVideo ? 'video' : 'image',
          use_filename: true,
          unique_filename: true
        });

        req.fileUrls[fieldname].push(result.secure_url);
        fs.unlinkSync(file.path);
      }
    }
    next();
  } catch (error) {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME.includes('mock')) {
      // Fallback for mock environments: use local files
      const port = process.env.PORT || 5000;
      Object.keys(req.files).forEach(fieldname => {
        const files = req.files[fieldname];
        req.fileUrls[fieldname] = files.map(file => `http://localhost:${port}/uploads/${file.filename}`);
      });
      return next();
    }

    // Cleanup any local files on error
    Object.values(req.files).flat().forEach(file => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });
    res.status(500).json({ message: 'Cloudinary multiple upload failed', error: error.message });
  }
};

export default upload;
