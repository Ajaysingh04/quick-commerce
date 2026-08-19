import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../../services/api';
import { 
 Clock, ChevronRight, MapPin, Truck, ShoppingBag, CheckCircle, AlertCircle, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

const Orders = () => {
 const [orders, setOrders] = useState([]);
 const [loading, setLoading] = useState(true);
 const [filter, setFilter] = useState('New');
 const { user } = useSelector(state => state.auth);

 const fetchOrders = async () => {
 try {
 const res = await API.get('/orders/partner');
 setOrders(res.data);
 } catch (error) {
 console.error("Failed to fetch partner orders:", error);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchOrders();

 // Socket.io connection for live updates
 const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
 
 if (user?._id) {
 socket.on(`newOrderPartner_${user._id}`, (newOrder) => {
 setOrders(prev => [newOrder, ...prev]);
 // Also play a sound or show toast in a real app
 });
 }

 // Also listen to general status updates if admin or delivery changes it
 socket.on('orderStatusUpdated', (data) => {
 setOrders(prev => prev.map(o => o._id === data.orderId ? { ...o, status: data.status } : o));
 });

 return () => socket.disconnect();
 }, [user]);

 const handleStatusUpdate = async (orderId, newStatus) => {
 try {
 await API.put(`/orders/${orderId}/status`, { status: newStatus });
 setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
 } catch (err) {
 console.error("Failed to update status:", err);
 alert("Failed to update order status");
 }
 };

 const getFilteredOrders = () => {
 if (filter === 'New') return orders.filter(o => ['pending', 'placed'].includes(o.status));
 if (filter === 'Packing') return orders.filter(o => o.status === 'preparing');
 if (filter === 'Ready') return orders.filter(o => o.status === 'ready');
 if (filter === 'History') return orders.filter(o => ['delivered', 'cancelled'].includes(o.status));
 if (filter === 'Refunds') return orders.filter(o => o.status.includes('refund'));
 return orders;
 };

 const filteredOrders = getFilteredOrders();

 if (loading) return <div className="p-8 text-center animate-pulse text-slate-500">Loading orders...</div>;

 const formatTime = (dateString) => {
 if (!dateString) return '';
 const date = new Date(dateString);
 return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
 };

 return (
 <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
 
 {/* Header */}
 <div className="p-6 border-b border-gray-200 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-[#f5f6fa]/50 ">
 <div>
 <h2 className="text-xl font-black text-slate-800 ">Order Management</h2>
 <p className="text-xs text-slate-500 mt-1">Accept, pack, and dispatch orders in real-time.</p>
 </div>
 <div className="flex flex-wrap gap-2">
 {['New', 'Packing', 'Ready', 'History', 'Refunds'].map(f => {
 const count = 
 f === 'New' ? orders.filter(o=>['pending', 'placed'].includes(o.status)).length : 
 f === 'Packing' ? orders.filter(o=>o.status==='preparing').length :
 f === 'Ready' ? orders.filter(o=>o.status==='ready').length :
 f === 'History' ? orders.filter(o=>['delivered', 'cancelled'].includes(o.status)).length :
 f === 'Refunds' ? orders.filter(o=>o.status.includes('refund')).length : 0;

 return (
 <button 
 key={f}
 onClick={() => setFilter(f)}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
 filter === f 
 ? 'bg-[#e31837] text-white shadow-lg shadow-[#e31837]/20' 
 : 'bg-white text-slate-600 border border-gray-200 hover:border-[#e31837]'
 }`}
 >
 {f} 
 {count > 0 && <span className={`px-1.5 py-0.5 rounded text-[9px] ${filter === f ? 'bg-white/20' : 'bg-brand-100 text-[#c8102e]'}`}>{count}</span>}
 </button>
 )
 })}
 </div>
 </div>

 {/* Order List */}
 <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f5f6fa] custom-scrollbar">
 <AnimatePresence>
 {filteredOrders.length > 0 ? (
 filteredOrders.map((order) => (
 <motion.div 
 key={order._id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-6 hover:shadow-md transition-shadow group"
 >
 {/* Order Details */}
 <div className="flex-1">
 <div className="flex justify-between items-start mb-3">
 <div>
 <div className="flex items-center gap-3">
 <span className="text-[10px] font-mono font-black bg-slate-100 px-2 py-1 rounded-md text-slate-600 border border-gray-200 ">
 {order._id}
 </span>
 <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3"/> {formatTime(order.createdAt)}</span>
 </div>
 <h3 className="text-lg font-black text-slate-800 mt-2">{order.user?.name}</h3>
 <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
 <MapPin className="w-3.5 h-3.5 text-[#e31837]" /> {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
 </p>
 </div>
 <div className="text-right">
 <p className="text-xl font-black text-slate-900 ">₹{order.billDetails?.grandTotal}</p>
 <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider border border-emerald-200">
 {order.paymentDetails?.method}
 </span>
 </div>
 </div>

 {/* Items */}
 <div className="border-t border-gray-200 pt-3 mt-3">
 <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-2">Order Items</p>
 <div className="flex flex-wrap gap-2">
 {order.items?.map((item, idx) => (
 <div key={idx} className="text-xs font-semibold bg-[#f5f6fa] px-3 py-1.5 rounded-lg text-slate-700 border border-gray-200 ">
 <span className="text-[#e31837] font-black mr-1">{item.quantity}x</span> {item.product?.name}
 </div>
 ))}
 </div>
 </div>

 {/* Refund Reason (if applicable) */}
 {order.status === 'refund_requested' && (
 <div className="mt-3 p-3 bg-[#e31837]/10 rounded-xl border border-rose-100 flex gap-2">
 <AlertCircle className="w-4 h-4 text-[#e31837] shrink-0 mt-0.5" />
 <div>
 <p className="text-[10px] font-black uppercase tracking-wider text-[#c8102e] mb-0.5">Customer Issue</p>
 <p className="text-xs font-medium text-rose-800 ">{order.reason}</p>
 </div>
 </div>
 )}

 {/* Delivery Partner Details */}
 {order.deliveryPartner && (
 <div className="mt-3 flex items-center gap-3 bg-blue-50 p-2.5 rounded-xl border border-blue-100 ">
 <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 ">
 <Truck className="w-4 h-4" />
 </div>
 <div>
 <p className="text-[9px] font-black uppercase tracking-wider text-blue-500">Assigned Rider</p>
 <p className="text-xs font-bold text-blue-900 ">{order.deliveryPartner.name} • {order.deliveryPartner.phone}</p>
 </div>
 </div>
 )}
 </div>

 {/* Actions */}
 <div className="lg:w-48 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-200 pt-4 lg:pt-0 lg:pl-6">
 <div className="mb-4">
 <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-1">Status</p>
 <span className={`inline-flex px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider
 ${order.status === 'placed' ? 'bg-blue-100 text-blue-600 border border-blue-200' : 
 order.status === 'preparing' ? 'bg-orange-100 text-orange-600 border border-orange-200' : 
 order.status === 'ready' ? 'bg-purple-100 text-purple-600 border border-purple-200' : 
 order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' :
 order.status.includes('refund') ? 'bg-rose-100 text-[#c8102e] border border-rose-200' :
 'bg-slate-100 text-slate-600 border border-gray-200'}`}
 >
 {order.status === 'preparing' ? 'packing' : order.status.replace('_', ' ')}
 </span>
 </div>
 
 <div className="space-y-2 mt-auto">
 {order.status === 'placed' && (
 <>
 <button 
 onClick={() => handleStatusUpdate(order._id, 'preparing')}
 className="w-full py-2.5 bg-[#e31837] text-white font-bold rounded-xl text-xs hover:bg-[#c8102e] transition-colors shadow-md shadow-[#e31837]/20"
 >
 Accept & Pack
 </button>
 <button 
 onClick={() => handleStatusUpdate(order._id, 'cancelled')}
 className="w-full py-2 bg-[#e31837]/10 text-[#c8102e] font-bold rounded-xl text-xs hover:bg-rose-100 transition-colors border border-transparent"
 >
 Reject
 </button>
 </>
 )}
 {order.status === 'preparing' && (
 <button 
 onClick={() => handleStatusUpdate(order._id, 'ready')}
 className="w-full py-2.5 bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-emerald-500/20"
 >
 <CheckCircle className="w-4 h-4" /> Mark as Packed
 </button>
 )}
 {order.status === 'ready' && (
 <button 
 disabled
 className="w-full py-2.5 bg-slate-100 text-slate-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
 >
 Waiting for Rider...
 </button>
 )}
 {order.status === 'refund_requested' && (
 <>
 <button 
 onClick={() => handleStatusUpdate(order._id, 'refund_approved')}
 className="w-full py-2.5 bg-emerald-500 text-white font-bold rounded-xl text-xs hover:bg-emerald-600 transition-colors"
 >
 Approve Refund
 </button>
 <button 
 onClick={() => handleStatusUpdate(order._id, 'refund_rejected')}
 className="w-full py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 :bg-slate-700 transition-colors"
 >
 Reject Request
 </button>
 </>
 )}
 </div>
 </div>
 </motion.div>
 ))
 ) : (
 <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 py-12">
 <ShoppingBag className="w-12 h-12 opacity-20" />
 <p className="font-semibold text-sm">No orders in this category.</p>
 </div>
 )}
 </AnimatePresence>
 </div>

 </div>
 );
};

export default Orders;
