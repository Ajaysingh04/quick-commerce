import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile } from '../../store/authSlice.js';
import API from '../../services/api.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { User, ShieldCheck, KeyRound, Check, Settings2, Activity, Camera, Lock, Eye, EyeOff, Save, Globe, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminProfile = () => {
 const dispatch = useDispatch();
 const { user } = useSelector(state => state.auth);
 const { settings, setSettings } = useSettings();

 const [activeTab, setActiveTab] = useState('personal');

 // Personal Info State
 const [name, setName] = useState(user?.name || 'Super Admin');
 const [email, setEmail] = useState(user?.email || 'admin@appsica.com');
 const [profilePhoto, setProfilePhoto] = useState(user?.avatar || null);
 const [faviconPreview, setFaviconPreview] = useState(settings.faviconUrl || null);
 const [logoPreview, setLogoPreview] = useState(settings.logoUrl || null);
 
 // Security State
 const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [twoFactorAuth, setTwoFactorAuth] = useState(true);

 // System Settings State
 const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(500);
 const [maintenanceMode, setMaintenanceMode] = useState(false);
 const [maxRadius, setMaxRadius] = useState(15);
 const [isSavingSystem, setIsSavingSystem] = useState(false);

 const [success, setSuccess] = useState('');

 const handleUpdateProfile = async (e) => {
 e.preventDefault();
 setSuccess('');
 try {
 await API.put('/user/profile', { name, email });
 dispatch(updateUserProfile({ name, email }));
 setSuccess('Profile updated successfully!');
 } catch (err) {
 dispatch(updateUserProfile({ name, email }));
 setSuccess('Profile updated locally.');
 }
 setTimeout(() => setSuccess(''), 3000);
 };

 const [uploading, setUploading] = useState(false);

 const handleImageUpload = async (e, type) => {
 const file = e.target.files[0];
 if (!file) return;
 
 setUploading(true);
 const formData = new FormData();
 formData.append('image', file);
 
 try {
 if (type === 'profile') {
 const res = await API.put('/users/profile/avatar', formData, {
 headers: { 'Content-Type': 'multipart/form-data' }
 });
 if (res.data && res.data.avatar) {
 setProfilePhoto(res.data.avatar);
 dispatch(updateUserProfile(res.data));
 setSuccess('Profile photo saved to your account!');
 setTimeout(() => setSuccess(''), 3000);
 }
 } else {
 const res = await API.post('/settings/upload', formData, {
 headers: { 'Content-Type': 'multipart/form-data' }
 });
 const url = res.data.url;
 
 if (type === 'favicon') {
 setFaviconPreview(url);
 setSettings(prev => ({ ...prev, faviconUrl: url }));
 let link = document.querySelector("link[rel~='icon']");
 if (!link) {
 link = document.createElement('link');
 link.rel = 'icon';
 document.head.appendChild(link);
 }
 link.href = url;
 } else if (type === 'logo') {
 setLogoPreview(url);
 setSettings(prev => ({ ...prev, logoUrl: url }));
 }
 }
 } catch (err) {
 console.error('Upload failed', err);
 alert('Upload failed. Check console or server connection.');
 }
 setUploading(false);
 };

 const handleSaveSystemSettings = async () => {
 setIsSavingSystem(true);
 try {
 const payload = {
 freeDeliveryThreshold,
 maxRadius,
 maintenanceMode,
 faviconUrl: settings.faviconUrl,
 logoUrl: settings.logoUrl
 };
 await API.put('/settings', payload);
 alert('System settings applied successfully!');
 } catch (err) {
 console.error(err);
 alert('Failed to apply system settings.');
 }
 setIsSavingSystem(false);
 };

 const renderTabContent = () => {
 switch (activeTab) {
 case 'personal':
 return (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="space-y-6"
 >
 <div className="bg-white rounded-3xl p-8 border border-pink-200/60 shadow-xl relative overflow-hidden">
 <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
 
 <h2 className="text-xl font-black text-slate-800 mb-6 relative z-10 flex items-center gap-2">
 <User className="text-brand-500" /> Personal Information
 </h2>
 
 <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8 relative z-10">
 <div className="relative group">
 <div className="w-28 h-28 rounded-full bg-pink-100 border-4 border-white flex items-center justify-center text-4xl font-black text-brand-500 overflow-hidden shadow-lg">
 {profilePhoto ? (
 <img src={profilePhoto} alt="Admin" className="w-full h-full object-cover" />
 ) : (
 name.charAt(0)
 )}
 </div>
 <label className={`absolute bottom-0 right-0 p-2 bg-brand-500 text-white rounded-full transition-colors shadow-lg shadow-brand-500/20 ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-brand-600'}`}>
 <Camera size={16} />
 <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'profile')} disabled={uploading} />
 </label>
 </div>
 
 <div className="flex-1 w-full space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
 <input 
 type="text" 
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-pink-50/50 outline-none focus:border-brand-500 text-sm font-semibold text-slate-800 transition-colors"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
 <input 
 type="email" 
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-pink-50/50 outline-none focus:border-brand-500 text-sm font-semibold text-slate-800 transition-colors"
 />
 </div>
 </div>
 
 <div className="pt-4">
 <button 
 onClick={handleUpdateProfile}
 className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-rose-500 hover:from-brand-600 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
 >
 <Save size={18} /> Save Changes
 </button>
 
 <AnimatePresence>
 {success && (
 <motion.p 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0 }}
 className="mt-4 text-xs font-bold text-emerald-500 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 flex items-center gap-2 inline-flex"
 >
 <Check size={16} /> {success}
 </motion.p>
 )}
 </AnimatePresence>
 </div>
 </div>
 </div>
 </div>
 </motion.div>
 );

 case 'system':
 return (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="space-y-6"
 >
 <div className="bg-white rounded-3xl p-8 border border-pink-200/60 shadow-xl">
 <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
 <Settings2 className="text-blue-500" /> Platform Configurations
 </h2>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
 <div className="p-5 bg-pink-50 rounded-2xl border border-pink-200 ">
 <label className="block text-sm font-bold text-slate-800 mb-1">Free Delivery Threshold</label>
 <p className="text-xs text-slate-500 mb-4">Minimum order value for free delivery.</p>
 <div className="relative">
 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
 <input 
 type="number" 
 value={freeDeliveryThreshold}
 onChange={(e) => setFreeDeliveryThreshold(parseInt(e.target.value))}
 className="w-full pl-8 pr-4 py-3 rounded-xl border border-pink-200 bg-white outline-none focus:border-brand-500 text-sm font-bold text-slate-800 "
 />
 </div>
 </div>

 <div className="p-5 bg-pink-50 rounded-2xl border border-pink-200 ">
 <label className="block text-sm font-bold text-slate-800 mb-1">Max Delivery Radius</label>
 <p className="text-xs text-slate-500 mb-4">Maximum operational radius per store.</p>
 <div className="relative">
 <input 
 type="number" 
 value={maxRadius}
 onChange={(e) => setMaxRadius(parseInt(e.target.value))}
 className="w-full pl-4 pr-12 py-3 rounded-xl border border-pink-200 bg-white outline-none focus:border-brand-500 text-sm font-bold text-slate-800 "
 />
 <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">KM</span>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
 {/* Logo Upload Block */}
 <div className="p-5 bg-pink-50 rounded-2xl border border-pink-200 flex flex-col justify-between">
 <div className="mb-4">
 <h3 className="text-sm font-bold text-slate-800 mb-1">Dashboard Logo</h3>
 <p className="text-xs text-slate-500">Update the main logo in the sidebar.</p>
 </div>
 <div className="flex items-center justify-between mt-auto">
 <div className="h-10 px-4 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden">
 {logoPreview ? (
 <img src={logoPreview} alt="Logo" className="h-6 object-contain" />
 ) : (
 <ImageIcon size={20} className="text-slate-400" />
 )}
 </div>
 <label className={`px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-brand-500/20 ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
 {uploading ? 'Uploading...' : 'Upload Logo'}
 <input type="file" accept="image/png, image/jpeg, image/svg+xml" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} disabled={uploading} />
 </label>
 </div>
 </div>

 {/* Favicon Upload Block */}
 <div className="p-5 bg-pink-50 rounded-2xl border border-pink-200 flex flex-col justify-between">
 <div className="mb-4">
 <h3 className="text-sm font-bold text-slate-800 mb-1">Site Favicon</h3>
 <p className="text-xs text-slate-500">Update the small icon shown in the browser tab.</p>
 </div>
 <div className="flex items-center justify-between mt-auto">
 <div className="w-10 h-10 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden">
 {faviconPreview ? (
 <img src={faviconPreview} alt="Favicon" className="w-full h-full object-cover" />
 ) : (
 <Globe size={20} className="text-slate-400" />
 )}
 </div>
 <label className={`px-4 py-2 bg-slate-200 hover:bg-slate-300 :bg-slate-600 text-slate-800 text-xs font-bold rounded-lg transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
 {uploading ? 'Uploading...' : 'Upload Icon'}
 <input type="file" accept="image/png, image/x-icon, image/jpeg" className="hidden" onChange={(e) => handleImageUpload(e, 'favicon')} disabled={uploading} />
 </label>
 </div>
 </div>
 </div>

 <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between">
 <div>
 <h3 className="text-sm font-bold text-rose-600 flex items-center gap-2">
 <Globe size={18} /> Maintenance Mode
 </h3>
 <p className="text-xs text-slate-500 mt-1 max-w-sm">
 Activate this to lock down the user client apps while backend updates are being deployed.
 </p>
 </div>
 <div 
 onClick={() => setMaintenanceMode(!maintenanceMode)}
 className={`w-14 h-7 rounded-full cursor-pointer relative transition-colors shadow-inner ${maintenanceMode ? 'bg-rose-500' : 'bg-slate-300 '}`}
 >
 <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${maintenanceMode ? 'translate-x-7' : 'translate-x-0'}`} />
 </div>
 </div>

 <div className="mt-8 flex justify-end">
 <button 
 onClick={handleSaveSystemSettings}
 disabled={isSavingSystem}
 className={`px-8 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all ${isSavingSystem ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
 >
 {isSavingSystem ? 'Saving...' : 'Apply System Settings'}
 </button>
 </div>
 </div>
 </motion.div>
 );

 case 'security':
 return (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="space-y-6"
 >
 <div className="bg-white rounded-3xl p-8 border border-pink-200/60 shadow-xl">
 <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
 <ShieldCheck className="text-emerald-500" /> Security Controls
 </h2>
 
 <div className="max-w-md space-y-6">
 <div>
 <h3 className="text-sm font-bold text-slate-800 mb-4">Change Admin Password</h3>
 <div className="space-y-4">
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">New Password</label>
 <div className="relative">
 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
 <input 
 type={showPassword ? 'text' : 'password'} 
 placeholder="Enter new password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full pl-10 pr-12 py-3 rounded-xl border border-pink-200 bg-pink-50/50 outline-none focus:border-emerald-500 text-sm font-semibold text-slate-800 "
 />
 <button 
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 :text-white"
 >
 {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
 </button>
 </div>
 </div>
 <button className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
 Update Password
 </button>
 </div>
 </div>
 
 <div className="pt-6 border-t border-pink-200 ">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-sm font-bold text-slate-800 ">Two-Factor Authentication (2FA)</h3>
 <p className="text-xs text-slate-500 mt-1">Require an OTP sent to your email to login.</p>
 </div>
 <div 
 onClick={() => setTwoFactorAuth(!twoFactorAuth)}
 className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors ${twoFactorAuth ? 'bg-emerald-500' : 'bg-slate-300 '}`}
 >
 <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${twoFactorAuth ? 'translate-x-6' : 'translate-x-0'}`} />
 </div>
 </div>
 </div>
 </div>
 </div>
 </motion.div>
 );

 case 'logs':
 return (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="space-y-6"
 >
 <div className="bg-white rounded-3xl p-8 border border-pink-200/60 shadow-xl">
 <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
 <Activity className="text-amber-500" /> Admin Audit Logs
 </h2>
 
 <div className="space-y-3">
 {[
 { msg: 'Admin session login successful', ip: '192.168.1.45', time: 'Just Now', type: 'auth' },
 { msg: 'Dish metadata updated (Smoked Truffle Burger)', ip: '192.168.1.45', time: '10 mins ago', type: 'action' },
 { msg: 'Voucher campaign FESTIVE20 created', ip: '192.168.1.45', time: '1 hour ago', type: 'action' },
 { msg: 'System Maintenance Mode toggled OFF', ip: '192.168.1.45', time: 'Yesterday, 4:00 PM', type: 'system' },
 { msg: 'Failed login attempt detected', ip: '45.22.19.102', time: 'Yesterday, 2:15 PM', type: 'alert' },
 ].map((log, i) => (
 <div key={i} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-2xl bg-pink-50 border border-pink-200 gap-2">
 <div className="flex items-center gap-3">
 <div className={`w-2 h-2 rounded-full ${
 log.type === 'auth' ? 'bg-emerald-500' : 
 log.type === 'alert' ? 'bg-rose-500 animate-pulse' : 
 log.type === 'system' ? 'bg-blue-500' : 'bg-amber-500'
 }`} />
 <span className="text-sm font-bold text-slate-700 ">{log.msg}</span>
 </div>
 <div className="flex items-center gap-4 text-xs font-medium text-slate-400 pl-5 sm:pl-0">
 <span className="font-mono bg-slate-200 px-2 py-0.5 rounded-md">{log.ip}</span>
 <span>{log.time}</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </motion.div>
 );
 
 default:
 return null;
 }
 };

 const tabs = [
 { id: 'personal', label: 'Personal Info', icon: User },
 { id: 'system', label: 'Platform Config', icon: Settings2 },
 { id: 'security', label: 'Security', icon: KeyRound },
 { id: 'logs', label: 'Audit Logs', icon: Activity },
 ];

 return (
 <div className="max-w-6xl mx-auto pb-12">
 <div className="mb-8">
 <h1 className="text-2xl font-black text-slate-800 mb-2">Admin Profile & Settings</h1>
 <p className="text-slate-500 text-sm">Manage your administrator account and global platform configurations.</p>
 </div>

 {/* Custom Tabs Navigation */}
 <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl border border-pink-200/60 shadow-sm w-fit">
 {tabs.map(tab => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
 activeTab === tab.id 
 ? 'bg-slate-900 text-white shadow-md' 
 : 'text-slate-500 hover:text-slate-800 :text-white hover:bg-pink-50 :bg-slate-800/50'
 }`}
 >
 <tab.icon size={16} className={activeTab === tab.id ? 'text-brand-500' : ''} />
 {tab.label}
 </button>
 ))}
 </div>

 {/* Tab Content */}
 <AnimatePresence mode="wait">
 {renderTabContent()}
 </AnimatePresence>

 </div>
 );
};

export default AdminProfile;
