import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
 Store, MapPin, Building, Clock, Save, Camera as ImageIcon
} from 'lucide-react';

const Profile = () => {
 const [profile, setProfile] = useState(null);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [uploadingImage, setUploadingImage] = useState(false);

 useEffect(() => {
 fetchProfile();
 }, []);

 const fetchProfile = async () => {
 try {
 const res = await API.get('/partner/profile');
 setProfile(res.data);
 } catch (err) {
 console.error(err);
 // Fallback
 setProfile({
 name: 'The Great Indian Kitchen',
 description: 'Authentic North Indian cuisine served with love.',
 bannerImage: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80',
 address: { street: '123 Main St', city: 'Mumbai', state: 'MH', zipCode: '400001' },
 bankDetails: { bankName: 'HDFC', accountNumber: '1234567890', accountHolderName: 'John Doe', ifscCode: 'HDFC0001' },
 gstDetails: { gstNumber: '27AAAAA0000A1Z5', panNumber: 'AAAAA0000A' },
 openingHours: { open: '10:00', close: '23:00' }
 });
 } finally {
 setLoading(false);
 }
 };

 const handleChange = (section, field, value) => {
 setProfile(prev => {
 if (section) {
 return { ...prev, [section]: { ...prev[section], [field]: value } };
 }
 return { ...prev, [field]: value };
 });
 };

 const uploadBannerHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataBody = new FormData();
    formDataBody.append('image', file);
    setUploadingImage(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await API.post('/upload', formDataBody, config);
      setProfile(prev => ({ ...prev, bannerImage: data.url || data }));
    } catch (error) {
      console.error(error);
      alert('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

 const handleSave = async (e) => {
 e.preventDefault();
 setSaving(true);
 try {
 await API.put('/partner/profile', profile);
 alert('Profile updated successfully!');
 } catch (err) {
 alert('Failed to update profile');
 } finally {
 setSaving(false);
 }
 };

 if (loading) return <div className="p-8 text-center animate-pulse text-slate-500">Loading profile...</div>;

 return (
 <div className="max-w-4xl mx-auto space-y-6">
 
 {/* Cover Image & Basic Info */}
 <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
 <div className="h-48 bg-slate-200 relative group overflow-hidden">
  <img src={profile.bannerImage} alt="Cover" className="w-full h-full object-cover" />
  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
  <div className="flex flex-col items-center text-white">
  <ImageIcon className="w-8 h-8 mb-2" />
  <span className="text-sm font-bold">
    {uploadingImage ? 'Uploading...' : 'Change Cover'}
  </span>
  </div>
  <input 
    type="file" 
    className="hidden" 
    onChange={uploadBannerHandler} 
    disabled={uploadingImage}
  />
  </label>
  </div>
 
 <div className="p-6 sm:px-10 relative">
 <div className="w-24 h-24 bg-white rounded-2xl border-4 border-white shadow-lg absolute -top-12 flex items-center justify-center">
 <Store className="w-10 h-10 text-[#e31837]" />
 </div>
 
 <div className="mt-14 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
  <div className="flex-1 w-full max-w-lg space-y-3">
  <div>
    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Store Name</label>
    <input 
      type="text" 
      value={profile.name || ''} 
      onChange={e => handleChange(null, 'name', e.target.value)} 
      className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-lg font-black text-slate-900 outline-none focus:border-[#e31837]" 
    />
  </div>
  <div>
    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Store Description</label>
    <textarea 
      rows="2" 
      value={profile.description || ''} 
      onChange={e => handleChange(null, 'description', e.target.value)} 
      className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm text-slate-700 outline-none focus:border-[#e31837] resize-none"
    ></textarea>
  </div>
  </div>
 <button 
 onClick={handleSave}
 disabled={saving}
 className="px-6 py-2.5 bg-[#e31837] text-white font-bold rounded-xl flex items-center gap-2 hover:bg-[#c8102e] transition-all shadow-md shadow-[#e31837]/20 disabled:opacity-70"
 >
 <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
 </button>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Contact & Location */}
 <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
 <div className="flex items-center gap-2 mb-6 text-slate-800 ">
 <MapPin className="w-5 h-5 text-[#e31837]" />
 <h3 className="text-lg font-black">Location Details</h3>
 </div>
 <div className="space-y-4">
 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Street Address</label>
 <input type="text" value={profile.address?.street || ''} onChange={e => handleChange('address', 'street', e.target.value)} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-medium" />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">City</label>
 <input type="text" value={profile.address?.city || ''} onChange={e => handleChange('address', 'city', e.target.value)} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-medium" />
 </div>
 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Pincode</label>
 <input type="text" value={profile.address?.zipCode || ''} onChange={e => handleChange('address', 'zipCode', e.target.value)} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-medium" />
 </div>
 </div>
  <div className="grid grid-cols-2 gap-4">
  <div>
  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Max Delivery Radius (in KM)</label>
  <input type="number" value={profile.distance || ''} onChange={e => handleChange(null, 'distance', e.target.value)} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-medium" />
  </div>
  <div>
  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Avg Delivery Time (mins)</label>
  <input type="number" value={profile.deliveryTime || ''} onChange={e => handleChange(null, 'deliveryTime', e.target.value)} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-medium" />
  </div>
  </div>
  <div>
  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Cost For Two (₹) (Optional Min Order)</label>
  <input type="number" value={profile.costForTwo || ''} onChange={e => handleChange(null, 'costForTwo', e.target.value)} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-medium" />
  </div>
 </div>
 </div>

 {/* Operating Hours */}
 <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
 <div className="flex items-center gap-2 mb-6 text-slate-800 ">
 <Clock className="w-5 h-5 text-orange-500" />
 <h3 className="text-lg font-black">Operating Hours</h3>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Opening Time</label>
 <input type="time" value={profile.openingHours?.open || '10:00'} onChange={e => handleChange('openingHours', 'open', e.target.value)} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-medium" />
 </div>
 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Closing Time</label>
 <input type="time" value={profile.openingHours?.close || '22:00'} onChange={e => handleChange('openingHours', 'close', e.target.value)} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-medium" />
 </div>
 </div>
 </div>

 {/* Bank & Tax Details */}
 <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm md:col-span-2">
 <div className="flex items-center gap-2 mb-6 text-slate-800 ">
 <Building className="w-5 h-5 text-emerald-500" />
 <h3 className="text-lg font-black">Financial & Tax Details</h3>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-4">
 <h4 className="text-sm font-bold border-b border-gray-200 pb-2">Bank Account</h4>
 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Account Holder Name</label>
 <input type="text" value={profile.bankDetails?.accountHolderName || ''} onChange={e => handleChange('bankDetails', 'accountHolderName', e.target.value)} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-medium" />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Account Number</label>
 <input type="password" value={profile.bankDetails?.accountNumber || ''} onChange={e => handleChange('bankDetails', 'accountNumber', e.target.value)} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-medium font-mono tracking-widest" />
 </div>
 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">IFSC Code</label>
 <input type="text" value={profile.bankDetails?.ifscCode || ''} onChange={e => handleChange('bankDetails', 'ifscCode', e.target.value)} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-medium uppercase" />
 </div>
 </div>
 </div>

 <div className="space-y-4">
 <h4 className="text-sm font-bold border-b border-gray-200 pb-2">Tax Registration</h4>
 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">GSTIN Number</label>
 <input type="text" value={profile.gstDetails?.gstNumber || ''} onChange={e => handleChange('gstDetails', 'gstNumber', e.target.value)} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-medium uppercase font-mono" />
 </div>
 <div>
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">PAN Number</label>
 <input type="text" value={profile.gstDetails?.panNumber || ''} onChange={e => handleChange('gstDetails', 'panNumber', e.target.value)} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-medium uppercase font-mono" />
 </div>
 </div>
 </div>
 </div>

 </div>

 </div>
 );
};

export default Profile;
