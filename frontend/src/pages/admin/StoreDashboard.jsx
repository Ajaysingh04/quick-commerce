import React, { useState, useEffect } from 'react';
import { ShoppingBag, TrendingUp, IndianRupee, Users, Award, Star, Clock } from 'lucide-react';
import API from '../../services/api.js';

const StoreDashboard = () => {
 const [liveOrders, setLiveOrders] = useState([]);
 const [loading, setLoading] = useState(true);
 const [metrics, setMetrics] = useState({
 revenue: 45200,
 totalOrders: 184,
 popularProducts: [
 { name: 'Smoked Truffle Burger', count: 68, revenue: 20332 },
 { name: 'Burrata & Wild Pesto Pizza', count: 42, revenue: 18858 },
 { name: 'Paneer Makhani (Royal Style)', count: 35, revenue: 11515 }
 ],
 customerRating: 4.8
 });

 useEffect(() => {
 fetchLiveOrders();
 }, []);

 const fetchLiveOrders = async () => {
 setLoading(true);
 try {
 const res = await API.get('/orders'); // Admin can view orders
 const allOrders = res.data || [];
 
 // Filter out active orders for live queue
 const active = allOrders.filter(o => ['placed', 'confirmed', 'preparing', 'out-for-delivery'].includes(o.status));
 setLiveOrders(active);
 
 // Calculate dynamic metrics
 let totalRev = 0;
 let productCounts = {};
 
 allOrders.forEach(order => {
 if (order.status === 'delivered') {
 totalRev += (order.billDetails?.grandTotal || 0);
 }
 order.items?.forEach(item => {
 const pName = item.product?.name || 'Unknown Product';
 if (!productCounts[pName]) productCounts[pName] = { count: 0, revenue: 0 };
 productCounts[pName].count += item.quantity;
 productCounts[pName].revenue += (item.price * item.quantity);
 });
 });
 
 let popProducts = Object.keys(productCounts)
 .map(name => ({ name, count: productCounts[name].count, revenue: productCounts[name].revenue }))
 .sort((a, b) => b.count - a.count)
 .slice(0, 5);
 
 if (popProducts.length === 0) popProducts = [{ name: 'No sales yet', count: 0, revenue: 0 }];
 
 setMetrics({
 revenue: totalRev,
 totalOrders: allOrders.length,
 popularProducts: popProducts,
 customerRating: 5.0
 });
 
 } catch (err) {
 console.error('Orders API error:', err);
 setLiveOrders([]);
 setMetrics({
 revenue: 0,
 totalOrders: 0,
 popularProducts: [{ name: 'No sales yet', count: 0, revenue: 0 }],
 customerRating: 5.0
 });
 } finally {
 setLoading(false);
 }
 };

 const handleUpdateStatus = async (orderId, newStatus) => {
 try {
 await API.put(`/orders/${orderId}/status`, { status: newStatus });
 setLiveOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o).filter(o => o.status !== 'delivered'));
 } catch (err) {
 // Mock local toggle
 setLiveOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o).filter(o => o.status !== 'delivered'));
 }
 };

 return (
 <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">
 {/* Header */}
 <div>
 <h2 className="text-2xl font-black text-slate-800 ">Store Owner Dashboard</h2>
 <p className="text-xs text-slate-400 mt-1">Real-time live queue management and financial analytics.</p>
 </div>

 {/* Analytics Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 {/* Metric 1 */}
 <div className="p-6 bg-white border border-emerald-200/60 rounded-3xl shadow-sm flex items-center justify-between">
 <div>
 <span className="text-[10px] font-bold text-slate-400 block mb-1">TOTAL REVENUE</span>
 <span className="text-2xl font-black text-slate-800 ">₹{metrics.revenue}</span>
 <span className="text-[10px] text-emerald-500 font-bold block mt-1">▲ +12% this week</span>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-600">
 <IndianRupee className="w-6 h-6" />
 </div>
 </div>

 {/* Metric 2 */}
 <div className="p-6 bg-white border border-emerald-200/60 rounded-3xl shadow-sm flex items-center justify-between">
 <div>
 <span className="text-[10px] font-bold text-slate-400 block mb-1">LIVE ACTIVE ORDERS</span>
 <span className="text-2xl font-black text-slate-800 ">{liveOrders.length}</span>
 <span className="text-[10px] text-slate-400 block mt-1">Updated just now</span>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
 <ShoppingBag className="w-6 h-6" />
 </div>
 </div>

 {/* Metric 3 */}
 <div className="p-6 bg-white border border-emerald-200/60 rounded-3xl shadow-sm flex items-center justify-between">
 <div>
 <span className="text-[10px] font-bold text-slate-400 block mb-1">POPULAR DISH SALES</span>
 <span className="text-2xl font-black text-slate-800 ">{metrics.popularProducts[0].count} orders</span>
 <span className="text-[10px] text-slate-400 block mt-1">{metrics.popularProducts[0].name}</span>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
 <TrendingUp className="w-6 h-6" />
 </div>
 </div>

 {/* Metric 4 */}
 <div className="p-6 bg-white border border-emerald-200/60 rounded-3xl shadow-sm flex items-center justify-between">
 <div>
 <span className="text-[10px] font-bold text-slate-400 block mb-1">CUSTOMER RATING</span>
 <span className="text-2xl font-black text-slate-800 flex items-center gap-1.5">
 {metrics.customerRating} <Star className="w-5 h-5 text-emerald-500 fill-emerald-500 shrink-0" />
 </span>
 <span className="text-[10px] text-emerald-500 font-bold block mt-1">Based on 1.2k reviews</span>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
 <Users className="w-6 h-6" />
 </div>
 </div>
 </div>

 <div className="flex flex-col lg:flex-row gap-8 items-start">
 {/* Live Orders Queue */}
 <div className="flex-[2] w-full p-6 bg-white border border-emerald-200/60 rounded-3xl shadow-sm">
 <h3 className="text-lg font-black mb-4 flex items-center gap-2">
 <Clock className="w-5 h-5 text-emerald-600" />
 Live Orders Queue
 </h3>
 
 {loading ? (
 <div className="text-center py-10 text-slate-400">Loading queue...</div>
 ) : liveOrders.length === 0 ? (
 <div className="text-center py-10 text-slate-400 text-xs">No active orders in queue right now.</div>
 ) : (
 <div className="space-y-4">
 {liveOrders.map(order => (
 <div key={order._id} className="p-4 border border-emerald-200 bg-emerald-50/50 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="font-extrabold text-xs text-emerald-600">ID: {order._id}</span>
 <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-yellow-400/20 text-yellow-600 border border-yellow-400/30">
 {order.status}
 </span>
 </div>
 <p className="text-xs font-bold text-slate-700 ">
 Customer: {order.user?.name || 'Customer'}
 </p>
 <p className="text-[10px] text-slate-400">
 Items: {order.items.map(i => `${i.product?.name || 'Dish'} x${i.quantity}`).join(', ')}
 </p>
 </div>

 <div className="flex gap-2">
 {order.status === 'placed' && (
 <button 
 onClick={() => handleUpdateStatus(order._id, 'confirmed')}
 className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold transition-all shadow-md"
 >
 Confirm Order
 </button>
 )}
 {order.status === 'confirmed' && (
 <button 
 onClick={() => handleUpdateStatus(order._id, 'preparing')}
 className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold transition-all shadow-md"
 >
 Start Preparing
 </button>
 )}
 {order.status === 'preparing' && (
 <button 
 onClick={() => handleUpdateStatus(order._id, 'out-for-delivery')}
 className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-[10px] font-bold transition-all shadow-md"
 >
 Out for Delivery
 </button>
 )}
 {order.status === 'out-for-delivery' && (
 <button 
 onClick={() => handleUpdateStatus(order._id, 'delivered')}
 className="px-3.5 py-1.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold transition-all shadow-md"
 >
 Mark Delivered
 </button>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Business popular product analytics */}
 <div className="flex-1 w-full p-6 bg-white border border-emerald-200/60 rounded-3xl shadow-sm flex flex-col gap-4">
 <h3 className="text-sm font-black flex items-center gap-2">
 <Award className="w-4 h-4 text-emerald-600" />
 Top Bestselling Dishes
 </h3>
 <div className="space-y-4 pt-2">
 {metrics.popularProducts.map(product => (
 <div key={product.name} className="space-y-1.5 text-xs">
 <div className="flex justify-between font-bold text-slate-700 ">
 <span>{product.name}</span>
 <span>{product.count} Sold</span>
 </div>
 {/* Simulated Chart bar */}
 <div className="w-full bg-emerald-100 h-2.5 rounded-full overflow-hidden border border-emerald-200/20">
 <div 
 className="bg-emerald-600 h-full rounded-full" 
 style={{ width: `${(product.count / 75) * 100}%` }}
 ></div>
 </div>
 <div className="flex justify-between text-[10px] text-slate-400">
 <span>Revenue Contribution</span>
 <span>₹{product.revenue}</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
};

export default StoreDashboard;
