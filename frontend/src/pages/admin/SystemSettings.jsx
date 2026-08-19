import React, { useState, useEffect } from 'react';
import API from '../../services/api.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { Save, Image as ImageIcon, Globe, Palette, Loader2, Trash2 } from 'lucide-react';

const SystemSettings = () => {
 const { setSettings: setGlobalSettings } = useSettings();
 const [settings, setSettings] = useState({
 siteTitle: '',
 adminHeaderText: '',
 adminHeaderColor: '',
 faviconUrl: '',
 logoUrl: '',
 primaryColor: '#f43f5e'
 });
 const [loading, setLoading] = useState(false);
 const [saving, setSaving] = useState(false);
 const [uploadingImage, setUploadingImage] = useState(false);
 const [message, setMessage] = useState(null);

 useEffect(() => {
 fetchSettings();
 }, []);

 const fetchSettings = async () => {
 setLoading(true);
 try {
 const res = await API.get('/settings');
 setSettings(res.data);
 } catch (error) {
 console.error('Failed to load settings', error);
 } finally {
 setLoading(false);
 }
 };

 const handleChange = (e) => {
 setSettings({ ...settings, [e.target.name]: e.target.value });
 };

 const handleImageUpload = async (e, field) => {
 const file = e.target.files[0];
 if (!file) return;

 const formData = new FormData();
 formData.append('image', file);

 setUploadingImage(true);
 try {
 const res = await API.post('/settings/upload', formData);
 setSettings({ ...settings, [field]: res.data.url });
 setMessage({ type: 'success', text: 'Image uploaded successfully!' });
 } catch (error) {
 setMessage({ type: 'error', text: 'Image upload failed. ' + (error.response?.data?.message || '') });
 } finally {
 setUploadingImage(false);
 }
 };

 const handleRemoveImage = (field) => {
 setSettings({ ...settings, [field]: '' });
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setSaving(true);
 setMessage(null);
 try {
 const res = await API.put('/settings', settings);
 setSettings(res.data);
 setGlobalSettings(res.data);
 setMessage({ type: 'success', text: 'Settings updated successfully!' });
 
 // Update DOM instantly for preview
 if (res.data.siteTitle) document.title = res.data.siteTitle;
 if (res.data.faviconUrl) {
 let link = document.querySelector("link[rel~='icon']");
 if (!link) {
 link = document.createElement('link');
 link.rel = 'icon';
 document.head.appendChild(link);
 }
 link.href = res.data.faviconUrl;
 }
 if (res.data.primaryColor) {
 const hex = res.data.primaryColor.startsWith('#') ? res.data.primaryColor : `#${res.data.primaryColor}`;
 if (hex.length === 7) {
 const r = parseInt(hex.substring(1, 3), 16);
 const g = parseInt(hex.substring(3, 5), 16);
 const b = parseInt(hex.substring(5, 7), 16);
 
 const mix = (c1, c2, weight) => {
 const w = weight / 100;
 return [
 Math.round(c1[0] * w + c2[0] * (1 - w)),
 Math.round(c1[1] * w + c2[1] * (1 - w)),
 Math.round(c1[2] * w + c2[2] * (1 - w))
 ].join(' ');
 };

 const base = [r, g, b];
 const white = [255, 255, 255];
 const black = [0, 0, 0];

 document.documentElement.style.setProperty('--brand-50', mix(base, white, 10));
 document.documentElement.style.setProperty('--brand-500', `${r} ${g} ${b}`);
 document.documentElement.style.setProperty('--brand-600', mix(base, black, 90));
 document.documentElement.style.setProperty('--brand-700', mix(base, black, 80));
 }
 }
 } catch (error) {
 console.error(error);
 setMessage({ type: 'error', text: 'Failed to update settings: ' + (error.response?.data?.message || error.message) });
 } finally {
 setSaving(false);
 }
 };

 if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

 return (
 <div className="max-w-4xl mx-auto space-y-6">
 <div className="flex items-center justify-between">
 <h1 className="text-2xl font-black text-slate-800 ">System Settings</h1>
 </div>

 {message && (
 <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
 {message.text}
 </div>
 )}

 <form onSubmit={handleSubmit} className="bg-white border border-pink-200 rounded-3xl p-6 shadow-sm space-y-6">
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <Globe className="w-4 h-4 text-brand-500" /> Site Title
 </label>
 <input 
 type="text" 
 name="siteTitle"
 value={settings.siteTitle || ''} 
 onChange={handleChange}
 className="w-full px-4 py-3 rounded-xl bg-pink-50 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm"
 placeholder="e.g. RoseDash Delivery"
 />
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <Globe className="w-4 h-4 text-brand-500" /> Admin Header Text
 </label>
 <input 
 type="text" 
 name="adminHeaderText"
 value={settings.adminHeaderText || ''} 
 onChange={handleChange}
 className="w-full px-4 py-3 rounded-xl bg-pink-50 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm"
 placeholder="e.g. RoseDash Admin"
 />
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <Palette className="w-4 h-4 text-brand-500" /> Admin Header Text Color (Hex)
 </label>
 <div className="flex items-center gap-3">
 <input 
 type="color" 
 name="adminHeaderColor"
 value={settings.adminHeaderColor || '#0f172a'} 
 onChange={handleChange}
 className="w-12 h-12 rounded-xl cursor-pointer border-0 p-0"
 />
 <input 
 type="text" 
 name="adminHeaderColor"
 value={settings.adminHeaderColor || ''} 
 onChange={handleChange}
 className="flex-1 px-4 py-3 rounded-xl bg-pink-50 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm uppercase"
 placeholder="Leave blank for default"
 />
 </div>
 <p className="text-xs text-slate-400">Choose a color for the admin header text. Leave empty for default theme color.</p>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <Palette className="w-4 h-4 text-brand-500" /> Primary Color (Hex)
 </label>
 <div className="flex items-center gap-3">
 <input 
 type="color" 
 name="primaryColor"
 value={settings.primaryColor || '#f43f5e'} 
 onChange={handleChange}
 className="w-12 h-12 rounded cursor-pointer border-0 p-0"
 />
 <input 
 type="text" 
 name="primaryColor"
 value={settings.primaryColor || '#f43f5e'} 
 onChange={handleChange}
 className="flex-1 px-4 py-3 rounded-xl bg-pink-50 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm uppercase"
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center justify-between gap-2">
 <div className="flex items-center gap-2">
 <ImageIcon className="w-4 h-4 text-brand-500" /> Favicon Image
 </div>
 {settings.faviconUrl && (
 <button type="button" onClick={() => handleRemoveImage('faviconUrl')} className="text-xs text-rose-500 font-bold hover:text-rose-600 flex items-center gap-1">
 <Trash2 className="w-3 h-3" /> Remove
 </button>
 )}
 </label>
 <div className="flex items-center gap-3">
 <input 
 type="file" 
 accept="image/*"
 onChange={(e) => handleImageUpload(e, 'faviconUrl')}
 disabled={uploadingImage}
 className="w-full px-4 py-3 rounded-xl bg-pink-50 border border-pink-200 focus:outline-none transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-500/10 file:text-brand-500 hover:file:bg-brand-500/20"
 />
 {uploadingImage && <Loader2 className="w-5 h-5 animate-spin text-brand-500" />}
 </div>
 {settings.faviconUrl && <p className="text-xs text-emerald-500 font-medium">✓ Image selected</p>}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center justify-between gap-2">
 <div className="flex items-center gap-2">
 <ImageIcon className="w-4 h-4 text-brand-500" /> Dashboard Logo Image
 </div>
 {settings.logoUrl && (
 <button type="button" onClick={() => handleRemoveImage('logoUrl')} className="text-xs text-rose-500 font-bold hover:text-rose-600 flex items-center gap-1">
 <Trash2 className="w-3 h-3" /> Remove
 </button>
 )}
 </label>
 <div className="flex items-center gap-3">
 <input 
 type="file" 
 accept="image/*"
 onChange={(e) => handleImageUpload(e, 'logoUrl')}
 disabled={uploadingImage}
 className="w-full px-4 py-3 rounded-xl bg-pink-50 border border-pink-200 focus:outline-none transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-500/10 file:text-brand-500 hover:file:bg-brand-500/20"
 />
 {uploadingImage && <Loader2 className="w-5 h-5 animate-spin text-brand-500" />}
 </div>
 <p className="text-xs text-slate-400">If no logo uploaded, text will be displayed.</p>
 </div>
 </div>

 {/* Previews */}
 <div className="mt-8 p-6 border border-dashed border-pink-200 rounded-2xl">
 <h3 className="text-sm font-bold text-slate-800 mb-4">Live Preview</h3>
 <div className="flex items-center gap-6">
 <div className="flex flex-col items-center gap-2">
 <span className="text-xs text-slate-500 font-semibold">Favicon</span>
 <div className="w-10 h-10 rounded shadow-sm border border-pink-200 flex items-center justify-center bg-pink-100 overflow-hidden">
 {settings.faviconUrl ? <img src={settings.faviconUrl} alt="Favicon" className="w-6 h-6" /> : <Globe className="w-5 h-5 text-slate-400" />}
 </div>
 </div>
 <div className="h-10 w-px bg-slate-200 "></div>
 <div className="flex flex-col items-start gap-2">
 <span className="text-xs text-slate-500 font-semibold">Dashboard Logo</span>
 <div className="flex items-center h-10 px-4 rounded border border-pink-200 bg-pink-50 ">
 {settings.logoUrl ? (
 <img src={settings.logoUrl} alt="Logo" className="h-6 object-contain" />
 ) : (
 <span className="font-extrabold text-sm" style={{ color: settings.adminHeaderColor || settings.primaryColor }}>{settings.adminHeaderText || settings.siteTitle || 'RoseDash Admin'}</span>
 )}
 </div>
 </div>
 </div>
 </div>

 <div className="flex justify-end pt-4 border-t border-pink-200 ">
 <button 
 type="submit" 
 disabled={saving}
 className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-70"
 >
 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
 Save Settings
 </button>
 </div>
 </form>
 </div>
 );
};

export default SystemSettings;
