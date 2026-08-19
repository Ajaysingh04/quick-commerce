import React, { useState } from 'react';
import { Search, Filter, Calendar, MapPin, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const History = () => {
 const [filter, setFilter] = useState('all');

 const historyData = [
 {
 id: 'ORD-94182',
 date: '2026-07-28T11:20:00',
 store: 'The Burger Craft & Co.',
 pickup: 'Connaught Place',
 dropoff: 'Vasant Vihar',
 earnings: 120,
 distance: '4.2 km',
 time: '32 mins',
 status: 'completed'
 },
 {
 id: 'ORD-93021',
 date: '2026-07-27T19:40:00',
 store: 'La Piazza Woodfired',
 pickup: 'Khan Market',
 dropoff: 'Defence Colony',
 earnings: 180,
 distance: '5.1 km',
 time: '45 mins',
 status: 'completed'
 },
 {
 id: 'ORD-92144',
 date: '2026-07-27T13:15:00',
 store: 'Ninja Roll & Asian House',
 pickup: 'Hauz Khas',
 dropoff: 'Green Park',
 earnings: 140,
 distance: '2.8 km',
 time: '24 mins',
 status: 'completed'
 },
 {
 id: 'ORD-91002',
 date: '2026-07-26T20:10:00',
 store: 'Spicy Route',
 pickup: 'Rajouri Garden',
 dropoff: 'Punjabi Bagh',
 earnings: 95,
 distance: '1.5 km',
 time: '18 mins',
 status: 'cancelled'
 },
 {
 id: 'ORD-89412',
 date: '2026-07-25T14:30:00',
 store: 'Vegan Bites',
 pickup: 'Saket',
 dropoff: 'Malviya Nagar',
 earnings: 110,
 distance: '3.0 km',
 time: '28 mins',
 status: 'completed'
 }
 ];

 const filteredHistory = historyData.filter(item => {
 if (filter === 'all') return true;
 if (filter === 'completed') return item.status === 'completed';
 if (filter === 'cancelled') return item.status === 'cancelled';
 return true;
 });

 const formatDate = (dateString) => {
 const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
 return new Date(dateString).toLocaleDateString('en-US', options);
 };

 return (
 <div className="max-w-5xl mx-auto space-y-6 pb-12">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
 <div>
 <h1 className="text-2xl font-bold text-slate-900 mb-2">Delivery History</h1>
 <p className="text-slate-600">Review your past deliveries and performance.</p>
 </div>
 
 <div className="flex items-center gap-3 w-full md:w-auto">
 <div className="relative flex-1 md:w-64">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
 <input 
 type="text" 
 placeholder="Search Order ID..." 
 className="w-full bg-white border border-gray-200 border border-gray-200 text-slate-900 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-[#e31837] transition-colors"
 />
 </div>
 <button className="p-2 bg-white border border-gray-200 border border-gray-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
 <Filter size={20} />
 </button>
 </div>
 </div>

 {/* Filters */}
 <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
 {['all', 'completed', 'cancelled'].map(f => (
 <button
 key={f}
 onClick={() => setFilter(f)}
 className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap capitalize ${
 filter === f 
 ? 'bg-[#e31837] text-white shadow-lg shadow-[#e31837]/20' 
 : 'bg-white border border-gray-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-gray-200'
 }`}
 >
 {f} Deliveries
 </button>
 ))}
 </div>

 {/* History List */}
 <div className="space-y-4">
 {filteredHistory.map((order, i) => (
 <motion.div 
 key={order.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.05 }}
 className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 hover:bg-white border border-gray-200 transition-colors"
 >
 <div className="flex flex-col md:flex-row justify-between gap-4">
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-3">
 <div className={`p-2 rounded-lg ${order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
 {order.status === 'completed' ? <CheckCircle size={18} /> : <Clock size={18} />}
 </div>
 <div>
 <h3 className="text-lg font-bold text-slate-900">{order.store}</h3>
 <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
 <span>{order.id}</span>
 <span>•</span>
 <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(order.date)}</span>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-4 text-sm text-slate-300 ml-12">
 <div className="flex items-center gap-1.5">
 <MapPin size={14} className="text-[#e31837]" />
 <span>{order.pickup}</span>
 </div>
 <div className="w-4 h-[1px] bg-slate-600"></div>
 <div className="flex items-center gap-1.5">
 <MapPin size={14} className="text-emerald-500" />
 <span>{order.dropoff}</span>
 </div>
 </div>
 </div>

 <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 min-w-[120px]">
 <div className="text-2xl font-black text-emerald-400">
 ₹{order.earnings}
 </div>
 <div className="flex gap-3 text-xs text-slate-600 font-medium mt-1">
 <span>{order.distance}</span>
 <span>•</span>
 <span>{order.time}</span>
 </div>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 </div>
 );
};

export default History;
