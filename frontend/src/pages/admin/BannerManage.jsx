import React, { useState, useEffect } from 'react';
import API from '../../services/api.js';
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';

const BannerManage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
    position: 'hero',
    category: 'home',
    isActive: true,
    order: 0
  });
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await API.get('/banners');
      setBanners(res.data);
    } catch (error) {
      console.error('Failed to fetch banners', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imgData = new FormData();
    imgData.append('image', file);

    setUploadingImage(true);
    try {
      const res = await API.post('/settings/upload', imgData);
      setFormData({ ...formData, imageUrl: res.data.url });
    } catch (error) {
      console.error('Image upload failed', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/banners/${editingId}`, formData);
      } else {
        await API.post('/banners', formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ title: '', subtitle: '', imageUrl: '', linkUrl: '', position: 'hero', category: 'home', isActive: true, order: 0 });
      fetchBanners();
    } catch (error) {
      console.error('Failed to save banner', error);
      alert(error.response?.data?.message || 'Failed to save banner');
    }
  };

  const handleEdit = (banner) => {
    setFormData(banner);
    setEditingId(banner._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await API.delete(`/banners/${id}`);
      fetchBanners();
    } catch (error) {
      console.error('Failed to delete banner', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Banner Management</h1>
          <p className="text-sm text-slate-500 font-medium">Manage banners for Home, Offer, and About pages</p>
        </div>
        <button onClick={() => { setEditingId(null); setFormData({ title: '', subtitle: '', imageUrl: '', linkUrl: '', position: 'hero', category: activeTab, isActive: true, order: 0 }); setShowModal(true); }} className="bg-emerald-600 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-200">
        {['home', 'offer', 'about'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 text-sm font-bold capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {tab} Page Banners
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.filter(b => (b.category || 'home') === activeTab).map(banner => (
            <div key={banner._id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden group ${banner.isActive ? 'border-emerald-200' : 'border-slate-200 opacity-60'}`}>
              <div className="h-40 w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
                {banner.imageUrl ? (
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                )}
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-slate-700 uppercase tracking-wider">{banner.position}</div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-800 text-lg mb-1 truncate">{banner.title}</h3>
                <p className="text-xs text-slate-500 font-medium truncate mb-4">{banner.subtitle || 'No subtitle'}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${banner.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(banner)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(banner._id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {banners.filter(b => (b.category || 'home') === activeTab).length === 0 && <div className="col-span-full text-center py-12 text-slate-500 font-medium bg-white rounded-2xl border border-dashed border-slate-300">No banners found for this category. Add one to get started.</div>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">{editingId ? 'Edit Banner' : 'Create New Banner'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="bannerForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-700">Banner Title</label>
                    <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-600 text-sm" placeholder="e.g. Mega Monsoon Sale" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-700">Subtitle</label>
                    <input type="text" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-600 text-sm" placeholder="e.g. Upto 50% Off on Groceries" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Category / Page</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-600 text-sm">
                      <option value="home">Home Page</option>
                      <option value="offer">Offer Page</option>
                      <option value="about">About Page</option>
                    </select>
                  </div>
                  {formData.category === 'home' && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Position (Home Only)</label>
                      <select value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-600 text-sm">
                        <option value="hero">Hero Slider</option>
                        <option value="promotional">Promotional Banner</option>
                      </select>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Order (Priority)</label>
                    <input type="number" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-600 text-sm" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-700">Link URL (Optional)</label>
                    <input type="text" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-600 text-sm" placeholder="e.g. /shop or /category/fresh" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-700">Image Source (URL or File Upload)</label>
                    {formData.imageUrl && (
                      <div className="mb-2 relative rounded-xl overflow-hidden border border-slate-200 h-32 w-full">
                        <img src={formData.imageUrl} className="w-full h-full object-contain" alt="Preview" />
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text" 
                        value={formData.imageUrl} 
                        onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                        placeholder="Paste image URL here..." 
                        className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-600 text-sm"
                      />
                      <div className="text-center font-bold text-slate-400 text-xs self-center">OR</div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        disabled={uploadingImage} 
                        className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100" 
                      />
                    </div>
                    {uploadingImage && <span className="text-xs text-emerald-600 font-bold mt-1 block">Uploading...</span>}
                  </div>
                  <div className="col-span-2 flex items-center gap-2 mt-2">
                    <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600" />
                    <label htmlFor="isActive" className="text-sm font-bold text-slate-700">Active (Visible on website)</label>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-3xl">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button type="submit" form="bannerForm" disabled={uploadingImage} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-colors disabled:opacity-50 flex items-center gap-2">
                Save Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManage;
