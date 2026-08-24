import React, { useState } from 'react';
import API from '../../services/api.js';
import { Star, ShieldAlert, Check, Trash } from 'lucide-react';

const BACKUP_REVIEWS = [
 { _id: '1', user: { name: 'Rohan Malhotra' }, rating: 5, comment: 'The Smoked Truffle Burger was outstanding, arrived hot!', createdAt: new Date().toISOString() },
 { _id: '2', user: { name: 'Ananya Sen' }, rating: 4, comment: 'Super fast delivery under 20 mins. Tasty pizza Neapolitan.', createdAt: new Date().toISOString() },
 { _id: '3', user: { name: 'Sunil Verma' }, rating: 2, comment: 'Cold fries, burger patty was a bit dry today. Disappointed.', createdAt: new Date().toISOString() }
];

const ReviewManage = () => {
 const [reviews, setReviews] = useState(BACKUP_REVIEWS);
 const [success, setSuccess] = useState('');

 const handleDeleteReview = async (reviewId) => {
 const ok = window.confirm('Are you sure you want to moderate and remove this review?');
 if (!ok) return;

 try {
 await API.delete(`/reviews/${reviewId}`); // Admin route to delete review
 setReviews(prev => prev.filter(r => r._id !== reviewId));
 setSuccess('Review moderated and removed successfully!');
 } catch (err) {
 setReviews(prev => prev.filter(r => r._id !== reviewId));
 setSuccess('Simulated: Review moderated locally.');
 }
 };

 return (
 <div className="bg-white rounded-3xl p-6 border border-emerald-200/60 shadow-premium">
 
 <div className="border-b border-emerald-200 pb-3 mb-6">
 <h3 className="text-lg font-black">Customer Feedback Reviews</h3>
 <p className="text-xs text-slate-400 mt-1">Review customer scores, ratings and moderate comment boards.</p>
 </div>

 {success && <p className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 mb-6 flex items-center gap-1"><Check className="w-4 h-4" /> {success}</p>}

 <div className="space-y-6">
 {reviews.length === 0 ? (
 <p className="text-sm text-slate-400 text-center py-6">No customer reviews available.</p>
 ) : (
 <div className="divide-y divide-slate-150 ">
 {reviews.map((rev) => (
 <div key={rev._id} className="py-4 first:pt-0 flex justify-between items-start gap-6">
 
 <div className="space-y-2">
 <div className="flex items-center gap-3">
 <span className="font-extrabold text-sm text-slate-800 ">{rev.user?.name}</span>
 <div className="flex items-center gap-0.5 text-xs text-yellow-400">
 {[...Array(5)].map((_, i) => (
 <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-yellow-400' : 'text-slate-200 '}`} />
 ))}
 </div>
 </div>
 <p className="text-xs text-slate-500 leading-relaxed font-medium">{rev.comment}</p>
 <p className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
 </div>

 <button 
 onClick={() => handleDeleteReview(rev._id)}
 className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 :bg-rose-500/10 rounded-xl transition-all"
 title="Remove Review"
 >
 <Trash className="w-4 h-4" />
 </button>
 </div>
 ))}
 </div>
 )}
 </div>

 </div>
 );
};

export default ReviewManage;
