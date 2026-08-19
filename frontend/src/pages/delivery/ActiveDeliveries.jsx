import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Bike, Phone, Play, Check, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api.js';

// No backup assignments - only real data

const DeliveryMiniMap = ({ progress, status }) => {
 const pathD = "M 30 110 Q 110 30, 180 110 T 330 110";
 let bikeX = 30 + (300 * progress / 100);
 let bikeY = 110 - Math.sin((progress / 100) * Math.PI) * 55;

 return (
 <div className="w-full h-48 bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden my-4 shadow-inner">
 <svg className="w-full h-full" viewBox="0 0 360 160">
 <defs>
 <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
 <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
 </pattern>
 </defs>
 <rect width="100%" height="100%" fill="url(#grid)" />
 
 <path d={pathD} fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
 <path d={pathD} fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round" className="opacity-40" />

 <path 
 d={pathD} 
 fill="none" 
 stroke="#f97316" 
 strokeWidth="4" 
 strokeDasharray="360"
 strokeDashoffset={360 - (360 * progress / 100)}
 strokeLinecap="round" 
 className="transition-all duration-300"
 />

 <g transform="translate(30, 110)">
 <circle r="12" fill="#f97316" fillOpacity="0.15" className="animate-ping" />
 <circle r="6" fill="#f97316" stroke="#000" strokeWidth="1.5" />
 <text y="-14" textAnchor="middle" fill="#f97316" className="text-[10px] font-bold uppercase">Store</text>
 </g>

 <g transform="translate(330, 110)">
 <circle r="12" fill="#10b981" fillOpacity="0.15" className="animate-ping" />
 <circle r="6" fill="#10b981" stroke="#000" strokeWidth="1.5" />
 <text y="-14" textAnchor="middle" fill="#10b981" className="text-[10px] font-bold uppercase">Home</text>
 </g>

 {status === 'out-for-delivery' && (
 <g transform={`translate(${bikeX}, ${bikeY})`}>
 <circle r="18" fill="#fbbf24" fillOpacity="0.2" className="animate-pulse" />
 <circle r="10" fill="#fbbf24" stroke="#000" strokeWidth="1.5" />
 </g>
 )}
 </svg>
 
 <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-50/90 px-3 py-1.5 rounded-full text-xs font-bold text-slate-200 border border-gray-200 uppercase">
 <span className={`w-2 h-2 rounded-full ${status === 'out-for-delivery' ? 'bg-[#e31837] animate-pulse' : 'bg-amber-500'}`}></span>
 {status === 'preparing' ? 'Preparing' : status === 'out-for-delivery' ? 'En Route' : 'Delivered'}
 </div>
 </div>
 );
};

