import React, { useState, useEffect } from 'react';
import API from '../../services/api.js';
import { Plus, Check, X, ShieldAlert, Trash2, ToggleLeft, ToggleRight, Utensils, ChefHat, Layers, IndianRupee, Search, Package, Upload, FileJson, FileText, Download, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORY_TEMPLATES } from '../../data/productTemplates.js';

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
 const [isPopular, setIsPopular] = useState(false);
 const [description, setDescription] = useState('');
 const [image, setImage] = useState('');
 const [imageFile, setImageFile] = useState(null);
 const [selectedStore, setSelectedStore] = useState('');
 const [selectedCategory, setSelectedCategory] = useState('');
 const [editingProductId, setEditingProductId] = useState(null);
 const [isEditMode, setIsEditMode] = useState(false);
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 8;

 const [searchQuery, setSearchQuery] = useState('');
 const [filterVeg, setFilterVeg] = useState('all');

 useEffect(() => {
   setCurrentPage(1);
 }, [searchQuery, filterVeg]);
 
 const [success, setSuccess] = useState('');
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const [bulkFile, setBulkFile] = useState(null);
 const [bulkLoading, setBulkLoading] = useState(false);
 const [selectedTemplateCategory, setSelectedTemplateCategory] = useState('All');

 useEffect(() => {
 fetchInitialData();
 }, []);

 // Sync Add New Product category dropdown with Bulk Upload template selection
 useEffect(() => {
   if (categoriesList.length > 0 && selectedTemplateCategory) {
     const matchedCategory = categoriesList.find(
       c => c.name.toLowerCase() === selectedTemplateCategory.toLowerCase()
     );
     if (matchedCategory) {
       setSelectedCategory(matchedCategory._id);
     }
   }
 }, [selectedTemplateCategory, categoriesList]);

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
 const catRes = await API.get('/products/categories?all=true');
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

 const handleSubmitProduct = async (e) => {
 e.preventDefault();
 setError('');
 setSuccess('');

 if (!selectedStore || !selectedCategory) {
 setError('Please select a store and a category first.');
 return;
 }

 try {
 const formData = new FormData();
 formData.append('name', name);
 formData.append('price', price);
 if (originalPrice) formData.append('originalPrice', originalPrice);
 if (weight) formData.append('weight', weight);
 if (sku) formData.append('sku', sku);
 formData.append('stockQuantity', stockQuantity);
 formData.append('isVeg', isVeg);
 formData.append('isPopular', isPopular);
 if (description) formData.append('description', description);
 formData.append('category', selectedCategory);
 formData.append('store', selectedStore);
 
 if (imageFile) {
   formData.append('image', imageFile);
 } else if (image) {
   formData.append('image', image);
 }

 if (editingProductId) {
   await API.put(`/products/${editingProductId}`, formData, {
     headers: { 'Content-Type': 'multipart/form-data' }
   });
   setSuccess(`Product "${name}" updated successfully!`);
 } else {
   await API.post('/products', formData, {
     headers: { 'Content-Type': 'multipart/form-data' }
   });
   setSuccess(`Product "${name}" added successfully!`);
 }
 
 // Re-fetch list to ensure fully populated data
 const updateRes = await API.get('/products?all=true');
 setProducts(updateRes.data);

 resetForm();
 } catch (err) {
 console.warn('API error saving product:', err);
 setError(err.response?.data?.message || 'Failed to save product');
 }
 };

 const handleEditClick = (product) => {
   setEditingProductId(product._id);
   setName(product.name);
   setPrice(product.price);
   setOriginalPrice(product.originalPrice || '');
   setWeight(product.weight || '');
   setSku(product.sku || '');
   setStockQuantity(product.stockQuantity || 0);
   setIsVeg(product.isVeg);
   setIsPopular(product.isPopular || false);
   setDescription(product.description || '');
   setImage(product.image || '');
   setImageFile(null);
   setSelectedStore(product.store?._id || '');
   setSelectedCategory(product.category?._id || '');
   window.scrollTo({ top: 0, behavior: 'smooth' });
 };

 const resetForm = () => {
 setEditingProductId(null);
 setName('');
 setPrice('');
 setOriginalPrice('');
 setWeight('');
 setSku('');
 setStockQuantity(100);
 setIsVeg(true);
 setIsPopular(false);
 setDescription('');
 setImage('');
 setImageFile(null);
 };

 const handleToggleStock = async (productId, currentStatus) => {
 try {
 await API.put(`/products/${productId}`, { inStock: !currentStatus });
 setProducts(prev => prev.map(f => f._id === productId ? { ...f, inStock: !currentStatus } : f));
 } catch (err) {
 setProducts(prev => prev.map(f => f._id === productId ? { ...f, inStock: !currentStatus } : f));
 }
 };

 const handleDeleteProduct = async (productId) => {
 if (!window.confirm('Are you sure you want to delete this product?')) return;
 try {
 await API.delete(`/products/${productId}`);
 setProducts(prev => prev.filter(f => f._id !== productId));
 setSuccess('Product deleted successfully.');
 } catch (err) {
 setProducts(prev => prev.filter(f => f._id !== productId));
 setSuccess('Simulated: Product deleted locally.');
 }
 };

  const filteredCatalog = products.filter(product => {
    const productName = product?.name || '';
    const storeName = product?.store?.name || '';
    
    const matchesSearch = productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          storeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = filterVeg === 'all' ? true : (filterVeg === 'veg' ? product.isVeg : !product.isVeg);
    
    return matchesSearch && matchesVeg;
  });

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) return setError('Please select a JSON file to upload');
    setError('');
    setSuccess('');
    setBulkLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target.result;
          let parsedData = [];
          if (bulkFile.name.endsWith('.json')) {
            parsedData = JSON.parse(content);
          } else if (bulkFile.name.endsWith('.csv')) {
            const parseCSVLine = (text) => {
              let ret = [];
              let curr = '';
              let inQuotes = false;
              for (let i = 0; i < text.length; ++i) {
                let char = text[i];
                if (char === '"') {
                  if (inQuotes && text[i+1] === '"') {
                    curr += '"';
                    i++;
                  } else {
                    inQuotes = !inQuotes;
                  }
                } else if (char === ',' && !inQuotes) {
                  ret.push(curr.trim());
                  curr = '';
                } else {
                  curr += char;
                }
              }
              ret.push(curr.trim());
              return ret;
            };

            const rows = content.split('\n').filter(row => row.trim() !== '');
            const headers = parseCSVLine(rows[0]).map(h => h.trim());
            for (let i = 1; i < rows.length; i++) {
              const values = parseCSVLine(rows[i]);
              let obj = {};
              headers.forEach((header, index) => {
                obj[header] = values[index] ? values[index].replace(/^"|"$/g, '').trim() : '';
              });
              if (obj.name) parsedData.push(obj);
            }
          } else {
            throw new Error('Unsupported file format. Please use .json or .csv');
          }
          if (parsedData.length === 0) throw new Error('File is empty or invalid');

          const res = await API.post('/products/bulk', { products: parsedData });
          
          // Re-fetch products
          const [prodRes, catRes, storeRes] = await Promise.all([
            API.get('/products?all=true'),
            API.get('/products/categories?all=true'),
            API.get('/stores')
          ]);
          setProducts(prodRes.data);
          
          if (res.data.skippedCount > 0) {
            setSuccess(`${res.data.inserted.length} products added, ${res.data.skippedCount} skipped (duplicates)!`);
          } else {
            setSuccess(`${res.data.inserted.length} products added successfully!`);
          }
          setBulkFile(null);
        } catch (err) {
          setError(err.message || 'Error processing file');
        } finally {
          setBulkLoading(false);
        }
      };
      reader.readAsText(bulkFile);
    } catch (err) {
      setError('Failed to read file');
      setBulkLoading(false);
    }
  };

  const getTemplateData = () => {
    if (selectedTemplateCategory === 'All') {
      return Object.values(CATEGORY_TEMPLATES).flat();
    }
    return CATEGORY_TEMPLATES[selectedTemplateCategory] || [];
  };

  const downloadJSONFormat = () => {
    const dataToDownload = getTemplateData();
    if(dataToDownload.length === 0) return alert('No data available for this category');
    
    const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_template_${selectedTemplateCategory.replace(/\s+/g, '_')}.json`;
    a.click();
  };

  const downloadCSVFormat = () => {
    const dataToDownload = getTemplateData();
    if(dataToDownload.length === 0) return alert('No data available for this category');

    const escapeCsvField = (field) => {
      if (field === null || field === undefined) return '';
      const str = String(field);
      if (str.includes(',') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const headers = Object.keys(dataToDownload[0]);
    const headerRow = headers.join(',') + '\n';
    const rows = dataToDownload.map(prod => 
      headers.map(h => escapeCsvField(prod[h])).join(',')
    ).join('\n');
    const blob = new Blob([headerRow + rows + '\n'], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_template_${selectedTemplateCategory.replace(/\s+/g, '_')}.csv`;
    a.click();
  };

 if (loading) {
 return <div className="p-10 text-center text-slate-500 animate-pulse">Loading Global Inventory...</div>;
 }

 return (
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
 
 {/* Header */}
 <div className="bg-white border border-emerald-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm relative overflow-hidden">
 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
 <div className="relative z-10">
 <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
 <Package className="w-8 h-8 text-emerald-500" />
 Global Inventory Management
 </h1>
 <p className="text-slate-500 mt-2 font-medium">Add, edit, or remove products across all Dark Stores.</p>
 </div>
 </div>

 <div className="flex flex-col gap-6 w-full">
 
 {/* LEFT COLUMN (Forms) */}
 <div className="w-full flex flex-col gap-6">
    
    {/* ADD NEW PRODUCT FORM */}
    <div className="bg-white border border-emerald-200 rounded-3xl p-6 shadow-sm">
 <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
 <Plus className="w-5 h-5 text-emerald-500" /> {editingProductId ? 'Edit Product' : 'Add New Product'}
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

 <form onSubmit={handleSubmitProduct} className="space-y-4">
 
 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Product Name</label>
 <input 
 type="text" 
 required 
 value={name} 
 onChange={e => setName(e.target.value)} 
 className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-semibold text-slate-800 "
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
 className="w-full pl-9 pr-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-bold text-slate-800 "
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
 className="w-full pl-9 pr-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-bold text-slate-800 "
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
 className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-bold text-slate-800 "
 placeholder="100"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Weight / Vol</label>
 <input 
 type="text" 
 value={weight} 
 onChange={e => setWeight(e.target.value)} 
 className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-bold text-slate-800 "
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
 className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-bold text-slate-800 "
 placeholder="e.g. FRS-APL-001"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Store Assignment</label>
 <select 
 required
 value={selectedStore} 
 onChange={e => setSelectedStore(e.target.value)} 
 className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-semibold text-slate-700 "
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
 className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-semibold text-slate-700 "
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
 className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-semibold text-slate-800 resize-none custom-scrollbar"
 placeholder="Short product info..."
 ></textarea>
 </div>

 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
 <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Product Image</label>
 
 <div>
   <label className="block text-[10px] font-bold text-slate-500 mb-1">Upload File (Priority)</label>
   <input 
     type="file" 
     accept="image/*"
     onChange={(e) => setImageFile(e.target.files[0])}
     className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-500 hover:file:bg-emerald-100"
   />
 </div>
 
 <div className="flex items-center gap-2">
   <div className="h-px bg-slate-200 flex-1"></div>
   <span className="text-[10px] font-bold text-slate-400 uppercase">OR</span>
   <div className="h-px bg-slate-200 flex-1"></div>
 </div>

 <div>
   <label className="block text-[10px] font-bold text-slate-500 mb-1">Image URL</label>
   <input 
   type="url" 
   value={image} 
   onChange={e => setImage(e.target.value)} 
   className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 transition-colors text-sm font-semibold text-slate-800 "
   placeholder="https://..."
   />
 </div>
 </div>

 <div className="flex gap-4">
 <label className="flex-1 flex justify-center items-center gap-2 p-3 border border-emerald-200 rounded-xl cursor-pointer hover:bg-emerald-50 :bg-slate-800/50 transition-colors">
 <input type="radio" checked={isVeg} onChange={() => setIsVeg(true)} className="accent-emerald-500" />
 <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
 Veg <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
 </span>
 </label>
 <label className="flex-1 flex justify-center items-center gap-2 p-3 border border-emerald-200 rounded-xl cursor-pointer hover:bg-emerald-50 :bg-slate-800/50 transition-colors">
 <input type="radio" checked={!isVeg} onChange={() => setIsVeg(false)} className="accent-rose-500" />
 <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
 Non-Veg <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
 </span>
 </label>
 </div>

 <div className="mt-4">
 <label className="flex items-center gap-3 p-4 border border-amber-200 bg-amber-50 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors">
 <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} className="accent-amber-500 w-5 h-5" />
 <div className="flex flex-col">
 <span className="text-sm font-bold text-amber-700">Mark as Popular Pick ⭐</span>
 <span className="text-xs font-semibold text-amber-600/70">Show this product on the Homepage Popular Picks section</span>
 </div>
 </label>
 </div>

 <div className="flex gap-3">
 <button 
 type="submit" 
 className="flex-1 bg-emerald-500 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
 >
 {editingProductId ? 'Update Product' : 'Add Product to Catalog'}
 </button>
 {editingProductId && (
   <button 
     type="button" 
     onClick={resetForm}
     className="px-6 bg-slate-100 text-slate-500 font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-colors"
   >
     Cancel
   </button>
 )}
 </div>
 </form>
 </div>

  {/* BULK UPLOAD FORM */}
  <div className="bg-white rounded-3xl p-6 border border-emerald-200/60 shadow-sm">
    <h3 className="text-lg font-black border-b border-emerald-200 pb-3 mb-4 flex items-center gap-2">
      <Upload className="w-5 h-5 text-emerald-500" /> Bulk Upload
    </h3>
    
    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-6">
      <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5"><Download className="w-4 h-4 text-emerald-600" /> Download Pre-filled Template</h4>
      <div className="space-y-3">
        <select 
          value={selectedTemplateCategory}
          onChange={e => setSelectedTemplateCategory(e.target.value)}
          className="w-full px-3 py-2.5 bg-white border border-emerald-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500"
        >
          <option value="All">All Categories</option>
          {Object.keys(CATEGORY_TEMPLATES).map(cat => (
            <option key={cat} value={cat}>{cat} ({CATEGORY_TEMPLATES[cat].length} items)</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button onClick={downloadCSVFormat} className="flex-1 py-2 px-3 text-[10px] font-bold text-emerald-600 bg-emerald-100/50 border border-emerald-200 rounded-lg hover:bg-emerald-100 flex items-center justify-center gap-1 transition-colors">
            <FileText className="w-3 h-3" /> Get CSV
          </button>
          <button onClick={downloadJSONFormat} className="flex-1 py-2 px-3 text-[10px] font-bold text-emerald-600 bg-emerald-100/50 border border-emerald-200 rounded-lg hover:bg-emerald-100 flex items-center justify-center gap-1 transition-colors">
            <FileJson className="w-3 h-3" /> Get JSON
          </button>
        </div>
      </div>
    </div>

    <form onSubmit={handleBulkUpload} className="space-y-4">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 border-dashed text-center">
        <input 
          type="file" 
          accept=".json, .csv"
          onChange={(e) => setBulkFile(e.target.files[0])}
          className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-500 hover:file:bg-emerald-100 transition-colors cursor-pointer"
        />
      </div>
      
      <button 
        type="submit"
        disabled={bulkLoading || !bulkFile}
        className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-center flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all text-sm disabled:opacity-50"
      >
        <Upload className="w-4 h-4" /> {bulkLoading ? 'Uploading...' : 'Upload File'}
      </button>
    </form>
  </div>

  </div>

 {/* PRODUCTS CATALOG LIST */}
 <div className="w-full flex flex-col gap-6">
 
 {/* Filters & Search */}
 <div className="bg-white border border-emerald-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
 <div className="relative w-full sm:flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <input 
 type="text" 
 placeholder="Search products or stores..."
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 className="w-full pl-9 pr-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm outline-none focus:border-emerald-500 font-semibold text-slate-700 "
 />
 </div>
 <div className="flex bg-emerald-100 p-1 rounded-xl shrink-0 w-full sm:w-auto">
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
 <div className="bg-white border border-emerald-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
 <div className="overflow-x-auto custom-scrollbar">
 <table className="w-full text-left text-sm whitespace-nowrap">
 <thead className="bg-emerald-50 ">
 <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-emerald-200 ">
 <th className="py-4 px-6">Product Details</th>
 <th className="py-4 px-6">Store & Cat</th>
 <th className="py-4 px-6">Price</th>
 <th className="py-4 px-6">Stock</th>
 <th className="py-4 px-6 text-center">Status</th>
 <th className="py-4 px-6 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 ">
 {(() => {
   const indexOfLastItem = currentPage * itemsPerPage;
   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
   const currentItems = filteredCatalog.slice(indexOfFirstItem, indexOfLastItem);
   
   if (currentItems.length === 0) {
     return (
       <tr>
         <td colSpan="6" className="py-12 text-center text-slate-400">
           <Layers className="w-12 h-12 mx-auto mb-3 opacity-20" />
           <p className="font-semibold text-sm">No products found matching filters.</p>
         </td>
       </tr>
     );
   }

   return currentItems.map(product => (
 <tr key={product._id} className="hover:bg-emerald-50/50 :bg-slate-800/30 transition-colors">
 <td className="py-4 px-6">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg overflow-hidden border border-emerald-100 shrink-0 bg-white">
 <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
 </div>
 <div>
 <div className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2 max-w-[200px] truncate">
 {product.name}
 {product.isVeg ? (
 <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white shadow-sm shrink-0" title="Veg"></span>
 ) : (
 <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white shadow-sm shrink-0" title="Non-Veg"></span>
 )}
 </div>
 <div className="text-[10px] sm:text-xs font-semibold text-slate-400 flex items-center gap-1.5 mt-0.5">
 <Package className="w-3.5 h-3.5" />
 {product.weight}
 </div>
 </div>
 </div>
 </td>
 <td className="py-4 px-6">
 <div className="font-semibold text-slate-700 truncate max-w-[120px]">{product.store?.name || 'Unknown Store'}</div>
 <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{product.category?.name || 'Uncategorized'}</div>
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
 <div className="flex items-center justify-end gap-2">
   <button 
     onClick={() => handleEditClick(product)}
     className="p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors"
     title="Edit Product"
   >
     <Edit2 className="w-4 h-4" />
   </button>
   <button 
     onClick={() => handleDeleteProduct(product._id)}
     className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 :bg-rose-500/10 rounded-lg transition-colors"
     title="Delete Product"
   >
     <Trash2 className="w-4 h-4" />
   </button>
 </div>
 </td>
 </tr>
   ));
 })()}
 </tbody>
 </table>
 </div>
 
 {/* Pagination Footer */}
 {Math.ceil(filteredCatalog.length / itemsPerPage) > 0 && (
   <div className="flex justify-between items-center px-6 py-4 border-t border-emerald-200/60 bg-emerald-50/30">
     <div className="text-xs font-bold text-slate-500">
       Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredCatalog.length)} of {filteredCatalog.length}
     </div>
     <div className="flex items-center gap-1">
       <button 
         disabled={currentPage === 1}
         onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
         className="p-1 rounded-md text-slate-400 hover:text-slate-800 transition-colors disabled:opacity-50"
       ><ChevronLeft className="w-4 h-4" /></button>
       
       {Array.from({ length: Math.ceil(filteredCatalog.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
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
         disabled={currentPage === Math.ceil(filteredCatalog.length / itemsPerPage)}
         onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredCatalog.length / itemsPerPage)))}
         className="p-1 rounded-md text-slate-400 hover:text-slate-800 transition-colors disabled:opacity-50"
       ><ChevronRight className="w-4 h-4" /></button>
     </div>
   </div>
 )}
 
 </div>

 </div>
 </div>
 </div>
 );
};

export default ProductManage;
