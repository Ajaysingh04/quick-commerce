import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
 Plus, Edit, Trash2, Search, Check, X as XIcon, Package, Image as ImageIcon, UploadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Inventory = () => {
 const [products, setProducts] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingProduct, setEditingProduct] = useState(null);
 
 const [formData, setFormData] = useState({
 name: '',
 description: '',
 price: '',
 originalPrice: '',
 stockQuantity: 100,
 weight: '',
 sku: '',
 category: '',
 image: '',
 isVeg: true,
 isBestseller: false,
 inStock: true
 });

 useEffect(() => {
 fetchInventory();
 }, []);

 const fetchInventory = async () => {
    try {
      const res = await API.get('/partner/menu');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch inventory from server.');
    } finally {
      setLoading(false);
    }
  };

 const handleStockToggle = async (id, currentStock) => {
    try {
      await API.put(`/partner/menu/${id}/stock`, { inStock: !currentStock });
      setProducts(prev => prev.map(f => f._id === id ? { ...f, inStock: !currentStock } : f));
    } catch (err) {
      alert('Failed to update stock status');
    }
  };

 const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await API.delete(`/partner/menu/${id}`);
        setProducts(prev => prev.filter(f => f._id !== id));
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

 const openModal = (product = null) => {
 if (product) {
 setEditingProduct(product);
 setFormData({
 name: product.name,
 description: product.description,
 price: product.price,
 originalPrice: product.originalPrice || '',
 stockQuantity: product.stockQuantity || 0,
 weight: product.weight || '',
 sku: product.sku || '',
 category: product.category?.name || '',
 image: product.image || '',
 isVeg: product.isVeg,
 isBestseller: product.isBestseller || false,
 inStock: product.inStock
 });
 } else {
 setEditingProduct(null);
 setFormData({
 name: '', description: '', price: '', originalPrice: '', stockQuantity: 100, weight: '', sku: '', category: '', image: '', isVeg: true, isBestseller: false, inStock: true
 });
 }
 setIsModalOpen(true);
 };

 const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const res = await API.put(`/partner/menu/${editingProduct._id}`, formData);
        setProducts(prev => prev.map(f => f._id === editingProduct._id ? res.data : f));
      } else {
        const res = await API.post('/partner/menu', formData);
        setProducts([res.data, ...products]);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save product');
    }
  };

 const filteredProducts = products.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

 if (loading) return <div className="p-8 text-center animate-pulse text-slate-500">Loading inventory...</div>;

 return (
 <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px] relative">
 
 {/* Header */}
 <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#f5f6fa]/50 ">
 <div>
 <h2 className="text-xl font-black text-slate-800 ">Inventory Management</h2>
 <p className="text-xs text-slate-500 mt-1">Manage your products, prices, and stock availability.</p>
 </div>
 <div className="flex gap-3 w-full sm:w-auto">
 <div className="relative flex-1 sm:w-64">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <input 
 type="text" 
 placeholder="Search products..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-semibold"
 />
 </div>
 <button onClick={() => openModal()} className="bg-[#e31837] text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#c8102e] transition-colors shadow-md shadow-[#e31837]/20 whitespace-nowrap">
 <Plus className="w-4 h-4" /> Add Product
 </button>
 </div>
 </div>

 {/* Inventory Table */}
 <div className="flex-1 overflow-auto custom-scrollbar">
 <table className="w-full text-left text-sm whitespace-nowrap">
 <thead className="bg-[#f5f6fa] sticky top-0 z-10">
 <tr className="border-b border-gray-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
 <th className="py-4 px-6">Product Name</th>
 <th className="py-4 px-6">Category</th>
 <th className="py-4 px-6">Price</th>
 <th className="py-4 px-6 text-center">Stock</th>
 <th className="py-4 px-6">Status</th>
 <th className="py-4 px-6 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 ">
 {filteredProducts.map((product) => (
 <tr key={product._id} className="hover:bg-[#f5f6fa]/80 :bg-slate-800/40 transition-colors group">
 <td className="py-4 px-6">
 <div className="flex items-center gap-3">
 <img 
 src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'} 
 alt={product.name} 
 className="w-10 h-10 rounded-lg object-cover bg-slate-100" 
 />
 <div>
 <div className="font-bold text-slate-900 flex items-center gap-2">
 {product.name}
 {product.isBestseller && <span className="bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-black">Bestseller</span>}
 </div>
 <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">{product.weight} | SKU: {product.sku || 'N/A'}</div>
 </div>
 </div>
 </td>
 <td className="py-4 px-6">
 <span className="text-xs font-semibold bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 ">
 {product.category?.name || 'Uncategorized'}
 </span>
 </td>
 <td className="py-4 px-6 font-black text-slate-800 ">
 ₹{product.price}
 {product.originalPrice && <span className="ml-2 text-xs text-slate-400 line-through">₹{product.originalPrice}</span>}
 </td>
 <td className="py-4 px-6 text-center">
 <span className={`font-bold ${product.stockQuantity < 10 ? 'text-red-500' : 'text-slate-700 '}`}>
 {product.stockQuantity}
 </span>
 </td>
 <td className="py-4 px-6">
 <button 
 onClick={() => handleStockToggle(product._id, product.inStock)}
 className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${
 product.inStock 
 ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' 
 : 'bg-rose-100 text-[#c8102e] hover:bg-rose-200'
 }`}
 >
 {product.inStock ? <><Check className="w-3 h-3"/> Active</> : <><XIcon className="w-3 h-3"/> Inactive</>}
 </button>
 </td>
 <td className="py-4 px-6 text-right">
 <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
 <button onClick={() => openModal(product)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 :bg-blue-500/10 rounded-lg transition-colors" title="Edit Item">
 <Edit className="w-4 h-4" />
 </button>
 <button onClick={() => handleDelete(product._id)} className="p-1.5 text-slate-400 hover:text-[#e31837] hover:bg-[#e31837]/10 :bg-[#e31837]/10 rounded-lg transition-colors" title="Delete Item">
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 {filteredProducts.length === 0 && (
 <div className="text-center py-12 text-slate-400">
 <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
 <p className="font-semibold text-sm">No products found.</p>
 </div>
 )}
 </div>

 {/* Add / Edit Modal */}
 <AnimatePresence>
 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
 >
 <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-[#f5f6fa]/50 ">
 <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
 {editingProduct ? <Edit className="w-5 h-5 text-[#e31837]"/> : <Plus className="w-5 h-5 text-[#e31837]"/>}
 {editingProduct ? 'Edit Product' : 'Add New Product'}
 </h3>
 <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 :text-slate-200 bg-slate-100 rounded-full transition-colors">
 <XIcon className="w-4 h-4" />
 </button>
 </div>

 <div className="p-6 overflow-y-auto custom-scrollbar">
 <form id="InventoryForm" onSubmit={handleSubmit} className="space-y-6">
 
 {/* Image Upload Area Mockup */}
 <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-[#f5f6fa] hover:bg-slate-100 :bg-slate-800 transition-colors cursor-pointer group">
 <UploadCloud className="w-8 h-8 mb-2 group-hover:text-[#e31837] transition-colors" />
 <p className="text-xs font-bold uppercase tracking-wider">Click to upload product image</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="md:col-span-2">
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Product Name</label>
 <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-semibold" placeholder="e.g. Fresh Milk" />
 </div>
 
 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Category</label>
 <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-semibold text-slate-700 ">
 <option value="">Select Category</option>
 <option value="Dairy">Dairy</option>
 <option value="Vegetables">Vegetables</option>
 <option value="Fruits">Fruits</option>
 <option value="Snacks">Snacks</option>
 <option value="Beverages">Beverages</option>
 </select>
 </div>
 
 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">SKU</label>
 <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-semibold" placeholder="e.g. DAIRY-001" />
 </div>

 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Price (₹)</label>
 <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-semibold" placeholder="e.g. 54" />
 </div>
 
 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Original Price (₹) (Optional)</label>
 <input type="number" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-semibold" placeholder="e.g. 60" />
 </div>
 
 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Stock Quantity</label>
 <input type="number" required value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-semibold" placeholder="e.g. 100" />
 </div>
 
 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Weight / Volume</label>
 <input type="text" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-semibold" placeholder="e.g. 500g, 1L" />
 </div>

 <div className="md:col-span-2">
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Description</label>
 <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-semibold resize-none custom-scrollbar" placeholder="Brief description of the product..."></textarea>
 </div>
 </div>

 {/* Tags & Properties */}
 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-3">Item Properties</label>
 <div className="flex flex-wrap gap-4">
 
 {/* Diet Type */}
 <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-xl flex-1 justify-center bg-[#f5f6fa] ">
 <input type="checkbox" checked={formData.isVeg} onChange={e => setFormData({...formData, isVeg: e.target.checked})} className="accent-green-500 w-4 h-4" />
 <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
 Veg <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
 </span>
 </label>
 
 <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-xl flex-1 justify-center bg-[#f5f6fa] ">
 <input type="checkbox" checked={!formData.isVeg} onChange={e => setFormData({...formData, isVeg: !e.target.checked})} className="accent-red-500 w-4 h-4" />
 <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
 Non-Veg <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
 </span>
 </label>

 </div>
 
 <div className="flex flex-wrap gap-4 mt-4">
 <label className="flex items-center gap-2 cursor-pointer">
 <input type="checkbox" checked={formData.isBestseller} onChange={e => setFormData({...formData, isBestseller: e.target.checked})} className="accent-brand-500 w-4 h-4 rounded" />
 <span className="text-sm font-semibold text-slate-600 ">Mark as Bestseller</span>
 </label>
 </div>
 </div>

 </form>
 </div>

 <div className="p-6 border-t border-gray-200 bg-[#f5f6fa]/50 flex justify-end gap-3">
 <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors hover:bg-slate-300 :bg-slate-700">
 Cancel
 </button>
 <button type="submit" form="InventoryForm" className="px-6 py-2.5 bg-[#e31837] text-white font-bold rounded-xl transition-colors hover:bg-[#c8102e] shadow-md shadow-[#e31837]/20">
 {editingProduct ? 'Save Changes' : 'Add Product'}
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 </div>
 );
};

export default Inventory;
