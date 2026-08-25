import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { MapPin, CheckCircle, Flame, Bike, Home, Clock, Navigation, ArrowLeft, Package, Receipt, ChevronRight, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [status, setStatus] = useState('placed'); // placed, confirmed, preparing, out-for-delivery, delivered
  const [coordinates, setCoordinates] = useState({ lat: 28.6139, lng: 77.2090 });
  const [progressWidth, setProgressWidth] = useState('0%');
  const [riderProgress, setRiderProgress] = useState(0); 
  const [orderDetails, setOrderDetails] = useState(null);
  
  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
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
        setOrderDetails(res.data);
        if (res.data.status) setStatus(res.data.status);
      } catch (error) {
        console.error('Failed to fetch order details', error);
      }
    };
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (status === 'delivered' && !reviewSubmitted) {
      setTimeout(() => {
        setShowReviewModal(true);
      }, 2500);
    }
  }, [status, reviewSubmitted]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!orderDetails?.store) return;
    
    setSubmittingReview(true);
    setReviewError('');
    try {
      const { default: API } = await import('../../services/api.js');
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
          
          <button onClick={handleDownloadPdf} className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors border border-emerald-100">
            <Download className="w-4 h-4" /> Download Slip
          </button>
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
            
            {/* ETA */}
            <motion.div whileHover={{ scale: 1.02 }} className="bg-emerald-50 rounded-[2rem] p-5 w-full flex items-center justify-between border border-emerald-200/50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Clock className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Estimated Delivery</p>
                  <p className="text-lg font-black text-slate-800">{status === 'delivered' ? 'Completed' : '10-15 Minutes'}</p>
                </div>
              </div>
              {status !== 'delivered' && <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></span>}
            </motion.div>

          </motion.div>

          {/* Order Details Panel */}
          <motion.div custom={3} variants={stepVariants} initial="hidden" animate="visible">
            <div className="bg-white rounded-[2rem] border border-emerald-100 shadow-xl shadow-emerald-900/5 overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-emerald-50 flex items-center gap-3 bg-slate-50/50">
                <Receipt className="w-6 h-6 text-emerald-600" />
                <h3 className="text-lg font-black text-slate-800">Order Summary</h3>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                {orderDetails ? (
                  <div className="space-y-6">
                    {/* Items List */}
                    <div className="space-y-4">
                      {orderDetails.items?.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-center">
                          <img src={item.product?.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80"} alt={item.product?.name} className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border border-slate-100" />
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{item.product?.name || 'Item'}</h4>
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
                        <span className="text-slate-800">₹{orderDetails.billDetails?.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span className="text-slate-800">₹{orderDetails.billDetails?.deliveryFee}</span>
                      </div>
                      {orderDetails.billDetails?.codCharge > 0 && (
                        <div className="flex justify-between">
                          <span>COD Charge</span>
                          <span className="text-slate-800">₹{orderDetails.billDetails?.codCharge}</span>
                        </div>
                      )}
                      {orderDetails.billDetails?.discount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Coupon Discount</span>
                          <span>-₹{orderDetails.billDetails?.discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-4 border-t border-slate-100 text-lg">
                        <span className="font-black text-slate-800">Grand Total</span>
                        <span className="font-black text-emerald-600">₹{orderDetails.billDetails?.grandTotal}</span>
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

      {/* PROFESSIONAL HIDDEN INVOICE TEMPLATE FOR PDF */}
      <div id="invoice-content" style={{ display: 'none', padding: '40px', fontFamily: '"Inter", sans-serif', color: '#1e293b', backgroundColor: '#ffffff' }}>
        {orderDetails && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #10b981', paddingBottom: '20px', marginBottom: '30px' }}>
              <div>
                <h1 style={{ color: '#0f172a', margin: '0 0 5px 0', fontSize: '32px', fontWeight: '900', letterSpacing: '-1px' }}>RoseDash</h1>
                <p style={{ margin: '0', color: '#10b981', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px' }}>Order Receipt</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b', fontWeight: 'bold' }}>Order ID: <span style={{ color: '#0f172a' }}>{orderId}</span></p>
                <p style={{ margin: '0', fontSize: '14px', color: '#64748b' }}>Date: {new Date(orderDetails.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {/* Store & Customer Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
              <div style={{ flex: '1', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', marginRight: '10px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#10b981', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Fulfilled By</h3>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#0f172a', fontSize: '16px' }}>{orderDetails.store?.name || 'RoseDash Dark Store'}</p>
                <p style={{ margin: '0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>Authorized Retailer<br/>Quality Verified</p>
              </div>
              <div style={{ flex: '1', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', marginLeft: '10px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#10b981', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Delivered To</h3>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#0f172a', fontSize: '16px' }}>{orderDetails.user?.name || 'Customer'}</p>
                <p style={{ margin: '0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
                  {orderDetails.deliveryAddress?.street}<br/>
                  {orderDetails.deliveryAddress?.city}, {orderDetails.deliveryAddress?.state} {orderDetails.deliveryAddress?.zipCode}
                </p>
              </div>
            </div>
            
            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
              <thead>
                <tr style={{ backgroundColor: '#10b981', color: 'white' }}>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderRadius: '8px 0 0 8px', fontSize: '14px' }}>Item Description</th>
                  <th style={{ padding: '12px 15px', textAlign: 'center', fontSize: '14px' }}>Qty</th>
                  <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '14px' }}>Unit Price</th>
                  <th style={{ padding: '12px 15px', textAlign: 'right', borderRadius: '0 8px 8px 0', fontSize: '14px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.items?.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#334155' }}>{item.product?.name}</td>
                    <td style={{ padding: '15px', textAlign: 'center', color: '#64748b', fontWeight: 'bold' }}>{item.quantity}</td>
                    <td style={{ padding: '15px', textAlign: 'right', color: '#64748b' }}>₹{item.price}</td>
                    <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#0f172a' }}>₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Totals Section */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '300px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#64748b', fontSize: '14px' }}>
                  <span style={{ fontWeight: 'bold' }}>Subtotal:</span>
                  <span>₹{orderDetails.billDetails?.subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#64748b', fontSize: '14px' }}>
                  <span style={{ fontWeight: 'bold' }}>Delivery Fee:</span>
                  <span>₹{orderDetails.billDetails?.deliveryFee}</span>
                </div>
                {orderDetails.billDetails?.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', marginBottom: '12px', fontSize: '14px' }}>
                    <span style={{ fontWeight: 'bold' }}>Discount Applied:</span>
                    <span>-₹{orderDetails.billDetails?.discount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a', fontWeight: '900', fontSize: '20px', borderTop: '2px dashed #cbd5e1', paddingTop: '15px', marginTop: '15px' }}>
                  <span>Grand Total:</span>
                  <span style={{ color: '#10b981' }}>₹{orderDetails.billDetails?.grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '50px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <p style={{ margin: '0 0 5px 0' }}>Thank you for shopping with RoseDash!</p>
              <p style={{ margin: '0' }}>For support, contact us at support@rosedash.com</p>
            </div>
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default OrderTracking;