const ActiveDeliveries = () => {
 const [orders, setOrders] = useState([]);
 const [loading, setLoading] = useState(true);
 const [orderProgress, setOrderProgress] = useState({});
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

 const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
 
 // Join the delivery partners broadcast room
 socket.emit('joinDeliveryRoom');
 
 // Listen for new orders dropped into the pool
 socket.on('newOrderAvailable', (order) => {
 // If it's preparing or ready, it's relevant for delivery
 if (['preparing', 'ready'].includes(order.status)) {
 setOrders(prev => {
 if (!prev.find(o => o._id === order._id)) {
 return [order, ...prev];
 }
 return prev;
 });
 }
 });

 // Listen for any other status updates (e.g. store marks it ready)
 socket.on('orderStatusUpdated', (data) => {
 setOrders(prev => {
 // If we don't have it, but it just became preparing/ready, fetch all to be safe
 if (!prev.find(o => o._id === data.orderId)) {
 if (['preparing', 'ready'].includes(data.status)) {
 fetchAssignedOrders();
 }
 return prev;
 }
 
 // Otherwise just update it
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

 const handleUpdateStatus = async (orderId, newStatus) => {
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

 const handleSimulateGPS = (orderId) => {
 const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
 let step = 0;
 const totalSteps = 20;

 setOrderProgress(prev => ({ ...prev, [orderId]: 0 }));

 const interval = setInterval(() => {
 step++;
 const nextProgress = Math.min((step / totalSteps) * 100, 100);
 setOrderProgress(prev => ({ ...prev, [orderId]: nextProgress }));

 socket.emit('sendCoordinates', { orderId, lat: 28.61, lng: 77.20 });

 if (step >= totalSteps) {
 clearInterval(interval);
 socket.disconnect();
 handleUpdateStatus(orderId, 'delivered');
 }
 }, 600);
 };

 if (!isOnline) {
 return (
 <div className="max-w-4xl mx-auto space-y-6">
 <div className="p-12 bg-white border border-gray-100 shadow-sm border border-gray-200 rounded-2xl text-center flex flex-col items-center gap-4 mt-8">
 <Bike size={48} className="text-slate-600 mb-2 opacity-50" />
 <h2 className="text-xl font-bold text-slate-600">You are offline</h2>
 <p className="text-slate-500">Go online from the Top Bar to view and manage your active deliveries.</p>
 </div>
 </div>
 );
 }

 if (loading) {
 return <div className="p-8 text-center text-slate-600">Loading active deliveries...</div>;
 }

 return (
 <div className="max-w-4xl mx-auto space-y-6">
 <div className="flex justify-between items-center mb-6">
 <div>
 <h1 className="text-2xl font-bold text-slate-900">Active Deliveries</h1>
 <p className="text-sm text-slate-600">Manage and track your current assignments</p>
 </div>
 <button onClick={fetchAssignedOrders} className="px-4 py-2 bg-white border border-gray-200 hover:bg-slate-50 text-slate-900 text-sm font-medium rounded-lg transition-colors">
 Refresh Map
 </button>
 </div>

 {orders.length === 0 ? (
 <div className="p-12 bg-white border border-gray-100 shadow-sm border border-gray-200 rounded-2xl text-center flex flex-col items-center gap-4">
 <Bike size={48} className="text-slate-600 mb-2" />
 <h2 className="text-xl font-bold text-slate-900">No active deliveries</h2>
 <p className="text-slate-600">You currently have no orders assigned. Stay online to receive requests.</p>
 </div>
 ) : (
 <div className="space-y-6">
 {orders.map(order => {
 const progress = orderProgress[order._id] || 0;
 return (
 <motion.div 
 key={order._id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 shadow-xl"
 >
 <div className="flex flex-col md:flex-row gap-6">
 {/* Info Column */}
 <div className="flex-1 space-y-6">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-4">
 <img src={order.store?.bannerImage} alt="" className="w-16 h-16 rounded-xl object-cover" />
 <div>
 <h3 className="text-lg font-bold text-slate-900">{order.store?.name}</h3>
 <p className="text-sm text-slate-600">Order #{order._id.slice(-6).toUpperCase()}</p>
 </div>
 </div>
 <div className="text-right">
 <div className="text-xl font-bold text-emerald-400">₹{order.payout}</div>
 <div className="text-sm text-slate-600">{order.distance}</div>
 </div>
 </div>

 <div className="space-y-4 text-sm bg-slate-50 p-4 rounded-xl">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-[#e31837]" />
 <span className="text-slate-600">Pickup</span>
 </div>
 <span className="text-slate-900 font-medium">{order.store?.name}</span>
 <a href={`tel:${order.store?.phone}`} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-slate-50">
 <Phone size={14} className="text-slate-300" />
 </a>
 </div>
 <div className="w-px h-4 bg-slate-700 ml-1" />
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-emerald-500" />
 <span className="text-slate-600">Dropoff</span>
 </div>
 <div className="text-right">
 <div className="text-slate-900 font-medium">{order.deliveryAddress?.street}</div>
 <div className="text-xs text-slate-600">{order.user?.name}</div>
 </div>
 <a href={`tel:${order.user?.phone}`} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-slate-50">
 <Phone size={14} className="text-slate-300" />
 </a>
 </div>
 </div>

 <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <span className="font-semibold text-slate-300">
 Status: <span className="text-[#e31837] uppercase tracking-wide">{order.status}</span>
 </span>

 {['preparing', 'ready'].includes(order.status) && (
 <button 
 onClick={() => {
 handleUpdateStatus(order._id, 'out-for-delivery');
 handleSimulateGPS(order._id);
 }}
 className="px-6 py-2.5 bg-[#e31837] hover:bg-[#c8102e] text-white font-bold rounded-xl transition-colors flex items-center gap-2"
 >
 <Play size={16} className="fill-current" /> Mark Picked Up & Navigate
 </button>
 )}

 {order.status === 'out-for-delivery' && orderProgress[order._id] === undefined && (
 <button 
 onClick={() => handleSimulateGPS(order._id)}
 className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold rounded-xl transition-colors flex items-center gap-2"
 >
 <Play size={16} className="fill-current" /> Start GPS Navigation
 </button>
 )}

 {order.status === 'delivered' && (
 <span className="text-emerald-400 font-bold flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
 <Check size={18} className="stroke-[3]" /> Delivery Completed
 </span>
 )}
 </div>
 </div>
 
 {/* Map Column */}
 <div className="flex-1 min-w-[300px]">
 {order.status !== 'delivered' && (
 <DeliveryMiniMap progress={progress} status={order.status} />
 )}
 </div>
 </div>
 </motion.div>
 );
 })}
 </div>
 )}
 </div>
 );
};

export default ActiveDeliveries;
