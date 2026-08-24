import React, { useState, useEffect } from 'react';
import API from '../../services/api.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { Save, Image as ImageIcon, Globe, Palette, Loader2, Trash2, Plus, Percent, IndianRupee, ToggleLeft, ToggleRight, CalendarDays, Gift } from 'lucide-react';

const SystemSettings = () => {
 const { setSettings: setGlobalSettings } = useSettings();
 const [settings, setSettings] = useState({
 siteTitle: '',
 adminHeaderText: '',
 adminHeaderColor: '',
 faviconUrl: '',
 logoUrl: '',
 primaryColor: '#f43f5e',
 activeSeason: 'none',
 festivalOffer: {
   isActive: true,
   festivalName: 'Mega Sale',
   title: 'Up to 70% OFF',
   description: 'Stock up on your daily essentials.',
   buttonText: 'Shop the Sale',
   imageUrl: ''
 },
 customCharges: []
 });
 const [loading, setLoading] = useState(false);
 const [saving, setSaving] = useState(false);
 const [uploadingImage, setUploadingImage] = useState(false);
 const [message, setMessage] = useState(null);
 const [newCharge, setNewCharge] = useState({ name: '', type: 'percentage', value: 0 });

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

 const handleImageUpload = async (e, field, isFestival = false) => {
 const file = e.target.files[0];
 if (!file) return;

 const formData = new FormData();
 formData.append('image', file);

 setUploadingImage(true);
 try {
 const res = await API.post('/settings/upload', formData);
 if (isFestival) {
  setSettings({ ...settings, festivalOffer: { ...settings.festivalOffer, [field]: res.data.url } });
 } else {
  setSettings({ ...settings, [field]: res.data.url });
 }
 setMessage({ type: 'success', text: 'Image uploaded successfully!' });
 } catch (error) {
 setMessage({ type: 'error', text: 'Image upload failed. ' + (error.response?.data?.message || '') });
 } finally {
 setUploadingImage(false);
 }
 };

 const handleRemoveImage = (field, isFestival = false) => {
 if (isFestival) {
  setSettings({ ...settings, festivalOffer: { ...settings.festivalOffer, [field]: '' } });
 } else {
  setSettings({ ...settings, [field]: '' });
 }
 };

 const handleAddCharge = () => {
 if (!newCharge.name || newCharge.value <= 0) return;
 const season = settings.activeSeason === 'none' ? 'all' : settings.activeSeason;
 const charge = {
 ...newCharge,
 id: 'charge-' + Date.now(),
 isActive: true,
 season: season
 };
 setSettings(prev => ({
 ...prev,
 customCharges: [...(prev.customCharges || []), charge]
 }));
 setNewCharge({ name: '', type: 'percentage', value: 0 });
 };

 const handleRemoveCharge = (id) => {
 setSettings(prev => ({
 ...prev,
 customCharges: (prev.customCharges || []).filter(c => c.id !== id)
 }));
 };

 const handleToggleCharge = (id) => {
 setSettings(prev => ({
 ...prev,
 customCharges: (prev.customCharges || []).map(c => 
 c.id === id ? { ...c, isActive: !c.isActive } : c
 )
 }));
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

 document.documentElement.style.setProperty('--emerald-50', mix(base, white, 10));
 document.documentElement.style.setProperty('--emerald-600', `${r} ${g} ${b}`);
 document.documentElement.style.setProperty('--emerald-600', mix(base, black, 90));
 document.documentElement.style.setProperty('--emerald-700', mix(base, black, 80));
 }
 }
 } catch (error) {
 console.error(error);
 setMessage({ type: 'error', text: 'Failed to update settings: ' + (error.response?.data?.message || error.message) });
 } finally {
 setSaving(false);
 }
 };

 if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

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

 <form onSubmit={handleSubmit} className="bg-white border border-emerald-200 rounded-3xl p-6 shadow-sm space-y-6">
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <Globe className="w-4 h-4 text-emerald-600" /> Site Title
 </label>
 <input 
 type="text" 
 name="siteTitle"
 value={settings.siteTitle || ''} 
 onChange={handleChange}
 className="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-sm"
 placeholder="e.g. RoseDash Delivery"
 />
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <Globe className="w-4 h-4 text-emerald-600" /> Admin Header Text
 </label>
 <input 
 type="text" 
 name="adminHeaderText"
 value={settings.adminHeaderText || ''} 
 onChange={handleChange}
 className="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-sm"
 placeholder="e.g. RoseDash Admin"
 />
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <Palette className="w-4 h-4 text-emerald-600" /> Admin Header Text Color (Hex)
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
 className="flex-1 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-sm uppercase"
 placeholder="Leave blank for default"
 />
 </div>
 <p className="text-xs text-slate-400">Choose a color for the admin header text. Leave empty for default theme color.</p>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <Palette className="w-4 h-4 text-emerald-600" /> Primary Color (Hex)
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
 className="flex-1 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-sm uppercase"
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center justify-between gap-2">
 <div className="flex items-center gap-2">
 <ImageIcon className="w-4 h-4 text-emerald-600" /> Favicon Image
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
 className="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-600/10 file:text-emerald-600 hover:file:bg-emerald-600/20"
 />
 {uploadingImage && <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />}
 </div>
 {settings.faviconUrl && <p className="text-xs text-emerald-500 font-medium">✓ Image selected</p>}
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center justify-between gap-2">
 <div className="flex items-center gap-2">
 <ImageIcon className="w-4 h-4 text-emerald-600" /> Dashboard Logo Image
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
 className="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-600/10 file:text-emerald-600 hover:file:bg-emerald-600/20"
 />
 {uploadingImage && <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />}
 </div>
 <p className="text-xs text-slate-400">If no logo uploaded, text will be displayed.</p>
 </div>
 </div>

 <div className="mt-8 border-t border-emerald-200 pt-8">
  <h2 className="text-lg font-bold text-slate-800 mb-6">Contact & Social Info</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700">Contact Email</label>
      <input type="email" name="contactEmail" value={settings.contactEmail || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-sm" placeholder="e.g. support@domain.com" />
    </div>
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700">Contact Phone</label>
      <input type="text" name="contactPhone" value={settings.contactPhone || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-sm" placeholder="e.g. +1234567890" />
    </div>
    <div className="space-y-2 md:col-span-2">
      <label className="text-sm font-bold text-slate-700">Contact Address</label>
      <input type="text" name="contactAddress" value={settings.contactAddress || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-sm" placeholder="e.g. 123 Main St, City" />
    </div>
    <div className="space-y-2 md:col-span-2">
      <label className="text-sm font-bold text-slate-700">Global Notice Banner</label>
      <input type="text" name="globalNotice" value={settings.globalNotice || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-sm" placeholder="e.g. 50% Off all products today!" />
    </div>
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700">Facebook URL</label>
      <input type="url" value={settings.socialLinks?.facebook || ''} onChange={(e) => setSettings({...settings, socialLinks: {...settings.socialLinks, facebook: e.target.value}})} className="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-sm" placeholder="https://facebook.com/..." />
    </div>
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700">Instagram URL</label>
      <input type="url" value={settings.socialLinks?.instagram || ''} onChange={(e) => setSettings({...settings, socialLinks: {...settings.socialLinks, instagram: e.target.value}})} className="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-sm" placeholder="https://instagram.com/..." />
    </div>
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700">Twitter URL</label>
      <input type="url" value={settings.socialLinks?.twitter || ''} onChange={(e) => setSettings({...settings, socialLinks: {...settings.socialLinks, twitter: e.target.value}})} className="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-sm" placeholder="https://twitter.com/..." />
    </div>
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700">LinkedIn URL</label>
      <input type="url" value={settings.socialLinks?.linkedin || ''} onChange={(e) => setSettings({...settings, socialLinks: {...settings.socialLinks, linkedin: e.target.value}})} className="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-sm" placeholder="https://linkedin.com/..." />
    </div>
  </div>
 </div>

 {/* Custom Charges Management Section */}
 <div className="mt-8 border-t border-emerald-200 pt-8">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
    <h2 className="text-lg font-bold text-slate-800">Manage Custom Extra Charges</h2>
    <div className="flex items-center gap-3">
      <span className="text-sm font-bold text-slate-700">Active Season:</span>
      <select 
        value={settings.activeSeason || 'none'}
        onChange={(e) => setSettings({...settings, activeSeason: e.target.value})}
        className="px-4 py-2 rounded-xl bg-white border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-bold text-emerald-700 shadow-sm"
      >
        <option value="none">None (Off-Season)</option>
        <option value="monsoon">Monsoon Season</option>
        <option value="winter">Winter Season</option>
        <option value="summer">Summer Season</option>
        <option value="diwali">Diwali/Festival Season</option>
      </select>
    </div>
  </div>

  <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200 mb-6">
    <div className="mb-4">
      <h3 className="text-sm font-bold text-slate-700">
        Existing Charges 
        {settings.activeSeason === 'none' ? ' (All-Season Charges only)' : ` (All-Season + ${settings.activeSeason.charAt(0).toUpperCase() + settings.activeSeason.slice(1)} Charges)`}
      </h3>
      {settings.activeSeason === 'none' && (
        <p className="text-xs text-rose-500 font-semibold mt-1">Select a season above to add or manage season-specific charges.</p>
      )}
    </div>
    
    {(!settings.customCharges || settings.customCharges.filter(c => c.season === 'all' || c.season === settings.activeSeason).length === 0) ? (
      <p className="text-sm text-slate-500 italic">No custom charges added for this view.</p>
    ) : (
      <div className="space-y-3">
        {settings.customCharges
          .filter(c => c.season === 'all' || c.season === settings.activeSeason)
          .map(charge => (
          <div key={charge.id} className={`flex items-center justify-between p-4 rounded-xl border ${charge.isActive ? 'bg-white border-emerald-200' : 'bg-slate-100 border-slate-200 opacity-60'}`}>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => handleToggleCharge(charge.id)} className={`transition-colors ${charge.isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                {charge.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
              </button>
              <div>
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  {charge.name} {charge.isActive ? '' : '(Inactive)'}
                  {charge.season === 'all' ? (
                    <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Permanent</span>
                  ) : (
                    <span className="bg-emerald-200 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Seasonal</span>
                  )}
                </h4>
                <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                  {charge.type === 'percentage' ? <Percent className="w-3 h-3" /> : <IndianRupee className="w-3 h-3" />}
                  {charge.value}{charge.type === 'percentage' ? '%' : ' flat'}
                </p>
              </div>
            </div>
            <button type="button" onClick={() => handleRemoveCharge(charge.id)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    )}
    
    <div className={`mt-6 pt-6 border-t border-emerald-200 ${settings.activeSeason === 'none' ? 'opacity-50 pointer-events-none' : ''}`}>
      <h3 className="text-sm font-bold text-slate-700 mb-4">Add New Charge (for {settings.activeSeason})</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <input 
          type="text" 
          placeholder="Charge Name (e.g. Rain Fee)" 
          value={newCharge.name}
          onChange={(e) => setNewCharge({...newCharge, name: e.target.value})}
          className="flex-1 px-4 py-3 rounded-xl bg-white border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
        />
        <select 
          value={newCharge.type}
          onChange={(e) => setNewCharge({...newCharge, type: e.target.value})}
          className="w-full sm:w-32 px-4 py-3 rounded-xl bg-white border border-emerald-200 focus:outline-none text-sm font-semibold"
        >
          <option value="percentage">Percent (%)</option>
          <option value="fixed">Flat (₹)</option>
        </select>
        <input 
          type="number" 
          placeholder="Amount" 
          value={newCharge.value || ''}
          onChange={(e) => setNewCharge({...newCharge, value: parseFloat(e.target.value) || 0})}
          className="w-full sm:w-32 px-4 py-3 rounded-xl bg-white border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
        />
        <button 
          type="button" 
          onClick={handleAddCharge}
          disabled={!newCharge.name || newCharge.value <= 0 || settings.activeSeason === 'none'}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
    </div>
  </div>
 </div>

 {/* Festival Offers Section */}
 <div className="mt-8 border-t border-emerald-200 pt-8">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-lg font-bold text-slate-800">Festival Banner Offer</h2>
    <div className="flex items-center gap-3">
      <span className="text-sm font-bold text-slate-700">Display Offer:</span>
      <button 
        type="button" 
        onClick={() => setSettings({...settings, festivalOffer: {...settings.festivalOffer, isActive: !settings.festivalOffer?.isActive}})} 
        className={`transition-colors ${settings.festivalOffer?.isActive ? 'text-emerald-500' : 'text-slate-400'}`}
      >
        {settings.festivalOffer?.isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
      </button>
    </div>
  </div>

  <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!settings.festivalOffer?.isActive ? 'opacity-50 pointer-events-none' : ''}`}>
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700">Festival Tag (e.g. Mega Sale, Diwali Special)</label>
      <input type="text" value={settings.festivalOffer?.festivalName || ''} onChange={(e) => setSettings({...settings, festivalOffer: {...settings.festivalOffer, festivalName: e.target.value}})} className="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm" />
    </div>
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700">Main Title (e.g. Up to 70% OFF)</label>
      <input type="text" value={settings.festivalOffer?.title || ''} onChange={(e) => setSettings({...settings, festivalOffer: {...settings.festivalOffer, title: e.target.value}})} className="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm" />
    </div>
    <div className="space-y-2 md:col-span-2">
      <label className="text-sm font-bold text-slate-700">Description</label>
      <input type="text" value={settings.festivalOffer?.description || ''} onChange={(e) => setSettings({...settings, festivalOffer: {...settings.festivalOffer, description: e.target.value}})} className="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm" />
    </div>
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700">Button Text</label>
      <input type="text" value={settings.festivalOffer?.buttonText || ''} onChange={(e) => setSettings({...settings, festivalOffer: {...settings.festivalOffer, buttonText: e.target.value}})} className="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm" />
    </div>
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700">Background Image URL</label>
      <input type="url" value={settings.festivalOffer?.imageUrl || ''} onChange={(e) => setSettings({...settings, festivalOffer: {...settings.festivalOffer, imageUrl: e.target.value}})} className="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm" placeholder="Leave empty for default" />
    </div>
  </div>
 </div>

 {/* Previews */}
 <div className="mt-8 p-6 border border-dashed border-emerald-200 rounded-2xl">
 <h3 className="text-sm font-bold text-slate-800 mb-4">Live Preview</h3>
 <div className="flex items-center gap-6">
 <div className="flex flex-col items-center gap-2">
 <span className="text-xs text-slate-500 font-semibold">Favicon</span>
 <div className="w-10 h-10 rounded shadow-sm border border-emerald-200 flex items-center justify-center bg-emerald-100 overflow-hidden">
 {settings.faviconUrl ? <img src={settings.faviconUrl} alt="Favicon" className="w-6 h-6" /> : <Globe className="w-5 h-5 text-slate-400" />}
 </div>
 </div>
 <div className="h-10 w-px bg-slate-200 "></div>
 <div className="flex flex-col items-start gap-2">
 <span className="text-xs text-slate-500 font-semibold">Dashboard Logo</span>
 <div className="flex items-center h-10 px-4 rounded border border-emerald-200 bg-emerald-50 ">
 {settings.logoUrl ? (
 <img src={settings.logoUrl} alt="Logo" className="h-6 object-contain" />
 ) : (
 <span className="font-extrabold text-sm" style={{ color: settings.adminHeaderColor || settings.primaryColor }}>{settings.adminHeaderText || settings.siteTitle || 'RoseDash Admin'}</span>
 )}
 </div>
 </div>
 </div>
 </div>

 <div className="flex justify-end pt-4 border-t border-emerald-200 ">
 <button 
 type="submit" 
 disabled={saving}
 className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-70"
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
