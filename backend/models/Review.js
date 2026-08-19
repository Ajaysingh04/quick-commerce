import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    text: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  productPhoto: { type: String, default: '' }
}, { timestamps: true });

// Prevent duplicate reviews from the same user on the same store
reviewSchema.index({ user: 1, store: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
