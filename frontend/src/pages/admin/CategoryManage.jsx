import React, { useState, useEffect } from 'react';
import API from '../../services/api.js';
import { Plus, Check, ShieldAlert, Trash2, ToggleLeft, ToggleRight, LayoutGrid, Image as ImageIcon, Edit2, X as CloseIcon, Upload, Download, FileJson, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const CategoryManage = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editImageFile, setEditImageFile] = useState(null);

  const [bulkFile, setBulkFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/products/categories?all=true');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('icon', icon);
      
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (image) {
        formData.append('image', image);
      }

      const res = await API.post('/products/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCategories(prev => [...prev, res.data]);
      setSuccess(`Category "${name}" added successfully!`);
      setName('');
      setIcon('');
      setImage('');
      setImageFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (catId, currentStatus) => {
    try {
      await API.put(`/products/categories/${catId}`, { isActive: !currentStatus });
      setCategories(prev => prev.map(c => c._id === catId ? { ...c, isActive: !currentStatus } : c));
    } catch (err) {
      console.error('Toggle failed', err);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await API.delete(`/products/categories/${catId}`);
      setCategories(prev => prev.filter(c => c._id !== catId));
      setSuccess('Category deleted successfully.');
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  const handleEditClick = (cat) => {
    setEditingId(cat._id);
    setEditName(cat.name);
    setEditIcon(cat.icon || '');
    setEditImage(cat.image || '');
    setEditImageFile(null);
  };

  const handleSaveEdit = async (catId) => {
    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('icon', editIcon);
      if (editImageFile) {
        formData.append('image', editImageFile);
      } else if (editImage) {
        formData.append('image', editImage);
      }

      const res = await API.put(`/products/categories/${catId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCategories(prev => prev.map(c => c._id === catId ? res.data : c));
      setEditingId(null);
      setSuccess('Category updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update category');
    }
  };

  const templateCategories = [
    { name: 'Fruits & Vegetables', icon: '🍎', image: '/assets/Fruits%20&%20Vegetables.jpg' },
    { name: 'Dairy & Breakfast', icon: '🥛', image: '/assets/Dairy%20&%20Breakfast.jpg' },
    { name: 'Munchies', icon: '🍪', image: '/assets/Munchies.jpg' },
    { name: 'Cold Drinks', icon: '🥤', image: '/assets/Cold%20Drinks.jpg' },
    { name: 'Sweet Cravings', icon: '🍫', image: '/assets/Sweet%20Cravings.jpg' },
    { name: 'Chicken & Eggs', icon: '🥚', image: '/assets/Chicken%20&%20Eggs.jpg' },
    { name: 'Cleaning', icon: '🧹', image: '/assets/Cleaning.jpg' },
    { name: 'Home & Office', icon: '🏠', image: '/assets/Home%20&%20Office.jpg' },
    { name: 'Personal Care', icon: '🧴', image: '/assets/Personal%20Care.jpg' },
    { name: 'Dry Fruits & Nuts', icon: '🥜', image: '/assets/Dry%20Fruits%20&%20Nuts.jpg' },
    { name: 'Edible Oils', icon: '🛢️', image: '/assets/Edible%20Oils.jpg' },
    { name: 'Flours', icon: '🌾', image: '/assets/Flours.jpg' },
    { name: 'Rice & Rice Products', icon: '🍚', image: '/assets/Rice%20&%20Rice%20Products.jpg' },
    { name: 'Frozen & Instant Food', icon: '🍕', image: '/assets/Frozen%20&%20Instant%20Food.jpg' },
    { name: 'Fish, Prawns & Seafood', icon: '🐟', image: '/assets/Fish,%20Prawns%20&%20Seafood.jpg' },
    { name: 'Mutton, Duck & Lamb', icon: '🍖', image: '/assets/Mutton,%20Duck%20&%20Lamb.jpg' },
    { name: 'Sauces & Seasoning', icon: '🧂', image: '/assets/Sauces%20&%20Seasoning.jpg' },
    { name: 'Masala, Salt & Sugar', icon: '🧂', image: '/assets/Masala,%20Salt%20&%20Sugar.jpg' },
    { name: 'Kitchenware', icon: '🍳', image: '/assets/Kitchenware.jpg' },
    { name: 'Packaging Material', icon: '📦', image: '/assets/Packaging%20Material.jpg' },
    { name: 'Canned & Imported Items', icon: '🥫', image: '/assets/Canned%20&%20Imported%20Items.jpg' },
    { name: 'Pulses', icon: '🫘', image: '/assets/Pulses.jpg' }
  ];

  const downloadJSONFormat = () => {
    const blob = new Blob([JSON.stringify(templateCategories, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'categories_template.json';
    a.click();
  };

  const downloadCSVFormat = () => {
    // Escape quotes and wrap fields with commas in quotes
    const escapeCsvField = (field) => {
      if (field.includes(',') || field.includes('"')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };

    const header = 'name,icon,image\n';
    const rows = templateCategories.map(cat => 
      `${escapeCsvField(cat.name)},${escapeCsvField(cat.icon)},${escapeCsvField(cat.image)}`
    ).join('\n');
    
    const blob = new Blob([header + rows + '\n'], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'categories_template.csv';
    a.click();
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) return setError('Please select a file to upload');
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
                // Remove leading/trailing quotes if they somehow remain, though our parser handles it
                obj[header] = values[index] ? values[index].replace(/^"|"$/g, '').trim() : '';
              });
              if (obj.name) parsedData.push(obj);
            }
          } else {
            throw new Error('Unsupported file format. Use .json or .csv');
          }

          if (parsedData.length === 0) throw new Error('File is empty or invalid');

          const res = await API.post('/products/categories/bulk', { categories: parsedData });
          setCategories(prev => [...prev, ...res.data.inserted]);
          
          if (res.data.skippedCount > 0) {
            setSuccess(`${res.data.inserted.length} categories added, ${res.data.skippedCount} skipped (duplicates)!`);
          } else {
            setSuccess(`${res.data.inserted.length} categories added successfully!`);
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

  return (
    <div className="flex flex-col gap-8 pb-20">
      
      {/* Top Sections (Forms) */}
      <div className="flex flex-col gap-8 w-full">
      
        {/* Left Form */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-200/60 shadow-premium h-fit">
        <h3 className="text-lg font-black border-b border-emerald-200 pb-3 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-600" /> Add Category
        </h3>

        {success && <p className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 mb-4 flex items-center gap-1"><Check className="w-4 h-4" /> {success}</p>}
        {error && <p className="text-[11px] font-bold text-rose-500 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 mb-4 flex items-center gap-1"><ShieldAlert className="w-4 h-4" /> {error}</p>}

        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Fresh Fruits"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-transparent outline-none focus:border-emerald-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Icon (Emoji/Text)</label>
            <input 
              type="text"
              placeholder="e.g. 🍎"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-transparent outline-none focus:border-emerald-600 text-sm"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Category Image</label>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Upload File (Priority)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100"
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
                placeholder="https://..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-emerald-200 bg-white outline-none focus:border-emerald-600 text-sm"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-center flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all text-sm"
          >
            Add Category
          </button>
        </form>
      </div>

      {/* Bulk Upload Form */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-200/60 shadow-premium h-fit">
        <h3 className="text-lg font-black border-b border-emerald-200 pb-3 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-emerald-600" /> Bulk Upload
        </h3>
        
        <p className="text-xs text-slate-500 font-medium mb-4">Upload multiple categories at once using CSV or JSON.</p>
        
        <div className="flex gap-2 mb-6">
          <button onClick={downloadCSVFormat} className="flex-1 py-2 px-3 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 flex items-center justify-center gap-1">
            <FileText className="w-3 h-3" /> CSV Format
          </button>
          <button onClick={downloadJSONFormat} className="flex-1 py-2 px-3 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 flex items-center justify-center gap-1">
            <FileJson className="w-3 h-3" /> JSON Format
          </button>
        </div>

        <form onSubmit={handleBulkUpload} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 border-dashed text-center">
            <input 
              type="file" 
              accept=".csv, .json"
              onChange={(e) => setBulkFile(e.target.files[0])}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100"
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

      {/* Right List */}
      <div className="w-full bg-white rounded-3xl p-6 border border-emerald-200/60 shadow-premium">
        <h3 className="text-lg font-black border-b border-emerald-200 pb-3 mb-4 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-emerald-600" /> All Categories
        </h3>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-emerald-200 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Active State</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              {(() => {
                const indexOfLastItem = currentPage * itemsPerPage;
                const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                const currentItems = categories.slice(indexOfFirstItem, indexOfLastItem);
                
                if (categories.length === 0) {
                  return (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400 font-medium">No categories found.</td>
                    </tr>
                  );
                }
                
                return currentItems.map((cat) => (
                <tr key={cat._id} className="hover:bg-emerald-50">
                  <td className="py-3 px-4 min-w-[140px]">
                    {editingId === cat._id ? (
                      <div className="flex flex-col gap-1.5">
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => setEditImageFile(e.target.files[0])}
                          className="w-full text-[10px] file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100 cursor-pointer"
                        />
                        <div className="flex items-center gap-2">
                          <div className="h-px bg-slate-200 flex-1"></div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase">OR</span>
                          <div className="h-px bg-slate-200 flex-1"></div>
                        </div>
                        <input 
                          type="url" 
                          value={editImage} 
                          onChange={(e) => setEditImage(e.target.value)} 
                          className="w-full px-2 py-1.5 text-[10px] rounded-md border border-emerald-200 outline-none focus:border-emerald-600"
                          placeholder="Image URL"
                        />
                      </div>
                    ) : cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-10 h-10 object-cover rounded-lg shadow-sm border border-emerald-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-lg">{cat.icon || <ImageIcon className="w-4 h-4 text-emerald-300" />}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {editingId === cat._id ? (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={editIcon} 
                          onChange={(e) => setEditIcon(e.target.value)} 
                          className="w-12 px-2 py-1 text-xs rounded border border-emerald-200 outline-none focus:border-emerald-600"
                          placeholder="Icon"
                        />
                        <input 
                          type="text" 
                          value={editName} 
                          onChange={(e) => setEditName(e.target.value)} 
                          className="w-full px-2 py-1 text-xs rounded border border-emerald-200 outline-none focus:border-emerald-600"
                          placeholder="Name"
                        />
                      </div>
                    ) : (
                      <>{cat.icon} {cat.name}</>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full ${cat.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {cat.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === cat._id ? (
                        <>
                          <button onClick={() => handleSaveEdit(cat._id)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg" title="Save">
                            <Check className="w-5 h-5" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg" title="Cancel">
                            <CloseIcon className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleToggleStatus(cat._id, cat.isActive)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600"
                            title="Toggle Status"
                          >
                            {cat.isActive ? <ToggleRight className="w-6 h-6 text-emerald-600" /> : <ToggleLeft className="w-6 h-6" />}
                          </button>
                          <button onClick={() => handleEditClick(cat)} className="p-1.5 text-slate-400 hover:text-emerald-600" title="Edit">
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(cat._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ));
              })()}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {Math.ceil(categories.length / itemsPerPage) > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-emerald-200/60 bg-emerald-50/30">
            <div className="text-xs font-bold text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, categories.length)} of {categories.length}
            </div>
            <div className="flex items-center gap-1">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1 rounded-md text-slate-400 hover:text-slate-800 transition-colors disabled:opacity-50"
              ><ChevronLeft className="w-4 h-4" /></button>
              
              {Array.from({ length: Math.ceil(categories.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
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
                disabled={currentPage === Math.ceil(categories.length / itemsPerPage)}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(categories.length / itemsPerPage)))}
                className="p-1 rounded-md text-slate-400 hover:text-slate-800 transition-colors disabled:opacity-50"
              ><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default CategoryManage;
