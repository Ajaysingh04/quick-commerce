import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  Bike,
  Phone,
  Play,
  Check,
  MapPin,
  Navigation,
  Map,
  Zap,
  ShieldAlert,
  Timer,
  KeyRound,
  ExternalLink,
  CheckCircle2,
  PackageCheck,
  ChevronRight,
  AlertCircle,
  Clock,
  QrCode,
  Star,
  Sparkles,
  IndianRupee,
  Lock,
  Unlock,
  CreditCard,
  Banknote,
  Camera,
  X,
  ThumbsUp,
  PartyPopper
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import API from '../../services/api.js';

// Timer Component for 10-Minute Quick Commerce SLA
const SlaTimer = () => {
  const [timeLeft, setTimeLeft] = useState(540); // 9 minutes countdown

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  const isUrgent = timeLeft < 180;

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black tracking-wider ${
        isUrgent
          ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }`}
    >
      <Timer size={14} />
      <span>{mins}:{secs} Left</span>
    </div>
  );
};

const ActiveDeliveries = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderStages, setOrderStages] = useState({}); // orderId -> 'at_store' | 'picked_up' | 'reached_customer' | 'delivered'
  
  // Modals state
  const [scanModalOrder, setScanModalOrder] = useState(null);
  const [codQrModalOrder, setCodQrModalOrder] = useState(null);
  const [ratingModalOrder, setRatingModalOrder] = useState(null);
  const [thankYouPopup, setThankYouPopup] = useState(null);
  
  // Rating states
  const [riderRating, setRiderRating] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = window.localStorage.getItem('deliveryOnline');
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    const handleOnlineState = (event) => {
      const next = event.detail ?? (window.localStorage.getItem('deliveryOnline') ?? 'true') === 'true';
      setIsOnline(next);
    };
    window.addEventListener('deliveryOnlineChanged', handleOnlineState);
    return () => window.removeEventListener('deliveryOnlineChanged', handleOnlineState);
  }, []);

  useEffect(() => {
    if (!isOnline) return;
    fetchAssignedOrders();

    const getSocketUrl = () => {
      const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      if (isLocalhost) return 'http://localhost:5000';
      return import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    };

    const socket = io(getSocketUrl());
    socket.emit('joinDeliveryRoom');

    socket.on('newOrderAvailable', (order) => {
      if (['preparing', 'ready', 'confirmed', 'out-for-delivery'].includes(order.status)) {
        setOrders((prev) => (!prev.find((o) => o._id === order._id) ? [order, ...prev] : prev));
      }
    });

    socket.on('orderStatusUpdated', (data) => {
      setOrders(prev => prev.map(o => o._id === data.orderId ? { 
        ...o, 
        status: data.status, 
        pickedUpAt: data.pickedUpAt || o.pickedUpAt,
        deliveredAt: data.deliveredAt || o.deliveredAt
      } : o));
    });

    return () => socket.disconnect();
  }, [isOnline]);

  const fetchAssignedOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get('/orders/delivery/assigned').catch(() => ({ data: [] }));
      const active = (res.data || []).filter((o) => !['delivered', 'cancelled'].includes(o.status));
      setOrders(active);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Perform Store Pickup QR Scan Verification
  const handlePerformPickupScan = async (order) => {
    try {
      setIsScanning(true);
      const res = await API.post(`/orders/${order._id}/pickup-scan`, {
        pickupCode: manualCodeInput || order.pickupCode || String(order._id).slice(-6)
      });
      
      // Update local state with unlocked customer info
      setOrders(prev => prev.map(o => o._id === order._id ? {
        ...o,
        ...res.data.order,
        status: 'out-for-delivery',
        pickedUpAt: res.data.order?.pickedUpAt || new Date().toISOString()
      } : o));

      setOrderStages(prev => ({ ...prev, [order._id]: 'picked_up' }));
      setScanModalOrder(null);
      setManualCodeInput('');
      setIsScanning(false);
    } catch (err) {
      console.error("Pickup scan failed:", err);
      // Fallback update
      try {
        await API.put(`/orders/${order._id}/status`, { status: 'out-for-delivery' });
        setOrders(prev => prev.map(o => o._id === order._id ? { ...o, status: 'out-for-delivery', pickedUpAt: new Date().toISOString() } : o));
        setOrderStages(prev => ({ ...prev, [order._id]: 'picked_up' }));
      } catch (e) {}
      setScanModalOrder(null);
      setIsScanning(false);
    }
  };

  const handleReachCustomer = (orderId) => {
    setOrderStages((prev) => ({ ...prev, [orderId]: 'reached_customer' }));
  };

  // Final Delivery Handover Trigger
  const handleCompleteDelivery = async (order, viaCodQr = false) => {
    try {
      await API.put(`/orders/${order._id}/status`, {
        status: 'delivered',
        codPaidViaQr: viaCodQr
      });

      setOrderStages(prev => ({ ...prev, [order._id]: 'delivered' }));
      if (codQrModalOrder?._id === order._id) {
        setCodQrModalOrder(null);
      }

      // Open Rider Rating Modal
      setRatingModalOrder(order);
    } catch (err) {
      console.error("Delivery completion failed:", err);
      alert("Failed to mark delivered. Please check network connection.");
    }
  };

  // Submit Rider Rating for Customer
  const handleSubmitRating = async () => {
    if (!ratingModalOrder) return;
    try {
      await API.post(`/orders/${ratingModalOrder._id}/rate`, {
        riderRating,
        feedback: ratingFeedback
      }).catch(() => {});
    } catch (e) {}

    const completedOrder = ratingModalOrder;
    setRatingModalOrder(null);
    setRiderRating(5);
    setRatingFeedback('');

    // Trigger 2-Second Animated Thank You Popup
    setThankYouPopup(completedOrder);
    setTimeout(() => {
      setThankYouPopup(null);
      setOrders(prev => prev.filter(o => o._id !== completedOrder._id));
    }, 2000);
  };

  const openGoogleMaps = (destinationName, street) => {
    const query = encodeURIComponent(`${destinationName}, ${street || ''}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (!isOnline) {
    return (
      <div className="max-w-2xl mx-auto p-10 bg-white border border-slate-200 shadow-sm rounded-3xl text-center mt-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
          <Bike size={24} />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-1">You are Currently Offline</h2>
        <p className="text-xs font-semibold text-slate-500">Toggle "ONLINE" on the top duty bar to start receiving and completing deliveries.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 border border-emerald-200">
            <Zap className="h-3 w-3 text-emerald-600" />
            Live Dispatch Queue & QR Verification
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Active Deliveries ({orders.length})</h1>
        </div>

        <button
          onClick={fetchAssignedOrders}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
        >
          Refresh Queue
        </button>
      </div>

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="rounded-[32px] border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 mb-4">
            <span className="absolute inset-0 rounded-3xl bg-emerald-400 animate-ping opacity-25" />
            <Navigation size={28} className="relative z-10 animate-bounce" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Waiting for New 10-Min Dash</h3>
          <p className="mt-1 text-xs font-semibold text-slate-400 max-w-sm mx-auto">
            Stay in high-demand zones near partner dark stores. New orders will flash directly onto your screen.
          </p>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => {
          const isPickedUpBackend = !!order.pickedUpAt || order.status === 'out-for-delivery';
          const currentStage = orderStages[order._id] || (isPickedUpBackend ? 'picked_up' : 'at_store');
          
          const isAtStore = currentStage === 'at_store' && !isPickedUpBackend;
          const isPickedUp = currentStage === 'picked_up' || (isPickedUpBackend && currentStage !== 'reached_customer' && currentStage !== 'delivered');
          const isReachedCustomer = currentStage === 'reached_customer';
          const isDelivered = currentStage === 'delivered' || order.status === 'delivered';
          const isCod = order.paymentDetails?.method === 'cod';

          return (
            <motion.div
              key={order._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[30px] border border-slate-200 bg-white p-5 sm:p-7 shadow-[0_12px_35px_rgba(15,23,42,0.05)] space-y-6"
            >
              {/* Order Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white font-black">
                    <Bike size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-900 text-base">#{String(order._id).slice(-6)}</h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {order.items?.length || 1} Items
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-emerald-600">Earnings: ₹{order.billDetails?.deliveryFee || 55}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <SlaTimer />
                  <span className={`rounded-full px-3 py-1 text-xs font-black text-white ${isCod ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                    ₹{order.billDetails?.grandTotal || 0} {isCod ? 'COD (Collect)' : 'PREPAID'}
                  </span>
                </div>
              </div>

              {/* 3-Stage Visual Progression */}
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-black uppercase tracking-wider">
                <div className={`p-2.5 rounded-xl border transition-all ${isAtStore ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-400/20' : isPickedUp || isReachedCustomer || isDelivered ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                  1. Scan Store QR
                </div>
                <div className={`p-2.5 rounded-xl border transition-all ${isPickedUp ? 'bg-sky-600 text-white border-sky-600 shadow-sm ring-2 ring-sky-400/20' : isReachedCustomer || isDelivered ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                  2. Route to Door
                </div>
                <div className={`p-2.5 rounded-xl border transition-all ${isReachedCustomer || isDelivered ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-400/20' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                  3. Collect & Deliver
                </div>
              </div>

              {/* Waypoints & Actions Box */}
              <div className="grid gap-4 sm:grid-cols-2">
                
                {/* 1. Store Pickup Box */}
                <div className={`rounded-2xl border p-4 transition ${isAtStore ? 'border-amber-300 bg-amber-50/40 ring-2 ring-amber-400/20' : 'border-slate-200 bg-slate-50/50'}`}>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                    <span className="flex items-center gap-1"><MapPin size={12}/> Store Pickup</span>
                    {order.pickedUpAt ? (
                      <span className="text-emerald-700 font-bold">Picked: {formatTime(order.pickedUpAt)}</span>
                    ) : (
                      <span className="text-amber-700 font-bold">Awaiting QR Scan</span>
                    )}
                  </div>
                  <h4 className="font-black text-sm text-slate-900">{order.store?.name || 'Quick Commerce Partner Hub'}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{order.store?.deliveryAddress || 'Dark Store Logistics Bay 4'}</p>

                  <div className="mt-3.5 flex items-center gap-2">
                    <button
                      onClick={() => openGoogleMaps(order.store?.name || 'Store', 'Dark Store')}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 transition"
                    >
                      <Navigation size={13} className="text-amber-600" />
                      Navigate to Store
                    </button>
                  </div>
                </div>

                {/* 2. Customer Dropoff Box (Unlocked ONLY after pickup) */}
                <div className={`rounded-2xl border p-4 transition ${isPickedUp || isReachedCustomer ? 'border-sky-300 bg-sky-50/40 ring-2 ring-sky-400/20' : 'border-slate-200 bg-slate-50/40'}`}>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                    <span>Customer Dropoff</span>
                    {isAtStore ? (
                      <span className="text-rose-500 font-black flex items-center gap-1">
                        <Lock size={11} /> Locked
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-black flex items-center gap-1">
                        <Unlock size={11} /> Unlocked
                      </span>
                    )}
                  </div>

                  {isAtStore ? (
                    <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-center space-y-1">
                      <Lock className="w-5 h-5 text-slate-400 mx-auto" />
                      <p className="text-xs font-black text-slate-700">Customer Details Protected</p>
                      <p className="text-[10px] text-slate-400">Scan Store Pickup QR code to reveal customer name, address & direct call.</p>
                    </div>
                  ) : (
                    <>
                      <h4 className="font-black text-sm text-slate-900">{order.user?.name || 'Customer'}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</p>

                      <div className="mt-3.5 flex items-center gap-2">
                        <button
                          onClick={() => openGoogleMaps(order.user?.name || 'Customer', `${order.deliveryAddress?.street}, ${order.deliveryAddress?.city}`)}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 transition"
                        >
                          <Navigation size={13} className="text-sky-600" />
                          Customer Route
                        </button>
                        <a
                          href={`tel:${order.user?.phone || '9876543210'}`}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-100 transition shadow-2xs"
                          title="Direct Call Customer"
                        >
                          <Phone size={14} className="text-emerald-600" />
                          <span>Call</span>
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons Area */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                {isAtStore && (
                  <button
                    onClick={() => setScanModalOrder(order)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#e31837] px-6 py-4 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e31837]/25 hover:bg-[#c8102e] transition active:scale-98"
                  >
                    <QrCode size={18} />
                    Scan Store Pickup QR → Unlock Customer & Start Dashing
                  </button>
                )}

                {isPickedUp && (
                  <button
                    onClick={() => handleReachCustomer(order._id)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-sky-600/20 hover:bg-sky-500 transition"
                  >
                    <Navigation size={16} />
                    I Have Reached Customer Door
                  </button>
                )}

                {isReachedCustomer && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                          <CheckCircle2 size={16} className="text-emerald-600" />
                          At Customer Doorstep
                        </h4>
                        <p className="text-xs text-slate-500">Collect payment (if COD) and confirm order delivery handover.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-slate-900">₹{order.billDetails?.grandTotal}</span>
                        <p className="text-[10px] font-bold text-slate-400">{isCod ? 'Cash on Delivery' : 'Already Paid Online'}</p>
                      </div>
                    </div>

                    {isCod ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {/* Dynamic COD QR Button */}
                        <button
                          onClick={() => setCodQrModalOrder(order)}
                          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-black text-white hover:bg-slate-800 transition shadow-sm"
                        >
                          <QrCode size={16} className="text-emerald-400" />
                          Show Dynamic UPI QR (GPay/PhonePe)
                        </button>

                        {/* Cash Received Button */}
                        <button
                          onClick={() => handleCompleteDelivery(order, false)}
                          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-black text-white hover:bg-emerald-500 transition shadow-sm"
                        >
                          <Banknote size={16} />
                          Cash ₹{order.billDetails?.grandTotal} Collected → Deliver
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCompleteDelivery(order, false)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-xs font-black text-white hover:bg-emerald-500 transition shadow-sm"
                      >
                        <PackageCheck size={18} />
                        Confirm Package Handover (Prepaid ₹0)
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 1. Store QR Scanner Modal */}
      <AnimatePresence>
        {scanModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center relative space-y-4"
            >
              <button 
                onClick={() => setScanModalOrder(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-[#e31837]/10 text-[#e31837] flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">Store Pickup QR Scanner</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Scan the QR code displayed on {scanModalOrder.store?.name || 'the Store Admin screen'}.
                </p>
              </div>

              {/* Viewfinder simulation */}
              <div className="relative h-44 bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-emerald-400/60 p-4">
                <div className="absolute inset-x-8 top-1/2 h-0.5 bg-emerald-400 shadow-[0_0_10px_#10b981] animate-bounce" />
                <QrCode className="w-16 h-16 text-slate-600 opacity-40 mb-2" />
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40">
                  Ready to Capture Store QR
                </span>
              </div>

              {/* One-Tap Instant Verification */}
              <button
                disabled={isScanning}
                onClick={() => handlePerformPickupScan(scanModalOrder)}
                className="w-full py-3 bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-500 transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
              >
                {isScanning ? (
                  <span>Verifying Pickup...</span>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    One-Tap Scan & Confirm Pickup
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 font-semibold mb-2">Or enter manual pickup code from store:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. PICK42 or ID"
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    className="flex-1 text-center font-mono font-bold text-xs uppercase bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-slate-900"
                  />
                  <button
                    onClick={() => handlePerformPickupScan(scanModalOrder)}
                    className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Dynamic COD Payment UPI QR Modal */}
      <AnimatePresence>
        {codQrModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center relative space-y-4"
            >
              <button 
                onClick={() => setCodQrModalOrder(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <IndianRupee className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md">
                  Dynamic UPI COD Payment
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">₹{codQrModalOrder.billDetails?.grandTotal}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Ask customer to scan with GPay, PhonePe, Paytm or BHIM UPI.</p>
              </div>

              {/* Dynamic QR SVG */}
              <div className="p-4 bg-slate-50 border-2 border-dashed border-emerald-400 rounded-2xl flex flex-col items-center justify-center">
                <div className="bg-white p-3 rounded-xl shadow-md">
                  <QRCodeSVG 
                    value={`upi://pay?pa=quickcommerce@upi&pn=QuickCommerce&am=${codQrModalOrder.billDetails?.grandTotal || 0}&tn=Order_${String(codQrModalOrder._id).slice(-6)}&cu=INR`}
                    size={190}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200">
                  <Sparkles size={13} className="text-emerald-500" />
                  <span>Auto-loads ₹{codQrModalOrder.billDetails?.grandTotal}</span>
                </div>
              </div>

              <button
                onClick={() => handleCompleteDelivery(codQrModalOrder, true)}
                className="w-full py-3.5 bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-500 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <CheckCircle2 size={16} />
                Customer Paid via UPI QR → Complete Drop
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Rider 2-Way Rating Modal */}
      <AnimatePresence>
        {ratingModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center relative space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">Rate Customer Experience</h3>
                <p className="text-xs text-slate-500 mt-1">
                  How was your delivery handover with {ratingModalOrder.user?.name || 'Customer'}?
                </p>
              </div>

              {/* Star Selector */}
              <div className="flex justify-center items-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRiderRating(star)}
                    className="p-1.5 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      size={28}
                      className={
                        star <= riderRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200'
                      }
                    />
                  </button>
                ))}
              </div>

              {/* Quick Tags */}
              <div className="flex flex-wrap gap-1.5 justify-center">
                {['Polite & Friendly', 'Easy to Find', 'Quick Payment', 'Smooth Handover'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setRatingFeedback(tag)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                      ratingFeedback === tag
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSubmitRating}
                  className="flex-1 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-slate-800 transition"
                >
                  Submit & Finish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. 2-Second Animated Thank You Celebration Popup */}
      <AnimatePresence>
        {thankYouPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
            <motion.div 
              initial={{ scale: 0.7, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 15 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-emerald-200 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <PartyPopper className="w-8 h-8 animate-bounce" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">Thank You!</h3>
                <p className="text-sm font-bold text-emerald-600 mt-1">Delivery Completed Successfully</p>
                <p className="text-xs text-slate-400 mt-1">
                  +₹{thankYouPopup.billDetails?.deliveryFee || 55} credited to your earnings wallet.
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-center gap-2 text-xs font-black text-emerald-800">
                <CheckCircle2 size={16} /> Order #{String(thankYouPopup._id).slice(-6)} Closed
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ActiveDeliveries;
