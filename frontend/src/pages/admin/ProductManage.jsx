import React, { useState, useEffect } from 'react';
import API from '../../services/api.js';
import { Plus, Check, X, ShieldAlert, Trash2, ToggleLeft, ToggleRight, Utensils, ChefHat, Layers, IndianRupee, Search, Package } from 'lucide-react';

const BACKUP_CATALOG = [
 { _id: '1', name: 'Amul Taaza Toned Fresh Milk', price: 54, originalPrice: 56, weight: '1 L', stockQuantity: 150, sku: 'DAIRY-001', isVeg: true, inStock: true, description: 'Fresh toned milk', store: { name: 'Quick Commerce Store' }, category: { name: 'Dairy' }, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=100&q=80' },
 { _id: '2', name: 'Britannia Good Day Cashew Cookies', price: 20, originalPrice: 25, weight: '72 g', stockQuantity: 300, sku: 'SNK-002', isVeg: true, inStock: true, description: 'Rich cashew cookies', store: { name: 'Quick Commerce Store' }, category: { name: 'Snacks' }, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=100&q=80' },
 { _id: '3', name: 'Fresh Onion (Pyaz)', price: 45, originalPrice: 60, weight: '1 kg', stockQuantity: 0, sku: 'VEG-003', isVeg: true, inStock: false, description: 'Farm fresh onions', store: { name: 'Quick Commerce Store' }, category: { name: 'Vegetables' }, image: 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?auto=format&fit=crop&w=100&q=80' }
];

const ProductManage = () => {
 const [products, setProducts] = useState([]);
 const [storesList, setStoresList] = useState([]);
 const [categoriesList, setCategoriesList] = useState([]);
 
 const [name, setName] = useState('');
 const [price, setPrice] = useState('');
 const [originalPrice, setOriginalPrice] = useState('');
 const [weight, setWeight] = useState('');
 const [sku, setSku] = useState('');
 const [stockQuantity, setStockQuantity] = useState(100);
 const [isVeg, setIsVeg] = useState(true);
 const [description, setDescription] = useState('');
 const [image, setImage] = useState('');
 const [selectedStore, setSelectedStore] = useState('');
 const [selectedCategory, setSelectedCategory] = useState('');

 const [searchQuery, setSearchQuery] = useState('');
 const [filterVeg, setFilterVeg] = useState('all');
 
 const [success, setSuccess] = useState('');
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);

 useEffect(() => {
 fetchInitialData();
 }, []);

 const fetchInitialData = async () => {
 setLoading(true);
 try {
 // 1. Fetch products list
 const productsRes = await API.get('/products?all=true');
 setProducts(productsRes.data);
 
 // 2. Fetch stores list
 const restRes = await API.get('/stores');
 setStoresList(restRes.data);
 if (restRes.data.length > 0) {
 setSelectedStore(restRes.data[0]._id);
 }
 
 // 3. Fetch categories list
 const catRes = await API.get('/products/categories');
 setCategoriesList(catRes.data);
 if (catRes.data.length > 0) {
 setSelectedCategory(catRes.data[0]._id);
 }
 } catch (err) {
 console.warn('API error loading initial admin data, using backups:', err);
 setProducts(BACKUP_CATALOG);
 setStoresList([
 { _id: 'store-1', name: 'Quick Commerce Store' }
 ]);
 setSelectedStore('store-1');

 setCategoriesList([
 { _id: 'cat-dairy', name: 'Dairy' },
 { _id: 'cat-snacks', name: 'Snacks' },
 { _id: 'cat-veg', name: 'Vegetables' }
 ]);
 setSelectedCategory('cat-dairy');
 } finally {
 setLoading(false);
 }
 };

 const handleCreateProduct = async (e) => {
 e.preventDefault();
 setError('');
 setSuccess('');

 if (!selectedStore || !selectedCategory) {
 setError('Please select a store and a category first.');
 return;
 }

 try {
 const payload = {
 name,
 price: parseFloat(price),
 originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
 weight,
 sku,
 stockQuantity: parseInt(stockQuantity),
 isVeg,
 description,
 image: image || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80',
 category: selectedCategory,
 store: selectedStore
 };

 await API.post('/products', payload);
 
 // Re-fetch list to ensure fully populated data
 const updateRes = await API.get('/products?all=true');
 setProducts(updateRes.data);

 setSuccess(`Product "${name}" added successfully!`);
 resetForm();
 } catch (err) {
 console.warn('API error adding product, completing locally:', err);
 
 const mockDish = {
 _id: `mock_prod_${Date.now()}`,
 name,
 price: parseFloat(price),
 originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
 weight,
 sku,
 stockQuantity: parseInt(stockQuantity),
 isVeg,
 inStock: parseInt(stockQuantity) > 0,
 description,
 image: image || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80',
 store: { name: storesList.find(r => r._id === selectedStore)?.name || 'Backup Store' },
 category: { name: categoriesList.find(c => c._id === selectedCategory)?.name || 'General' }
 };

 setProducts(prev => [...prev, mockDish]);
 setSuccess(`Simulated: Product "${name}" added locally.`);
 resetForm();
 }
 };

 const resetForm = () => {
 setName('');
 setPrice('');
 setOriginalPrice('');
 setWeight('');
 setSku('');
 setStockQuantity(100);
 setIsVeg(true);
 setDescription('');
 setImage('');
 };

 const handleToggleStock = async (dishId, currentStatus) => {
 try {
 await API.put(`/products/${dishId}`, { inStock: !currentStatus });
 setProducts(prev => prev.map(f => f._id === dishId ? { ...f, inStock: !currentStatus } : f));
 } catch (err) {
 setProducts(prev => prev.map(f => f._id === dishId ? { ...f, inStock: !currentStatus } : f));
 }
 };

 const handleDeleteProduct = async (dishId) => {
 if (!window.confirm('Are you sure you want to delete this product?')) return;
 try {
 await API.delete(`/products/${dishId}`);
 setProducts(prev => prev.filter(f => f._id !== dishId));
 setSuccess('Product deleted successfully.');
 } catch (err) {
 setProducts(prev => prev.filter(f => f._id !== dishId));
 setSuccess('Simulated: Product deleted locally.');
 }
 };

 const filteredCatalog = products.filter(product => {
 const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
 (product.store?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
 const matchesVeg = filterVeg === 'all' ? true : (filterVeg === 'veg' ? product.isVeg : !product.isVeg);
 return matchesSearch && matchesVeg;
 });

 if (loading) {
 return <div className="p-10 text-center text-slate-500 animate-pulse">Loading Global Inventory...</div>;
 }

 return (
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
 
 {/* Header */}
 <div className="bg-white border border-pink-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm relative overflow-hidden">
 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
 <div className="relative z-10">
 <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
 <Package className="w-8 h-8 text-emerald-500" />
 Global Inventory Management
 </h1>
 <p className="text-slate-500 mt-2 font-medium">Add, edit, or remove products across all Dark Stores.</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 {/* ADD NEW PRODUCT FORM */}
 <div className="lg:col-span-1">
 <div className="bg-white border border-pink-200 rounded-3xl p-6 shadow-sm sticky top-6">
 <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
 <Plus className="w-5 h-5 text-emerald-500" /> Add New Product
 </h2>
 
 {error && (
 <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-semibold flex items-start gap-2 border border-red-100">
 <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
 {error}
 </div>
 )}
 {success && (
 <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl mb-4 text-sm font-semibold flex items-start gap-2 border border-emerald-100">
 <Check className="w-4 h-4 mt-0.5 shrink-0" />
 {success}
 </div>
 )}

 <form onSubmit={handleCreateProduct} className="space-y-4">
 
 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Product Name</label>
 <input 
 type="text" 
 required 
 value={name} 
 onChange={e => setName(e.target.value)} 
 className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-semibold text-slate-800 "
 placeholder="e.g., Farm Fresh Apples"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Price (₹)</label>
 <div className="relative">
 <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
 <input 
 type="number" 
 required 
 value={price} 
 onChange={e => setPrice(e.target.value)} 
 className="w-full pl-9 pr-4 py-3 bg-pink-50 border border-pink-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-bold text-slate-800 "
 placeholder="99"
 />
 </div>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Original Price (₹)</label>
 <div className="relative">
 <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
 <input 
 type="number" 
 value={originalPrice} 
 onChange={e => setOriginalPrice(e.target.value)} 
 className="w-full pl-9 pr-4 py-3 bg-pink-50 border border-pink-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-bold text-slate-800 "
 placeholder="120"
 />
 </div>
 </div>
 </div>
 
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Stock Quantity</label>
 <input 
 type="number" 
 required 
 value={stockQuantity} 
 onChange={e => setStockQuantity(e.target.value)} 
 className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-bold text-slate-800 "
 placeholder="100"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Weight / Vol</label>
 <input 
 type="text" 
 value={weight} 
 onChange={e => setWeight(e.target.value)} 
 className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-bold text-slate-800 "
 placeholder="e.g. 500g"
 />
 </div>
 </div>
 
 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">SKU</label>
 <input 
 type="text" 
 value={sku} 
 onChange={e => setSku(e.target.value)} 
 className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-bold text-slate-800 "
 placeholder="e.g. FRS-APL-001"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Store Assignment</label>
 <select 
 required
 value={selectedStore} 
 onChange={e => setSelectedStore(e.target.value)} 
 className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-semibold text-slate-700 "
 >
 <option value="">Select a Store</option>
 {storesList.map(r => (
 <option key={r._id} value={r._id}>{r.name}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
 <select 
 required
 value={selectedCategory} 
 onChange={e => setSelectedCategory(e.target.value)} 
 className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-semibold text-slate-700 "
 >
 <option value="">Select Category</option>
 {categoriesList.map(c => (
 <option key={c._id} value={c._id}>{c.name}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description (Optional)</label>
 <textarea 
 rows="2" 
 value={description} 
 onChange={e => setDescription(e.target.value)} 
 className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-semibold text-slate-800 resize-none custom-scrollbar"
 placeholder="Short product info..."
 ></textarea>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Image URL (Optional)</label>
 <input 
 type="url" 
 value={image} 
 onChange={e => setImage(e.target.value)} 
 className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-semibold text-slate-800 "
 placeholder="https://..."
 />
 </div>

 <div className="flex gap-4">
 <label className="flex-1 flex justify-center items-center gap-2 p-3 border border-pink-200 rounded-xl cursor-pointer hover:bg-pink-50 :bg-slate-800/50 transition-colors">
 <input type="radio" checked={isVeg} onChange={() => setIsVeg(true)} className="accent-emerald-500" />
 <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
 Veg <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
 </span>
 </label>
 <label className="flex-1 flex justify-center items-center gap-2 p-3 border border-pink-200 rounded-xl cursor-pointer hover:bg-pink-50 :bg-slate-800/50 transition-colors">
 <input type="radio" checked={!isVeg} onChange={() => setIsVeg(false)} className="accent-rose-500" />
 <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
 Non-Veg <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
 </span>
 </label>
 </div>

 <button 
 type="submit" 
 className="w-full bg-emerald-500 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
 >
 Add Product to Catalog
 </button>
 </form>
 </div>
 </div>

 {/* PRODUCTS CATALOG LIST */}
 <div className="lg:col-span-2 flex flex-col gap-6">
 
 {/* Filters & Search */}
 <div className="bg-white border border-pink-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
 <div className="relative w-full sm:flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <input 
 type="text" 
 placeholder="Search products or stores..."
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 className="w-full pl-9 pr-4 py-2.5 bg-pink-50 border border-pink-200 rounded-xl text-sm outline-none focus:border-emerald-500 font-semibold text-slate-700 "
 />
 </div>
 <div className="flex bg-pink-100 p-1 rounded-xl shrink-0 w-full sm:w-auto">
 <button 
 onClick={() => setFilterVeg('all')}
 className={`flex-1 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterVeg === 'all' ? 'bg-white shadow-sm text-slate-900 ' : 'text-slate-500 hover:text-slate-700 :text-slate-300'}`}
 >All</button>
 <button 
 onClick={() => setFilterVeg('veg')}
 className={`flex-1 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterVeg === 'veg' ? 'bg-white shadow-sm text-emerald-600 ' : 'text-slate-500 hover:text-emerald-600'}`}
 >Veg</button>
 <button 
 onClick={() => setFilterVeg('nonveg')}
 className={`flex-1 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterVeg === 'nonveg' ? 'bg-white shadow-sm text-rose-600 ' : 'text-slate-500 hover:text-rose-600'}`}
 >Non-Veg</button>
 </div>
 </div>

 {/* List */}
 <div className="bg-white border border-pink-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
 <div className="overflow-x-auto custom-scrollbar">
 <table className="w-full text-left text-sm whitespace-nowrap">
 <thead className="bg-pink-50 ">
 <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-pink-200 ">
 <th className="py-4 px-6">Product Details</th>
 <th className="py-4 px-6">Store & Cat</th>
 <th className="py-4 px-6">Price</th>
 <th className="py-4 px-6">Stock</th>
 <th className="py-4 px-6 text-center">Status</th>
 <th className="py-4 px-6 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 ">
 {filteredCatalog.map(product => (
 <tr key={product._id} className="hover:bg-pink-50/50 :bg-slate-800/30 transition-colors">
 <td className="py-4 px-6">
 <div className="flex items-center gap-3">
 <img src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-slate-200 border border-pink-200 " />
 <div>
 <div className="font-bold text-slate-800 flex items-center gap-1.5">
 <span className={`w-2 h-2 rounded-full inline-block ${product.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
 {product.name}
 </div>
 <div className="text-[10px] text-slate-400 max-w-[150px] truncate">{product.weight} | SKU: {product.sku || 'N/A'}</div>
 </div>
 </div>
 </td>
 <td className="py-4 px-6">
 <div className="font-semibold text-slate-700 truncate max-w-[120px]">{product.store?.name || 'Unknown Store'}</div>
 <div className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">{product.category?.name || 'Uncategorized'}</div>
 </td>
 <td className="py-4 px-6 font-black text-slate-800 ">
 ₹{product.price}
 {product.originalPrice && <span className="ml-2 text-xs text-slate-400 line-through">₹{product.originalPrice}</span>}
 </td>
 <td className="py-4 px-6 font-bold text-slate-700 ">
 {product.stockQuantity}
 </td>
 <td className="py-4 px-6 text-center">
 <button 
 onClick={() => handleToggleStock(product._id, product.inStock)}
 className="hover:scale-110 transition-transform focus:outline-none"
 title={product.inStock ? "Mark Out of Stock" : "Mark In Stock"}
 >
 {product.inStock 
 ? <ToggleRight className="w-7 h-7 text-emerald-500" /> 
 : <ToggleLeft className="w-7 h-7 text-slate-300 " />
 }
 </button>
 </td>
 <td className="py-4 px-6 text-right">
 <button 
 onClick={() => handleDeleteProduct(product._id)}
 className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 :bg-rose-500/10 rounded-lg transition-colors"
 title="Delete Product"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </td>
 </tr>
 ))}
 {filteredCatalog.length === 0 && (
 <tr>
 <td colSpan="6" className="py-12 text-center text-slate-400">
 <Layers className="w-12 h-12 mx-auto mb-3 opacity-20" />
 <p className="font-semibold text-sm">No products found matching filters.</p>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 </div>
 </div>
 </div>
 );
};

export default ProductManage;
