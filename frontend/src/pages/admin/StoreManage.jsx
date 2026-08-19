import React, { useState } from 'react';
import API from '../../services/api.js';
import { Plus, Check, ShieldAlert, Store, ToggleLeft, ToggleRight } from 'lucide-react';

const BACKUP_STORES = [
 { _id: 'res-1', name: 'The Burger Craft & Co.', deliveryTime: 25, distance: 1.8, costForTwo: 500, isActive: true },
 { _id: 'res-2', name: 'La Piazza Woodfired', deliveryTime: 35, distance: 3.2, costForTwo: 800, isActive: true },
 { _id: 'res-3', name: 'Ninja Roll & Asian House', deliveryTime: 30, distance: 2.5, costForTwo: 900, isActive: true }
];

const StoreManage = () => {
 const [stores, setStores] = useState(BACKUP_STORES);
 const [name, setName] = useState('');
 const [cuisineTypes, setCuisineTypes] = useState('');
 const [deliveryTime, setDeliveryTime] = useState('');
 const [distance, setDistance] = useState('');
 const [costForTwo, setCostForTwo] = useState('');
 
 const [success, setSuccess] = useState('');
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);

 const handleCreateStore = async (e) => {
 e.preventDefault();
 setError('');
 setSuccess('');
 setLoading(true);

 try {
 const payload = {
 name,
 cuisineTypes: cuisineTypes.split(',').map(c => c.trim()),
 deliveryTime: parseInt(deliveryTime),
 distance: parseFloat(distance),
 costForTwo: parseInt(costForTwo),
 bannerImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80', // default mock banner
 featured: false
 };

 const res = await API.post('/stores', payload); // Admin endpoint mapped to POST /api/stores
 setStores(prev => [...prev, res.data]);
 setSuccess(`Store "${name}" registered successfully!`);
 resetForm();
 } catch (err) {
 console.warn('API error, completing action in local state:', err);

 const mockRes = {
 _id: `mock_res_${Date.now()}`,
 name,
 deliveryTime: parseInt(deliveryTime) || 30,
 distance: parseFloat(distance) || 2.0,
 costForTwo: parseInt(costForTwo) || 400,
 isActive: true
 };

 setStores(prev => [...prev, mockRes]);
 setSuccess(`Simulated: Store "${name}" added locally.`);
 resetForm();
 } finally {
 setLoading(false);
 }
 };

 const resetForm = () => {
 setName('');
 setCuisineTypes('');
 setDeliveryTime('');
 setDistance('');
 setCostForTwo('');
 };

 const handleToggleStatus = async (resId, currentStatus) => {
 try {
 await API.put(`/stores/${resId}`, { isActive: !currentStatus });
 setStores(prev => prev.map(r => r._id === resId ? { ...r, isActive: !currentStatus } : r));
 } catch (err) {
 setStores(prev => prev.map(r => r._id === resId ? { ...r, isActive: !currentStatus } : r));
 }
 };

 return (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 
 {/* Left Form */}
 <div className="bg-white rounded-3xl p-6 border border-pink-200/60 shadow-premium h-fit">
 <h3 className="text-lg font-black border-b border-pink-200 pb-3 mb-4 flex items-center gap-2">
 <Plus className="w-5 h-5 text-brand-500" /> Add Store
 </h3>

 {success && <p className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 mb-4 flex items-center gap-1"><Check className="w-4 h-4" /> {success}</p>}
 {error && <p className="text-[11px] font-bold text-rose-500 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 mb-4 flex items-center gap-1"><ShieldAlert className="w-4 h-4" /> {error}</p>}

 <form onSubmit={handleCreateStore} className="space-y-4">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Kitchen Name</label>
 <input 
 type="text" 
 required
 placeholder="e.g. Spice Route Bistro"
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-transparent outline-none focus:border-brand-500 text-sm"
 />
 </div>

 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Cuisines (Comma Separated)</label>
 <input 
 type="text" 
 required
 placeholder="e.g. Italian, Pasta, Pizza"
 value={cuisineTypes}
 onChange={(e) => setCuisineTypes(e.target.value)}
 className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-transparent outline-none focus:border-brand-500 text-sm"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Delivery Time (m)</label>
 <input 
 type="number" 
 required
 placeholder="30"
 value={deliveryTime}
 onChange={(e) => setDeliveryTime(e.target.value)}
 className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-transparent outline-none focus:border-brand-500 text-sm"
 />
 </div>
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Distance (km)</label>
 <input 
 type="number" 
 step="0.1"
 required
 placeholder="2.5"
 value={distance}
 onChange={(e) => setDistance(e.target.value)}
 className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-transparent outline-none focus:border-brand-500 text-sm"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Cost For Two (INR)</label>
 <input 
 type="number" 
 required
 placeholder="500"
 value={costForTwo}
 onChange={(e) => setCostForTwo(e.target.value)}
 className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-transparent outline-none focus:border-brand-500 text-sm"
 />
 </div>

 <button 
 type="submit"
 disabled={loading}
 className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-center flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all text-sm"
 >
 Add Kitchen
 </button>
 </form>
 </div>

 {/* Right List */}
 <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-pink-200/60 shadow-premium">
 <h3 className="text-lg font-black border-b border-pink-200 pb-3 mb-4">Kitchen Catalogs</h3>

 <div className="overflow-x-auto w-full">
 <table className="w-full text-left text-sm border-collapse">
 <thead>
 <tr className="border-b border-pink-200 text-xs font-bold uppercase tracking-wider text-slate-400">
 <th className="py-3 px-4">Store</th>
 <th className="py-3 px-4">Delivery Details</th>
 <th className="py-3 px-4">Cost for Two</th>
 <th className="py-3 px-4">Active State</th>
 <th className="py-3 px-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 font-semibold">
 {stores.map((res) => (
 <tr key={res._id} className="hover:bg-pink-50 :bg-slate-850">
 <td className="py-3.5 px-4">{res.name}</td>
 <td className="py-3.5 px-4">{res.deliveryTime}m | {res.distance}km</td>
 <td className="py-3.5 px-4">₹{res.costForTwo}</td>
 <td className="py-3.5 px-4">
 <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full ${res.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
 {res.isActive ? 'Active' : 'Disabled'}
 </span>
 </td>
 <td className="py-3.5 px-4 text-right">
 <button 
 onClick={() => handleToggleStatus(res._id, res.isActive)}
 className="p-1.5 text-slate-400 hover:text-brand-500"
 >
 {res.isActive ? <ToggleRight className="w-6 h-6 text-brand-500" /> : <ToggleLeft className="w-6 h-6" />}
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

export default StoreManage;
