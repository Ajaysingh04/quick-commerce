import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import API from '../../services/api.js';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Bike, IndianRupee, Star, TrendingUp, TrendingDown, Clock, Shield, Award, ChevronRight, X, Zap, MapPin, Navigation, ArrowRight, Activity, Map, Navigation2 } from 'lucide-react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';

const SlideToAccept = ({ onAccept, onDecline }) => {
  const x = useMotionValue(0);
  const background = useTransform(x, [0, 200], ['#f1f5f9', '#10b981']);
  const textColor = useTransform(x, [0, 200], ['#94a3b8', '#ffffff']);
  
  const handleDragEnd = (e, info) => {
    if (info.offset.x > 180) {
      onAccept();
    }
  };

  return (
    <div className="flex gap-3 items-center">
      <button 
        onClick={onDecline}
        className="w-16 h-16 shrink-0 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
      >
        <X size={24} />
      </button>

      <motion.div 
        style={{ background }}
        className="flex-1 h-16 rounded-2xl relative overflow-hidden flex items-center border border-slate-200"
      >
        <motion.div style={{ color: textColor }} className="absolute inset-0 flex items-center justify-center font-black text-sm uppercase tracking-widest z-0">
          Slide to Accept
        </motion.div>
        
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 200 }}
          dragSnapToOrigin={true}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className="w-14 h-14 bg-white rounded-xl shadow-md flex items-center justify-center absolute left-1 cursor-grab active:cursor-grabbing z-10"
        >
          <ArrowRight className="text-emerald-500" />
        </motion.div>
      </motion.div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [showTierModal, setShowTierModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [hideKycAlert, setHideKycAlert] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  
  const [incomingOrder, setIncomingOrder] = useState(null);
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
    shadowSize: [41, 41]
  });

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    const handleOnlineState = (event) => {
      const next = event.detail ?? (window.localStorage.getItem('deliveryOnline') ?? 'true') === 'true';
      setIsOnline(next);
    };
    window.addEventListener('deliveryOnlineChanged', handleOnlineState);
    return () => window.removeEventListener('deliveryOnlineChanged', handleOnlineState);
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  useEffect(() => {
    if (user?.kyc?.status !== 'approved' || !isOnline) return;

    const getSocketUrl = () => {
      return import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    };

    const socket = io(getSocketUrl());
    socket.emit('joinDeliveryRoom');

    socket.on('newOrderAvailable', (order) => {
      setIncomingOrder(order);
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      } catch (e) {}

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New 10-Min Dash!', {
          body: `Drop-off at ${order.deliveryAddress?.street}. Earn ₹${order.deliveryFee || 45}`,
          icon: '/logo.png'
        });
      }
    });

    return () => {
      socket.emit('leaveDeliveryRoom');
      socket.disconnect();
    };
  }, [user, isOnline]);

  const handleAcceptOrder = async () => {
    if (!incomingOrder) return;
    try {
      await API.put(`/orders/${incomingOrder._id}/status`, { status: 'confirmed' });
      setIncomingOrder(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept order. It may have been claimed by someone else.');
      setIncomingOrder(null);
    }
  };

  const getPickupDistance = (order) => Number(order?.store?.distance || 1.2).toFixed(1);
  const getDeliveryDistance = (order) => Math.max(0.8, Number(order?.store?.distance || 1.2) + 0.8).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Incoming Order Quick Commerce Popup */}
      <AnimatePresence>
        {incomingOrder && isOnline && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md rounded-[2.5rem] bg-white shadow-2xl overflow-hidden border-4 border-emerald-500/20"
            >
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-500/40 rounded-full blur-3xl"
                />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.5)] border-4 border-white/10 animate-bounce">
                    <Zap size={36} className="text-white fill-white" />
                  </div>
                  <h3 className="text-4xl font-black mb-1 text-emerald-400">₹{incomingOrder?.deliveryFee || 45}</h3>
                  <p className="text-xs uppercase tracking-[0.3em] font-bold text-slate-300">New 10-Min Delivery</p>
                </div>
              </div>

              <div className="p-6 space-y-3 bg-white">
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#e31837]">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pickup</p>
                    <p className="font-bold text-slate-900 text-sm line-clamp-1">{incomingOrder?.store?.name || 'Dark Store #4'}</p>
                    <p className="text-xs font-semibold text-slate-500">{getPickupDistance(incomingOrder)} km • 2 mins away</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-emerald-500">
                    <Navigation size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dropoff</p>
                    <p className="font-bold text-ltr text-sm line-clamp-1">{incomingOrder?.deliveryAddress?.street || 'Customer Location'}</p>
                    <p className="text-xs font-semibold text-slate-500">{getDeliveryDistance(incomingOrder)} km • 6 mins trip</p>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-2 bg-white">
                <SlideToAccept 
                  onAccept={handleAcceptOrder} 
                  onDecline={() => setIncomingOrder(null)} 
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Banner */}
      {!hideKycAlert && (!user?.kyc?.status || user?.kyc?.status === 'pending' || user?.kyc?.status === 'rejected') ? (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-rose-700 relative overflow-hidden shadow-sm mb-6">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-black mb-1 flex items-center gap-2">
                <Shield className="w-5 h-5 text-rose-500" /> 
                {user?.kyc?.status === 'rejected' ? 'KYC Rejected - Please Reupload' : 'KYC Verification Required'}
              </h1>
              <p className="text-xs font-medium">
                Please upload your mandatory KYC documents in the Settings &gt; Vehicle &amp; Docs section to start accepting deliveries.
              </p>
            </div>
            <button 
              onClick={() => setHideKycAlert(true)}
              className="p-2 rounded-full hover:bg-rose-100 text-rose-500 transition-colors shrink-0"
              title="Dismiss"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl mb-8 group">
          <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-[#10b981]/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute left-0 bottom-0 w-64 h-64 bg-gradient-to-tr from-[#0284c7]/20 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-emerald-400 font-black tracking-[0.2em] uppercase text-xs mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span> Quick Commerce Mode
              </p>
              <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">Ready to dash, <br className="sm:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-emerald-500">{user?.name || 'Rider'}?</span></h1>
              <p className="text-slate-400 text-lg font-medium">
                You're currently <span className={`font-bold px-2 py-0.5 rounded-md border ${isOnline ? 'text-white bg-white/10 border-white/20' : 'text-slate-900 bg-slate-300 border-slate-400'}`}>
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </span> {isOnline ? 'and in a high demand zone.' : ' - go online to receive orders.'}
              </p>
            </div>
            <div className="hidden md:flex flex-col items-center justify-center gap-3 w-32 h-32 bg-white/5 rounded-3xl backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(16,185,129,0.2)] p-2">
              <Zap size={40} className="text-emerald-400 fill-emerald-400 transform group-hover:scale-110 transition-transform duration-500" />
              {notificationPermission === 'default' && (
                <button 
                  onClick={requestNotificationPermission}
                  className="text-[10px] font-bold bg-white text-slate-900 px-3 py-1.5 rounded-full hover:bg-emerald-50 w-full text-center"
                >
                  Enable Alerts
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Commerce Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Today's Earnings", value: '₹840', icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', trend: '+15%' },
          { label: 'On-Time Rate', value: '98%', icon: Clock, color: 'text-[#0284c7]', bg: 'bg-sky-50', border: 'border-sky-100', trend: 'Excellent' },
          { label: 'Deliveries Done', value: '14', icon: Zap, color: 'text-[#e31837]', bg: 'bg-rose-50', border: 'border-rose-100', trend: null },
          { label: 'Avg Time/Order', value: '9.2m', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', trend: '-0.5m fast' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: "spring" }}
            className="bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-[2rem] p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} ${stat.border} border group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={24} />
              </div>
              {stat.trend && <span className="text-xs font-bold text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200"><TrendingUp size={14} className={stat.color} /> {stat.trend}</span>}
            </div>
            <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
            <div className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Demand Hotzones */}
        <div className="col-span-1 lg:col-span-2 bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-8 overflow-hidden relative">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Map className="text-emerald-500" /> Live Demand Zones
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Move to hot zones for 1.5x surge pay</p>
            </div>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div className="relative h-64 w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
            <MapContainer 
              center={[28.6139, 77.2090]} 
              zoom={11} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              
              <Marker position={[28.6139, 77.2090]} icon={defaultIcon}>
                <Popup>Your Location</Popup>
              </Marker>

              <Circle center={[28.6448, 77.2167]} radius={2000} pathOptions={{ color: '#e31837', fillColor: '#e31837', fillOpacity: 0.3 }} />
              <Circle center={[28.5355, 77.2410]} radius={2500} pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.2 }} />
            </MapContainer>
            
            <div className="absolute inset-0 border-[4px] border-white/10 rounded-[1rem] pointer-events-none z-[400]"></div>

            <div className="absolute bottom-4 left-4 right-4 flex gap-3 z-[400] pointer-events-none">
              <div className="flex-1 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-2xl shadow-xl pointer-events-auto">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-[#c8102e] animate-pulse"></div>
                  <span className="text-xs font-bold text-white">Connaught Place</span>
                </div>
                <div className="text-[10px] text-slate-400 font-bold">Surge: 1.5x • 12 mins away</div>
              </div>
              <div className="flex-1 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-2xl shadow-xl pointer-events-auto">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-xs font-bold text-white">South Extension</span>
                </div>
                <div className="text-[10px] text-slate-400 font-bold">Surge: 1.2x • 25 mins away</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent */}
        <div className="col-span-1 space-y-8">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl border border-white/30">
                <Award size={32} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-white/80 mb-1">Weekly Target</p>
                <h2 className="text-2xl font-black">₹500 Bonus</h2>
              </div>
            </div>
            <div className="space-y-3 mb-6 relative z-10">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-white">45/60 Deliveries</span>
              </div>
              <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                <div className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] relative w-3/4"></div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-8">
            <h2 className="text-lg font-black text-slate-900 mb-4">Latest Drops</h2>
            <div className="space-y-4">
              {[
                { id: '10M-842', time: '8m 20s', amt: 45 },
                { id: '10M-911', time: '9m 45s', amt: 50 },
              ].map((d, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Zap size={14} className="fill-current" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">#{d.id}</p>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase">Delivered in {d.time}</p>
                    </div>
                  </div>
                  <div className="font-black text-slate-900">+₹{d.amt}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
