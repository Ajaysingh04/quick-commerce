import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Bike, Phone, Play, Check, MapPin, Navigation, Map, Zap, Camera, ShieldAlert, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api.js';

// Timer Component for 10-Minute SLA
const SlaTimer = ({ createdAt }) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    // If we had a real createdAt, we'd calculate difference. Using mock 10m countdown for demo.
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        if (prev <= 180) setIsUrgent(true); // under 3 mins is urgent
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-black text-lg tracking-widest shadow-sm ${
      isUrgent ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
    }`}>
      <Timer size={20} className={isUrgent ? 'text-rose-500' : 'text-emerald-500'} />
      {mins}:{secs}
    </div>
  );
};

const DeliveryMiniMap = ({ progress, status }) => {
  const pathD = "M 40 120 Q 120 40, 200 120 T 360 120";
  let bikeX = 40 + (320 * progress / 100);
  let bikeY = 120 - Math.sin((progress / 100) * Math.PI) * 55;

  return (
    <div className="w-full h-56 bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden my-4 shadow-inner group">
      <svg className="w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </pattern>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        <path d={pathD} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round" />
        <path d={pathD} fill="none" stroke="url(#pathGradient)" strokeWidth="2" strokeDasharray="6 6" strokeLinecap="round" className="opacity-40" />

        <path 
          d={pathD} 
          fill="none" 
          stroke="url(#pathGradient)" 
          strokeWidth="5" 
          strokeDasharray="400"
          strokeDashoffset={400 - (400 * progress / 100)}
          strokeLinecap="round" 
          className="transition-all duration-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        />

        {/* Pickup Node */}
        <g transform="translate(40, 120)">
          <circle r="16" fill="#0ea5e9" fillOpacity="0.15" className="animate-ping" />
          <circle r="6" fill="#0ea5e9" stroke="#1e293b" strokeWidth="2" />
          <text y="-20" textAnchor="middle" fill="#0ea5e9" className="text-[10px] font-black uppercase tracking-wider">Store</text>
        </g>

        {/* Dropoff Node */}
        <g transform="translate(360, 120)">
          <circle r="16" fill="#10b981" fillOpacity="0.15" className="animate-ping" />
          <circle r="6" fill="#10b981" stroke="#1e293b" strokeWidth="2" />
          <text y="-20" textAnchor="middle" fill="#10b981" className="text-[10px] font-black uppercase tracking-wider">Cust</text>
        </g>

        {/* Bike Location */}
        {status === 'out-for-delivery' && (
          <g transform={`translate(${bikeX}, ${bikeY})`} className="transition-all duration-300">
            <circle r="20" fill="#fbbf24" fillOpacity="0.2" className="animate-pulse" />
            <circle r="8" fill="#fbbf24" stroke="#1e293b" strokeWidth="2.5" className="drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
          </g>
        )}
      </svg>
      
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black text-white border border-white/10 uppercase tracking-widest shadow-lg">
        <span className={`w-2 h-2 rounded-full ${status === 'out-for-delivery' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]' : 'bg-amber-500'}`}></span>
        {status === 'preparing' ? 'Pickup' : status === 'out-for-delivery' ? 'Dashing' : 'Delivered'}
      </div>
    </div>
  );
};

