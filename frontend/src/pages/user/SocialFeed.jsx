import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, UserMinus, Camera, Award, Sparkles, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api.js';

const SocialFeed = () => {
 const [feed, setFeed] = useState([]);
 const [loading, setLoading] = useState(true);
 
 // Post review form state
 const [commentText, setCommentText] = useState('');
 const [rating, setRating] = useState(5);
 const [stores, setStores] = useState([]);
 const [selectedRes, setSelectedRes] = useState('');
 const [photoUrl, setPhotoUrl] = useState('');
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');

 // Comment input state per review card
 const [commentsInput, setCommentsInput] = useState({});

 useEffect(() => {
 loadFeed();
 loadStores();
 }, []);

 const loadFeed = async () => {
 setLoading(true);
 try {
 const res = await API.get('/advanced/social/feed');
 setFeed(res.data.data);
 } catch (err) {
 console.warn('Social Feed error, using mockups:', err);
 // Fallback mockup feed
 setFeed([
 {
 _id: 'review-1',
 user: { _id: 'user-rohan', name: 'Rohan Malhotra', loyalty: { level: 'Gold' } },
 store: { name: 'The Burger Craft & Co.' },
 rating: 5,
 comment: 'Perfect crust and juicy patty! Best chicken burger ever.',
 productPhoto: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
 likes: ['user-ajay'],
 comments: [
 { user: 'user-mod', userName: 'Support Team', text: 'Awesome! Glad you loved it.', createdAt: new Date() }
 ],
 createdAt: new Date(Date.now() - 3600000 * 2)
 },
 {
 _id: 'review-2',
 user: { _id: 'user-ananya', name: 'Ananya Sen', loyalty: { level: 'Silver' } },
 store: { name: 'La Piazza Woodfired' },
 rating: 4,
 comment: 'The burrata cheese was incredibly fresh. A bit thin on the crust but still very tasty!',
 productPhoto: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
 likes: [],
 comments: [],
 createdAt: new Date(Date.now() - 3600000 * 5)
 }
 ]);
 } finally {
 setLoading(false);
 }
 };

 const loadStores = async () => {
 try {
 const res = await API.get('/stores');
 setStores(res.data);
 if (res.data.length > 0) setSelectedRes(res.data[0]._id);
 } catch (err) {
 setStores([
 { _id: 'res-gourmet-burger', name: 'The Burger Craft & Co.' },
 { _id: 'res-la-piazza', name: 'La Piazza Woodfired' }
 ]);
 setSelectedRes('res-gourmet-burger');
 }
 };

 const handleLike = async (reviewId) => {
 try {
 const res = await API.post('/advanced/social/like', { reviewId });
 setFeed(prev => prev.map(item => {
 if (item._id === reviewId) {
 return { ...item, likes: res.data.likes };
 }
 return item;
 }));
 } catch (err) {
 // Toggle locally for instant responsive feel if offline/unauth
 setFeed(prev => prev.map(item => {
 if (item._id === reviewId) {
 const liked = item.likes.includes('user-current');
 const nextLikes = liked ? item.likes.filter(id => id !== 'user-current') : [...item.likes, 'user-current'];
 return { ...item, likes: nextLikes };
 }
 return item;
 }));
 }
 };

 const handleCommentSubmit = async (e, reviewId) => {
 e.preventDefault();
 const text = commentsInput[reviewId];
 if (!text || !text.trim()) return;

 try {
 const res = await API.post('/advanced/social/comment', { reviewId, text });
 setFeed(prev => prev.map(item => {
 if (item._id === reviewId) {
 return { ...item, comments: res.data.comments };
 }
 return item;
 }));
 setCommentsInput(prev => ({ ...prev, [reviewId]: '' }));
 } catch (err) {
 // Offline fallback comments post
 setFeed(prev => prev.map(item => {
 if (item._id === reviewId) {
 return {
 ...item,
 comments: [
 ...item.comments,
 { user: 'user-current', userName: 'You (Mock)', text, createdAt: new Date() }
 ]
 };
 }
 return item;
 }));
 setCommentsInput(prev => ({ ...prev, [reviewId]: '' }));
 }
 };

 const handlePostReview = async (e) => {
 e.preventDefault();
 setError('');
 setSuccess('');
 
 if (!commentText.trim()) {
 setError('Please add a review comment first!');
 return;
 }

 try {
 const res = await API.post('/advanced/social/review', {
 storeId: selectedRes,
 rating,
 comment: commentText,
 productPhoto: photoUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'
 });

 setSuccess('Your product review has been published! +35 Coins gained.');
 setCommentText('');
 setPhotoUrl('');
 // Reload feed
 loadFeed();
 } catch (err) {
 // Mock insert locally
 const mockNewItem = {
 _id: Math.random().toString(),
 user: { name: 'You (Mock)', loyalty: { level: 'Bronze' } },
 store: { name: stores.find(r => r._id === selectedRes)?.name || 'Store' },
 rating,
 comment: commentText,
 productPhoto: photoUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
 likes: [],
 comments: [],
 createdAt: new Date()
 };
 setFeed(prev => [mockNewItem, ...prev]);
 setSuccess('Review posted locally! +35 Coins earned.');
 setCommentText('');
 setPhotoUrl('');
 }
 };

 const handleFollowUser = async (userId) => {
 try {
 await API.post('/advanced/social/follow', { userId });
 setSuccess('Follow status updated!');
 setTimeout(() => setSuccess(''), 2000);
 } catch (err) {
 setSuccess('Simulated following user!');
 setTimeout(() => setSuccess(''), 2000);
 }
 };

 return (
 <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 items-start">
 {/* Feed Area */}
 <div className="flex-[2] w-full flex flex-col gap-6">
 <div className="flex items-center justify-between">
 <h2 className="text-2xl font-black">Productie Social Feed</h2>
 <span className="text-[10px] bg-brand-500/10 text-brand-500 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
 <Sparkles className="w-3.5 h-3.5 fill-brand-500" /> Community Updates
 </span>
 </div>

 {loading ? (
 <div className="flex justify-center items-center py-20">
 <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-500"></div>
 </div>
 ) : feed.length === 0 ? (
 <div className="text-center py-16 bg-white border rounded-3xl text-slate-400">
 No productie updates available. Be the first to share one!
 </div>
 ) : (
 <div className="space-y-6">
 {feed.map((item) => (
 <motion.article 
 key={item._id}
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-white border border-pink-200/60 rounded-3xl p-6 shadow-sm flex flex-col gap-4"
 >
 {/* User row */}
 <div className="flex items-center justify-between gap-2">
 <div className="flex items-center gap-2.5">
 <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-lg font-black border border-brand-500/15 text-brand-500">
 {item.user?.name ? item.user.name.charAt(0) : 'U'}
 </div>
 <div>
 <h4 className="font-extrabold text-sm flex items-center gap-1.5 leading-none">
 {item.user?.name || 'Gourmet Lover'}
 {item.user?.loyalty?.level && (
 <span className="text-[8px] bg-yellow-400/20 text-yellow-600 border border-yellow-400/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
 {item.user.loyalty.level}
 </span>
 )}
 </h4>
 <span className="text-[10px] text-slate-400 leading-none mt-1 inline-block">
 reviewed **{item.store?.name || 'Kitchen'}** • {new Date(item.createdAt).toLocaleDateString()}
 </span>
 </div>
 </div>
 
 <button 
 onClick={() => handleFollowUser(item.user?._id)}
 className="flex items-center gap-1 px-3 py-1.5 border border-pink-200 rounded-xl text-[10px] font-bold text-slate-600 hover:border-brand-500 hover:text-brand-500 transition-colors"
 >
 <UserPlus className="w-3.5 h-3.5" />
 <span>Follow</span>
 </button>
 </div>

 {/* Rating stars & review */}
 <div className="space-y-2 text-xs">
 <div className="flex items-center gap-0.5 text-yellow-400">
 {[...Array(5)].map((_, i) => (
 <span key={i} className={i < item.rating ? 'text-yellow-400' : 'text-slate-200 '}>★</span>
 ))}
 </div>
 <p className="text-slate-700 leading-relaxed font-medium">
 {item.comment}
 </p>
 </div>

 {/* Product photo */}
 {item.productPhoto && (
 <div className="w-full aspect-video rounded-2xl overflow-hidden bg-pink-100 border border-pink-200 ">
 <img onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"; }} src={item.productPhoto} alt="Shared Product Review" className="w-full h-full object-cover" />
 </div>
 )}

 {/* Like & Comment buttons */}
 <div className="flex items-center gap-6 border-t border-b border-pink-200 py-3 text-slate-500 font-semibold text-xs">
 <button 
 onClick={() => handleLike(item._id)}
 className="flex items-center gap-1.5 hover:text-rose-500 transition-colors focus:outline-none"
 >
 <Heart className={`w-4 h-4 ${item.likes?.includes('user-current') ? 'fill-rose-500 text-rose-500' : ''}`} />
 <span>{item.likes?.length || 0} Likes</span>
 </button>

 <div className="flex items-center gap-1.5">
 <MessageCircle className="w-4 h-4" />
 <span>{item.comments?.length || 0} Comments</span>
 </div>
 </div>

 {/* Comments List */}
 {item.comments && item.comments.length > 0 && (
 <div className="space-y-3 bg-pink-50 p-4 rounded-2xl border border-pink-200 max-h-[180px] overflow-y-auto pr-1 no-scrollbar">
 {item.comments.map((comm, idx) => (
 <div key={idx} className="text-xs space-y-0.5">
 <span className="font-extrabold text-brand-500">{comm.userName}: </span>
 <span className="text-slate-600 font-medium">{comm.text}</span>
 </div>
 ))}
 </div>
 )}

 {/* Post comment input */}
 <form 
 onSubmit={(e) => handleCommentSubmit(e, item._id)}
 className="flex gap-2 items-center"
 >
 <input 
 type="text"
 placeholder="Write a comment..."
 value={commentsInput[item._id] || ''}
 onChange={(e) => setCommentsInput(prev => ({ ...prev, [item._id]: e.target.value }))}
 className="flex-grow bg-pink-50 border border-pink-200 rounded-full px-4 py-2 text-xs outline-none focus:border-brand-500 text-slate-800 "
 />
 <button 
 type="submit"
 className="p-2 rounded-full bg-pink-100 hover:bg-brand-500 hover:text-white transition-all text-slate-500"
 >
 <Send className="w-3.5 h-3.5" />
 </button>
 </form>
 </motion.article>
 ))}
 </div>
 )}
 </div>

 {/* Share Review Form */}
 <div className="flex-1 w-full bg-white border border-pink-200 rounded-3xl p-6 shadow-sm sticky top-24">
 <h3 className="text-lg font-black mb-4 flex items-center gap-2">
 <Camera className="w-5 h-5 text-brand-500" /> Share Product Photo
 </h3>

 {error && <div className="mb-4 text-xs text-rose-500">{error}</div>}
 {success && <div className="mb-4 text-xs text-emerald-500">{success}</div>}

 <form onSubmit={handlePostReview} className="space-y-4 text-xs">
 {/* Store select */}
 <div className="flex flex-col gap-1.5">
 <label className="font-bold text-slate-400">Select Store</label>
 <select 
 value={selectedRes}
 onChange={(e) => setSelectedRes(e.target.value)}
 className="bg-pink-50 border border-pink-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-500"
 >
 {stores.map(r => (
 <option key={r._id} value={r._id}>{r.name}</option>
 ))}
 </select>
 </div>

 {/* Rating */}
 <div className="flex flex-col gap-1.5">
 <label className="font-bold text-slate-400">Rating</label>
 <div className="flex gap-1 text-lg text-yellow-400">
 {[1, 2, 3, 4, 5].map(val => (
 <button 
 type="button" 
 key={val}
 onClick={() => setRating(val)}
 className="focus:outline-none"
 >
 {val <= rating ? '★' : '☆'}
 </button>
 ))}
 </div>
 </div>

 {/* Review text */}
 <div className="flex flex-col gap-1.5">
 <label className="font-bold text-slate-400">Review Comments</label>
 <textarea 
 rows="3"
 placeholder="How was the product, packaging, or taste?"
 value={commentText}
 onChange={(e) => setCommentText(e.target.value)}
 className="bg-pink-50 border border-pink-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-500"
 />
 </div>

 {/* Mock photo link upload */}
 <div className="flex flex-col gap-1.5">
 <label className="font-bold text-slate-400">Product Image Link (Mock Upload)</label>
 <input 
 type="text"
 placeholder="Paste unspash or any image URL here"
 value={photoUrl}
 onChange={(e) => setPhotoUrl(e.target.value)}
 className="bg-pink-50 border border-pink-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-500"
 />
 </div>

 {/* Post button */}
 <button 
 type="submit"
 className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs text-center rounded-xl shadow-md"
 >
 PUBLISH REVIEW
 </button>
 </form>
 </div>
 </div>
 );
};

export default SocialFeed;
