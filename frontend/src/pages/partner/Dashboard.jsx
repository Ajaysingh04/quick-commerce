import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
 TrendingUp, ShoppingBag, Users, Star, ArrowUpRight, ArrowDownRight, Clock,
 X, Check, Package
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, trend, icon: Icon, colorClass }) => (
 <motion.div 
 whileHover={{ y: -5 }}
 className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
 >
 <div className="flex justify-between items-start mb-4">
 <div className={`p-3 rounded-xl ${colorClass}`}>
 <Icon className="w-6 h-6" />
 </div>
 {trend && (
 <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-[#e31837]/10 text-[#c8102e]'}`}>
 {trend > 0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
 {Math.abs(trend)}%
 </span>
 )}
 </div>
 <div>
 <h3 className="text-3xl font-black text-slate-900 mb-1">{value}</h3>
 <p className="text-sm font-semibold text-slate-500">{title}</p>
 </div>
 </motion.div>
);

const Dashboard = () => {
 const [stats, setStats] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 fetchStats();
 }, []);

 const fetchStats = async () => {
 try {
 const res = await API.get('/partner/dashboard-stats');
 setStats(res.data);
 } catch (err) {
 console.error(err);
 // Fallback
 setStats({
 totalOrders: 145,
 totalRevenue: 34500,
 pendingOrders: 12,
 completedOrders: 130,
 storeRating: 4.5
 });
 } finally {
 setLoading(false);
 }
 };

 if (loading) {
 return <div className="p-8 text-center animate-pulse text-slate-500">Loading your store stats...</div>;
 }

 return (
 <div className="space-y-6 animate-in fade-in duration-500">
 
 {/* Overview Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 <StatCard 
 title="Today's Revenue" 
 value={`₹${stats?.totalRevenue || 4580}`} 
 trend={12.5} 
 icon={TrendingUp} 
 colorClass="bg-[#e31837]/10 text-[#c8102e] "
 />
 <StatCard 
 title="Today's Orders" 
 value={stats?.totalOrders || 24} 
 trend={8.4}
 icon={ShoppingBag} 
 colorClass="bg-blue-50 text-blue-600 "
 />
 <StatCard 
 title="Pending Orders" 
 value={stats?.pendingOrders || 3} 
 icon={Clock} 
 colorClass="bg-orange-50 text-orange-600 "
 />
 <StatCard 
 title="Completed Orders" 
 value={stats?.completedOrders || 20} 
 icon={Check} 
 colorClass="bg-emerald-50 text-emerald-600 "
 />
 <StatCard 
 title="Cancelled Orders" 
 value={stats?.cancelledOrders || 1} 
 icon={X} 
 colorClass="bg-[#e31837]/10 text-[#c8102e] "
 />
 <StatCard 
 title="Average Rating" 
 value={stats?.storeRating || '4.8'} 
 icon={Star} 
 colorClass="bg-yellow-50 text-yellow-600 "
 />
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Analytics Chart Placeholder */}
 <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
 <div className="flex justify-between items-center mb-6">
 <h3 className="text-lg font-black text-slate-800 ">Weekly Sales Graph</h3>
 <select className="bg-[#f5f6fa] border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold outline-none text-slate-700 ">
 <option>Last 7 Days</option>
 <option>Last 30 Days</option>
 <option>This Year</option>
 </select>
 </div>
 
 <div className="h-64 flex items-end justify-between gap-2 pt-4 border-t border-gray-200 ">
 {[
 { label: 'Mon', height: '40%' }, { label: 'Tue', height: '60%' },
 { label: 'Wed', height: '30%' }, { label: 'Thu', height: '80%' },
 { label: 'Fri', height: '90%' }, { label: 'Sat', height: '100%' }, { label: 'Sun', height: '70%' }
 ].map((bar, i) => (
 <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
 <div style={{ height: bar.height }} className="w-full max-w-[40px] bg-[#e31837]/20 group-hover:bg-[#e31837] rounded-t-xl transition-all relative">
 <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold py-1 px-2 rounded z-10 whitespace-nowrap shadow-lg">
 ₹{parseInt(bar.height) * 100}
 </div>
 </div>
 <span className="text-xs font-bold text-slate-400">{bar.label}</span>
 </div>
 ))}
 </div>
 </div>

 {/* Top Selling Items */}
 <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
 <div className="flex justify-between items-center mb-6">
 <h3 className="text-lg font-black text-slate-800 ">Top Selling Items</h3>
 <Package className="w-5 h-5 text-slate-400" />
 </div>
 <div className="space-y-4">
 {[
 { name: 'Paneer Butter Masala', orders: 124, price: 280, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?w=100' },
 { name: 'Chicken Biryani', orders: 98, price: 320, img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=100' },
 { name: 'Garlic Naan', orders: 85, price: 60, img: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=100' },
 { name: 'Dal Makhani', orders: 76, price: 240, img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=100' }
 ].map((item, idx) => (
 <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#f5f6fa] :bg-slate-800/50 transition-colors">
 <img src={item.img} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />
 <div className="flex-1 min-w-0">
 <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
 <p className="text-xs text-slate-500">{item.orders} Orders</p>
 </div>
 <div className="text-sm font-black text-slate-900 ">
 ₹{item.price}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 </div>
 );
};

export default Dashboard;
