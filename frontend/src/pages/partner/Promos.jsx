import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Gift, Percent, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../../services/api';

const Promos = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', type: 'percentage', value: '', expiry: '', usageLimit: '' });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await API.get('/partner/promos');
      setCoupons(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code) return;
    
    try {
      const res = await API.post('/partner/promos', newCoupon);
      setCoupons([res.data, ...coupons]);
      setIsAdding(false);
      setNewCoupon({ code: '', type: 'percentage', value: '', expiry: '', usageLimit: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add coupon');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/partner/promos/${id}`);
      setCoupons(coupons.filter(c => c._id !== id));
    } catch (err) {
      alert('Failed to delete coupon');
    }
  };

 return (
 <div className="max-w-6xl mx-auto space-y-6">
 
 {/* Header */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
 <div>
 <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
 <Tag className="w-6 h-6 text-[#e31837]" /> Promos & Offers
 </h2>
 <p className="text-sm text-slate-500 mt-1">Create discount coupons, BOGO offers, and festival campaigns.</p>
 </div>
 <button 
 onClick={() => setIsAdding(!isAdding)}
 className="px-6 py-2.5 bg-[#e31837] text-white font-bold rounded-xl flex items-center gap-2 hover:bg-[#c8102e] transition-all shadow-md shadow-[#e31837]/20"
 >
 <Plus className="w-4 h-4" /> {isAdding ? 'Cancel' : 'Create Coupon'}
 </button>
 </div>

 {/* Add Coupon Form */}
 {isAdding && (
 <motion.form 
 initial={{ opacity: 0, height: 0 }} 
 animate={{ opacity: 1, height: 'auto' }} 
 className="bg-white border border-[#e31837] rounded-3xl p-6 shadow-lg shadow-[#e31837]/10 overflow-hidden"
 onSubmit={handleAddCoupon}
 >
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Promo Code</label>
 <input type="text" placeholder="e.g. DIWALI20" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-black uppercase" required />
 </div>
 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Discount Type</label>
 <select value={newCoupon.type} onChange={e => setNewCoupon({...newCoupon, type: e.target.value})} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-semibold text-slate-700 ">
 <option value="percentage">Percentage (%)</option>
 <option value="flat">Flat Amount (₹)</option>
 <option value="bogo">Buy One Get One</option>
 </select>
 </div>
 {newCoupon.type !== 'bogo' && (
 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Discount Value</label>
 <input type="number" placeholder={newCoupon.type === 'percentage' ? "e.g. 50" : "e.g. 150"} value={newCoupon.value} onChange={e => setNewCoupon({...newCoupon, value: e.target.value})} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-semibold" required />
 </div>
 )}
 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Expiry Date</label>
 <input type="date" value={newCoupon.expiry} onChange={e => setNewCoupon({...newCoupon, expiry: e.target.value})} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-semibold text-slate-700 " required />
 </div>
 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Usage Limit</label>
 <input type="number" placeholder="Total times code can be used" value={newCoupon.usageLimit} onChange={e => setNewCoupon({...newCoupon, usageLimit: e.target.value})} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-semibold" required />
 </div>
 <div className="flex items-end">
 <button type="submit" className="w-full px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
 Save & Activate Coupon
 </button>
 </div>
 </div>
 </motion.form>
 )}

 {/* Coupons List */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {coupons.map((coupon) => (
 <div key={coupon._id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col relative overflow-hidden group">
 
 {/* Background design */}
 <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl opacity-20 ${
 coupon.isActive ? 'bg-emerald-500' : 'bg-[#f5f6fa]0'
 }`}></div>

 <div className="flex justify-between items-start mb-4 relative z-10">
 <div className="px-3 py-1 bg-slate-100 rounded-lg border border-dashed border-slate-300 ">
 <span className="font-mono font-black text-lg text-slate-900 tracking-widest">{coupon.code}</span>
 </div>
 <button onClick={() => handleDelete(coupon._id)} className="p-2 text-slate-300 hover:text-[#e31837] hover:bg-[#e31837]/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
 <Trash2 className="w-4 h-4" />
 </button>
 </div>

 <div className="flex items-center gap-3 mb-6 relative z-10">
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
 coupon.discountType === 'percentage' ? 'bg-purple-100 text-purple-600' :
 coupon.discountType === 'bogo' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
 }`}>
 {coupon.discountType === 'percentage' && <Percent className="w-5 h-5" />}
 {coupon.discountType === 'bogo' && <Gift className="w-5 h-5" />}
 {coupon.discountType === 'flat' && <Zap className="w-5 h-5" />}
 </div>
 <div>
 <h3 className="font-bold text-slate-800 ">
 {coupon.discountType === 'percentage' ? `${coupon.discountValue || coupon.discountPercent}% OFF` : 
 coupon.discountType === 'flat' ? `₹${coupon.discountValue} FLAT OFF` : 
 'BUY ONE GET ONE'}
 </h3>
 <p className="text-[10px] uppercase font-bold text-slate-400">Valid till {new Date(coupon.validTo).toLocaleDateString()}</p>
 </div>
 </div>

 <div className="mt-auto border-t border-gray-200 pt-4 flex items-center justify-between relative z-10">
 <div className="flex-1">
 <div className="flex justify-between text-xs font-semibold mb-1">
 <span className="text-slate-500">Usage limit</span>
 <span className="text-slate-900 ">{coupon.usedCount || 0} / {coupon.usageLimit || '∞'}</span>
 </div>
 <div className="w-full bg-slate-100 rounded-full h-1.5">
 <div className={`h-1.5 rounded-full ${coupon.isActive ? 'bg-[#e31837]' : 'bg-slate-400'}`} style={{ width: `${coupon.usageLimit ? ((coupon.usedCount || 0) / coupon.usageLimit) * 100 : 100}%` }}></div>
 </div>
 </div>
 <div className="ml-6">
 <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
 coupon.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-gray-200'
 }`}>
 {coupon.isActive ? 'Active' : 'Inactive'}
 </span>
 </div>
 </div>
 </div>
 ))}
 </div>

 </div>
 );
};

export default Promos;
