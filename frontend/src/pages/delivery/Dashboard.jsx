import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import API from '../../services/api.js';
import { Bike, IndianRupee, Star, TrendingUp, TrendingDown, Clock, Shield, Award, ChevronRight, X, PhoneCall, Mail, MessageSquare, Send, ArrowLeft, Navigation, MapPin } from 'lucide-react';
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
 <div className="max-w-5xl mx-auto space-y-6 pb-12">
 <AnimatePresence>
 {incomingOrder && isOnline && (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 20 }}
 className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-start sm:justify-end sm:p-6"
 >
 <motion.div
 initial={{ scale: 0.96 }}
 animate={{ scale: 1 }}
 exit={{ scale: 0.96 }}
 className="w-full max-w-md rounded-3xl border border-[#e31837]/30 bg-slate-950/95 shadow-2xl backdrop-blur-xl"
 >
 <div className="flex items-start justify-between border-b border-slate-800 p-4 sm:p-5">
 <div>
 <p className="text-[10px] uppercase tracking-[0.3em] text-brand-400">New delivery request</p>
 <h3 className="mt-1 text-lg font-bold text-slate-900">Pickup & drop details</h3>
 </div>
 <button onClick={handleDismissOrder} className="rounded-full p-2 text-slate-600 hover:bg-white border border-gray-200 hover:text-slate-900">
 <X size={18} />
 </button>
 </div>

 <div className="space-y-3 p-4 sm:p-5">
 <div className="rounded-2xl border border-slate-800 bg-slate-50/70 p-3">
 <div className="flex items-center gap-2 text-brand-400">
 <MapPin size={16} />
 <p className="text-[10px] uppercase tracking-[0.3em]">Pickup product</p>
 </div>
 <p className="mt-2 text-sm font-semibold text-slate-900">{incomingOrder?.store?.name || 'Pickup location'}</p>
 <p className="mt-1 text-xs text-slate-600">Distance: {getPickupDistance(incomingOrder)} km</p>
 </div>

 <div className="rounded-2xl border border-slate-800 bg-slate-50/70 p-3">
 <div className="flex items-center gap-2 text-emerald-400">
 <Navigation size={16} />
 <p className="text-[10px] uppercase tracking-[0.3em]">Deliver product</p>
 </div>
 <p className="mt-2 text-sm font-semibold text-slate-900">{formatDeliveryAddress(incomingOrder)}</p>
 <p className="mt-1 text-xs text-slate-600">Distance: {getDeliveryDistance(incomingOrder)} km</p>
 </div>
 </div>

 <div className="flex gap-3 border-t border-slate-800 p-4 sm:p-5">
 <button
 onClick={handleAcceptOrder}
 className="flex-1 rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-brand-400"
 >
 Accept
 </button>
 <button
 onClick={handleDismissOrder}
 className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white border border-gray-200"
 >
 Dismiss
 </button>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Welcome Banner */}
 {user?.kyc?.status !== 'approved' ? (
 <div className="bg-rose-500/10 border-2 border-rose-500 rounded-3xl p-6 text-rose-500 relative overflow-hidden shadow-lg mb-6">
 <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-black mb-2 flex items-center gap-2">
 <Shield className="w-6 h-6" /> 
 {user?.kyc?.status === 'pending_review' ? 'KYC Under Review' : 'KYC Verification Required'}
 </h1>
 <p className="text-sm font-semibold">
 {user?.kyc?.status === 'pending_review' 
 ? 'Your documents are being reviewed by our team. You will be notified once approved.' 
 : 'Please upload your mandatory KYC documents in the Settings > Vehicle & Docs section to start accepting deliveries.'}
 </p>
 </div>
 <div className="hidden md:flex items-center justify-center w-16 h-16 bg-rose-500/20 rounded-2xl">
 <X className="w-8 h-8" />
 </div>
 </div>
 </div>
 ) : (
 <div className="bg-gradient-to-r from-brand-600 to-brand-400 rounded-3xl p-8 text-slate-900 relative overflow-hidden shadow-lg mb-6">
 <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
 <div className="relative z-10 flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Rider'}! 👋</h1>
 <p className="text-brand-100 text-lg">You're currently <span className="font-bold text-slate-900">online</span> and ready to accept deliveries.</p>
 </div>
 <div className="hidden md:flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30">
 <Bike size={40} className="text-slate-900 animate-bounce" />
 </div>
 </div>
 </div>
 )}

 {/* Quick Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 {[
 { label: "Today's Earnings", value: '₹640', icon: IndianRupee, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
 { label: 'Deliveries Done', value: '8', icon: Bike, color: 'text-brand-400', bg: 'bg-brand-500/10' },
 { label: 'Time Online', value: '4.5h', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
 { label: 'Current Rating', value: '4.9', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' }
 ].map((stat, i) => (
 <motion.div 
 key={i}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.1 }}
 className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex flex-col justify-center shadow-md"
 >
 <div className="flex justify-between items-start mb-4">
 <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
 <stat.icon size={20} />
 </div>
 {i === 0 && <span className="text-xs font-medium text-emerald-400 flex items-center gap-1"><TrendingUp size={14} /> +12%</span>}
 </div>
 <h3 className="text-slate-600 text-sm font-medium mb-1">{stat.label}</h3>
 <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
 </motion.div>
 ))}
 </div>

 {/* Main Content Area */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 
 {/* Recent Activity */}
 <div className="col-span-1 md:col-span-2 bg-white border border-gray-100 shadow-sm rounded-3xl p-6">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-xl font-bold text-slate-900">Recent Deliveries</h2>
 <button className="text-sm text-[#e31837] hover:text-orange-400 font-medium">View All</button>
 </div>
 
 <div className="space-y-4">
 {[
 { id: 'BD-94182', res: 'The Burger Craft & Co.', amt: 120, time: '2 mins ago', status: 'completed' },
 { id: 'BD-20491', res: 'La Piazza Woodfired', amt: 180, time: '1 hour ago', status: 'completed' },
 { id: 'BD-84729', res: 'Ninja Roll & Asian House', amt: 140, time: '3 hours ago', status: 'completed' }
 ].map(delivery => (
 <div key={delivery.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-gray-200/50 hover:bg-white border border-gray-200 transition-colors cursor-pointer">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
 <Check size={20} />
 </div>
 <div>
 <h4 className="font-bold text-slate-900">{delivery.res}</h4>
 <p className="text-xs text-slate-600">Order {delivery.id} • {delivery.time}</p>
 </div>
 </div>
 <div className="text-right">
 <div className="font-bold text-emerald-400">+₹{delivery.amt}</div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Level & Rewards */}
 <div className="col-span-1 space-y-6">
 <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6">
 <div className="flex items-center gap-3 mb-6">
 <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg">
 <Award size={24} />
 </div>
 <div>
 <h2 className="text-lg font-bold text-slate-900">Gold Tier</h2>
 <p className="text-xs text-slate-600">Pro Rider Status</p>
 </div>
 </div>
 
 <div className="space-y-2 mb-6">
 <div className="flex justify-between text-sm font-medium">
 <span className="text-slate-300">86/100 Trips</span>
 <span className="text-orange-400">14 to Platinum</span>
 </div>
 <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
 <div className="h-full bg-gradient-to-r from-[#e31837] to-yellow-400 rounded-full" style={{ width: '86%' }}></div>
 </div>
 </div>

 <button 
 onClick={() => setShowTierModal(true)}
 className="w-full py-3 bg-slate-50 hover:bg-white border border-gray-200 text-slate-900 font-medium rounded-xl border border-gray-200 transition-colors flex justify-between items-center px-4"
 >
 View Tier Benefits <ChevronRight size={16} className="text-slate-600" />
 </button>
 </div>

 {/* Quick Actions */}
 <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6">
 <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
 <div className="space-y-3">
 <button 
 onClick={() => setShowSupportModal(true)}
 className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-white border border-gray-200 rounded-xl transition-colors text-left border border-gray-200/50"
 >
 <Shield size={18} className="text-blue-400" />
 <div>
 <div className="text-sm font-bold text-slate-900">Help & Support</div>
 <div className="text-xs text-slate-600">Contact rider care</div>
 </div>
 </button>
 </div>
 </div>
 </div>
 </div>

 {/* Tier Benefits Modal */}
 <AnimatePresence>
 {showTierModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
 onClick={() => setShowTierModal(false)}
 />
 <motion.div 
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="relative bg-slate-50 border border-gray-200 rounded-3xl w-full max-w-md p-6 overflow-hidden shadow-2xl"
 >
 <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-yellow-500/20 to-transparent"></div>
 
 <div className="flex justify-between items-start relative z-10">
 <div className="p-3 bg-yellow-500/20 text-yellow-500 rounded-2xl mb-4">
 <Award size={32} />
 </div>
 <button onClick={() => setShowTierModal(false)} className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-gray-200 rounded-full transition-colors">
 <X size={20} />
 </button>
 </div>
 
 <h2 className="text-2xl font-bold text-slate-900 mb-1 relative z-10">Gold Tier Benefits</h2>
 <p className="text-sm text-slate-600 mb-6 relative z-10">You are in the top 15% of riders! Enjoy these exclusive perks.</p>
 
 <div className="space-y-4 relative z-10">
 <div className="flex items-start gap-4 p-4 bg-white border border-gray-100 shadow-sm rounded-2xl border border-gray-200">
 <IndianRupee className="text-emerald-400 mt-0.5" size={20} />
 <div>
 <h3 className="font-bold text-slate-900 text-sm">5% Earnings Boost</h3>
 <p className="text-xs text-slate-600">Earn extra on every completed delivery.</p>
 </div>
 </div>
 <div className="flex items-start gap-4 p-4 bg-white border border-gray-100 shadow-sm rounded-2xl border border-gray-200">
 <Shield className="text-blue-400 mt-0.5" size={20} />
 <div>
 <h3 className="font-bold text-slate-900 text-sm">Free Accidental Insurance</h3>
 <p className="text-xs text-slate-600">Coverage up to ₹5 Lakhs while on duty.</p>
 </div>
 </div>
 <div className="flex items-start gap-4 p-4 bg-white border border-gray-100 shadow-sm rounded-2xl border border-gray-200">
 <PhoneCall className="text-orange-400 mt-0.5" size={20} />
 <div>
 <h3 className="font-bold text-slate-900 text-sm">Priority Support Routing</h3>
 <p className="text-xs text-slate-600">Skip the queue when calling rider care.</p>
 </div>
 </div>
 </div>
 
 <button 
 onClick={() => setShowTierModal(false)}
 className="w-full mt-6 py-3 bg-[#e31837] hover:bg-[#c8102e] text-white font-bold rounded-xl transition-colors"
 >
 Awesome!
 </button>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* Help & Support Modal */}
 <AnimatePresence>
 {showSupportModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
 onClick={() => setShowSupportModal(false)}
 />
 <motion.div 
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="relative bg-slate-50 border border-gray-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
 >
 {showChat ? (
 // --- CHAT INTERFACE ---
 <>
 <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-50 z-10 shrink-0">
 <div className="flex items-center gap-3">
 <button onClick={() => setShowChat(false)} className="p-2 text-slate-600 hover:text-slate-900 transition-colors">
 <ArrowLeft size={20} />
 </button>
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 bg-[#e31837] rounded-full flex items-center justify-center text-slate-900 font-bold text-xs">
 BD
 </div>
 <div>
 <h2 className="text-sm font-bold text-slate-900 leading-none">Rider Support</h2>
 <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
 <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Typically replies in 2 mins
 </span>
 </div>
 </div>
 </div>
 <button 
 onClick={() => { setShowSupportModal(false); setShowChat(false); }} 
 className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-gray-200 rounded-full transition-colors"
 >
 <X size={20} />
 </button>
 </div>
 
 {/* Messages Area */}
 <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/50 min-h-[300px]">
 {messages.map(msg => (
 <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
 <div className={`max-w-[80%] rounded-2xl p-3 ${msg.sender === 'user' ? 'bg-[#e31837] text-white rounded-br-sm' : 'bg-white border border-gray-200 text-slate-200 rounded-bl-sm border border-gray-200'}`}>
 <p className="text-sm">{msg.text}</p>
 <span className={`text-[9px] block mt-1 ${msg.sender === 'user' ? 'text-orange-200 text-right' : 'text-slate-600'}`}>
 {msg.time}
 </span>
 </div>
 </div>
 ))}
 </div>

 {/* Input Area */}
 <div className="p-4 bg-slate-50 border-t border-slate-800 shrink-0">
 <form onSubmit={handleSendMessage} className="relative flex items-center">
 <input 
 type="text" 
 value={inputText}
 onChange={(e) => setInputText(e.target.value)}
 placeholder="Type your message..." 
 className="w-full bg-white border border-gray-200 border border-gray-200 text-slate-900 text-sm rounded-full pl-4 pr-12 py-3 focus:outline-none focus:border-[#e31837] transition-colors"
 />
 <button 
 type="submit" 
 disabled={!inputText.trim()}
 className="absolute right-2 p-2 bg-[#e31837] text-white rounded-full hover:bg-[#c8102e] disabled:opacity-50 disabled:hover:bg-[#e31837] transition-colors"
 >
 <Send size={16} />
 </button>
 </form>
 </div>
 </>
 ) : (
 // --- DEFAULT SUPPORT MENU ---
 <div className="p-6">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-xl font-bold text-slate-900">Help & Support</h2>
 <button onClick={() => setShowSupportModal(false)} className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-gray-200 rounded-full transition-colors">
 <X size={20} />
 </button>
 </div>
 
 <div className="grid grid-cols-2 gap-4 mb-6">
 <a href="tel:18005550199" className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-gray-200 hover:bg-slate-50 rounded-2xl border border-gray-200 transition-colors">
 <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center">
 <PhoneCall size={24} />
 </div>
 <span className="text-sm font-bold text-slate-900">Call Us</span>
 </a>
 <a href="mailto:rider@appsica.com" className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-gray-200 hover:bg-slate-50 rounded-2xl border border-gray-200 transition-colors">
 <div className="w-12 h-12 bg-[#e31837]/10 text-orange-400 rounded-full flex items-center justify-center">
 <Mail size={24} />
 </div>
 <span className="text-sm font-bold text-slate-900">Email</span>
 </a>
 </div>

 <button 
 onClick={() => setShowChat(true)}
 className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-gray-200 hover:bg-slate-50 text-slate-900 font-bold rounded-xl transition-colors border border-gray-200"
 >
 <MessageSquare size={18} className="text-slate-600" /> Open Chat Support
 </button>
 </div>
 )}
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* Incoming Order Modal */}
 <AnimatePresence>
 {incomingOrder && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <motion.div 
 initial={{ opacity: 0 }} 
 animate={{ opacity: 1 }} 
 exit={{ opacity: 0 }} 
 className="absolute inset-0 bg-slate-50/60 backdrop-blur-sm"
 />
 <motion.div 
 initial={{ opacity: 0, scale: 0.9, y: 20 }} 
 animate={{ opacity: 1, scale: 1, y: 0 }} 
 exit={{ opacity: 0, scale: 0.9, y: 20 }}
 className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-brand-500/50"
 >
 <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-brand-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg animate-bounce">
 <Bike className="w-10 h-10 text-slate-900" />
 </div>

 <div className="text-center mt-12 mb-6">
 <h3 className="text-xs font-black uppercase text-brand-500 tracking-widest mb-1">New Delivery Request</h3>
 <h2 className="text-2xl font-bold text-slate-800 ">Order #{incomingOrder._id?.substring(0, 8)}</h2>
 </div>

 <div className="space-y-4 mb-6">
 <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-2xl">
 <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
 <Navigation className="w-4 h-4 text-slate-600 " />
 </div>
 <div>
 <p className="text-xs text-slate-600 font-bold uppercase mb-0.5">Pickup From</p>
 <p className="text-sm font-semibold text-slate-800 ">{incomingOrder.store?.name || 'Store'}</p>
 </div>
 </div>

 <div className="flex items-start gap-3 p-3 bg-brand-50 rounded-2xl border border-brand-100 ">
 <div className="w-8 h-8 rounded-full bg-brand-200 flex items-center justify-center shrink-0">
 <MapPin className="w-4 h-4 text-brand-600 " />
 </div>
 <div>
 <p className="text-xs text-brand-500 font-bold uppercase mb-0.5">Deliver To</p>
 <p className="text-sm font-semibold text-slate-800 line-clamp-2">
 {incomingOrder.deliveryAddress?.street}, {incomingOrder.deliveryAddress?.city}
 </p>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <button 
 onClick={() => setIncomingOrder(null)}
 className="flex-1 py-3.5 rounded-xl bg-pink-100 text-slate-600 font-bold transition-colors hover:bg-slate-200 :bg-slate-700"
 >
 Decline
 </button>
 <button 
 onClick={handleAcceptOrder}
 className="flex-[2] py-3.5 rounded-xl bg-brand-500 text-slate-900 font-bold transition-all hover:bg-brand-600 active:scale-95 shadow-lg shadow-brand-500/30"
 >
 Accept Order
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 </div>
 );
};

const Check = ({ size, className }) => (
 <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
 <polyline points="20 6 9 17 4 12"></polyline>
 </svg>
);

export default Dashboard;
