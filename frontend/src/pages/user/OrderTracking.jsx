import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { MapPin, CheckCircle, Flame, Bike, Home, Clock, Navigation, ArrowLeft } from 'lucide-react';

const OrderTracking = () => {
 const [searchParams] = useSearchParams();
 const orderId = searchParams.get('orderId') || 'BD-8472948';

 const [status, setStatus] = useState('placed'); // placed, confirmed, preparing, out-for-delivery, delivered
 const [coordinates, setCoordinates] = useState({ lat: 28.6139, lng: 77.2090 }); // Connaught Place, Delhi coordinates
 const [progressWidth, setProgressWidth] = useState('0%');

 // Animation state for SVG map tracking path
 const [riderProgress, setRiderProgress] = useState(0); // percentage along the path (0 to 100)

 // Order Details
 const [orderDetails, setOrderDetails] = useState(null);
 
 // Review Modal State
 const [showReviewModal, setShowReviewModal] = useState(false);
 const [reviewRating, setReviewRating] = useState(5);
 const [reviewComment, setReviewComment] = useState('');
 const [reviewSubmitted, setReviewSubmitted] = useState(false);
 const [reviewError, setReviewError] = useState('');
 const [submittingReview, setSubmittingReview] = useState(false);

 // Socket configurations
 useEffect(() => {
 const getSocketUrl = () => {
 const envUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
 if (envUrl.includes('localhost') && window.location.hostname !== 'localhost') {
 return `http://${window.location.hostname}:5000`;
 }
 return envUrl;
 };

 const socket = io(getSocketUrl());

 socket.emit('joinOrderRoom', { orderId });

 socket.on('orderStatusUpdated', (data) => {
 if (data.status) {
 setStatus(data.status);
 }
 });

 socket.on('coordinatesUpdated', (data) => {
 if (data.coordinates) {
 setCoordinates(data.coordinates);
 }
 });

 // Start a simple animation for the rider on the map ONLY if out-for-delivery
 let progressInterval;
 if (status === 'out-for-delivery') {
 setRiderProgress(0); // start path
 progressInterval = setInterval(() => {
 setRiderProgress(prev => {
 if (prev >= 98) {
 clearInterval(progressInterval);
 return 98; // keep just before home until delivered
 }
 return prev + 2; 
 });
 }, 500);
 } else if (status === 'delivered') {
 setRiderProgress(100);
 } else {
 setRiderProgress(0);
 }

 return () => {
 socket.emit('leaveOrderRoom', { orderId });
 socket.disconnect();
 if (progressInterval) clearInterval(progressInterval);
 };
 }, [orderId, status]);

 // Fetch full order details
 useEffect(() => {
 const fetchOrder = async () => {
 try {
 const { default: API } = await import('../../services/api.js');
 const res = await API.get(`/orders/${orderId}`);
 setOrderDetails(res.data);
 } catch (error) {
 console.error('Failed to fetch order details', error);
 }
 };
 fetchOrder();
 }, [orderId]);

 // Show review modal when delivered
 useEffect(() => {
 if (status === 'delivered' && !reviewSubmitted) {
 setTimeout(() => {
 setShowReviewModal(true);
 }, 1500);
 }
 }, [status, reviewSubmitted]);

 const handleSubmitReview = async (e) => {
 e.preventDefault();
 if (!orderDetails?.store) return;
 
 setSubmittingReview(true);
 setReviewError('');
 try {
 const { default: API } = await import('../../services/api.js');
 // For creating a review
 await API.post('/reviews', {
 storeId: orderDetails.store._id || orderDetails.store,
 rating: reviewRating,
 comment: reviewComment
 });
 setReviewSubmitted(true);
 setTimeout(() => setShowReviewModal(false), 2000);
 } catch (err) {
 setReviewError(err.response?.data?.message || 'Failed to submit review');
 } finally {
 setSubmittingReview(false);
 }
 };

 // Update coordinate numbers mathematically based on path progress for simulated tracking!
 useEffect(() => {
 // Start coordinates (Connaught Place, Store): 28.6139, 77.2090
 // End coordinates (User home, Delhi Gate): 28.6369, 77.2410
 const startLat = 28.6139;
 const startLng = 77.2090;
 const endLat = 28.6369;
 const endLng = 77.2410;

 const ratio = riderProgress / 100;
 const currentLat = startLat + (endLat - startLat) * ratio;
 const currentLng = startLng + (endLng - startLng) * ratio;

 setCoordinates({
 lat: parseFloat(currentLat.toFixed(5)),
 lng: parseFloat(currentLng.toFixed(5))
 });
 }, [riderProgress]);

 // Map status to progress bar widths
 useEffect(() => {
 if (status === 'placed') setProgressWidth('0%');
 else if (status === 'confirmed') setProgressWidth('25%');
 else if (status === 'preparing') setProgressWidth('50%');
 else if (status === 'out-for-delivery') setProgressWidth('75%');
 else if (status === 'delivered') setProgressWidth('100%');
 }, [status]);

 const getStatusLabel = () => {
 if (status === 'placed') return 'Order Placed 🥳';
 if (status === 'confirmed') return 'Confirmed by Dark Store 🏪';
 if (status === 'preparing') return 'Packing your order 📦';
 if (status === 'out-for-delivery') return 'Out for Delivery 🛵';
 if (status === 'delivered') return 'Delivered! Enjoy! 🎉';
 return 'Processing Order';
 };

 // SVG road points
 // Simple straight/curved vector coordinate calculation
 const pathLength = 300;
 const riderX = 50 + (300 * (riderProgress / 100)); // x position along SVG path (50 to 350)
 const riderY = 150 + Math.sin((riderProgress / 100) * Math.PI * 3) * 25; // curved road coordinate

 return (
 <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
 
 <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-500 transition-colors self-start">
 <ArrowLeft className="w-4 h-4" /> Back to Home
 </Link>

 <div className="bg-white rounded-3xl p-6 md:p-8 border border-pink-200 shadow-premium flex flex-col gap-6 text-center items-center">
 
 {/* Header Title */}
 <div>
 <span className="text-xs font-black uppercase text-brand-500 tracking-widest">Order Live Status</span>
 <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">{getStatusLabel()}</h2>
 <p className="text-xs text-slate-400 mt-2">Order ID: <span className="font-mono font-bold">{orderId}</span></p>
 </div>

 {/* Live Tracking Map Box */}
 <div className="w-full h-64 bg-pink-50 rounded-2xl border border-pink-200/50 relative overflow-hidden flex items-center justify-center">
 
 {/* SVG Map Guide */}
 <svg className="w-full h-full max-w-[400px]" viewBox="0 0 400 300">
 {/* Grid Map Background Pattern */}
 <defs>
 <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
 <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1"/>
 </pattern>
 </defs>
 <rect width="100%" height="100%" fill="url(#grid)" />

 {/* Path / Road line */}
 <path 
 d="M 50 150 Q 150 75 200 150 T 350 150" 
 fill="none" 
 stroke="rgba(244, 63, 94, 0.15)" 
 strokeWidth="6" 
 strokeLinecap="round" 
 />
 <path 
 d="M 50 150 Q 150 75 200 150 T 350 150" 
 fill="none" 
 stroke="#f43f5e" 
 strokeWidth="3" 
 strokeDasharray="6 4" 
 strokeLinecap="round" 
 />

 {/* Store Node */}
 <g transform="translate(50, 150)">
 <circle r="16" fill="#10b981" fillOpacity="0.2" className="animate-ping" />
 <circle r="10" fill="#10b981" stroke="white" strokeWidth="2" />
 <text y="-16" textAnchor="middle" fontSize="9" fontWeight="black" fill="#10b981" uppercase="true">STORE</text>
 </g>

 {/* User Home Node */}
 <g transform="translate(350, 150)">
 <circle r="16" fill="#3b82f6" fillOpacity="0.2" />
 <circle r="10" fill="#3b82f6" stroke="white" strokeWidth="2" />
 <text y="-16" textAnchor="middle" fontSize="9" fontWeight="black" fill="#3b82f6">HOME</text>
 </g>

 {/* Rider Node Moving along Path */}
 <g transform={`translate(${riderX}, ${riderY})`}>
 <circle r="14" fill="#f43f5e" fillOpacity="0.25" className="animate-pulse" />
 <circle r="9" fill="#f43f5e" stroke="white" strokeWidth="1.5" />
 <g transform="scale(0.6) translate(-10, -10)">
 <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white" />
 </g>
 </g>
 </svg>

 {/* Coordinates HUD overlay */}
 <div className="absolute bottom-3 left-3 bg-slate-900/90 text-white font-mono text-[9px] px-2.5 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
 <Navigation className="w-3.5 h-3.5 text-brand-500 animate-spin" />
 <div>
 <p>LAT: {coordinates.lat}° N</p>
 <p>LNG: {coordinates.lng}° E</p>
 </div>
 </div>
 </div>

 {/* Delivery ETA banner */}
 <div className="bg-pink-50 rounded-2xl p-4 w-full flex items-center justify-between border border-pink-200 max-w-sm">
 <div className="flex items-center gap-2.5 text-left">
 <Clock className="w-5 h-5 text-brand-500 shrink-0" />
 <div>
 <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Estimated Delivery</p>
 <p className="text-sm font-extrabold">{status === 'delivered' ? 'Completed' : '10-15 Minutes'}</p>
 </div>
 </div>
 <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-ping"></span>
 </div>

 {/* Connected Stepper Tracker */}
 <div className="w-full relative flex items-center justify-between mt-8 max-w-md">
 {/* Progress Connecting Line */}
 <div className="absolute left-0 right-0 top-5 h-1 bg-pink-100 -z-10 rounded-full">
 <div className="h-full bg-brand-500 rounded-full transition-all duration-1000" style={{ width: progressWidth }}></div>
 </div>

 {/* Placed step */}
 <div className="flex flex-col items-center gap-2">
 <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold text-sm shadow transition-colors ${
 ['placed', 'confirmed', 'preparing', 'out-for-delivery', 'delivered'].includes(status)
 ? 'bg-brand-500 border-brand-500 text-white'
 : 'bg-white border-pink-200 '
 }`}>
 <CheckCircle className="w-5 h-5" />
 </div>
 <span className="text-[10px] font-black uppercase text-slate-400">Placed</span>
 </div>

 {/* Preparing step */}
 <div className="flex flex-col items-center gap-2">
 <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold text-sm shadow transition-colors ${
 ['preparing', 'out-for-delivery', 'delivered'].includes(status)
 ? 'bg-brand-500 border-brand-500 text-white'
 : 'bg-white border-pink-200 '
 }`}>
 <CheckCircle className="w-5 h-5" />
 </div>
 <span className="text-[10px] font-black uppercase text-slate-400">Packing</span>
 </div>

 {/* Out for Delivery step */}
 <div className="flex flex-col items-center gap-2">
 <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold text-sm shadow transition-colors ${
 ['out-for-delivery', 'delivered'].includes(status)
 ? 'bg-brand-500 border-brand-500 text-white'
 : 'bg-white border-pink-200 '
 }`}>
 <Bike className="w-5 h-5" />
 </div>
 <span className="text-[10px] font-black uppercase text-slate-400">Out</span>
 </div>

 {/* Delivered step */}
 <div className="flex flex-col items-center gap-2">
 <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold text-sm shadow transition-colors ${
 status === 'delivered'
 ? 'bg-brand-500 border-brand-500 text-white animate-bounce'
 : 'bg-white border-pink-200 '
 }`}>
 <Home className="w-5 h-5" />
 </div>
 <span className="text-[10px] font-black uppercase text-slate-400">Delivered</span>
 </div>
 </div>

 {/* Back home action button */}
 <Link 
 to="/"
 className="mt-8 px-8 py-3 rounded-full bg-slate-950 text-white hover:bg-slate-905 font-bold text-sm shadow-md active:scale-95 transition-all flex items-center gap-2"
 >
 <Home className="w-4 h-4" /> Go Back Home
 </Link>
 </div>

 {/* REVIEW MODAL */}
 {showReviewModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
 <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 border border-pink-200 ">
 {reviewSubmitted ? (
 <div className="p-8 text-center">
 <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
 <CheckCircle className="w-8 h-8" />
 </div>
 <h3 className="text-xl font-bold text-slate-900 mb-2">Thank You!</h3>
 <p className="text-slate-500 text-sm">Your feedback helps us improve.</p>
 </div>
 ) : (
 <div className="p-6">
 <div className="flex justify-between items-start mb-4">
 <h3 className="text-xl font-bold text-slate-900 ">Rate your order</h3>
 <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-700">×</button>
 </div>
 <form onSubmit={handleSubmitReview}>
 <div className="flex justify-center gap-2 mb-6">
 {[1, 2, 3, 4, 5].map((star) => (
 <button
 key={star}
 type="button"
 onClick={() => setReviewRating(star)}
 className={`text-3xl transition-transform ${reviewRating >= star ? 'text-amber-400 scale-110' : 'text-slate-200 hover:text-amber-200'}`}
 >
 ★
 </button>
 ))}
 </div>
 <textarea
 placeholder="Write a comment... (optional)"
 value={reviewComment}
 onChange={(e) => setReviewComment(e.target.value)}
 className="w-full px-4 py-3 rounded-lg border border-pink-200 bg-pink-50 outline-none focus:border-brand-500 text-sm mb-4 resize-none h-24"
 />
 {reviewError && <p className="text-xs text-rose-500 mb-4">{reviewError}</p>}
 <button
 type="submit"
 disabled={submittingReview}
 className="w-full bg-brand-500 text-white font-bold py-3 rounded-xl shadow hover:bg-brand-600 disabled:opacity-50"
 >
 {submittingReview ? 'Submitting...' : 'Submit Feedback'}
 </button>
 </form>
 </div>
 )}
 </div>
 </div>
 )}

 </div>
 );
};

export default OrderTracking;
