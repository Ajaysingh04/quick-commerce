import React, { useState, useEffect } from 'react';
import API from '../../services/api.js';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';

const PageManage = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    isActive: true
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await API.get('/pages');
      setPages(res.data);
    } catch (error) {
      console.error('Failed to fetch pages', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await API.put(`/pages/${editingId}`, formData);
      } else {
        await API.post('/pages', formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ slug: '', title: '', content: '', isActive: true });
      fetchPages();
    } catch (error) {
      console.error('Failed to save page', error);
      alert(error.response?.data?.message || 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (page) => {
    setFormData(page);
    setEditingId(page._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this page? This might break links on the website.')) return;
    try {
      await API.delete(`/pages/${id}`);
      fetchPages();
    } catch (error) {
      console.error('Failed to delete page', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Static Pages</h1>
          <p className="text-sm text-slate-500 font-medium">Manage content for About, Terms, Privacy, etc.</p>
        </div>
        <button onClick={() => { setEditingId(null); setFormData({ slug: '', title: '', content: '', isActive: true }); setShowModal(true); }} className="bg-emerald-600 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Create Page
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest">Title</th>
                <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest">Slug</th>
                <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(page => (
                <tr key={page._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-800">{page.title}</td>
                  <td className="py-4 px-6 font-mono text-sm text-slate-500">/{page.slug}</td>
                  <td className="py-4 px-6">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${page.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {page.isActive ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(page)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(page._id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500 font-medium">No pages created yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">{editingId ? 'Edit Page' : 'Create New Page'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 flex flex-col min-h-[400px]">
              <form id="pageForm" onSubmit={handleSubmit} className="space-y-4 flex flex-col h-full">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Page Title</label>
                    <input type="text" required value={formData.title} onChange={e => {
                        const title = e.target.value;
                        const slug = !editingId ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : formData.slug;
                        setFormData({...formData, title, slug});
                      }} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-600 text-sm" placeholder="e.g. Terms and Conditions" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">URL Slug</label>
                    <input type="text" required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-600 text-sm font-mono" placeholder="e.g. terms-conditions" />
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col space-y-1">
                  <label className="text-xs font-bold text-slate-700">Page HTML Content</label>
                  <textarea 
                    value={formData.content} 
                    onChange={e => setFormData({...formData, content: e.target.value})} 
                    className="w-full flex-1 min-h-[300px] px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-600 text-sm font-mono"
                    placeholder="<h2>Welcome to our page</h2><p>You can write HTML here...</p>"
                  ></textarea>
                  <p className="text-xs text-slate-500">You can use standard HTML tags for formatting.</p>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600" />
                  <label htmlFor="isActive" className="text-sm font-bold text-slate-700">Publish Page</label>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-3xl shrink-0">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button type="submit" form="pageForm" disabled={saving} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-colors disabled:opacity-50 flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageManage;
