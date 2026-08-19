import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, AlertTriangle, ShieldAlert, CheckCircle, ThumbsUp, Filter, MessageCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api.js';

const Reviews = () => {
 const [filter, setFilter] = useState('All');
 const [replyingTo, setReplyingTo] = useState(null);
 const [replyText, setReplyText] = useState('');
 
 const [reviews, setReviews] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchReviews = async () => {
 try {
 const res = await API.get('/partner/reviews');
 // Map backend Review model to frontend state format
 const mappedReviews = res.data.map(r => ({
 id: r._id,
 user: r.user?.name || 'Anonymous',
 rating: r.rating,
 date: new Date(r.createdAt).toISOString().split('T')[0],
 comment: r.comment || 'No comment provided.',
 reply: null, // You can extend the Review model later if you want to save replies
 reported: false
 }));
 setReviews(mappedReviews);
 } catch (err) {
 console.error('Failed to fetch reviews', err);
 } finally {
 setLoading(false);
 }
 };
 fetchReviews();
 }, []);

 const handleReplySubmit = (id) => {
 if (!replyText.trim()) return;
 setReviews(reviews.map(r => r.id === id ? { ...r, reply: replyText } : r));
 setReplyingTo(null);
 setReplyText('');
 };

 const handleReport = (id) => {
 setReviews(reviews.map(r => r.id === id ? { ...r, reported: true } : r));
 alert('Review reported to RoseDash Admin for investigation.');
 };

 const filteredReviews = reviews.filter(r => {
 if (filter === 'All') return true;
 if (filter === 'Needs Reply') return !r.reply && !r.reported;
 if (filter === 'Positive') return r.rating >= 4;
 if (filter === 'Critical') return r.rating <= 2;
 return true;
 });

 if (loading) {
 return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#e31837]" /></div>;
 }

 return (
 <div className="max-w-6xl mx-auto space-y-6">
 
 {/* Header */}
 <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
 <Star className="w-6 h-6 text-[#e31837] fill-brand-500" /> Reviews & Ratings
 </h2>
 <p className="text-sm text-slate-500 mt-1">Manage customer feedback, reply to reviews, and report spam.</p>
 </div>
 
 {/* Quick Stats */}
 <div className="flex gap-4">
 <div className="text-center px-4 border-r border-gray-200 ">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Average</p>
 <p className="text-2xl font-black text-slate-800 flex items-center gap-1">4.2 <Star className="w-4 h-4 text-[#e31837] fill-brand-500" /></p>
 </div>
 <div className="text-center px-4">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Reviews</p>
 <p className="text-2xl font-black text-slate-800 ">1,248</p>
 </div>
 </div>
 </div>

 <div className="flex flex-col lg:flex-row gap-6">
 
 {/* Rating Analytics Sidebar */}
 <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
 <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
 <h3 className="font-bold text-slate-800 mb-4">Rating Distribution</h3>
 <div className="space-y-3">
 {[5, 4, 3, 2, 1].map((star) => {
 const percentages = { 5: 65, 4: 20, 3: 10, 2: 3, 1: 2 };
 const counts = { 5: 811, 4: 249, 3: 125, 2: 38, 1: 25 };
 return (
 <div key={star} className="flex items-center gap-3">
 <div className="w-8 flex items-center gap-1 text-sm font-bold text-slate-600 ">
 {star} <Star className="w-3 h-3 text-slate-400 fill-slate-400" />
 </div>
 <div className="flex-1 bg-slate-100 rounded-full h-2">
 <div className={`h-2 rounded-full ${star >= 4 ? 'bg-emerald-500' : star === 3 ? 'bg-amber-500' : 'bg-[#e31837]'}`} style={{ width: `${percentages[star]}%` }}></div>
 </div>
 <div className="w-8 text-right text-xs font-semibold text-slate-500">{counts[star]}</div>
 </div>
 );
 })}
 </div>
 </div>
 </div>

 {/* Reviews List */}
 <div className="flex-1 bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
 {/* Filters */}
 <div className="p-4 border-b border-gray-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
 <Filter className="w-4 h-4 text-slate-400 mr-2" />
 {['All', 'Needs Reply', 'Positive', 'Critical'].map(f => (
 <button 
 key={f}
 onClick={() => setFilter(f)}
 className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
 filter === f 
 ? 'bg-[#e31837]/10 text-[#c8102e] border border-[#e31837]/30' 
 : 'bg-[#f5f6fa] text-slate-600 border border-transparent hover:bg-slate-100 :bg-slate-700'
 }`}
 >
 {f}
 </button>
 ))}
 </div>

 <div className="p-6 space-y-4">
 <AnimatePresence>
 {filteredReviews.length > 0 ? filteredReviews.map((review) => (
 <motion.div 
 key={review.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-[#f5f6fa] p-5 rounded-2xl border border-gray-200 "
 >
 <div className="flex justify-between items-start mb-3">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 uppercase">
 {review.user.charAt(0)}
 </div>
 <div>
 <h4 className="font-bold text-slate-800 flex items-center gap-2">
 {review.user}
 {review.reported && <span className="px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-black bg-rose-100 text-[#c8102e] flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> Reported</span>}
 </h4>
 <div className="flex items-center gap-2 mt-0.5">
 <div className="flex gap-0.5">
 {[1, 2, 3, 4, 5].map(star => (
 <Star key={star} className={`w-3 h-3 ${star <= review.rating ? 'text-[#e31837] fill-brand-500' : 'text-slate-300 fill-slate-300 '}`} />
 ))}
 </div>
 <span className="text-[10px] font-bold text-slate-400">{new Date(review.date).toLocaleDateString()}</span>
 </div>
 </div>
 </div>
 </div>

 <p className="text-sm text-slate-700 mb-4">{review.comment}</p>

 {/* Reply Section */}
 {review.reply ? (
 <div className="bg-[#e31837]/10 p-4 rounded-xl border border-brand-100 mt-4 relative">
 <div className="absolute -top-2.5 left-6 w-5 h-5 bg-[#e31837]/10 border-l border-t border-brand-100 rotate-45"></div>
 <div className="relative z-10 flex items-start gap-2">
 <MessageSquare className="w-4 h-4 text-[#e31837] shrink-0 mt-0.5" />
 <div>
 <p className="text-xs font-black text-[#c8102e] mb-1">Your Reply</p>
 <p className="text-sm font-semibold text-slate-700 ">{review.reply}</p>
 </div>
 </div>
 </div>
 ) : replyingTo === review.id ? (
 <div className="mt-4 flex gap-2">
 <input 
 type="text" 
 value={replyText}
 onChange={(e) => setReplyText(e.target.value)}
 placeholder="Type your reply here..." 
 className="flex-1 px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-[#e31837]"
 autoFocus
 />
 <button 
 onClick={() => handleReplySubmit(review.id)}
 className="px-4 py-2 bg-[#e31837] text-white font-bold rounded-xl text-sm hover:bg-[#c8102e]"
 >
 Send
 </button>
 <button 
 onClick={() => { setReplyingTo(null); setReplyText(''); }}
 className="px-4 py-2 bg-slate-200 text-slate-600 font-bold rounded-xl text-sm"
 >
 Cancel
 </button>
 </div>
 ) : (
 <div className="flex items-center gap-3 pt-4 mt-2 border-t border-gray-200 ">
 {!review.reported && (
 <button 
 onClick={() => setReplyingTo(review.id)}
 className="text-xs font-bold text-[#c8102e] flex items-center gap-1.5 hover:underline"
 >
 <MessageCircle className="w-4 h-4" /> Reply to Customer
 </button>
 )}
 {!review.reported && (
 <button 
 onClick={() => handleReport(review.id)}
 className="text-xs font-bold text-slate-400 hover:text-[#e31837] flex items-center gap-1.5 transition-colors ml-auto"
 >
 <AlertTriangle className="w-3.5 h-3.5" /> Report Fake
 </button>
 )}
 </div>
 )}

 </motion.div>
 )) : (
 <div className="text-center py-12 text-slate-400">
 <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
 <p className="font-semibold text-sm">No reviews found for this filter.</p>
 </div>
 )}
 </AnimatePresence>
 </div>
 </div>

 </div>
 </div>
 );
};

export default Reviews;
