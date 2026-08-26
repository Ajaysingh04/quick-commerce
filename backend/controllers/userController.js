import User from '../models/User.js';
import Order from '../models/Order.js';

// @desc    Update user profile picture (avatar)
// @route   PUT /api/users/profile/avatar
// @access  Private
export const updateProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.fileUrl) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    user.avatar = req.fileUrl;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile picture', error: error.message });
  }
};

// @desc    Submit KYC documents for delivery partner
// @route   POST /api/users/delivery/kyc
// @access  Private (Delivery Only)
export const submitKyc = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'delivery') {
      return res.status(403).json({ message: 'Only delivery partners can submit KYC' });
    }

    const fileUrls = req.fileUrls || {};

    user.kyc = {
      status: 'pending_review', // Now requires Admin manual approval
      pan: fileUrls.pan ? fileUrls.pan[0] : user.kyc?.pan,
      aadhar: fileUrls.aadhar ? fileUrls.aadhar[0] : user.kyc?.aadhar,
      license: fileUrls.license ? fileUrls.license[0] : user.kyc?.license,
      selfieVideo: fileUrls.video ? fileUrls.video[0] : user.kyc?.selfieVideo
    };

    await user.save();

    res.status(200).json({
      message: 'KYC submitted successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        kyc: user.kyc
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit KYC', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otp -searchHistory');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get profile', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, phone, alternatePhone, addresses, bankDetails, deliveryDetails } = req.body;

    user.name = name || user.name;
    
    // Check if new email is already in use
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already in use by another account.' });
      }
      user.email = email;
    }

    user.phone = phone !== undefined ? phone : user.phone;
    user.alternatePhone = alternatePhone !== undefined ? alternatePhone : user.alternatePhone;

    if (addresses) {
      user.addresses = addresses;
    }
    
    if (bankDetails) {
      user.bankDetails = { ...user.bankDetails, ...bankDetails };
    }
    
    if (deliveryDetails) {
      user.deliveryDetails = {
        vehicleType: deliveryDetails.vehicleType || user.deliveryDetails?.vehicleType,
        licensePlate: deliveryDetails.licensePlate !== undefined ? deliveryDetails.licensePlate : user.deliveryDetails?.licensePlate,
        preferences: {
          ...user.deliveryDetails?.preferences,
          ...deliveryDetails.preferences
        }
      };
    }

    await user.save();
    
    // Return sanitized user object
    const updatedUser = await User.findById(req.user._id).select('-password -otp -searchHistory');
    
    // Emit notification to Admin
    if (global.io) {
      global.io.emit('adminNotification', {
        title: 'Profile Updated',
        message: `User ${updatedUser.name} (${updatedUser.email}) just updated their profile details.`,
        type: 'info',
        date: new Date()
      });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password -otp -searchHistory').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// @desc    Update KYC Status (Admin only)
// @route   PUT /api/users/:id/kyc
// @access  Private (Admin)
export const updateKycStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'pending_review', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'delivery') {
      return res.status(400).json({ message: 'User is not a delivery partner' });
    }

    user.kyc.status = status;
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update KYC status', error: error.message });
  }
};

// @desc    Update user password
// @route   PUT /api/users/profile/password
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both current and new password' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clerk users can't change password here
    if (user.clerkId) {
      return res.status(400).json({ message: 'Please change your password through your authentication provider.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
};

// @desc    Toggle product in wishlist
// @route   POST /api/users/wishlist/toggle
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'Product ID is required' });

    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    res.status(200).json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle wishlist', error: error.message });
  }
};

// @desc    Get user's populated wishlist
// @route   GET /api/users/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch wishlist', error: error.message });
  }
};

// @desc    Get detailed user information (Admin)
// @route   GET /api/users/:id/details
// @access  Private (Admin)
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -otp -searchHistory')
      .populate('wishlist');
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).populate('store');

    res.status(200).json({
      user,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user details', error: error.message });
  }
};
