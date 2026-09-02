import React, { useState } from 'react';
import { LineChart, BarChart, PieChart, TrendingUp, Users, Calendar, Download, Target, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const Analytics = () => {
 const [timeRange, setTimeRange] = useState('This Week');
 
 // Mock Data
 const weeklySales = [
 { day: 'Mon', revenue: 12500, orders: 45 },
 { day: 'Tue', revenue: 14200, orders: 52 },
 { day: 'Wed', revenue: 11800, orders: 41 },
 { day: 'Thu', revenue: 15600, orders: 58 },
 { day: 'Fri', revenue: 22400, orders: 85 },
 { day: 'Sat', revenue: 31500, orders: 120 },
 { day: 'Sun', revenue: 28900, orders: 105 },
 ];
 
  const peakHours = [
    { hour: '8 AM', intensity: 80 },
    { hour: '11 AM', intensity: 40 },
    { hour: '2 PM', intensity: 30 },
    { hour: '5 PM', intensity: 75 },
    { hour: '8 PM', intensity: 100 },
    { hour: '11 PM', intensity: 60 },
    { hour: '2 AM', intensity: 15 },
  ];

 const maxRevenue = Math.max(...weeklySales.map(d => d.revenue));

 return (
 <div className="max-w-6xl mx-auto space-y-6">
 
 {/* Header & Controls */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
 <div>
 <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
 <LineChart className="w-6 h-6 text-[#e31837]" /> Business Analytics
 </h2>
 <p className="text-sm text-slate-500 mt-1">Detailed insights into your store's performance and customer behavior.</p>
 </div>
 <div className="flex items-center gap-3 w-full sm:w-auto">
 <select 
 value={timeRange} 
 onChange={e => setTimeRange(e.target.value)}
 className="flex-1 sm:flex-none px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#e31837]"
 >
 <option>Today</option>
 <option>This Week</option>
 <option>This Month</option>
 <option>This Year</option>
 </select>
 <button className="px-4 py-2.5 bg-white border border-gray-200 text-slate-600 font-bold rounded-xl flex items-center gap-2 hover:bg-[#f5f6fa] :bg-slate-700 transition-all">
 <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 {/* Main Revenue Chart */}
 <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
 <div className="flex justify-between items-start mb-8">
 <div>
 <h3 className="text-lg font-black text-slate-800 mb-1">Revenue Overview</h3>
 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{timeRange}</p>
 </div>
 <div className="text-right">
 <p className="text-3xl font-black text-slate-900 ">₹1,36,900</p>
 <p className="text-xs font-bold text-emerald-500 flex items-center justify-end gap-1 mt-1">
 <TrendingUp className="w-3 h-3" /> +14.5% vs last week
 </p>
 </div>
 </div>
 
 {/* CSS Bar Chart */}
 <div className="h-64 flex items-end justify-between gap-2 mt-4">
 {weeklySales.map((data, idx) => {
 const heightPercentage = (data.revenue / maxRevenue) * 100;
 return (
 <div key={idx} className="flex flex-col items-center flex-1 group">
 <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-slate-500 mb-2 whitespace-nowrap">
 ₹{(data.revenue/1000).toFixed(1)}k
 </div>
 <div className="w-full max-w-[40px] bg-slate-100 rounded-t-xl relative overflow-hidden group-hover:bg-slate-200 :bg-slate-700 transition-colors" style={{ height: '100%' }}>
 <motion.div 
 initial={{ height: 0 }}
 animate={{ height: `${heightPercentage}%` }}
 transition={{ duration: 1, delay: idx * 0.1, type: 'spring' }}
 className={`absolute bottom-0 left-0 right-0 rounded-t-xl ${
 idx === 5 || idx === 6 ? 'bg-[#e31837] shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-brand-300 '
 }`}
 ></motion.div>
 </div>
 <span className="text-xs font-bold text-slate-400 mt-3">{data.day}</span>
 </div>
 );
 })}
 </div>
 </div>

 {/* Customer Insights */}
 <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col">
 <div className="flex items-center gap-2 mb-6">
 <Users className="w-5 h-5 text-purple-500" />
 <h3 className="text-lg font-black text-slate-800 ">Customer Insights</h3>
 </div>
 
  <div className="grid grid-cols-2 gap-4 mb-8">
  <div className="p-4 bg-[#f5f6fa] rounded-2xl border border-gray-200 ">
  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Delivery Time</p>
  <p className="text-2xl font-black text-slate-800 ">14 <span className="text-sm font-bold text-slate-500">mins</span></p>
  </div>
  <div className="p-4 bg-[#e31837]/10 rounded-2xl border border-brand-100 ">
  <p className="text-[10px] font-bold text-[#e31837] uppercase tracking-wider mb-1">Fulfillment Rate</p>
  <p className="text-2xl font-black text-[#c8102e] ">98.5%</p>
  </div>
  </div>

  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 mt-auto">Top Categories</h4>
  <div className="space-y-3">
  <div>
  <div className="flex justify-between text-xs font-bold mb-1">
  <span className="text-slate-600 ">Dairy & Breakfast</span>
  <span className="text-slate-800 ">45%</span>
  </div>
  <div className="w-full bg-slate-100 rounded-full h-2">
  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
  </div>
  </div>
  <div>
  <div className="flex justify-between text-xs font-bold mb-1">
  <span className="text-slate-600 ">Snacks & Beverages</span>
  <span className="text-slate-800 ">35%</span>
  </div>
  <div className="w-full bg-slate-100 rounded-full h-2">
  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div>
  </div>
  </div>
  <div>
  <div className="flex justify-between text-xs font-bold mb-1">
  <span className="text-slate-600 ">Personal Care</span>
  <span className="text-slate-800 ">20%</span>
  </div>
  <div className="w-full bg-slate-100 rounded-full h-2">
  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '20%' }}></div>
  </div>
  </div>
 </div>
 </div>

 {/* Peak Hours Heatmap */}
 <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm lg:col-span-2">
 <div className="flex items-center gap-2 mb-6">
 <Flame className="w-5 h-5 text-[#e31837]" />
 <h3 className="text-lg font-black text-slate-800 ">Peak Hours Analysis</h3>
 </div>
 
 <div className="flex items-end justify-between h-40 gap-1 mt-4">
 {peakHours.map((time, idx) => (
 <div key={idx} className="flex flex-col items-center flex-1 gap-2">
 <div className="w-full h-full bg-[#f5f6fa] rounded-xl relative overflow-hidden">
 <motion.div 
 initial={{ height: 0 }}
 animate={{ height: `${time.intensity}%` }}
 transition={{ duration: 1.5, type: 'spring' }}
 className={`absolute bottom-0 left-0 right-0 rounded-xl ${
 time.intensity > 80 ? 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.5)]' :
 time.intensity > 40 ? 'bg-gradient-to-t from-orange-500 to-orange-300' :
 'bg-gradient-to-t from-amber-400 to-amber-200'
 }`}
 ></motion.div>
 </div>
 <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{time.hour}</span>
 </div>
 ))}
 </div>
 </div>

 {/* Top Selling Products */}
 <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
 <div className="flex items-center gap-2 mb-6">
 <Target className="w-5 h-5 text-blue-500" />
 <h3 className="text-lg font-black text-slate-800 ">Top Performers</h3>
 </div>
 
 <div className="space-y-4">
 {[
 { name: 'Amul Taaza Milk 1L', category: 'Dairy', sales: 425, trend: '+12%' },
 { name: 'Harvest Gold Bread', category: 'Breakfast', sales: 856, trend: '+5%' },
 { name: 'Lays Magic Masala', category: 'Snacks', sales: 312, trend: '+22%' },
 { name: 'Eggs - 6 Pack', category: 'Essentials', sales: 298, trend: '-3%' },
 ].map((item, idx) => (
 <div key={idx} className="flex items-center justify-between p-3 bg-[#f5f6fa] rounded-2xl border border-gray-200 ">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">
 #{idx + 1}
 </div>
 <div>
 <h4 className="text-sm font-bold text-slate-800 ">{item.name}</h4>
 <p className="text-[10px] text-slate-500 font-semibold">{item.category}</p>
 </div>
 </div>
 <div className="text-right">
 <p className="text-sm font-black text-slate-900 ">{item.sales}</p>
 <p className={`text-[10px] font-bold ${item.trend.startsWith('+') ? 'text-emerald-500' : 'text-[#e31837]'}`}>
 {item.trend}
 </p>
 </div>
 </div>
 ))}
 </div>
 </div>

 </div>
 </div>
 );
};

export default Analytics;
