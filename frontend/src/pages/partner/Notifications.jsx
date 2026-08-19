import React, { useState } from 'react';
import { Bell, ShoppingBag, Wallet, AlertTriangle, Megaphone, CheckCircle, Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
 const [filter, setFilter] = useState('All');
 const [notifications, setNotifications] = useState([
 { id: 1, type: 'order', title: 'New Order Received!', message: 'Order #ORD-9025 has been placed by Rahul. Please accept and start preparing.', time: '2 mins ago', read: false },
 { id: 2, type: 'payment', title: 'Payout Successful', message: 'An amount of ₹45,200 has been successfully settled to your HDFC Bank account ending in 8901.', time: '1 hour ago', read: false },
 { id: 3, type: 'alert', title: 'Low Stock Alert', message: 'Your stock for "Paneer Tikka" is running low (only 3 portions left). Update stock to avoid cancellations.', time: '3 hours ago', read: true },
 { id: 4, type: 'announcement', title: 'Diwali Festival Campaign', message: 'Join the RoseDash Diwali Mega Sale! Opt-in before Oct 15th to boost your sales by up to 3x.', time: '1 day ago', read: true },
 { id: 5, type: 'order', title: 'Order Cancelled', message: 'Order #ORD-8941 was cancelled by the customer due to high delivery time.', time: '2 days ago', read: true },
 ]);

 const markAllAsRead = () => {
 setNotifications(notifications.map(n => ({ ...n, read: true })));
 };

 const deleteNotification = (id) => {
 setNotifications(notifications.filter(n => n.id !== id));
 };

 const markAsRead = (id) => {
 setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
 };

 const filteredNotifications = notifications.filter(n => {
 if (filter === 'All') return true;
 if (filter === 'Unread') return !n.read;
 if (filter === 'Orders') return n.type === 'order';
 if (filter === 'Payments') return n.type === 'payment';
 if (filter === 'Alerts') return n.type === 'alert' || n.type === 'announcement';
 return true;
 });

 const getIcon = (type) => {
 switch (type) {
 case 'order': return <ShoppingBag className="w-5 h-5 text-blue-500" />;
 case 'payment': return <Wallet className="w-5 h-5 text-emerald-500" />;
 case 'alert': return <AlertTriangle className="w-5 h-5 text-[#e31837]" />;
 case 'announcement': return <Megaphone className="w-5 h-5 text-amber-500" />;
 default: return <Bell className="w-5 h-5 text-slate-500" />;
 }
 };

 const getBgColor = (type, read) => {
 if (read) return 'bg-slate-100 ';
 switch (type) {
 case 'order': return 'bg-blue-100 ';
 case 'payment': return 'bg-emerald-100 ';
 case 'alert': return 'bg-rose-100 ';
 case 'announcement': return 'bg-amber-100 ';
 default: return 'bg-slate-100 ';
 }
 };

 return (
 <div className="max-w-4xl mx-auto space-y-6">
 
 {/* Header */}
 <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
 <Bell className="w-6 h-6 text-[#e31837]" /> Notifications
 </h2>
 <p className="text-sm text-slate-500 mt-1">Stay updated with orders, payments, and platform announcements.</p>
 </div>
 <button 
 onClick={markAllAsRead}
 className="px-4 py-2 bg-[#f5f6fa] text-slate-600 font-bold rounded-xl border border-gray-200 hover:bg-slate-100 :bg-slate-700 transition-colors flex items-center gap-2 text-sm"
 >
 <CheckCircle className="w-4 h-4" /> Mark all as read
 </button>
 </div>

 <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
 
 {/* Filters */}
 <div className="p-4 border-b border-gray-200 flex gap-2 overflow-x-auto no-scrollbar">
 {['All', 'Unread', 'Orders', 'Payments', 'Alerts'].map(f => (
 <button 
 key={f}
 onClick={() => setFilter(f)}
 className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
 filter === f 
 ? 'bg-[#e31837]/10 text-[#c8102e] border border-[#e31837]/30 ' 
 : 'bg-[#f5f6fa] text-slate-600 border border-transparent hover:bg-slate-100 :bg-slate-700'
 }`}
 >
 {f}
 {f === 'Unread' && notifications.filter(n => !n.read).length > 0 && (
 <span className="ml-1.5 bg-[#e31837] text-white px-1.5 py-0.5 rounded-full text-[9px]">{notifications.filter(n => !n.read).length}</span>
 )}
 </button>
 ))}
 </div>

 {/* Notifications List */}
 <div className="flex-1 overflow-y-auto">
 <AnimatePresence>
 {filteredNotifications.length > 0 ? (
 <div className="divide-y divide-slate-50 ">
 {filteredNotifications.map((notif) => (
 <motion.div 
 key={notif.id}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0, x: -20 }}
 className={`p-5 flex gap-4 transition-colors group ${!notif.read ? 'bg-[#f5f6fa]/50 ' : 'hover:bg-[#f5f6fa] :bg-slate-800/20'}`}
 >
 {/* Icon */}
 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getBgColor(notif.type, notif.read)}`}>
 {getIcon(notif.type)}
 </div>

 {/* Content */}
 <div className="flex-1">
 <div className="flex justify-between items-start mb-1">
 <h4 className={`text-sm ${!notif.read ? 'font-black text-slate-900 ' : 'font-bold text-slate-700 '}`}>
 {notif.title}
 </h4>
 <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-4">{notif.time}</span>
 </div>
 <p className={`text-sm leading-relaxed pr-8 ${!notif.read ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
 {notif.message}
 </p>
 </div>

 {/* Actions */}
 <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
 {!notif.read && (
 <button onClick={() => markAsRead(notif.id)} className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="Mark as read">
 <Check className="w-4 h-4" />
 </button>
 )}
 <button onClick={() => deleteNotification(notif.id)} className="p-1.5 text-slate-400 hover:text-[#e31837] hover:bg-[#e31837]/10 rounded-lg transition-colors" title="Delete">
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </motion.div>
 ))}
 </div>
 ) : (
 <div className="h-full flex flex-col items-center justify-center text-slate-400 py-24">
 <Bell className="w-12 h-12 mb-3 opacity-20" />
 <p className="font-semibold text-sm">No notifications found.</p>
 </div>
 )}
 </AnimatePresence>
 </div>

 </div>
 </div>
 );
};

export default Notifications;
