import React, { useState, useEffect } from 'react';
import API from '../../services/api.js';
import { Plus, Check, ShieldAlert, Store, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight, Star, Edit2, X } from 'lucide-react';

const StoreManage = () => {
 const [stores, setStores] = useState([]);
 const [name, setName] = useState('');
 const [cuisineTypes, setCuisineTypes] = useState('');
 const [deliveryTime, setDeliveryTime] = useState('');
 const [distance, setDistance] = useState('');
 const [costForTwo, setCostForTwo] = useState('');
 
 const [success, setSuccess] = useState('');
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const [pageLoading, setPageLoading] = useState(true);
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 8;
 const [isFeatured, setIsFeatured] = useState(false);
 const [bannerMode, setBannerMode] = useState('url'); // 'url' or 'file'
 const [bannerUrl, setBannerUrl] = useState('');
 const [bannerFile, setBannerFile] = useState(null);
 const [editingStoreId, setEditingStoreId] = useState(null);

 useEffect(() => {
   fetchStores();
 }, []);

 const fetchStores = async () => {
   setPageLoading(true);
   try {
     const res = await API.get('/stores');
     setStores(res.data);
   } catch (err) {
     console.error('Failed to fetch stores', err);
   } finally {
     setPageLoading(false);
   }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setError('');
 setSuccess('');
 setLoading(true);

 try {
 const formData = new FormData();
 formData.append('name', name);
 formData.append('cuisineTypes', cuisineTypes.split(',').map(c => c.trim()).join(','));
 formData.append('category', cuisineTypes.split(',').map(c => c.trim())[0] || 'Store');
 formData.append('deliveryTime', deliveryTime);
 formData.append('distance', distance);
 formData.append('costForTwo', costForTwo);
 formData.append('featured', isFeatured);

 if (bannerMode === 'file' && bannerFile) {
   formData.append('banner', bannerFile);
 } else if (bannerMode === 'url' && bannerUrl) {
   formData.append('bannerImageUrl', bannerUrl);
 } else if (!editingStoreId) {
   formData.append('bannerImageUrl', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80');
 }

 if (editingStoreId) {
   const res = await API.put(`/stores/${editingStoreId}`, formData);
   setStores(prev => prev.map(s => s._id === editingStoreId ? res.data : s));
   setSuccess(`Store "${name}" updated successfully!`);
 } else {
   const res = await API.post('/stores', formData); // Admin endpoint
   setStores(prev => [...prev, res.data]);
   setSuccess(`Store "${name}" registered successfully!`);
 }
 
 resetForm();
 } catch (err) {
 console.warn('API error, completing action in local state:', err);

 const mockRes = {
 _id: editingStoreId || `mock_res_${Date.now()}`,
 name,
 deliveryTime: parseInt(deliveryTime) || 30,
 distance: parseFloat(distance) || 2.0,
 costForTwo: parseInt(costForTwo) || 400,
 isActive: true
 };

 if (editingStoreId) {
   setStores(prev => prev.map(s => s._id === editingStoreId ? mockRes : s));
   setSuccess(`Simulated: Store "${name}" updated locally.`);
 } else {
   setStores(prev => [...prev, mockRes]);
   setSuccess(`Simulated: Store "${name}" added locally.`);
 }
 resetForm();
 } finally {
 setLoading(false);
 }
 };

 const handleEditClick = (store) => {
  setEditingStoreId(store._id);
  setName(store.name);
  setCuisineTypes(store.cuisineTypes?.join(', ') || store.category || '');
  setDeliveryTime(store.deliveryTime);
  setDistance(store.distance);
  setCostForTwo(store.costForTwo || '');
  setIsFeatured(store.featured || false);
  setBannerMode('url');
  setBannerUrl(store.bannerImage || '');
  setBannerFile(null);
  setError('');
  setSuccess('');
 };

 const resetForm = () => {
 setName('');
 setCuisineTypes('');
 setDeliveryTime('');
 setDistance('');
 setCostForTwo('');
 setIsFeatured(false);
 setBannerUrl('');
 setBannerFile(null);
 setEditingStoreId(null);
 };

 const handleToggleStatus = async (resId, currentStatus) => {
 try {
 await API.put(`/stores/${resId}`, { isActive: !currentStatus });
 setStores(prev => prev.map(r => r._id === resId ? { ...r, isActive: !currentStatus } : r));
 } catch (err) {
 setStores(prev => prev.map(r => r._id === resId ? { ...r, isActive: !currentStatus } : r));
 }
 };

 const handleToggleFeatured = async (resId, currentFeatured) => {
 try {
 await API.put(`/stores/${resId}`, { featured: !currentFeatured });
 setStores(prev => prev.map(r => r._id === resId ? { ...r, featured: !currentFeatured } : r));
 } catch (err) {
 setStores(prev => prev.map(r => r._id === resId ? { ...r, featured: !currentFeatured } : r));
 }
 };

 return (
 <div className="flex flex-col gap-8 w-full pb-20">
 
 {/* Left Form */}
 <div className="bg-white rounded-3xl p-6 border border-emerald-200/60 shadow-premium h-fit">
 <div className="flex justify-between items-center border-b border-emerald-200 pb-3 mb-4">
   <h3 className="text-lg font-black flex items-center gap-2">
   {editingStoreId ? <Edit2 className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-emerald-600" />} 
   {editingStoreId ? 'Edit Hub' : 'Add Hub'}
   </h3>
   {editingStoreId && (
     <button onClick={resetForm} className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1">
       <X className="w-4 h-4"/> Cancel
     </button>
   )}
 </div>

 {success && <p className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 mb-4 flex items-center gap-1"><Check className="w-4 h-4" /> {success}</p>}
 {error && <p className="text-[11px] font-bold text-rose-500 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 mb-4 flex items-center gap-1"><ShieldAlert className="w-4 h-4" /> {error}</p>}

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Hub Name</label>
 <input 
 type="text" 
 required
 placeholder="e.g. CP Delivery Hub"
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-transparent outline-none focus:border-emerald-600 text-sm"
 />
 </div>

 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Coverage Pincodes (Comma Separated)</label>
 <input 
 type="text" 
 required
 placeholder="e.g. 110001, 110002"
 value={cuisineTypes}
 onChange={(e) => setCuisineTypes(e.target.value)}
 className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-transparent outline-none focus:border-emerald-600 text-sm"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Delivery Time (m)</label>
 <input 
 type="number" 
 required
 placeholder="10"
 value={deliveryTime}
 onChange={(e) => setDeliveryTime(e.target.value)}
 className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-transparent outline-none focus:border-emerald-600 text-sm"
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
 className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-transparent outline-none focus:border-emerald-600 text-sm"
 />
 </div>
 </div>

  <div className="grid grid-cols-2 gap-4">
  <div>
  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Min Order Value (MOV)</label>
  <input 
  type="number" 
  required
  placeholder="99"
  value={costForTwo}
  onChange={(e) => setCostForTwo(e.target.value)}
  className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-transparent outline-none focus:border-emerald-600 text-sm"
  />
  </div>
  
  <div className="flex flex-col justify-end">
    <label className="flex items-center gap-2 cursor-pointer h-full pt-6">
      <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer" />
      <span className="text-sm font-bold text-slate-700">Mark as Featured</span>
    </label>
  </div>
  </div>

  <div className="border border-emerald-100 rounded-2xl p-4 bg-emerald-50/30">
    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Store Banner</label>
    <div className="flex gap-4 mb-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="radio" name="bannerMode" checked={bannerMode === 'url'} onChange={() => setBannerMode('url')} className="text-emerald-600 focus:ring-emerald-500" />
        <span className="text-sm font-semibold text-slate-700">Image URL</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="radio" name="bannerMode" checked={bannerMode === 'file'} onChange={() => setBannerMode('file')} className="text-emerald-600 focus:ring-emerald-500" />
        <span className="text-sm font-semibold text-slate-700">Upload File</span>
      </label>
    </div>
    
    {bannerMode === 'url' ? (
      <input 
      type="url" 
      placeholder="https://example.com/image.jpg"
      value={bannerUrl}
      onChange={(e) => setBannerUrl(e.target.value)}
      className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-white outline-none focus:border-emerald-600 text-sm"
      />
    ) : (
      <input 
      type="file" 
      accept="image/*"
      onChange={(e) => setBannerFile(e.target.files[0])}
      className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 bg-white outline-none focus:border-emerald-600 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
      />
    )}
  </div>

 <button 
 type="submit"
 disabled={loading}
 className={`w-full py-3.5 mt-2 rounded-xl text-white font-bold text-center flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all text-sm ${editingStoreId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
 >
 {editingStoreId ? 'Update Hub' : 'Add Hub'}
 </button>
 </form>
 </div>

 {/* Right List */}
 <div className="w-full bg-white rounded-3xl p-6 border border-emerald-200/60 shadow-premium">
 <h3 className="text-lg font-black border-b border-emerald-200 pb-3 mb-4">Dark Stores / Hubs Catalog</h3>

 <div className="overflow-x-auto w-full">
 <table className="w-full text-left text-sm border-collapse">
 <thead>
 <tr className="border-b border-emerald-200 text-xs font-bold uppercase tracking-wider text-slate-400">
 <th className="py-3 px-4">Hub Name</th>
 <th className="py-3 px-4">Delivery Details</th>
 <th className="py-3 px-4 text-center">Featured</th>
 <th className="py-3 px-4">Active State</th>
 <th className="py-3 px-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 font-semibold">
 {(() => {
   const indexOfLastItem = currentPage * itemsPerPage;
   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
   const currentItems = stores.slice(indexOfFirstItem, indexOfLastItem);
   
   if (stores.length === 0) {
     return (
       <tr>
         <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">No hubs found.</td>
       </tr>
     );
   }
   
   return currentItems.map((res) => (
 <tr key={res._id} className="hover:bg-emerald-50 :bg-slate-850">
 <td className="py-3.5 px-4 font-bold text-slate-800">{res.name}</td>
 <td className="py-3.5 px-4 text-xs font-semibold text-slate-500">{res.deliveryTime}m | {res.distance}km</td>
 <td className="py-3.5 px-4 text-center">
  <button onClick={() => handleToggleFeatured(res._id, res.featured)} className={`p-1.5 rounded-full transition-colors ${res.featured ? 'bg-amber-100 text-amber-500 hover:bg-amber-200' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}`}>
    <Star className="w-4 h-4" fill={res.featured ? "currentColor" : "none"} />
  </button>
 </td>
 <td className="py-3.5 px-4">
 <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full ${res.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
 {res.isActive ? 'Active' : 'Disabled'}
 </span>
 </td>
 <td className="py-3.5 px-4 text-right flex justify-end items-center gap-1">
 <button 
 onClick={() => handleEditClick(res)}
 className="p-1.5 text-slate-400 hover:text-amber-500"
 title="Edit Hub"
 >
   <Edit2 className="w-4 h-4" />
 </button>
 <button 
 onClick={() => handleToggleStatus(res._id, res.isActive)}
 className="p-1.5 text-slate-400 hover:text-emerald-600"
 title={res.isActive ? 'Disable Hub' : 'Enable Hub'}
 >
 {res.isActive ? <ToggleRight className="w-6 h-6 text-emerald-600" /> : <ToggleLeft className="w-6 h-6" />}
 </button>
 </td>
 </tr>
   ));
 })()}
 </tbody>
 </table>
 </div>
 
 {/* Pagination Footer */}
 {Math.ceil(stores.length / itemsPerPage) > 0 && (
   <div className="flex justify-between items-center px-6 py-4 border-t border-emerald-200/60 bg-emerald-50/30">
     <div className="text-xs font-bold text-slate-500">
       Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, stores.length)} of {stores.length}
     </div>
     <div className="flex items-center gap-1">
       <button 
         disabled={currentPage === 1}
         onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
         className="p-1 rounded-md text-slate-400 hover:text-slate-800 transition-colors disabled:opacity-50"
       ><ChevronLeft className="w-4 h-4" /></button>
       
       {Array.from({ length: Math.ceil(stores.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
         <button 
           key={page} 
           onClick={() => setCurrentPage(page)}
           className={`w-8 h-8 rounded-md text-xs font-bold flex items-center justify-center transition-colors ${
             page === currentPage ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'text-slate-500 hover:bg-slate-100'
           }`}
         >
           {page}
         </button>
       ))}
       
       <button 
         disabled={currentPage === Math.ceil(stores.length / itemsPerPage)}
         onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(stores.length / itemsPerPage)))}
         className="p-1 rounded-md text-slate-400 hover:text-slate-800 transition-colors disabled:opacity-50"
       ><ChevronRight className="w-4 h-4" /></button>
     </div>
   </div>
 )}
 
 </div>

 </div>
 );
};

export default StoreManage;
