import Review from '../models/Review.js';
import Store from '../models/Store.js';

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
export const addReview = async (req, res) => {
  const { storeId, rating, comment, productPhoto } = req.body;
  
  if (!storeId || !rating) {
    return res.status(400).json({ message: 'Store and rating are required' });
  }

  try {
    const existingReview = await Review.findOne({ user: req.user._id, store: storeId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this store' });
    }

    const review = await Review.create({
      user: req.user._id,
      store: storeId,
      rating,
      comment,
      productPhoto
    });

    // Update store rating
    const store = await Store.findById(storeId);
    if (store) {
      const allReviews = await Review.find({ store: storeId });
      const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;
      store.rating = avgRating.toFixed(1);
      await store.save();
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a store
// @route   GET /api/reviews/:storeId
// @access  Public
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ store: req.params.storeId })
      .populate('user', 'name avatar')
      .sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
