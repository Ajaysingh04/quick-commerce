import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import API from '../../services/api.js';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Bike,
  IndianRupee,
  Star,
  TrendingUp,
  Clock,
  Shield,
  Award,
  ChevronRight,
  X,
  Zap,
  MapPin,
  Navigation,
  ArrowRight,
  Activity,
  Map,
  Wallet,
  PhoneCall,
  CheckCircle2,
  Flame,
  Percent,
  Compass,
  QrCode,
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import RiderQrScannerModal from '../../components/delivery/RiderQrScannerModal.jsx';

const SlideToAccept = ({ onAccept, onDecline }) => {
  const x = useMotionValue(0);
  const background = useTransform(x, [0, 200], ['#f1f5f9', '#10b981']);
  const textColor = useTransform(x, [0, 200], ['#94a3b8', '#ffffff']);

  const handleDragEnd = (e, info) => {
    if (info.offset.x > 170) {
      onAccept();
    }
  };

  return (
    <div className="flex gap-3 items-center">
      <button
        onClick={onDecline}
        className="w-14 h-14 shrink-0 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 hover:bg-rose-100 transition-colors shadow-xs"
        title="Decline Order"
      >
        <X size={20} />
      </button>

      <motion.div
        style={{ background }}
        className="flex-1 h-14 rounded-2xl relative overflow-hidden flex items-center border border-slate-200 shadow-inner"
      >
        <motion.div
          style={{ color: textColor }}
          className="absolute inset-0 flex items-center justify-center font-black text-xs uppercase tracking-widest z-0"
        >
          Slide to Accept Order →
        </motion.div>

        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 190 }}
          dragSnapToOrigin={true}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center absolute left-1 cursor-grab active:cursor-grabbing z-10 border border-slate-100"
        >
          <ArrowRight className="text-emerald-600 h-5 w-5" />
        </motion.div>
      </motion.div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [incomingOrder, setIncomingOrder] = useState(null);
  const [showDashboardQrScanner, setShowDashboardQrScanner] = useState(false);
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = window.localStorage.getItem('deliveryOnline');
    return saved === null ? true : saved === 'true';
  });

  const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
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

    const getSocketUrl = () => {
      const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      if (isLocalhost) return 'http://localhost:5000';
      return import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    };

    const socket = io(getSocketUrl());
    socket.emit('joinDeliveryRoom');

    socket.on('newOrderAvailable', (order) => {
      setIncomingOrder(order);
    });

    return () => {
      socket.emit('leaveDeliveryRoom');
      socket.disconnect();
    };
  }, [isOnline]);

  const handleAcceptOrder = async () => {
    if (!incomingOrder) return;
    try {
      await API.put(`/orders/${incomingOrder._id}/status`, { status: 'confirmed' });
      setIncomingOrder(null);
      alert('Order accepted! Head over to Active Orders to start navigation.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept order.');
      setIncomingOrder(null);
    }
  };

  const getPickupDistance = (order) => Number(order?.store?.distance || 1.1).toFixed(1);
  const getDeliveryDistance = (order) => Math.max(0.7, Number(order?.store?.distance || 1.1) + 0.9).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-12">
      
      {/* Incoming Order Flash Modal */}
      <AnimatePresence>
        {incomingOrder && isOnline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              className="w-full max-w-md rounded-[32px] bg-white shadow-2xl overflow-hidden border-2 border-emerald-400/30"
            >
              {/* Header Box */}
              <div className="bg-[#0B132B] p-6 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300 border border-emerald-400/30 mb-2">
                    <Flame className="h-3.5 w-3.5 text-emerald-400 animate-bounce" />
                    New 10-Min Trip Available
                  </div>
                  <div className="text-4xl font-black text-emerald-400 tracking-tight">₹{incomingOrder?.deliveryFee || 55}</div>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">Estimated payout for this delivery</p>
                </div>
              </div>

              {/* Waypoints */}
              <div className="p-5 space-y-3 bg-white">
                <div className="flex items-center gap-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 shrink-0 font-black">
                    <MapPin size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pickup Store</p>
                    <p className="font-bold text-slate-900 text-sm truncate">{incomingOrder?.store?.name || 'Quick Dark Store #04'}</p>
                    <p className="text-xs font-semibold text-emerald-600">{getPickupDistance(incomingOrder)} km away</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-700 shrink-0 font-black">
                    <Navigation size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Customer Drop</p>
                    <p className="font-bold text-slate-900 text-sm truncate">{incomingOrder?.deliveryAddress?.street || 'Connaught Place, Block B'}</p>
                    <p className="text-xs font-semibold text-sky-600">{getDeliveryDistance(incomingOrder)} km trip</p>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 bg-white">
                <SlideToAccept
                  onAccept={handleAcceptOrder}
                  onDecline={() => setIncomingOrder(null)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Incentive Progress Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-slate-800 bg-gradient-to-br from-[#0B132B] via-[#111C3D] to-[#0A0F1D] p-6 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300 backdrop-blur-md mb-3">
              <Award className="h-3.5 w-3.5 text-emerald-400" />
              Daily Incentive Milestone
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Complete 4 more trips for <span className="text-emerald-400">+₹250 Bonus</span>
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-300">
              Shift Active • High demand in your current zone with 1.2x surge multiplier
            </p>
          </div>

          {/* Progress Bar Meter */}
          <div className="w-full lg:w-72 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
            <div className="flex justify-between items-center text-xs font-black mb-2">
              <span className="text-slate-300">Today's Target</span>
              <span className="text-emerald-400 font-bold">8 / 12 Trips</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '66%' }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]"
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-400">
              <span>Tier 1 (₹100) ✓</span>
              <span className="text-emerald-300">Tier 2 (₹250) Pending</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Rider Quick Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <button
          type="button"
          onClick={() => setShowDashboardQrScanner(true)}
          className="flex items-center justify-between p-4 rounded-[24px] bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10 transition active:scale-98 group border border-slate-800"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black group-hover:scale-105 transition">
              <QrCode size={24} />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Fast Pickup</span>
              <h3 className="text-sm sm:text-base font-black text-white">Scan Store Pickup QR</h3>
              <p className="text-[11px] text-slate-400">Camera / PIN pickup verification</p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
            <ArrowRight size={16} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => window.location.href = '/delivery/active'}
          className="flex items-center justify-between p-4 rounded-[24px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 transition active:scale-98 group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center font-black group-hover:scale-105 transition">
              <Bike size={24} />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">Active Fleet</span>
              <h3 className="text-sm sm:text-base font-black text-white">Active Deliveries</h3>
              <p className="text-[11px] text-emerald-100">Live navigation & door dropoff</p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
            <ArrowRight size={16} />
          </div>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Today's Earnings", value: '₹1,240', icon: IndianRupee, change: '+18% vs avg', color: 'from-emerald-500 to-teal-600' },
          { label: 'Completed Trips', value: '8', icon: Zap, change: 'Avg 9.4 mins', color: 'from-sky-500 to-blue-600' },
          { label: 'Cash in Hand (COD)', value: '₹680', icon: Wallet, change: 'Max Limit ₹3,000', color: 'from-amber-500 to-orange-600' },
          { label: 'Rider Rating', value: '4.9 ★', icon: Star, change: 'Top 5% Fleet', color: 'from-violet-500 to-purple-600' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              whileHover={{ y: -3 }}
              className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_25px_rgba(15,23,42,0.03)]"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr ${item.color} text-white shadow-sm font-black`}>
                  <Icon size={18} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                  {item.change}
                </span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-slate-900 tracking-tight">{item.value}</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Demand Hotzones Map & Surge Radar */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
        
        {/* Map Box */}
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_25px_rgba(15,23,42,0.03)] sm:p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Surge Heatmap</p>
              <h2 className="text-lg font-black text-slate-900">Live Demand Hubs Nearby</h2>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Live Radar
            </div>
          </div>

          <div className="relative h-64 w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
            <MapContainer
              center={[28.6139, 77.209]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <Marker position={[28.6139, 77.209]} icon={defaultIcon}>
                <Popup>Your Current Location</Popup>
              </Marker>
              <Circle center={[28.6348, 77.2167]} radius={1800} pathOptions={{ color: '#10B981', fillColor: '#10B981', fillOpacity: 0.35 }} />
              <Circle center={[28.5355, 77.241]} radius={2200} pathOptions={{ color: '#F59E0B', fillColor: '#F59E0B', fillOpacity: 0.25 }} />
            </MapContainer>

            {/* Floating Zone Badges */}
            <div className="absolute bottom-3 left-3 right-3 flex gap-2.5 z-[400]">
              <div className="flex-1 bg-slate-900/90 backdrop-blur-md border border-white/10 p-2.5 rounded-xl text-white">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Connaught Hub (1.3x Surge)
                </div>
                <div className="text-[10px] text-slate-400 font-semibold">+₹25 bonus per drop</div>
              </div>
              <div className="flex-1 bg-slate-900/90 backdrop-blur-md border border-white/10 p-2.5 rounded-xl text-white">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  South Ex Hub (1.1x Surge)
                </div>
                <div className="text-[10px] text-slate-400 font-semibold">+₹15 bonus per drop</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Completed Deliveries */}
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_25px_rgba(15,23,42,0.03)] sm:p-6 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Shift Log</p>
            <h2 className="text-lg font-black text-slate-900">Latest Completed Drops</h2>
          </div>

          <div className="space-y-3 my-4">
            {[
              { id: 'ORD-9821', time: '8 mins ago', fee: '₹65', duration: '9m 10s', tip: '₹20' },
              { id: 'ORD-9742', time: '35 mins ago', fee: '₹55', duration: '8m 45s', tip: '₹0' },
              { id: 'ORD-9650', time: '1 hr ago', fee: '₹70', duration: '11m 20s', tip: '₹30' },
            ].map((drop) => (
              <div key={drop.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">#{drop.id}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">{drop.duration} • Tip: {drop.tip}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-600">+{drop.fee}</div>
                  <div className="text-[9px] font-bold text-slate-400">{drop.time}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => window.location.href = '/delivery/history'}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition text-center"
          >
            View Complete Trip History →
          </button>
        </div>
      </div>

      {/* Global Rider QR Scanner Modal */}
      <RiderQrScannerModal
        isOpen={showDashboardQrScanner}
        onClose={() => setShowDashboardQrScanner(false)}
        onScanSuccess={() => {
          window.location.href = '/delivery/active';
        }}
      />

    </div>
  );
};

export default Dashboard;
