import Review from '../models/Review.js';
import User from '../models/User.js';

// Toggle Follow/Unfollow User
export const toggleFollowUser = async (req, res) => {
  try {
    const targetUserId = req.body.userId;
    const currentUserId = req.user._id;

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself.' });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User to follow not found.' });
    }

    const isFollowing = currentUser.following.includes(targetUserId);
    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId.toString());
      await currentUser.save();
      return res.status(200).json({ success: true, message: 'User unfollowed successfully', following: currentUser.following });
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      await currentUser.save();
      return res.status(200).json({ success: true, message: 'User followed successfully', following: currentUser.following });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle Like/Unlike on a Review
export const toggleLikeReview = async (req, res) => {
  try {
    const { reviewId } = req.body;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const hasLiked = review.likes.includes(userId);
    if (hasLiked) {
      review.likes = review.likes.filter(id => id.toString() !== userId.toString());
    } else {
      review.likes.push(userId);
    }

    await review.save();
    res.status(200).json({ success: true, likes: review.likes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Comment to Review
export const addCommentToReview = async (req, res) => {
  try {
    const { reviewId, text } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Comment text is required.' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    review.comments.push({
      user: userId,
      userName,
      text
    });

    await review.save();
    res.status(201).json({ success: true, comments: review.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch Social Review Feed
export const getSocialFeed = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name loyalty')
      .populate('store', 'name bannerImage')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add New Social Review (with photo uploading mock/handling)
export const createSocialReview = async (req, res) => {
  try {
    const { storeId, rating, comment, productPhoto } = req.body;
    const userId = req.user._id;

    // Check for duplicate review limit
    const existingReview = await Review.findOne({ user: userId, store: storeId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this store.' });
    }

    const review = await Review.create({
      user: userId,
      store: storeId,
      rating,
      comment,
      productPhoto: productPhoto || '',
      likes: [],
      comments: []
    });

    // Award loyalty coins for reviewing and uploading a photo!
    const user = await User.findById(userId);
    if (user) {
      let coinsGained = 20; // base review coins
      if (productPhoto) {
        coinsGained += 15; // bonus for adding a photo
      }
      user.loyalty.coins += coinsGained;
      if (!user.loyalty.badges.includes('Product Critic')) {
        user.loyalty.badges.push('Product Critic');
      }
      await user.save();
    }

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name loyalty')
      .populate('store', 'name');

    res.status(201).json({ success: true, data: populatedReview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
