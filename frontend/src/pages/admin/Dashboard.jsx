import React, { useState, useEffect } from 'react';
import API from '../../services/api.js';
import { 
 DollarSign, ShoppingCart, Users, Salad, X, Search, Filter, 
 MapPin, CreditCard, ChevronRight, Truck, Package, CheckCircle2, Navigation, Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomersList from './CustomersList.jsx';
import PayoutsList from './PayoutsList.jsx';

const BACKUP_ORDERS = [
 {
 _id: 'order-101',
 user: { name: 'Rohan Malhotra', email: 'rohan@gmail.com' },
 billDetails: { grandTotal: 580 },
 paymentDetails: { method: 'cod', status: 'pending' },
 status: 'placed',
 createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 mins ago
 },
 {
 _id: 'order-102',
 user: { name: 'Ananya Sen', email: 'ananya@gmail.com' },
 billDetails: { grandTotal: 940 },
 paymentDetails: { method: 'card', status: 'paid' },
 status: 'preparing',
 createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 mins ago
 },
 {
 _id: 'order-103',
 user: { name: 'Amit Sharma', email: 'amit@gmail.com' },
 billDetails: { grandTotal: 340 },
 paymentDetails: { method: 'upi', status: 'paid' },
 status: 'out-for-delivery',
 createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString() // 90 mins ago
 }
];

const MOCK_RIDERS = [
 { id: 'rider-1', name: 'Rider Deepak (9876543210)' },
 { id: 'rider-2', name: 'Rider Sunil (9845321098)' },
 { id: 'rider-3', name: 'Rider Amit (9812345678)' }
];

const Dashboard = () => {
 const [activeTab, setActiveTab] = useState('overview');
 const [orders, setOrders] = useState([]);
 const [loading, setLoading] = useState(true);
 
 // Search & Filter state
 const [searchQuery, setSearchQuery] = useState('');
 const [statusFilter, setStatusFilter] = useState('All');

 const [stats, setStats] = useState({
 revenue: 1860,
 ordersCount: 3,
 usersCount: 15,
 deliveryCount: 5,
 productsCount: 8
 });

 const [selectedOrder, setSelectedOrder] = useState(null);
 const [selectedRider, setSelectedRider] = useState('');

 useEffect(() => {
 fetchAdminData();
 }, []);

 const fetchAdminData = async () => {
 setLoading(true);
 try {
 const [ordersRes, usersRes, productsRes] = await Promise.all([
 API.get('/orders/admin/all').catch(() => ({ data: BACKUP_ORDERS })),
 API.get('/users').catch(() => ({ data: [] })),
 API.get('/products').catch(() => ({ data: [] }))
 ]);
 
 const fetchedOrders = ordersRes.data && ordersRes.data.length > 0 ? ordersRes.data : BACKUP_ORDERS;
 setOrders(fetchedOrders);
 
 const allUsers = usersRes.data || [];
 const allProducts = productsRes.data || [];
 
 // Calculate revenue from delivered/completed orders
 const totalRevenue = fetchedOrders
 .filter(o => o.status === 'delivered')
 .reduce((sum, o) => sum + (o.billDetails?.grandTotal || 0), 0);

 setStats({
 revenue: totalRevenue,
 ordersCount: fetchedOrders.length,
 usersCount: allUsers.filter(u => u.role === 'user').length,
 deliveryCount: allUsers.filter(u => u.role === 'delivery').length,
 productsCount: allProducts.length
 });
 
 } catch (err) {
 console.warn('API Error, loading fallback admin data:', err);
 setOrders(BACKUP_ORDERS);
 } finally {
 setLoading(false);
 }
 };

 const handleUpdateStatus = async (orderId, newStatus) => {
 try {
 await API.put(`/orders/${orderId}/status`, { status: newStatus });
 setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
 } catch (err) {
 setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
 }
 };

 const handleAssignRider = async () => {
 if (!selectedRider || !selectedOrder) return;
 const rider = MOCK_RIDERS.find(r => r.id === selectedRider);
 
 try {
 setOrders(prev => prev.map(o => o._id === selectedOrder._id 
 ? { ...o, status: 'out-for-delivery', riderName: rider.name } 
 : o
 ));
 setSelectedOrder(null);
 } catch (err) {
 setOrders(prev => prev.map(o => o._id === selectedOrder._id 
 ? { ...o, status: 'out-for-delivery', riderName: rider.name } 
 : o
 ));
 setSelectedOrder(null);
 }
 };

 // Filter logic
 const filteredOrders = orders.filter(o => {
 const searchLower = searchQuery.toLowerCase();
 const idString = String(o._id || '').toLowerCase();
 const userName = String(o.user?.name || '').toLowerCase();

 const matchesSearch = idString.includes(searchLower) || userName.includes(searchLower);
 const matchesStatus = statusFilter === 'All' || o.status === statusFilter.toLowerCase();

 return matchesSearch && matchesStatus;
 });

 const getStatusColor = (status) => {
 switch (status) {
 case 'placed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
 case 'preparing': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
 case 'out-for-delivery': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
 case 'delivered': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
 default: return 'bg-pink-500/10 text-slate-500 border-slate-500/20';
 }
 };

 return (
 <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 
 {/* Top Tabs */}
 <div className="flex bg-pink-100 p-1.5 rounded-xl w-full sm:w-fit overflow-x-auto no-scrollbar relative mb-4 gap-1">
 <button
 onClick={() => setActiveTab('overview')}
 className={`whitespace-nowrap px-6 py-2.5 text-sm font-bold relative z-10 transition-colors ${activeTab === 'overview' ? 'text-slate-900 bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)]' : 'text-slate-500 hover:text-slate-700 :text-slate-300'}`}
 >
 Overview & Orders
 </button>
 <button 
 onClick={() => setActiveTab('Customers')}
 className={`whitespace-nowrap px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
 activeTab === 'Customers' 
 ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)]' 
 : 'text-slate-500 hover:text-slate-700'
 }`}
 >
 Customers
 </button>
 <button 
 onClick={() => setActiveTab('Payouts')}
 className={`whitespace-nowrap px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
 activeTab === 'Payouts' 
 ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)]' 
 : 'text-slate-500 hover:text-slate-700'
 }`}
 >
 <Wallet className="w-4 h-4" /> Payouts
 </button>
 </div>

 <AnimatePresence mode="wait">
 {activeTab === 'overview' && (
 <motion.div 
 key="overview"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="space-y-8"
 >
 {/* Stat Cards Grid */}
 <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
 {[
 { label: 'Gross Revenue', value: `₹${stats.revenue}`, icon: DollarSign, color: 'text-brand-600', bg: 'bg-brand-50' },
 { label: 'Total Orders', value: stats.ordersCount, icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
 { label: 'Active Customers', value: stats.usersCount, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
 { label: 'Delivery Partners', value: stats.deliveryCount, icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
 { label: 'Dishes Catalog', value: stats.productsCount, icon: Salad, color: 'text-amber-600', bg: 'bg-amber-50' },
 ].map((stat, i) => (
 <motion.div 
 key={i}
 whileHover={{ y: -2 }}
 className="bg-white border border-pink-200 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between"
 >
 <div className="flex justify-between items-start mb-4">
 <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl`}>
 <stat.icon className="w-6 h-6" />
 </div>
 </div>
 <div>
 <h3 className="text-3xl font-black text-slate-900 mb-1">{stat.value}</h3>
 <p className="text-xs font-semibold text-slate-500 tracking-wide">{stat.label}</p>
 </div>
 </motion.div>
 ))}
 </section>

 {/* Visual Analytics Canvas Chart Panel */}
 <section className="bg-white border border-pink-200/60 rounded-3xl p-6 shadow-sm">
 <div className="flex justify-between items-center border-b border-pink-200 pb-4 mb-4">
 <h3 className="text-lg font-black text-slate-800 ">Revenue Analytics (Last 7 Days)</h3>
 </div>
 
 {/* Customized CSS Grid Chart */}
 <div className="h-64 flex items-end gap-2 sm:gap-6 pt-4 px-2 sm:px-4 w-full">
 {[
 { day: 'Mon', h: '30%', val: '₹450' }, { day: 'Tue', h: '45%', val: '₹620' },
 { day: 'Wed', h: '25%', val: '₹340' }, { day: 'Thu', h: '60%', val: '₹890' },
 { day: 'Fri', h: '85%', val: '₹1250' }, { day: 'Sat', h: '50%', val: '₹760' },
 { day: 'Sun', h: '95%', val: '₹1860' }
 ].map((bar, i) => (
 <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
 <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded font-bold mb-1">
 {bar.val}
 </div>
 <div 
 className="bg-brand-500/80 w-full max-w-[40px] rounded-t-xl transition-all duration-500 group-hover:bg-brand-500 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.5)]" 
 style={{ height: bar.h }}
 ></div>
 <span className="text-[10px] text-slate-400 font-bold uppercase">{bar.day}</span>
 </div>
 ))}
 </div>
 </section>

 {/* Active Orders Queue Table */}
 <section className="bg-white border border-pink-200 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
 
 {/* Header & Filters */}
 <div className="p-6 border-b border-pink-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
 <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
 Recent Orders
 <span className="bg-pink-100 text-slate-600 text-[11px] font-bold px-2 py-1 rounded-md">{orders.length} TOTAL</span>
 </h3>

 <div className="flex flex-col sm:flex-row gap-3">
 {/* Search */}
 <div className="relative">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <input 
 type="text" 
 placeholder="Search orders..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full sm:w-64 pl-10 pr-4 py-2 bg-pink-50 border border-transparent focus:border-brand-500 rounded-lg text-sm outline-none transition-colors"
 />
 </div>
 {/* Filter */}
 <div className="relative">
 <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <select 
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="w-full sm:w-48 pl-9 pr-4 py-2.5 bg-white border border-pink-200 rounded-xl text-xs outline-none focus:border-brand-500 transition-colors appearance-none font-semibold text-slate-700 "
 >
 <option value="All">All Statuses</option>
 <option value="Placed">Placed (New)</option>
 <option value="Preparing">Preparing</option>
 <option value="Out-for-delivery">Out for Delivery</option>
 <option value="Delivered">Delivered</option>
 </select>
 </div>
 </div>
 </div>

 {loading ? (
 <div className="p-12 text-center text-slate-400 font-medium animate-pulse">Loading orders data...</div>
 ) : filteredOrders.length === 0 ? (
 <div className="p-12 text-center text-slate-400 font-medium">No orders found matching your filters.</div>
 ) : (
 <div className="overflow-x-auto w-full">
 <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
 <thead className="bg-pink-50 ">
 <tr className="border-b border-pink-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
 <th className="py-4 px-6">Order ID & Time</th>
 <th className="py-4 px-6">Customer Info</th>
 <th className="py-4 px-6">Amount</th>
 <th className="py-4 px-6">Status</th>
 <th className="py-4 px-6 text-right">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 font-medium text-slate-700 ">
 {filteredOrders.map((o) => (
 <tr key={o._id} className="hover:bg-pink-50/80 :bg-slate-800/40 transition-colors group">
 <td className="py-4 px-6">
 <div className="font-mono text-xs font-bold text-slate-900 ">{o._id}</div>
 <div className="text-[10px] text-slate-400 mt-1">
 {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
 </div>
 </td>
 <td className="py-4 px-6">
 <div className="font-bold text-slate-900 flex items-center gap-2">
 {o.user?.name}
 </div>
 <div className="text-[10px] text-slate-400 mt-0.5">{o.user?.email}</div>
 </td>
 <td className="py-4 px-6">
 <div className="font-black text-brand-500">₹{o.billDetails?.grandTotal}</div>
 <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5 border border-pink-200 inline-block px-1 rounded bg-pink-100 ">
 {o.paymentDetails?.method}
 </div>
 </td>
 <td className="py-4 px-6">
 <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full border ${getStatusColor(o.status)}`}>
 {o.status}
 </span>
 {o.riderName && (
 <div className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1 font-semibold">
 <Truck className="w-3 h-3" /> {o.riderName.split(' ')[1]}
 </div>
 )}
 </td>
 <td className="py-4 px-6 text-right">
 <button 
 onClick={() => { setSelectedOrder(o); setSelectedRider(''); }}
 className="inline-flex items-center gap-1 px-3 py-1.5 bg-pink-100 hover:bg-slate-200 :bg-slate-700 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-sm"
 >
 Manage <ChevronRight className="w-3 h-3" />
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </section>

 {/* Premium Sliding Drawer Modal for Order Details */}
 <AnimatePresence>
 {selectedOrder && (
 <div key="order-drawer-wrapper">
 <motion.div 
 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
 onClick={() => setSelectedOrder(null)}
 className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
 />
 <motion.div 
 initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
 transition={{ type: 'spring', damping: 25, stiffness: 200 }}
 className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-pink-200 "
 >
 {/* Drawer Header */}
 <div className="px-6 py-5 border-b border-pink-200 flex justify-between items-center bg-pink-50/50 ">
 <div>
 <h3 className="text-lg font-black text-slate-900 ">Order Details</h3>
 <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedOrder._id}</p>
 </div>
 <button 
 onClick={() => setSelectedOrder(null)} 
 className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 :bg-rose-500/10 rounded-full transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Drawer Content */}
 <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
 
 {/* Status Timeline */}
 <div>
 <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Live Tracking</h4>
 <div className="relative pl-3 space-y-6">
 <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-pink-100 "></div>
 
 {/* Placed */}
 <div className="relative flex items-start gap-4">
 <div className={`w-3 h-3 rounded-full mt-1 z-10 ${['placed', 'preparing', 'out-for-delivery', 'delivered'].includes(selectedOrder.status) ? 'bg-brand-500 ring-4 ring-brand-500/20' : 'bg-slate-300'}`}></div>
 <div>
 <p className="text-sm font-bold text-slate-800 ">Order Placed</p>
 <p className="text-[10px] text-slate-400 mt-0.5">Customer successfully paid</p>
 </div>
 </div>

 {/* Preparing */}
 <div className="relative flex items-start gap-4">
 <div className={`w-3 h-3 rounded-full mt-1 z-10 ${['preparing', 'out-for-delivery', 'delivered'].includes(selectedOrder.status) ? 'bg-orange-500 ring-4 ring-orange-500/20' : 'bg-slate-200 '}`}></div>
 <div>
 <p className="text-sm font-bold text-slate-800 ">Kitchen Preparing</p>
 {selectedOrder.status === 'placed' && (
 <button 
 onClick={() => handleUpdateStatus(selectedOrder._id, 'preparing')}
 className="mt-2 text-[10px] font-bold px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg shadow-md transition-all"
 >
 Accept & Start Preparing
 </button>
 )}
 </div>
 </div>

 {/* Out for Delivery */}
 <div className="relative flex items-start gap-4">
 <div className={`w-3 h-3 rounded-full mt-1 z-10 ${['out-for-delivery', 'delivered'].includes(selectedOrder.status) ? 'bg-purple-500 ring-4 ring-purple-500/20' : 'bg-slate-200 '}`}></div>
 <div className="w-full">
 <p className="text-sm font-bold text-slate-800 ">Out for Delivery</p>
 
 {/* Rider Assignment Block */}
 {selectedOrder.status === 'preparing' && (
 <div className="mt-3 p-3 bg-pink-50 border border-pink-200 rounded-xl space-y-2">
 <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Assign Partner</label>
 <select 
 value={selectedRider}
 onChange={(e) => setSelectedRider(e.target.value)}
 className="w-full px-3 py-2 rounded-lg border border-pink-200 bg-white text-xs outline-none text-slate-700 "
 >
 <option value="">Select an online rider...</option>
 {MOCK_RIDERS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
 </select>
 <button 
 onClick={handleAssignRider}
 disabled={!selectedRider}
 className="w-full py-2 bg-slate-900 disabled:bg-slate-300 :bg-slate-700 disabled:text-slate-500 hover:bg-brand-500 :bg-brand-500 hover:text-white text-white text-[10px] font-black rounded-lg transition-all uppercase tracking-wider"
 >
 Dispatch Order
 </button>
 </div>
 )}
 {selectedOrder.riderName && (
 <p className="text-[10px] font-semibold text-purple-500 mt-1 flex items-center gap-1">
 <Truck className="w-3 h-3" /> Assigned: {selectedOrder.riderName}
 </p>
 )}
 </div>
 </div>

 {/* Delivered */}
 <div className="relative flex items-start gap-4">
 <div className={`w-3 h-3 rounded-full mt-1 z-10 ${selectedOrder.status === 'delivered' ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-slate-200 '}`}></div>
 <div>
 <p className="text-sm font-bold text-slate-800 ">Delivered Successfully</p>
 </div>
 </div>

 </div>
 </div>

 {/* Customer Details */}
 <div className="p-4 bg-pink-50 border border-pink-200 rounded-2xl">
 <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3">Customer Information</h4>
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-black text-lg uppercase">
 {selectedOrder.user?.name?.charAt(0) || 'U'}
 </div>
 <div>
 <p className="text-sm font-bold text-slate-800 ">{selectedOrder.user?.name}</p>
 <p className="text-[10px] text-slate-500">{selectedOrder.user?.email}</p>
 </div>
 </div>
 </div>

 {/* Bill Summary */}
 <div className="p-4 border border-pink-200 rounded-2xl">
 <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3">Payment Summary</h4>
 <div className="space-y-2 text-xs font-semibold">
 <div className="flex justify-between">
 <span className="text-slate-500 flex items-center gap-1"><CreditCard className="w-3.5 h-3.5"/> Payment Method</span>
 <span className="uppercase text-slate-800 border px-1.5 py-0.5 rounded border-pink-200 ">{selectedOrder.paymentDetails?.method}</span>
 </div>
 {selectedOrder.paymentDetails?.paymentId && (
 <div className="flex justify-between pt-2 border-t border-pink-200 mt-2">
 <span className="text-slate-500">Transaction ID</span>
 <span className="font-mono text-[10px] text-slate-800 ">{selectedOrder.paymentDetails.paymentId}</span>
 </div>
 )}
 <div className="flex justify-between pt-2 border-t border-pink-200 mt-2">
 <span className="text-slate-800 font-bold">Total Amount</span>
 <span className="font-black text-brand-500 text-sm">₹{selectedOrder.billDetails?.grandTotal}</span>
 </div>
 </div>
 </div>

 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 </motion.div>
 )}

 {activeTab === 'Customers' && (
 <motion.div 
 key="customers"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 >
 <CustomersList />
 </motion.div>
 )}

 {activeTab === 'Payouts' && (
 <motion.div 
 key="payouts"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 >
 <PayoutsList />
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
};

export default Dashboard;
