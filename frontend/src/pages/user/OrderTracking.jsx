import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { MapPin, CheckCircle, Flame, Bike, Home, Clock, Navigation, ArrowLeft, Package, ChevronRight, Download, X, FileText, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import { useSettings } from '../../context/SettingsContext.jsx';

const OrderTracking = () => {
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const orderId = searchParams.get('orderId');

  // Initialize orderDetails instantly from location state or cached localStorage
  const [orderDetails, setOrderDetails] = useState(() => {
    if (location.state?.order) return location.state.order;
    if (orderId) {
      try {
        const cached = localStorage.getItem(`order_${orderId}`) || localStorage.getItem('lastPlacedOrder');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed._id === orderId || !orderId || parsed._id)) return parsed;
        }
      } catch (e) {
        console.warn('Error parsing cached order', e);
      }
    }
    return null;
  });

  const [status, setStatus] = useState(() => orderDetails?.status || 'placed'); // placed, confirmed, preparing, out-for-delivery, delivered
  const [coordinates, setCoordinates] = useState({ lat: 28.6139, lng: 77.2090 });
  const [progressWidth, setProgressWidth] = useState('0%');
  const [riderProgress, setRiderProgress] = useState(0); 
  
  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    
    const getSocketUrl = () => {
      return import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    };

    const socket = io(getSocketUrl());
    socket.emit('joinOrderRoom', { orderId });

    socket.on('orderStatusUpdated', (data) => {
      if (data.status) {
        setStatus(data.status);
      }
      setOrderDetails(prev => prev ? {
        ...prev,
        status: data.status || prev.status,
        pickedUpAt: data.pickedUpAt || prev.pickedUpAt,
        deliveredAt: data.deliveredAt || prev.deliveredAt
      } : prev);
    });

    socket.on('orderPickedUp', (data) => {
      setStatus('out-for-delivery');
      setOrderDetails(prev => prev ? {
        ...prev,
        status: 'out-for-delivery',
        pickedUpAt: data.pickedUpAt || new Date().toISOString()
      } : prev);
    });

    socket.on('coordinatesUpdated', (data) => {
      if (data.coordinates) {
        setCoordinates(data.coordinates);
      }
    });

    let progressInterval;
    if (status === 'out-for-delivery') {
      setRiderProgress(0); 
      progressInterval = setInterval(() => {
        setRiderProgress(prev => {
          if (prev >= 98) {
            clearInterval(progressInterval);
            return 98; 
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

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const { default: API } = await import('../../services/api.js');
        const res = await API.get(`/orders/${orderId}`);
        if (res.data) {
          setOrderDetails(res.data);
          if (res.data.status) setStatus(res.data.status);
          localStorage.setItem(`order_${orderId}`, JSON.stringify(res.data));
        }
      } catch (error) {
        console.warn('Failed to fetch order details via API, using stored state / fallback:', error);
        setOrderDetails(prev => {
          if (prev) return prev;
          try {
            const cached = localStorage.getItem(`order_${orderId}`) || localStorage.getItem('lastPlacedOrder');
            if (cached) return JSON.parse(cached);
          } catch(e){}
          return {
            _id: orderId,
            status: 'placed',
            user: { name: 'Customer' },
            items: [],
            billDetails: { subtotal: 0, deliveryFee: 0, grandTotal: 0 },
            deliveryAddress: { street: 'Standard Delivery Address', city: 'New Delhi', state: 'Delhi', zipCode: '110001' },
            paymentDetails: { method: 'upi', status: 'paid' },
            createdAt: new Date().toISOString()
          };
        });
      }
    };
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (status === 'delivered' && !reviewSubmitted && !orderDetails?.rating?.customerRating) {
      setTimeout(() => {
        setShowReviewModal(true);
      }, 2000);
    }
  }, [status, reviewSubmitted, orderDetails]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError('');
    try {
      const { default: API } = await import('../../services/api.js');
      // 1. Submit to order rate endpoint
      await API.post(`/orders/${orderId}/rate`, {
        customerRating: reviewRating,
        feedback: reviewComment
      }).catch(() => {});

      // 2. Submit to store reviews endpoint if store exists
      if (orderDetails?.store) {
        await API.post('/reviews', {
          storeId: orderDetails.store._id || orderDetails.store,
          rating: reviewRating,
          comment: reviewComment
        }).catch(() => {});
      }

      setReviewSubmitted(true);
      setTimeout(() => setShowReviewModal(false), 2000);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById('invoice-content');
    if (!element) return;
    
    // Briefly unhide for render, then re-hide
    element.style.display = 'block';
    
    const opt = {
      margin:       0.5,
      filename:     `RoseDash-slip_${orderId}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      element.style.display = 'none';
    });
  };

  useEffect(() => {
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

  useEffect(() => {
    if (status === 'placed') setProgressWidth('0%');
    else if (status === 'confirmed') setProgressWidth('25%');
    else if (status === 'preparing') setProgressWidth('50%');
    else if (status === 'out-for-delivery') setProgressWidth('75%');
    else if (status === 'delivered') setProgressWidth('100%');
  }, [status]);

  const getStatusLabel = () => {
    if (status === 'placed') return 'Order Placed 🥳';
    if (status === 'confirmed') return 'Confirmed by Store 🏪';
    if (status === 'preparing') return 'Packing your order 📦';
    if (status === 'out-for-delivery') return 'Out for Delivery 🛵';
    if (status === 'delivered') return 'Delivered! Enjoy! 🎉';
    return 'Processing Order';
  };

  const getStatusSubtext = () => {
    if (status === 'placed') return 'Waiting for store to accept your order.';
    if (status === 'confirmed') return 'The store has accepted your order.';
    if (status === 'preparing') return 'Your items are being packed carefully.';
    if (status === 'out-for-delivery') return 'Rider is on the way to your location.';
    if (status === 'delivered') return 'Your order has been delivered successfully.';
    return 'Please wait...';
  };

  const pathLength = 300;
  const riderX = 50 + (300 * (riderProgress / 100));
  const riderY = 150 + Math.sin((riderProgress / 100) * Math.PI * 3) * 25;

  if (!orderId) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">Invalid Order ID</div>;
  }

  const stepVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
    })
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 font-sans pb-24 pt-8"
    >
      <div className="max-w-4xl mx-auto px-4 flex flex-col gap-8">
        
        <motion.div custom={0} variants={stepVariants} initial="hidden" animate="visible" className="flex justify-between items-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          
        <div className="flex gap-3">
          <button onClick={() => setShowSlipModal(true)} className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors border border-emerald-100">
            <FileText className="w-4 h-4" /> View Slip
          </button>
          <button onClick={handleDownloadPdf} className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-sm px-4 py-2 rounded-xl transition-colors border border-slate-200">
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
        </motion.div>

        {/* Tracking Header */}
        <motion.div custom={1} variants={stepVariants} initial="hidden" animate="visible" className="bg-white rounded-[2rem] p-8 border border-emerald-100 shadow-xl shadow-emerald-900/5 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
          
          <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-widest rounded-full mb-4">
            Live Status
          </span>
          <AnimatePresence mode="wait">
            <motion.h2 
              key={status}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight"
            >
              {getStatusLabel()}
            </motion.h2>
          </AnimatePresence>
          <p className="text-sm font-medium text-slate-500 mt-2">{getStatusSubtext()}</p>
          <p className="text-xs text-slate-400 mt-4 font-mono font-bold bg-slate-50 inline-block px-3 py-1 rounded-lg">Order ID: {orderId}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Tracking Map & Stepper */}
          <motion.div custom={2} variants={stepVariants} initial="hidden" animate="visible" className="flex flex-col gap-6">
            
            {/* Map Box */}
            <div className="w-full h-[280px] bg-emerald-50/50 rounded-[2rem] border border-emerald-200/60 relative overflow-hidden flex items-center justify-center shadow-inner group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              
              <svg className="w-full h-full max-w-[400px] z-10" viewBox="0 0 400 300">
                <path d="M 50 150 Q 150 75 200 150 T 350 150" fill="none" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="8" strokeLinecap="round" />
                <path d="M 50 150 Q 150 75 200 150 T 350 150" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="8 6" strokeLinecap="round" className="animate-pulse" />

                <g transform="translate(50, 150)">
                  <circle r="18" fill="#059669" fillOpacity="0.2" className="animate-ping" />
                  <circle r="12" fill="#059669" stroke="white" strokeWidth="3" />
                  <text y="-20" textAnchor="middle" fontSize="10" fontWeight="black" fill="#059669">STORE</text>
                </g>

                <g transform="translate(350, 150)">
                  <circle r="18" fill="#3b82f6" fillOpacity="0.2" />
                  <circle r="12" fill="#3b82f6" stroke="white" strokeWidth="3" />
                  <text y="-20" textAnchor="middle" fontSize="10" fontWeight="black" fill="#3b82f6">HOME</text>
                </g>

                <motion.g animate={{ x: riderX, y: riderY }} transition={{ type: "spring", stiffness: 100, damping: 20 }}>
                  <circle r="16" fill="#10b981" fillOpacity="0.3" className="animate-pulse" />
                  <circle r="11" fill="#10b981" stroke="white" strokeWidth="2" />
                  <g transform="scale(0.7) translate(-10, -10)">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white" />
                  </g>
                </motion.g>
              </svg>

              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur text-slate-800 font-mono text-[10px] px-3 py-2 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-500 animate-spin" />
                <div>
                  <p className="font-bold">LAT: {coordinates.lat}°</p>
                  <p className="font-bold">LNG: {coordinates.lng}°</p>
                </div>
              </div>
            </div>

            {/* Stepper */}
            <div className="bg-white p-6 rounded-[2rem] border border-emerald-100 shadow-sm relative">
              <div className="w-full relative flex items-center justify-between z-10 px-2">
                <div className="absolute left-6 right-6 top-5 h-1.5 bg-slate-100 -z-10 rounded-full">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: progressWidth }}></div>
                </div>

                {[
                  { id: 'placed', icon: CheckCircle, label: 'Placed' },
                  { id: 'preparing', icon: Package, label: 'Packing' },
                  { id: 'out-for-delivery', icon: Bike, label: 'Out' },
                  { id: 'delivered', icon: Home, label: 'Delivered' }
                ].map((step, idx) => {
                  const isPast = ['placed', 'confirmed', 'preparing', 'out-for-delivery', 'delivered'].indexOf(status) >= ['placed', 'confirmed', 'preparing', 'out-for-delivery', 'delivered'].indexOf(step.id);
                  const isCurrent = status === step.id || (status === 'confirmed' && step.id === 'placed');
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center gap-2">
                      <motion.div 
                        initial={false}
                        animate={isCurrent ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 font-bold shadow-sm transition-colors duration-500 ${
                          isPast ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-300'
                        }`}
                      >
                        <step.icon className="w-5 h-5" />
                      </motion.div>
                      <span className={`text-[10px] font-black uppercase ${isPast ? 'text-emerald-700' : 'text-slate-400'}`}>{step.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* ETA & Live Timestamps */}
            <motion.div whileHover={{ scale: 1.02 }} className="bg-emerald-50 rounded-[2rem] p-5 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-emerald-200/50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Clock className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Estimated Delivery</p>
                  <p className="text-lg font-black text-slate-800">{status === 'delivered' ? 'Completed' : '10-15 Minutes'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {orderDetails?.pickedUpAt && (
                  <span className="text-[11px] font-bold bg-white px-3 py-1 rounded-full text-sky-700 border border-sky-200 shadow-2xs">
                    🛵 Picked: {new Date(orderDetails.pickedUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                {orderDetails?.deliveredAt && (
                  <span className="text-[11px] font-bold bg-white px-3 py-1 rounded-full text-emerald-700 border border-emerald-200 shadow-2xs">
                    🎉 Delivered: {new Date(orderDetails.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </motion.div>

          </motion.div>

          {/* Order Details Panel */}
          <motion.div custom={3} variants={stepVariants} initial="hidden" animate="visible">
            <div className="bg-white rounded-[2rem] border border-emerald-100 shadow-xl shadow-emerald-900/5 overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-emerald-50 flex items-center gap-3 bg-slate-50/50">
                <IndianRupee className="w-6 h-6 text-emerald-600" />
                <h3 className="text-lg font-black text-slate-800">Order Summary</h3>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                {orderDetails ? (
                  <div className="space-y-6">
                    {/* Items List */}
                    <div className="space-y-4">
                      {orderDetails.items?.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-center">
                          <img src={item.product?.image || item.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80"} alt={item.product?.name || item.name} className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border border-slate-100" />
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{item.product?.name || item.name || 'Item'}</h4>
                            <p className="text-xs font-semibold text-slate-500 mt-0.5">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-black text-slate-800">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="w-full h-px bg-slate-100 border border-dashed border-slate-200"></div>

                    {/* Bill Details */}
                    <div className="space-y-2 text-sm font-semibold text-slate-600">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="text-slate-800">₹{orderDetails.billDetails?.subtotal || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span className="text-slate-800">₹{orderDetails.billDetails?.deliveryFee || 0}</span>
                      </div>
                      {(() => {
                        const extraCharges = (orderDetails.billDetails?.tax || 0) + 
                                             (orderDetails.billDetails?.codCharge || 0) + 
                                             (orderDetails.billDetails?.extraDistanceSurcharge || 0) + 
                                             (orderDetails.billDetails?.appliedCharges?.reduce((a, c) => a + c.amount, 0) || 0);
                        if (extraCharges > 0) {
                          return (
                            <div className="flex justify-between">
                              <span>Taxes & Charges</span>
                              <span className="text-slate-800">₹{extraCharges}</span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      {orderDetails.billDetails?.discount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-bold">
                          <span>Coupon Discount</span>
                          <span>-₹{orderDetails.billDetails?.discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-4 border-t border-slate-100 text-lg">
                        <span className="font-black text-slate-800">Grand Total</span>
                        <span className="font-black text-emerald-600">₹{orderDetails.billDetails?.grandTotal || 0}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 mt-6 border border-slate-100">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> Delivery Address</h4>
                      <p className="text-sm font-bold text-slate-800">{orderDetails.deliveryAddress?.street}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">{orderDetails.deliveryAddress?.city}, {orderDetails.deliveryAddress?.state} {orderDetails.deliveryAddress?.zipCode}</p>
                    </div>

                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 font-bold animate-pulse">Loading details...</div>
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* REVIEW MODAL */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-emerald-100"
            >
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
                    <h3 className="text-xl font-black text-slate-900">Rate your experience</h3>
                    <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full p-1"><X className="w-4 h-4"/></button>
                  </div>
                  <form onSubmit={handleSubmitReview}>
                    <div className="flex justify-center gap-2 mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`text-4xl transition-transform ${reviewRating >= star ? 'text-amber-400 scale-110 drop-shadow-md' : 'text-slate-200 hover:text-amber-200'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      placeholder="Write a comment... (optional)"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 text-sm mb-4 resize-none h-24 font-medium text-slate-700"
                    />
                    {reviewError && <p className="text-xs font-bold text-rose-500 mb-4">{reviewError}</p>}
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-95"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SLIP / INVOICE CONTENT */}
      {orderDetails && (
        <>
          {/* Hidden element for PDF rendering */}
          <div id="invoice-content" style={{ display: 'none', padding: '40px', fontFamily: '"Inter", sans-serif', color: '#1e293b', backgroundColor: '#ffffff' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <InvoiceJSX orderDetails={orderDetails} orderId={orderId} settings={settings} />
            </div>
          </div>
          
          {/* Modal for Viewing the Slip */}
          <AnimatePresence>
            {showSlipModal && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                  className="bg-slate-100 rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-300"
                >
                  <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-200 bg-white shadow-sm z-10">
                    <h3 className="text-base sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                      <IndianRupee className="w-5 h-5 text-emerald-600"/> Order Slip
                    </h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleDownloadPdf} 
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        <Download className="w-4 h-4"/> <span className="hidden sm:inline">Download</span> PDF
                      </button>
                      <button 
                        onClick={() => setShowSlipModal(false)} 
                        className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                      >
                        <X className="w-5 h-5"/>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 sm:p-6 md:p-8 bg-slate-100 custom-scrollbar flex justify-center items-start">
                    <div className="bg-white shadow-xl rounded-2xl sm:rounded-3xl w-full max-w-[800px] font-sans text-slate-800 p-4 sm:p-8 md:p-10 border border-slate-200/60">
                      <InvoiceJSX orderDetails={orderDetails} orderId={orderId} settings={settings} />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};

// Extracted JSX for Invoice to avoid duplication & ensure responsiveness
const InvoiceJSX = ({ orderDetails, orderId, settings }) => (
  <div className="relative overflow-hidden">
    {/* Watermark Seal */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 opacity-[0.03] pointer-events-none z-0 flex flex-col items-center justify-center w-full select-none">
      <span className="text-5xl sm:text-8xl font-black text-emerald-600 uppercase tracking-tighter whitespace-nowrap leading-none">
        {settings?.siteTitle || 'ROSEDASH'}
      </span>
      <span className="text-xl sm:text-3xl font-bold text-emerald-600 tracking-widest whitespace-nowrap mt-2">
        OFFICIAL RECEIPT
      </span>
    </div>
    
    <div className="relative z-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-emerald-500 pb-5">
        <div className="flex items-center gap-3">
          {settings?.logoUrl && (
            <img src={settings.logoUrl} alt="Logo" className="h-10 sm:h-12 object-contain" />
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none m-0">
              {settings?.siteTitle || 'RoseDash'}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-emerald-600 uppercase tracking-widest mt-1">
              Order Receipt
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right font-sans">
          <p className="text-xs sm:text-sm font-bold text-slate-500 m-0">
            Order ID: <span className="text-slate-900 font-mono font-black">{orderId}</span>
          </p>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Date: {new Date(orderDetails.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Store & Customer Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <h3 className="text-[11px] font-black text-emerald-600 uppercase tracking-wider mb-1.5">Fulfilled By</h3>
          <p className="font-bold text-slate-900 text-sm sm:text-base mb-1">{orderDetails.store?.name || 'RoseDash Dark Store'}</p>
          <p className="text-xs text-slate-500 leading-relaxed">Authorized Retailer &bull; Quality Verified</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <h3 className="text-[11px] font-black text-emerald-600 uppercase tracking-wider mb-1.5">Delivered To</h3>
          <p className="font-bold text-slate-900 text-sm sm:text-base mb-1">{orderDetails.user?.name || 'Customer'}</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            {orderDetails.deliveryAddress?.street || 'Standard Delivery Address'}
            {orderDetails.deliveryAddress?.city ? `, ${orderDetails.deliveryAddress.city}` : ''}
            {orderDetails.deliveryAddress?.state ? `, ${orderDetails.deliveryAddress.state}` : ''}
            {orderDetails.deliveryAddress?.zipCode ? ` - ${orderDetails.deliveryAddress.zipCode}` : ''}
          </p>
        </div>
      </div>
      
      {/* Items Table with horizontal scroll wrapper for small screens */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
        <table className="w-full text-left border-collapse min-w-[420px]">
          <thead>
            <tr className="bg-emerald-600 text-white text-xs uppercase tracking-wider font-bold">
              <th className="p-3 sm:p-4 rounded-tl-xl">Item Description</th>
              <th className="p-3 sm:p-4 text-center">Qty</th>
              <th className="p-3 sm:p-4 text-right">Unit Price</th>
              <th className="p-3 sm:p-4 text-right rounded-tr-xl">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {orderDetails.items?.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                <td className="p-3 sm:p-4 font-bold text-slate-800">{item.product?.name || item.name || 'Product Item'}</td>
                <td className="p-3 sm:p-4 text-center text-slate-600 font-semibold">{item.quantity}</td>
                <td className="p-3 sm:p-4 text-right text-slate-500">₹{item.price}</td>
                <td className="p-3 sm:p-4 text-right font-black text-slate-900">₹{item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Totals Section */}
      <div className="flex justify-end pt-2">
        <div className="w-full sm:w-80 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-slate-600">
            <span className="font-semibold">Subtotal:</span>
            <span className="font-bold text-slate-800">₹{orderDetails.billDetails?.subtotal || 0}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span className="font-semibold">Delivery Fee:</span>
            <span className="font-bold text-slate-800">₹{orderDetails.billDetails?.deliveryFee || 0}</span>
          </div>
          {(() => {
            const extraCharges = (orderDetails.billDetails?.tax || 0) + 
                                 (orderDetails.billDetails?.codCharge || 0) + 
                                 (orderDetails.billDetails?.extraDistanceSurcharge || 0) + 
                                 (orderDetails.billDetails?.appliedCharges?.reduce((a, c) => a + c.amount, 0) || 0);
            if (extraCharges > 0) {
              return (
                <div className="flex justify-between text-slate-600">
                  <span className="font-semibold">Taxes & Charges:</span>
                  <span className="font-bold text-slate-800">₹{extraCharges}</span>
                </div>
              );
            }
            return null;
          })()}
          {orderDetails.billDetails?.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
              <span>Discount Applied:</span>
              <span>-₹{orderDetails.billDetails?.discount}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-900 font-black text-base sm:text-lg border-t border-slate-200 pt-3 mt-2">
            <span>Grand Total:</span>
            <span className="text-emerald-600">₹{orderDetails.billDetails?.grandTotal || 0}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-[11px] sm:text-xs text-slate-400 border-t border-slate-100 pt-4 space-y-1">
        <p className="font-semibold text-slate-500 m-0">Thank you for shopping with {settings?.siteTitle || 'RoseDash'}!</p>
        <p className="m-0">For support, contact us at {settings?.contactEmail || 'support@rosedash.com'}</p>
      </div>
    </div>
  </div>
);

export default OrderTracking;
