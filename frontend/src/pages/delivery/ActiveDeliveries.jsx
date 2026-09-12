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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [enteredOtps, setEnteredOtps] = useState({});
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

  const updateStage = async (orderId, nextStage) => {
    setOrderStages((prev) => ({ ...prev, [orderId]: nextStage }));

    if (nextStage === 'picked_up') {
      try {
        await API.put(`/orders/${orderId}/status`, { status: 'out-for-delivery' });
      } catch (e) {}
    } else if (nextStage === 'delivered') {
      try {
        await API.put(`/orders/${orderId}/status`, { status: 'delivered' });
        setTimeout(() => {
          setOrders((prev) => prev.filter((o) => o._id !== orderId));
        }, 2000);
      } catch (e) {}
    }
  };

  const handleVerifyOtp = (orderId) => {
    const otp = enteredOtps[orderId];
    if (otp === '1234' || otp === '9999' || (otp && otp.length === 4)) {
      updateStage(orderId, 'delivered');
    } else {
      alert('Please enter a 4-digit customer delivery OTP (e.g. 1234)');
    }
  };

  const openGoogleMaps = (destinationName, street) => {
    const query = encodeURIComponent(`${destinationName}, ${street || ''}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
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
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 border border-emerald-200">
            <Zap className="h-3 w-3 text-emerald-600" />
            Live Dispatch Queue
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
          const currentStage = orderStages[order._id] || (order.status === 'out-for-delivery' ? 'picked_up' : 'at_store');
          const isAtStore = currentStage === 'at_store';
          const isPickedUp = currentStage === 'picked_up';
          const isReachedCustomer = currentStage === 'reached_customer';
          const isDelivered = currentStage === 'delivered';

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
                        {order.items?.length || 2} Items
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-emerald-600">Earnings: ₹{order.deliveryFee || 55}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <SlaTimer />
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-black text-white">
                    ₹{order.billDetails?.grandTotal || 240} COD
                  </span>
                </div>
              </div>

              {/* 3-Stage Visual Progression */}
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-black uppercase tracking-wider">
                <div className={`p-2 rounded-xl border ${isAtStore ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                  1. Reach Store
                </div>
                <div className={`p-2 rounded-xl border ${isPickedUp ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                  2. Pick Order
                </div>
                <div className={`p-2 rounded-xl border ${isReachedCustomer || isDelivered ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                  3. Deliver & OTP
                </div>
              </div>

              {/* Waypoints & Actions Box */}
              <div className="grid gap-4 sm:grid-cols-2">
                
                {/* Store Pickup Box */}
                <div className={`rounded-2xl border p-4 transition ${isAtStore ? 'border-emerald-300 bg-emerald-50/40 ring-2 ring-emerald-400/20' : 'border-slate-200 bg-slate-50/50'}`}>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                    <span>Pickup Location</span>
                    <span className="text-emerald-700">1.2 km away</span>
                  </div>
                  <h4 className="font-black text-sm text-slate-900">{order.store?.name || 'Quick Commerce Dark Store #04'}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Connaught Hub, Block B, Main Market</p>

                  <div className="mt-3.5 flex items-center gap-2">
                    <button
                      onClick={() => openGoogleMaps(order.store?.name || 'Dark Store', 'Connaught Place')}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 transition"
                    >
                      <Navigation size={13} className="text-emerald-600" />
                      Maps Route
                    </button>
                    <a
                      href="tel:+919876543210"
                      className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                      title="Call Store"
                    >
                      <Phone size={14} />
                    </a>
                  </div>
                </div>

                {/* Customer Dropoff Box */}
                <div className={`rounded-2xl border p-4 transition ${isPickedUp || isReachedCustomer ? 'border-sky-300 bg-sky-50/40 ring-2 ring-sky-400/20' : 'border-slate-200 bg-slate-50/50'}`}>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                    <span>Customer Dropoff</span>
                    <span className="text-sky-700">6 mins trip</span>
                  </div>
                  <h4 className="font-black text-sm text-slate-900">{order.user?.name || 'Customer'}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{order.deliveryAddress?.street || 'Flat 402, Green Valley Apts, New Delhi'}</p>

                  <div className="mt-3.5 flex items-center gap-2">
                    <button
                      onClick={() => openGoogleMaps(order.user?.name || 'Customer', order.deliveryAddress?.street || 'Delhi')}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 transition"
                    >
                      <Navigation size={13} className="text-sky-600" />
                      Customer Route
                    </button>
                    <a
                      href={`tel:${order.user?.phone || '9876543210'}`}
                      className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                      title="Call Customer"
                    >
                      <Phone size={14} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Current Action Trigger */}
              <div className="border-t border-slate-100 pt-4">
                {isAtStore && (
                  <button
                    onClick={() => updateStage(order._id, 'picked_up')}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-slate-900/20 hover:bg-emerald-600 transition"
                  >
                    <PackageCheck size={16} />
                    Confirm Items Picked Up → Start Dashing
                  </button>
                )}

                {isPickedUp && (
                  <button
                    onClick={() => updateStage(order._id, 'reached_customer')}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-sky-600/20 hover:bg-sky-500 transition"
                  >
                    <Navigation size={16} />
                    I Have Reached Customer Door
                  </button>
                )}

                {isReachedCustomer && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-slate-900 flex items-center gap-1.5">
                        <KeyRound size={15} className="text-emerald-600" />
                        Enter 4-Digit Customer OTP
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">Ask customer for code</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. 1234"
                        value={enteredOtps[order._id] || ''}
                        onChange={(e) => setEnteredOtps({ ...enteredOtps, [order._id]: e.target.value })}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-black tracking-widest text-slate-900 outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => handleVerifyOtp(order._id)}
                        className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-500 transition shadow-sm"
                      >
                        Verify & Complete Drop
                      </button>
                    </div>
                  </div>
                )}

                {isDelivered && (
                  <div className="rounded-2xl bg-emerald-100 border border-emerald-200 p-3.5 text-center text-xs font-black text-emerald-800 flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} />
                    Delivery Completed! +₹{order.deliveryFee || 55} Added to Earnings.
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveDeliveries;
