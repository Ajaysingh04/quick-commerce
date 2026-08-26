import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import API from '../../services/api.js';
import { Bike, IndianRupee, Star, TrendingUp, TrendingDown, Clock, Shield, Award, ChevronRight, X, PhoneCall, Mail, MessageSquare, Send, ArrowLeft, Navigation, MapPin, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
 const { user } = useSelector(state => state.auth);
 const [showTierModal, setShowTierModal] = useState(false);
 const [showSupportModal, setShowSupportModal] = useState(false);
 
 // Chat Support State
 const [showChat, setShowChat] = useState(false);
 const [messages, setMessages] = useState([
 { id: 1, text: "Hi there! How can we help you with your delivery today?", sender: 'support', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
 ]);
 const [inputText, setInputText] = useState('');

 // Socket & Incoming Order State
 const [incomingOrder, setIncomingOrder] = useState(null);
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
 if (user?.kyc?.status !== 'approved' || !isOnline) return;

    const getSocketUrl = () => {
      return import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    };

    const socket = io(getSocketUrl());
 socket.emit('joinDeliveryRoom');

 socket.on('newOrderAvailable', (order) => {
 setIncomingOrder(order);
 // Play a simple browser beep (if permitted by browser)
 try {
 const audio = new Audio('/notification.mp3');
 audio.play().catch(() => {});
 } catch (e) {}
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
 alert('Order Accepted! It is now in your active deliveries.');
 } catch (err) {
 alert(err.response?.data?.message || 'Failed to accept order. It may have been claimed by someone else.');
 setIncomingOrder(null);
 }
 };

 const handleSendMessage = (e) => {
 e.preventDefault();
 if (!inputText.trim()) return;
 
 // Add user message
 const newMsg = {
 id: Date.now(),
 text: inputText,
 sender: 'user',
 time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
 };
 
 setMessages(prev => [...prev, newMsg]);
 setInputText('');

 // Simulate agent response
 setTimeout(() => {
 setMessages(prev => [...prev, {
 id: Date.now() + 1,
 text: "Thanks for reaching out. An agent is reviewing your query and will respond shortly.",
 sender: 'support',
 time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
 }]);
 }, 1500);
 };

 const getPickupDistance = (order) => {
 const base = Number(order?.store?.distance || 2.2);
 return base.toFixed(1);
 };

 const getDeliveryDistance = (order) => {
 const base = Number(order?.store?.distance || 2.2);
 return Math.max(1.4, base + 1.4).toFixed(1);
 };

 const formatDeliveryAddress = (order) => {
 const address = order?.deliveryAddress;
 if (!address) return 'Customer location';
 return [address.street, address.city].filter(Boolean).join(', ');
 };

 const handleDismissOrder = () => setIncomingOrder(null);

 return (
 <div className="max-w-6xl mx-auto space-y-8 pb-12">
 <AnimatePresence>
 {incomingOrder && isOnline && (
 <motion.div
 initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
 animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
 exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
 className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40"
 >
 <motion.div
 initial={{ scale: 0.8, y: 50, rotateX: 20 }}
 animate={{ scale: 1, y: 0, rotateX: 0 }}
 exit={{ scale: 0.9, y: 30, opacity: 0 }}
 transition={{ type: "spring", damping: 25, stiffness: 300 }}
 className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden border border-white/50"
 style={{ transformPerspective: 1000 }}
 >
 {/* Pulsing Header */}
 <div className="bg-gradient-to-r from-[#c8102e] to-[#e31837] p-6 text-white text-center relative overflow-hidden">
    <div className="absolute inset-0 opacity-10"></div>
    <motion.div 
      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
      transition={{ repeat: Infinity, duration: 2 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/20 rounded-full blur-3xl"
    />
    <div className="relative z-10 flex flex-col items-center">
      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3 border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-bounce">
         <Bike size={32} className="text-white" />
      </div>
      <p className="text-[10px] uppercase tracking-[0.3em] text-white/80 font-black mb-1">New Delivery Request</p>
      <h3 className="text-3xl font-black">Order #{incomingOrder._id?.substring(0, 6).toUpperCase()}</h3>
    </div>
 </div>

 <div className="p-6 space-y-4 bg-slate-50">
 <div className="rounded-2xl bg-white border border-slate-100 p-4 shadow-sm relative overflow-hidden group">
 <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#e31837]" />
 <div className="flex items-center gap-3 text-[#e31837] mb-2">
 <MapPin size={18} />
 <p className="text-[11px] uppercase font-bold tracking-[0.2em]">Pickup Point</p>
 </div>
 <p className="text-base font-black text-slate-900">{incomingOrder?.store?.name || 'Pickup location'}</p>
 <p className="text-xs text-slate-500 font-medium mt-1">{getPickupDistance(incomingOrder)} km away</p>
 </div>

 <div className="rounded-2xl bg-white border border-slate-100 p-4 shadow-sm relative overflow-hidden">
 <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
 <div className="flex items-center gap-3 text-emerald-500 mb-2">
 <Navigation size={18} />
 <p className="text-[11px] uppercase font-bold tracking-[0.2em]">Dropoff Point</p>
 </div>
 <p className="text-base font-black text-slate-900">{formatDeliveryAddress(incomingOrder)}</p>
 <p className="text-xs text-slate-500 font-medium mt-1">{getDeliveryDistance(incomingOrder)} km total trip</p>
 </div>
 
 <div className="flex justify-between items-center bg-[#e31837]/5 rounded-2xl p-4 border border-[#e31837]/10">
    <div className="flex items-center gap-2 text-slate-700 font-bold">
      <IndianRupee size={20} className="text-[#e31837]" /> Est. Payout
    </div>
    <div className="text-2xl font-black text-[#e31837]">₹{incomingOrder?.deliveryFee || 40}</div>
 </div>
 </div>

 <div className="flex gap-4 p-6 bg-white border-t border-slate-100">
 <button
 onClick={handleDismissOrder}
 className="flex-1 rounded-xl bg-slate-100 px-4 py-4 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
 >
 Decline
 </button>
 <button
 onClick={handleAcceptOrder}
 className="flex-[2] rounded-xl bg-gradient-to-r from-[#c8102e] to-[#e31837] px-4 py-4 text-sm font-bold text-white transition hover:shadow-lg hover:shadow-[#e31837]/30 transform active:scale-95 flex items-center justify-center gap-2"
 >
 <Zap size={18} className="fill-current" /> Accept Delivery
 </button>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Welcome Banner */}
 {user?.kyc?.status !== 'approved' ? (
 <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-rose-700 relative overflow-hidden shadow-sm mb-6">
 <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-black mb-2 flex items-center gap-2">
 <Shield className="w-6 h-6 text-rose-500" /> 
 {user?.kyc?.status === 'pending_review' ? 'KYC Under Review' : 'KYC Verification Required'}
 </h1>
 <p className="text-sm font-medium">
 {user?.kyc?.status === 'pending_review' 
 ? 'Your documents are being reviewed by our team. You will be notified once approved.' 
 : 'Please upload your mandatory KYC documents in the Settings > Vehicle & Docs section to start accepting deliveries.'}
 </p>
 </div>
 <div className="hidden md:flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm border border-rose-100 text-rose-500">
 <X className="w-8 h-8" />
 </div>
 </div>
 </div>
 ) : (
 <div className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl mb-8 group">
 <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-[#e31837]/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>
 <div className="absolute left-0 bottom-0 w-64 h-64 bg-gradient-to-tr from-[#10b981]/20 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
 <div className="relative z-10 flex items-center justify-between">
 <div>
 <p className="text-[#e31837] font-black tracking-[0.2em] uppercase text-xs mb-3 flex items-center gap-2">
  <span className="w-2 h-2 rounded-full bg-[#e31837] animate-pulse"></span> Rider Dashboard
 </p>
 <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">Welcome back, <br className="sm:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{user?.name || 'Rider'}!</span></h1>
 <p className="text-slate-400 text-lg font-medium">You're currently <span className="text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-md">ONLINE</span> and ready to earn.</p>
 </div>
 <div className="hidden md:flex items-center justify-center w-32 h-32 bg-white/5 rounded-3xl backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(227,24,55,0.2)]">
 <Bike size={56} className="text-white transform group-hover:translate-x-2 transition-transform duration-500" />
 </div>
 </div>
 </div>
 )}

 {/* Quick Stats Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 {[
 { label: "Today's Earnings", value: '₹640', icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', trend: '+12%' },
 { label: 'Deliveries Done', value: '8', icon: Bike, color: 'text-[#e31837]', bg: 'bg-rose-50', border: 'border-rose-100', trend: null },
 { label: 'Time Online', value: '4.5h', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', trend: null },
 { label: 'Current Rating', value: '4.9', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', trend: null }
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
 {stat.trend && <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100"><TrendingUp size={14} /> {stat.trend}</span>}
 </div>
 <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">{stat.label}</h3>
 <div className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</div>
 </motion.div>
 ))}
 </div>

 {/* Main Content Area */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 
 {/* Recent Activity */}
 <div className="col-span-1 lg:col-span-2 bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-8">
 <div className="flex justify-between items-center mb-8">
 <h2 className="text-2xl font-black text-slate-900">Recent Deliveries</h2>
 <button className="text-sm text-[#e31837] hover:text-[#c8102e] font-bold flex items-center gap-1 group">
   View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
 </button>
 </div>
 
 <div className="space-y-4">
 {[
 { id: 'BD-94182', res: 'The Burger Craft & Co.', amt: 120, time: '2 mins ago', status: 'completed' },
 { id: 'BD-20491', res: 'La Piazza Woodfired', amt: 180, time: '1 hour ago', status: 'completed' },
 { id: 'BD-84729', res: 'Ninja Roll & Asian House', amt: 140, time: '3 hours ago', status: 'completed' }
 ].map(delivery => (
 <div key={delivery.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md hover:border-[#e31837]/20 transition-all cursor-pointer group">
 <div className="flex items-center gap-5">
 <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-110 transition-transform">
 <Check size={20} className="stroke-[3]" />
 </div>
 <div>
 <h4 className="font-bold text-slate-900 text-base">{delivery.res}</h4>
 <p className="text-xs font-medium text-slate-500 mt-1">Order #{delivery.id} • {delivery.time}</p>
 </div>
 </div>
 <div className="text-right">
 <div className="font-black text-lg text-slate-900">+₹{delivery.amt}</div>
 <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mt-1">Paid</div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Level & Rewards & Quick Actions */}
 <div className="col-span-1 space-y-8">
 {/* Tier Card */}
 <div className="bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-orange-500/20 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
 
 <div className="flex items-center gap-4 mb-8 relative z-10">
 <div className="p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl border border-white/30 shadow-inner">
 <Award size={32} />
 </div>
 <div>
 <p className="text-[10px] uppercase font-black tracking-[0.2em] text-white/80 mb-1">Rider Status</p>
 <h2 className="text-2xl font-black">Gold Tier</h2>
 </div>
 </div>
 
 <div className="space-y-3 mb-8 relative z-10">
 <div className="flex justify-between text-sm font-bold">
 <span className="text-white">86/100 Trips</span>
 <span className="text-white/80">14 to Platinum</span>
 </div>
 <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
 <div className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] relative">
    <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white/0 to-white/50 animate-pulse"></div>
 </div>
 </div>
 </div>

 <button 
 onClick={() => setShowTierModal(true)}
 className="w-full py-4 bg-white/20 hover:bg-white text-white hover:text-orange-500 font-black rounded-2xl border border-white/30 transition-all flex justify-between items-center px-6 backdrop-blur-md relative z-10"
 >
 View Tier Benefits <ChevronRight size={18} />
 </button>
 </div>

 {/* Quick Actions */}
 <div className="bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-8">
 <h2 className="text-xl font-black text-slate-900 mb-6">Quick Support</h2>
 <div className="space-y-4">
 <button 
 onClick={() => setShowSupportModal(true)}
 className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-white border border-slate-100 hover:border-[#e31837]/30 rounded-2xl transition-all text-left group hover:shadow-md"
 >
 <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-[#e31837]/10 transition-colors">
    <Shield size={20} className="text-[#e31837]" />
 </div>
 <div>
 <div className="text-sm font-bold text-slate-900 group-hover:text-[#e31837] transition-colors">Help Center</div>
 <div className="text-xs font-medium text-slate-500 mt-1">Contact rider care instantly</div>
 </div>
 </button>
 </div>
 </div>
 </div>
 </div>

 </div>
 );
};

const Check = ({ size, className }) => (
 <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
 <polyline points="20 6 9 17 4 12"></polyline>
 </svg>
);

export default Dashboard;
