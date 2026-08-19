import React, { useState } from 'react';
import API from '../../services/api.js';
import { Plus, Check, ShieldAlert, Ticket, ToggleLeft, ToggleRight } from 'lucide-react';

const BACKUP_COUPONS = [
 { _id: '1', code: 'BITE50', discountPercent: 50, maxDiscount: 250, minOrderValue: 200, isActive: true },
 { _id: '2', code: 'WELCOME100', discountPercent: 20, maxDiscount: 100, minOrderValue: 0, isActive: true },
 { _id: '3', code: 'WEEKEND30', discountPercent: 30, maxDiscount: 150, minOrderValue: 300, isActive: true }
];

const CouponManage = () => {
 const [coupons, setCoupons] = useState(BACKUP_COUPONS);
 const [code, setCode] = useState('');
 const [discountPercent, setDiscountPercent] = useState('');
 const [maxDiscount, setMaxDiscount] = useState('');
 const [minOrderValue, setMinOrderValue] = useState('');
 
 const [success, setSuccess] = useState('');
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);

 const handleCreateCoupon = async (e) => {
 e.preventDefault();
 setError('');
 setSuccess('');
 setLoading(true);

 try {
 const payload = {
 code: code.toUpperCase(),
 discountPercent: parseFloat(discountPercent),
 maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
 minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
 validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days default
 };

 const res = await API.post('/admin/coupons', payload); // Admin route POST /api/admin/coupons
 setCoupons(prev => [...prev, res.data]);
 setSuccess(`Coupon "${code.toUpperCase()}" launched successfully!`);
 resetForm();
 } catch (err) {
 console.warn('API error, saving coupon details locally:', err);
 
 const mockCoupon = {
 _id: `mock_cp_${Date.now()}`,
 code: code.toUpperCase(),
 discountPercent: parseFloat(discountPercent),
 maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
 minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
 isActive: true
 };

 setCoupons(prev => [...prev, mockCoupon]);
 setSuccess(`Simulated: Coupon "${code.toUpperCase()}" added locally.`);
 resetForm();
 } finally {
 setLoading(false);
 }
 };

 const resetForm = () => {
 setCode('');
 setDiscountPercent('');
 setMaxDiscount('');
 setMinOrderValue('');
 };

 const handleToggleStatus = async (couponId, currentStatus) => {
 try {
 await API.delete(`/admin/coupons/${couponId}`); // Admin route to toggle/deactivate coupon
 setCoupons(prev => prev.map(c => c._id === couponId ? { ...c, isActive: !currentStatus } : c));
 } catch (err) {
 setCoupons(prev => prev.map(c => c._id === couponId ? { ...c, isActive: !currentStatus } : c));
 }
 };

 return (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 
 {/* Left Form */}
 <div className="bg-white rounded-3xl p-6 border border-pink-200/60 shadow-premium h-fit">
 <h3 className="text-lg font-black border-b border-pink-200 pb-3 mb-4 flex items-center gap-2">
 <Plus className="w-5 h-5 text-brand-500" /> Launch Coupon
 </h3>

 {success && <p className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 mb-4 flex items-center gap-1"><Check className="w-4 h-4" /> {success}</p>}
 {error && <p className="text-[11px] font-bold text-rose-500 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 mb-4 flex items-center gap-1"><ShieldAlert className="w-4 h-4" /> {error}</p>}

 <form onSubmit={handleCreateCoupon} className="space-y-4">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Coupon Code</label>
 <input 
 type="text" 
 required
 placeholder="e.g. FESTIVE20"
 value={code}
 onChange={(e) => setCode(e.target.value)}
 className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-transparent outline-none focus:border-brand-500 text-sm uppercase font-mono font-bold"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Discount %</label>
 <input 
 type="number" 
 required
 max="100"
 min="1"
 placeholder="20"
 value={discountPercent}
 onChange={(e) => setDiscountPercent(e.target.value)}
 className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-transparent outline-none focus:border-brand-500 text-sm font-bold"
 />
 </div>
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Max Cap (₹)</label>
 <input 
 type="number" 
 placeholder="150"
 value={maxDiscount}
 onChange={(e) => setMaxDiscount(e.target.value)}
 className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-transparent outline-none focus:border-brand-500 text-sm font-bold"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Min Order Value (₹)</label>
 <input 
 type="number" 
 required
 placeholder="250"
 value={minOrderValue}
 onChange={(e) => setMinOrderValue(e.target.value)}
 className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-transparent outline-none focus:border-brand-500 text-sm font-bold"
 />
 </div>

 <button 
 type="submit"
 disabled={loading}
 className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-center flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all text-sm"
 >
 Create Coupon
 </button>
 </form>
 </div>

 {/* Right List */}
 <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-pink-200/60 shadow-premium">
 <h3 className="text-lg font-black border-b border-pink-200 pb-3 mb-4">Promo Campaign Pools</h3>

 <div className="overflow-x-auto w-full">
 <table className="w-full text-left text-sm border-collapse">
 <thead>
 <tr className="border-b border-pink-200 text-xs font-bold uppercase tracking-wider text-slate-400">
 <th className="py-3 px-4">Coupon Code</th>
 <th className="py-3 px-4">Discount</th>
 <th className="py-3 px-4">Min Spend</th>
 <th className="py-3 px-4">Active Status</th>
 <th className="py-3 px-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 font-semibold">
 {coupons.map((cp) => (
 <tr key={cp._id} className="hover:bg-pink-50 :bg-slate-850">
 <td className="py-3.5 px-4 font-mono font-bold text-xs uppercase tracking-wider text-brand-500">{cp.code}</td>
 <td className="py-3.5 px-4">{cp.discountPercent}% {cp.maxDiscount ? `(Up to ₹${cp.maxDiscount})` : ''}</td>
 <td className="py-3.5 px-4">₹{cp.minOrderValue}</td>
 <td className="py-3.5 px-4">
 <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full ${cp.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
 {cp.isActive ? 'Active' : 'Expired'}
 </span>
 </td>
 <td className="py-3.5 px-4 text-right">
 <button 
 onClick={() => handleToggleStatus(cp._id, cp.isActive)}
 className="p-1.5 text-slate-400 hover:text-brand-500"
 >
 {cp.isActive ? <ToggleRight className="w-6 h-6 text-brand-500" /> : <ToggleLeft className="w-6 h-6" />}
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 </div>
 );
};

export default CouponManage;