const ActiveDeliveries = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Custom Flow States for Quick Commerce
  // steps: 'arrived_store', 'picked_up', 'navigating', 'arrived_customer', 'pod_uploaded', 'delivered'
  const [orderFlow, setOrderFlow] = useState({}); 
  const [orderProgress, setOrderProgress] = useState({});
  const [podPhoto, setPodPhoto] = useState({});

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

    const getSocketUrl = () => import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const socket = io(getSocketUrl());
    
    socket.emit('joinDeliveryRoom');
    
    socket.on('newOrderAvailable', (order) => {
      if (['preparing', 'ready'].includes(order.status)) {
        setOrders(prev => !prev.find(o => o._id === order._id) ? [order, ...prev] : prev);
      }
    });

    socket.on('orderStatusUpdated', (data) => {
      setOrders(prev => {
        if (!prev.find(o => o._id === data.orderId)) {
          if (['preparing', 'ready'].includes(data.status)) fetchAssignedOrders();
          return prev;
        }
        return prev.map(o => o._id === data.orderId ? { ...o, status: data.status } : o);
      });
    });

    return () => socket.disconnect();
  }, [isOnline]);

  const fetchAssignedOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get('/orders/delivery/assigned');
      const active = res.data.filter(o => !['delivered', 'cancelled'].includes(o.status));
      setOrders(active);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateBackendStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      if (newStatus === 'delivered') {
        setTimeout(() => {
          setOrders(prev => prev.filter(o => o._id !== orderId));
        }, 3000);
      }
    } catch (err) {
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  const advanceFlow = (orderId, nextFlowState) => {
    setOrderFlow(prev => ({ ...prev, [orderId]: nextFlowState }));
    
    if (nextFlowState === 'picked_up') {
      updateBackendStatus(orderId, 'out-for-delivery');
    } else if (nextFlowState === 'navigating') {
      handleSimulateGPS(orderId);
    } else if (nextFlowState === 'delivered') {
      updateBackendStatus(orderId, 'delivered');
    }
  };

  const handleSimulateGPS = (orderId) => {
    const getSocketUrl = () => import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const socket = io(getSocketUrl());
    let step = 0;
    const totalSteps = 20;

    setOrderProgress(prev => ({ ...prev, [orderId]: 0 }));

    const interval = setInterval(() => {
      step++;
      const nextProgress = Math.min((step / totalSteps) * 100, 100);
      setOrderProgress(prev => ({ ...prev, [orderId]: nextProgress }));

      const startLat = 28.61, startLng = 77.20;
      const curLat = startLat + (step * 0.001);
      const curLng = startLng + (step * 0.001);

      socket.emit('sendCoordinates', { orderId, lat: curLat, lng: curLng });

      if (step >= totalSteps) {
        clearInterval(interval);
        socket.disconnect();
        advanceFlow(orderId, 'arrived_customer'); // Auto stop at customer door
      }
    }, 600);
  };

  const capturePOD = (orderId) => {
    // Simulate capturing a photo
    setPodPhoto(prev => ({ ...prev, [orderId]: 'uploaded' }));
    advanceFlow(orderId, 'pod_uploaded');
  };

  if (!isOnline) {
    return (
      <div className="max-w-4xl mx-auto p-12 bg-white border border-slate-100 shadow-sm rounded-[2.5rem] text-center mt-8">
        <h2 className="text-2xl font-black text-slate-900 mb-2">You are offline</h2>
        <p className="text-slate-500 font-medium">Go online from the Top Navbar to view active deliveries.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center p-20">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
             10-Min Dashes <Zap className="text-emerald-500 fill-emerald-500" />
          </h1>
          <p className="text-slate-500 font-medium mt-1">High urgency. Pick up quickly.</p>
        </div>
        <button onClick={fetchAssignedOrders} className="px-6 py-3 bg-white border border-slate-200 hover:border-emerald-500/30 text-slate-900 text-sm font-bold rounded-xl transition-all shadow-sm">
          Refresh List
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-[2.5rem] text-center flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
            <Bike size={48} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">No active drops</h2>
          <p className="text-slate-500 font-medium">Waiting for the next surge...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <AnimatePresence>
            {orders.map(order => {
              const flowState = orderFlow[order._id] || (order.status === 'out-for-delivery' ? 'navigating' : 'pending');
              const progress = orderProgress[order._id] || 0;

              return (
                <motion.div 
                  key={order._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, type: "spring" }}
                  className="bg-white border border-slate-100 shadow-[0_4px_30px_-4px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden group hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.15)] transition-shadow duration-500 relative"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Info Column */}
                    <div className="flex-1 p-8 border-b lg:border-b-0 lg:border-r border-slate-100 relative">
                      
                      <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm p-1">
                            <img src={order.store?.bannerImage || '/logo.png'} alt="" className="w-full h-full rounded-xl object-cover" onError={e => e.target.style.display = 'none'} />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-slate-900">Order #{order._id.slice(-6).toUpperCase()}</h3>
                            <p className="text-xs font-bold text-slate-400 mt-0.5">{order.store?.name}</p>
                          </div>
                        </div>
                        {/* 10 MIN SLA TIMER */}
                        {flowState !== 'delivered' && <SlaTimer createdAt={order.createdAt} />}
                      </div>

                      <div className="relative space-y-6">
                        <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-slate-100" />
                        
                        {/* Pickup */}
                        <div className="flex items-start gap-4 relative z-10">
                          <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center shrink-0 border-2 border-white shadow-sm mt-1">
                            <MapPin size={18} className="text-sky-500" />
                          </div>
                          <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-[10px] uppercase font-bold tracking-wider text-sky-500 mb-1">Pickup Store</p>
                                <p className="font-bold text-slate-900">{order.store?.name}</p>
                              </div>
                              <a href={`tel:${order.store?.phone}`} className="p-2.5 bg-white shadow-sm border border-slate-100 rounded-full hover:border-sky-500/30 transition-colors text-slate-400 hover:text-sky-500">
                                <Phone size={16} />
                              </a>
                            </div>
                          </div>
                        </div>
                        
                        {/* Dropoff */}
                        <div className="flex items-start gap-4 relative z-10">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border-2 border-white shadow-sm mt-1">
                            <Navigation size={18} className="text-emerald-500" />
                          </div>
                          <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 mb-1">Customer Drop</p>
                                <p className="font-bold text-slate-900 line-clamp-2">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</p>
                              </div>
                              <a href={`tel:${order.user?.phone}`} className="p-2.5 bg-white shadow-sm border border-slate-100 rounded-full hover:border-emerald-500/30 transition-colors text-slate-400 hover:text-emerald-500">
                                <Phone size={16} />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Action Button Flow */}
                      <div className="mt-8">
                        {flowState === 'pending' && (
                          <button onClick={() => advanceFlow(order._id, 'arrived_store')} className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-2xl transition-all shadow-md active:scale-95">
                            Arrived at Store
                          </button>
                        )}

                        {flowState === 'arrived_store' && (
                          <button onClick={() => advanceFlow(order._id, 'picked_up')} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)] active:scale-95 flex justify-center items-center gap-2">
                            <Check size={20} className="stroke-[3]" /> Confirm Pickup
                          </button>
                        )}

                        {flowState === 'picked_up' && (
                          <button onClick={() => advanceFlow(order._id, 'navigating')} className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-2xl transition-all shadow-md active:scale-95 flex justify-center items-center gap-2">
                            <Play size={20} className="fill-current" /> Start Navigation
                          </button>
                        )}

                        {flowState === 'navigating' && (
                          <div className="w-full py-4 bg-slate-100 text-slate-500 font-black rounded-2xl flex justify-center items-center gap-2 animate-pulse">
                            <Navigation size={20} /> Navigating... (Auto-stops at customer)
                          </div>
                        )}

                        {flowState === 'arrived_customer' && (
                          <button onClick={() => capturePOD(order._id)} className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl transition-all shadow-[0_4px_15px_rgba(245,158,11,0.3)] active:scale-95 flex justify-center items-center gap-2">
                            <Camera size={20} /> Take POD Photo
                          </button>
                        )}

                        {flowState === 'pod_uploaded' && (
                          <button onClick={() => advanceFlow(order._id, 'delivered')} className="w-full py-4 bg-[#e31837] hover:bg-[#c8102e] text-white font-black rounded-2xl transition-all shadow-[0_4px_15px_rgba(227,24,55,0.3)] active:scale-95 flex justify-center items-center gap-2">
                            <Zap size={20} className="fill-current" /> Mark 10-Min Drop Complete
                          </button>
                        )}

                        {flowState === 'delivered' && (
                          <div className="w-full py-4 bg-emerald-50 text-emerald-600 font-black rounded-2xl flex justify-center items-center gap-2">
                            <Check size={20} className="stroke-[3]" /> Drop Completed
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Map Column */}
                    <div className="flex-1 bg-slate-50 relative p-4 flex flex-col justify-center items-center">
                      {order.status !== 'delivered' ? (
                        <div className="w-full h-full flex items-center max-w-sm">
                          <DeliveryMiniMap progress={progress} status={order.status} />
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center">
                          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                            <Check size={48} className="text-emerald-500 stroke-[3]" />
                          </div>
                          <h3 className="text-2xl font-black text-slate-900">Dash Successful!</h3>
                          <p className="text-slate-500 font-medium mt-2">Earned ₹{order.deliveryFee || 45}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ActiveDeliveries;
