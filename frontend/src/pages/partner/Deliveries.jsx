import React, { useState, useEffect } from 'react';
import { Bike, Clock, MapPin, Phone, Star, Activity, AlertCircle, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

const Deliveries = () => {
 const [activeTab, setActiveTab] = useState('live');

 // Mock Data
 const [activeDeliveries, setActiveDeliveries] = useState([
 { id: '#ORD-9021', rider: 'Rajesh Kumar', phone: '+91 98765 43210', status: 'On the way to customer', eta: 12, distance: 3.2, assignedAt: '10 mins ago', rating: 4.8, mapX: 50, mapY: 50 },
 { id: '#ORD-9024', rider: 'Amit Singh', phone: '+91 87654 32109', status: 'Arriving at Dark Store', eta: 2, distance: 0.5, assignedAt: '5 mins ago', rating: 4.5, mapX: 70, mapY: 30 },
 ]);

 useEffect(() => {
 if (activeTab !== 'live') return;
 const interval = setInterval(() => {
 setActiveDeliveries(prev => prev.map(delivery => {
 if (delivery.eta <= 0) return delivery;
 return {
 ...delivery,
 eta: Math.max(0, delivery.eta - 1),
 distance: Math.max(0, +(delivery.distance - 0.2).toFixed(1)),
 mapX: delivery.mapX + (Math.random() * 10 - 5),
 mapY: delivery.mapY + (Math.random() * 10 - 5),
 };
 }));
 }, 5000); // Update every 5 seconds for simulation
 return () => clearInterval(interval);
 }, [activeTab]);

 const pastDeliveries = [
 { id: '#ORD-8990', rider: 'Suresh Verma', time: 'Today, 1:45 PM', status: 'Delivered', duration: '28 mins' },
 { id: '#ORD-8985', rider: 'Rahul Das', time: 'Today, 12:30 PM', status: 'Delivered', duration: '35 mins' },
 { id: '#ORD-8970', rider: 'Vikash Jain', time: 'Yesterday, 8:15 PM', status: 'Delayed', duration: '55 mins' },
 ];

 return (
 <div className="max-w-6xl mx-auto space-y-6">
 
 {/* Header */}
 <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
 <Bike className="w-6 h-6 text-[#e31837]" /> Delivery Management
 </h2>
 <p className="text-sm text-slate-500 mt-1">Track active riders, view delivery performance, and manage logistics.</p>
 </div>
 
 {/* Performance Metrics */}
 <div className="flex gap-4">
 <div className="text-center px-4 border-r border-gray-200 ">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Handover</p>
 <p className="text-xl font-black text-slate-800 ">4.5m</p>
 </div>
 <div className="text-center px-4">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Delivery</p>
 <p className="text-xl font-black text-slate-800 ">28m</p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 {/* Main Content Area */}
 <div className="lg:col-span-2 space-y-6">
 
 {/* Tabs */}
 <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-max">
 <button 
 onClick={() => setActiveTab('live')}
 className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
 activeTab === 'live' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 :text-slate-300'
 }`}
 >
 Live Tracking (2)
 </button>
 <button 
 onClick={() => setActiveTab('history')}
 className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
 activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 :text-slate-300'
 }`}
 >
 Delivery History
 </button>
 </div>

 {activeTab === 'live' ? (
 <div className="space-y-4">
 {activeDeliveries.map((delivery, idx) => (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.1 }}
 key={delivery.id} 
 className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6"
 >
 {/* Map Mockup Area */}
 <div className="w-full md:w-48 h-32 bg-slate-100 rounded-2xl border border-gray-200 flex items-center justify-center relative overflow-hidden">
 <img src="https://www.transparenttextures.com/patterns/cartographer.png" className="absolute inset-0 opacity-20 object-cover" alt="map" />
 <motion.div 
 animate={{ left: `${Math.max(10, Math.min(90, delivery.mapX))}%`, top: `${Math.max(10, Math.min(90, delivery.mapY))}%` }}
 transition={{ type: 'spring', damping: 20 }}
 className="absolute -translate-x-1/2 -translate-y-1/2"
 >
 <div className="absolute inset-0 w-full h-full bg-[#e31837]/30 rounded-full animate-ping"></div>
 <div className="relative z-10 w-8 h-8 bg-[#e31837] rounded-full border-2 border-white shadow-lg flex items-center justify-center">
 <Bike className="w-4 h-4 text-white" />
 </div>
 </motion.div>
 </div>

 {/* Details */}
 <div className="flex-1 flex flex-col justify-between">
 <div className="flex justify-between items-start mb-2">
 <div>
 <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">
 {delivery.id}
 </span>
 <h3 className="text-lg font-black text-slate-800 mt-1">{delivery.rider}</h3>
 <div className="flex items-center gap-3 mt-1">
 <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
 <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {delivery.rating}
 </p>
 <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
 <Phone className="w-3 h-3" /> {delivery.phone}
 </p>
 </div>
 </div>
 <div className="text-right">
 <p className="text-xl font-black text-[#e31837]">{delivery.eta} mins</p>
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ETA • {delivery.distance} km</p>
 </div>
 </div>

 <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
 <div className="flex items-center gap-2">
 <Activity className={`w-4 h-4 ${delivery.status.includes('customer') ? 'text-blue-500' : 'text-amber-500'}`} />
 <span className="text-xs font-bold text-slate-700 ">{delivery.status}</span>
 </div>
 <span className="text-[10px] font-bold text-slate-400">Assigned {delivery.assignedAt}</span>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 ) : (
 <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm overflow-x-auto custom-scrollbar">
 <table className="w-full text-left text-sm whitespace-nowrap">
 <thead className="bg-[#f5f6fa] text-xs uppercase font-bold text-slate-500 tracking-wider">
 <tr>
 <th className="px-6 py-4">Order ID</th>
 <th className="px-6 py-4">Rider</th>
 <th className="px-6 py-4">Time</th>
 <th className="px-6 py-4">Duration</th>
 <th className="px-6 py-4 text-right">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 ">
 {pastDeliveries.map((delivery) => (
 <tr key={delivery.id} className="hover:bg-[#f5f6fa] :bg-slate-800/20 transition-colors">
 <td className="px-6 py-4 font-mono font-bold text-slate-600 ">{delivery.id}</td>
 <td className="px-6 py-4 font-bold text-slate-800 ">{delivery.rider}</td>
 <td className="px-6 py-4 text-slate-500 font-medium">{delivery.time}</td>
 <td className="px-6 py-4 text-slate-600 font-semibold">{delivery.duration}</td>
 <td className="px-6 py-4 text-right">
 <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
 delivery.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-[#e31837]/10 text-[#c8102e] border border-rose-200'
 }`}>
 {delivery.status}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 </div>

 {/* Sidebar */}
 <div className="space-y-6">
 <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
 <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
 <Navigation className="w-5 h-5 text-blue-500" /> Dispatch Center
 </h3>
 <div className="space-y-4">
 <div className="p-4 bg-[#f5f6fa] border border-gray-200 rounded-2xl">
 <div className="flex justify-between items-center mb-1">
 <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Riders Nearby</span>
 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
 </div>
 <p className="text-3xl font-black text-slate-800 ">12</p>
 <p className="text-[10px] font-bold text-emerald-500 mt-1">High availability in your area</p>
 </div>

 <div className="space-y-3">
 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Automated Dispatch</h4>
 <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl">
 <div>
 <p className="text-sm font-bold text-slate-800 ">Auto-Assign Rider</p>
 <p className="text-[10px] text-slate-500 font-medium">Assign nearest rider when order is prepared</p>
 </div>
 <div className="w-10 h-6 bg-[#e31837] rounded-full p-1 cursor-pointer">
 <div className="w-4 h-4 bg-white rounded-full shadow-sm ml-auto"></div>
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
 <div className="flex items-start gap-3">
 <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
 <div>
 <h4 className="text-sm font-bold text-amber-800 mb-1">High Order Volume</h4>
 <p className="text-xs font-semibold text-amber-700/80 leading-relaxed">
 Delivery times might be delayed by 5-10 minutes due to peak hours and rain in your area. Riders are being dynamically routed.
 </p>
 </div>
 </div>
 </div>
 </div>

 </div>
 </div>
 );
};

export default Deliveries;
