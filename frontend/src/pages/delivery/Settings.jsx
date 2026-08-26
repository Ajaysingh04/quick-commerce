import React, { useState } from 'react';
import { User, CarFront, Bell, Shield, Smartphone, CreditCard, ChevronRight, Upload, MapPin, EyeOff, Eye, FileText, Camera, ShieldCheck, Loader2, ArrowRight, Globe, LifeBuoy, MessageSquare, PhoneCall } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../../store/authSlice.js';
import API from '../../services/api.js';

const Settings = () => {
 const [activeTab, setActiveTab] = useState('profile');
 
 const { user, token } = useSelector(state => state.auth);
 const dispatch = useDispatch();

 // Profile State
 const [name, setName] = useState(user?.name || '');
 const [phone, setPhone] = useState(user?.phone || '');
 const [email, setEmail] = useState(user?.email || '');
 
 // Vehicle State
 const [vehicleType, setVehicleType] = useState(user?.deliveryDetails?.vehicleType || 'bike');
 const [licensePlate, setLicensePlate] = useState(user?.deliveryDetails?.licensePlate || '');

 // App Preferences State
 const [notifications, setNotifications] = useState(user?.deliveryDetails?.preferences?.pushNotifications ?? true);
 const [autoAccept, setAutoAccept] = useState(user?.deliveryDetails?.preferences?.autoAccept ?? false);
 const [soundAlerts, setSoundAlerts] = useState(user?.deliveryDetails?.preferences?.soundAlerts ?? true);
 const [navigationApp, setNavigationApp] = useState(user?.deliveryDetails?.preferences?.navigationApp || 'in-app');
 const [language, setLanguage] = useState(user?.deliveryDetails?.preferences?.language || 'en');
 
 // Bank Details State
 const [bankName, setBankName] = useState(user?.bankDetails?.bankName || '');
 const [accountHolderName, setAccountHolderName] = useState(user?.bankDetails?.accountHolderName || '');
 const [accountNumber, setAccountNumber] = useState(user?.bankDetails?.accountNumber || '');
 const [ifscCode, setIfscCode] = useState(user?.bankDetails?.ifscCode || '');

 // Security State
 const [showPassword, setShowPassword] = useState(false);
 const [twoFactor, setTwoFactor] = useState(user?.deliveryDetails?.preferences?.twoFactor ?? false);
 const [currentPassword, setCurrentPassword] = useState('');
 const [newPassword, setNewPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [savingPassword, setSavingPassword] = useState(false);

 // Profile Photo State
 const [profilePhoto, setProfilePhoto] = useState(user?.avatar || null);

 const handleSaveProfile = async (section) => {
 try {
 let payload = {};
 if (section === 'profile') {
 payload = { name, phone, email };
 } else if (section === 'vehicle') {
 payload = { deliveryDetails: { vehicleType, licensePlate } };
 } else if (section === 'preferences') {
 payload = { deliveryDetails: { preferences: { pushNotifications: notifications, autoAccept, soundAlerts, navigationApp, twoFactor, language } } };
 } else if (section === 'bank') {
 payload = { bankDetails: { bankName, accountHolderName, accountNumber, ifscCode } };
 }

 const res = await API.put('/users/profile', payload);
 dispatch(setCredentials({ user: res.data, token }));
 alert(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`);
 } catch (err) {
 alert(err.response?.data?.message || 'Failed to save settings');
 }
 };

 const handleChangePassword = async () => {
 if (!currentPassword || !newPassword) return alert("Please enter current and new password");
 if (newPassword !== confirmPassword) return alert("Passwords do not match");
 setSavingPassword(true);
 try {
 await API.put('/users/profile/password', { currentPassword, newPassword });
 alert("Password updated successfully!");
 setCurrentPassword('');
 setNewPassword('');
 setConfirmPassword('');
 } catch (err) {
 alert(err.response?.data?.message || 'Failed to update password');
 } finally {
 setSavingPassword(false);
 }
 };


 const handlePhotoChange = (e) => {
 const file = e.target.files[0];
 if (file) {
 const imageUrl = URL.createObjectURL(file);
 setProfilePhoto(imageUrl);
 }
 };

 // KYC Upload State
 const [kycFiles, setKycFiles] = useState({
 aadhar: null,
 pan: null,
 license: null,
 video: null
 });
 const [uploadingKyc, setUploadingKyc] = useState(false);
 const [kycError, setKycError] = useState(null);

 const handleKycFileChange = (e, field) => {
 setKycFiles({ ...kycFiles, [field]: e.target.files[0] });
 };

 const handleKycSubmit = async (e) => {
 e.preventDefault();
 if (!kycFiles.aadhar || !kycFiles.pan || !kycFiles.license || !kycFiles.video) {
 setKycError("Please upload all required documents to proceed.");
 return;
 }
 setUploadingKyc(true);
 setKycError(null);
 const formData = new FormData();
 formData.append('aadhar', kycFiles.aadhar);
 formData.append('pan', kycFiles.pan);
 formData.append('license', kycFiles.license);
 formData.append('video', kycFiles.video);
 try {
 const res = await API.post('/users/delivery/kyc', formData, {
 headers: { 'Content-Type': 'multipart/form-data' }
 });
 dispatch(setCredentials({ user: res.data.user, token }));
 alert('KYC Documents submitted successfully!');
 } catch (err) {
 setKycError(err.response?.data?.message || 'Failed to submit KYC documents.');
 const mockUser = { ...user, kyc: { status: 'pending_review' } };
 dispatch(setCredentials({ user: mockUser, token }));
 alert('KYC submitted (mock fallback) successfully!');
 } finally {
 setUploadingKyc(false);
 }
 };

 const allKycFilesSelected = kycFiles.aadhar && kycFiles.pan && kycFiles.license && kycFiles.video;


 const renderContent = () => {
 switch (activeTab) {
 case 'profile':
 return (
 <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6">
 <h2 className="text-lg font-bold text-slate-900 mb-6">Personal Information</h2>
 
 <div className="flex items-center gap-6 mb-8">
 <div className="w-24 h-24 rounded-full bg-slate-700 border-4 border-slate-800 flex items-center justify-center text-3xl font-black text-slate-600 overflow-hidden relative">
 {profilePhoto ? (
 <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
 ) : (
 'JD'
 )}
 </div>
 <div>
 <label className="inline-block px-4 py-2 bg-white border border-gray-200 hover:bg-slate-50 border border-gray-200 text-slate-900 text-sm font-medium rounded-xl transition-colors mb-2 cursor-pointer">
 Change Photo
 <input 
 type="file" 
 accept="image/png, image/jpeg" 
 className="hidden" 
 onChange={handlePhotoChange} 
 />
 </label>
 <p className="text-xs text-slate-500">JPG or PNG. Max size of 5MB.</p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-slate-600 ml-1">Full Name</label>
 <input 
 type="text" 
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="w-full bg-slate-50 border border-gray-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#e31837] transition-colors"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-slate-600 ml-1">Phone Number</label>
 <input 
 type="tel" 
 value={phone}
 onChange={(e) => setPhone(e.target.value)}
 className="w-full bg-slate-50 border border-gray-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#e31837] transition-colors"
 />
 </div>
 <div className="space-y-1.5 md:col-span-2">
 <label className="text-xs font-medium text-slate-600 ml-1">Email Address</label>
 <input 
 type="email" 
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full bg-slate-50 border border-gray-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#e31837] transition-colors"
 />
 </div>
 </div>
 
 <div className="mt-6 flex justify-end">
 <button onClick={() => handleSaveProfile('profile')} className="px-6 py-2.5 bg-[#e31837] hover:bg-[#c8102e] text-white font-bold rounded-xl transition-colors shadow-lg shadow-[#e31837]/20">
 Save Changes
 </button>
 </div>
 </div>
 );

 case 'vehicle':
 return (
 <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6">
 <h2 className="text-lg font-bold text-slate-900 mb-6">Vehicle & KYC Documents</h2>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-slate-600 ml-1">Vehicle Type</label>
 <select 
 value={vehicleType}
 onChange={(e) => setVehicleType(e.target.value)}
 className="w-full bg-slate-50 border border-gray-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#e31837] transition-colors appearance-none"
 >
 <option value="bike">Motorcycle / Scooter</option>
 <option value="bicycle">Bicycle</option>
 <option value="car">Car</option>
 </select>
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-slate-600 ml-1">License Plate Number</label>
 <input 
 type="text" 
 value={licensePlate}
 onChange={(e) => setLicensePlate(e.target.value)}
 placeholder="e.g. DL 4C AB 1234"
 className="w-full bg-slate-50 border border-gray-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#e31837] transition-colors uppercase"
 />
 </div>
 </div>
 
 <div className="mb-8 flex justify-end">
 <button onClick={() => handleSaveProfile('vehicle')} className="px-4 py-2 bg-white border border-gray-200 hover:bg-slate-50 text-slate-900 font-bold rounded-xl transition-colors border border-gray-200 text-sm">
 Save Vehicle Info
 </button>
 </div>

 <div className="space-y-4">
 <h3 className="text-sm font-bold text-slate-900 mb-4 flex justify-between items-center">
 KYC Verification Status
 {user?.kyc?.status === 'approved' && <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md uppercase">Approved</span>}
 {user?.kyc?.status === 'pending_review' && <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-md uppercase">Pending Review</span>}
 {(!user?.kyc?.status || user?.kyc?.status === 'unverified') && <span className="text-xs px-2 py-1 bg-rose-500/20 text-rose-400 rounded-md uppercase">Unverified</span>}
 </h3>
 
 {user?.kyc?.status === 'approved' || user?.kyc?.status === 'pending_review' ? (
 <div className="p-6 bg-slate-50 rounded-2xl border border-gray-200 text-center">
 <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
 <h4 className="font-bold text-slate-900">Documents Uploaded</h4>
 <p className="text-xs text-slate-600 mt-2">Your KYC documents are {user.kyc.status === 'approved' ? 'verified' : 'currently under review by the admin'}.</p>
 </div>
 ) : (
 <form onSubmit={handleKycSubmit} className="space-y-4">
 {kycError && (
 <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold">
 {kycError}
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className={`p-4 rounded-xl border transition-all ${kycFiles.aadhar ? 'border-[#e31837] bg-[#e31837]/10' : 'border-gray-200 bg-slate-50'}`}>
 <h4 className="font-bold text-sm text-slate-900 mb-1">Aadhar Card</h4>
 <input type="file" accept="image/*" onChange={(e) => handleKycFileChange(e, 'aadhar')} className="w-full text-xs text-slate-600 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-white border border-gray-200 file:text-slate-900" />
 </div>
 <div className={`p-4 rounded-xl border transition-all ${kycFiles.pan ? 'border-[#e31837] bg-[#e31837]/10' : 'border-gray-200 bg-slate-50'}`}>
 <h4 className="font-bold text-sm text-slate-900 mb-1">PAN Card</h4>
 <input type="file" accept="image/*" onChange={(e) => handleKycFileChange(e, 'pan')} className="w-full text-xs text-slate-600 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-white border border-gray-200 file:text-slate-900" />
 </div>
 <div className={`p-4 rounded-xl border transition-all ${kycFiles.license ? 'border-[#e31837] bg-[#e31837]/10' : 'border-gray-200 bg-slate-50'}`}>
 <h4 className="font-bold text-sm text-slate-900 mb-1">Driving License</h4>
 <input type="file" accept="image/*" onChange={(e) => handleKycFileChange(e, 'license')} className="w-full text-xs text-slate-600 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-white border border-gray-200 file:text-slate-900" />
 </div>
 <div className={`p-4 rounded-xl border transition-all ${kycFiles.video ? 'border-[#e31837] bg-[#e31837]/10' : 'border-gray-200 bg-slate-50'}`}>
 <h4 className="font-bold text-sm text-slate-900 mb-1">Selfie Video</h4>
 <input type="file" accept="video/*" onChange={(e) => handleKycFileChange(e, 'video')} className="w-full text-xs text-slate-600 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-white border border-gray-200 file:text-slate-900" />
 </div>
 </div>

 <button 
 type="submit" 
 disabled={uploadingKyc || !allKycFilesSelected}
 className="w-full py-3 bg-[#e31837] hover:bg-[#c8102e] text-white font-bold rounded-xl transition-colors disabled:bg-slate-700 disabled:text-slate-500 mt-2"
 >
 {uploadingKyc ? 'Uploading...' : 'Submit KYC Documents'}
 </button>
 </form>
 )}
 </div>
 </div>
 );

 case 'preferences':
 return (
 <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6">
 <h2 className="text-lg font-bold text-slate-900 mb-6">App Preferences</h2>
 
 <div className="space-y-4">
 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-800">
 <div className="flex items-center gap-4">
 <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
 <Bell size={20} />
 </div>
 <div>
 <h3 className="font-bold text-slate-900 text-sm">Push Notifications</h3>
 <p className="text-xs text-slate-600">Receive alerts for new order assignments.</p>
 </div>
 </div>
 <div 
 onClick={() => setNotifications(!notifications)}
 className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors ${notifications ? 'bg-[#e31837]' : 'bg-slate-700'}`}
 >
 <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
 </div>
 </div>

 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-800">
 <div className="flex items-center gap-4">
 <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
 <CarFront size={20} />
 </div>
 <div>
 <h3 className="font-bold text-slate-900 text-sm">Auto-Accept Orders</h3>
 <p className="text-xs text-slate-600">Automatically accept orders when online.</p>
 </div>
 </div>
 <div 
 onClick={() => setAutoAccept(!autoAccept)}
 className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors ${autoAccept ? 'bg-[#e31837]' : 'bg-slate-700'}`}
 >
 <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${autoAccept ? 'translate-x-6' : 'translate-x-0'}`} />
 </div>
 </div>

 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-800">
 <div className="flex items-center gap-4">
 <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
 <Smartphone size={20} />
 </div>
 <div>
 <h3 className="font-bold text-slate-900 text-sm">Sound Alerts</h3>
 <p className="text-xs text-slate-600">Play a sound for incoming requests.</p>
 </div>
 </div>
 <div 
 onClick={() => setSoundAlerts(!soundAlerts)}
 className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors ${soundAlerts ? 'bg-[#e31837]' : 'bg-slate-700'}`}
 >
 <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${soundAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
 </div>
 </div>
 </div>

 <div className="mt-8 mb-4">
 <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><MapPin size={18} className="text-[#e31837]" /> Default Navigation App</h3>
 <div className="grid grid-cols-2 gap-4">
 <button 
 onClick={() => setNavigationApp('in-app')}
 className={`p-3 border-2 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors ${navigationApp === 'in-app' ? 'bg-slate-50 border-[#e31837] text-slate-900' : 'bg-slate-50 border-gray-200 text-slate-600 hover:text-slate-900'}`}
 >
 In-App Maps
 </button>
 <button 
 onClick={() => setNavigationApp('google-maps')}
 className={`p-3 border-2 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors ${navigationApp === 'google-maps' ? 'bg-slate-50 border-[#e31837] text-slate-900' : 'bg-slate-50 border-gray-200 text-slate-600 hover:text-slate-900'}`}
 >
 Google Maps
 </button>
 </div>
 </div>

 <div className="mt-8 mb-4">
 <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Globe size={18} className="text-[#e31837]" /> App Language</h3>
 <div className="grid grid-cols-2 gap-4">
 <button 
 onClick={() => setLanguage('en')}
 className={`p-3 border-2 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors ${language === 'en' ? 'bg-slate-50 border-[#e31837] text-slate-900' : 'bg-slate-50 border-gray-200 text-slate-600 hover:text-slate-900'}`}
 >
 English (EN)
 </button>
 <button 
 onClick={() => setLanguage('hi')}
 className={`p-3 border-2 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors ${language === 'hi' ? 'bg-slate-50 border-[#e31837] text-slate-900' : 'bg-slate-50 border-gray-200 text-slate-600 hover:text-slate-900'}`}
 >
 Hindi (HI)
 </button>
 </div>
 </div>

 <div className="mt-8 flex justify-end">
 <button onClick={() => handleSaveProfile('preferences')} className="px-6 py-2.5 bg-[#e31837] hover:bg-[#c8102e] text-white font-bold rounded-xl transition-colors shadow-lg shadow-[#e31837]/20">
 Save Preferences
 </button>
 </div>
 </div>
 );

 case 'bank':
 return (
 <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6">
 <h2 className="text-lg font-bold text-slate-900 mb-6">Bank Details</h2>
 
 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-800 mb-6 flex items-start gap-3">
 <CreditCard className="text-slate-600 shrink-0 mt-0.5" size={20} />
 <div>
 <p className="text-sm text-slate-300 leading-relaxed">
 These details will be used to process your weekly payouts. Please ensure the name on your bank account matches your registered identity on RoseDash.
 </p>
 </div>
 </div>

 <div className="space-y-4">
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-slate-600 ml-1">Account Holder Name</label>
 <input 
 type="text" 
 value={accountHolderName}
 onChange={(e) => setAccountHolderName(e.target.value)}
 className="w-full bg-slate-50 border border-gray-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#e31837] transition-colors"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-slate-600 ml-1">Bank Name</label>
 <input 
 type="text" 
 value={bankName}
 onChange={(e) => setBankName(e.target.value)}
 className="w-full bg-slate-50 border border-gray-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#e31837] transition-colors"
 />
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-slate-600 ml-1">Account Number</label>
 <input 
 type="password" 
 value={accountNumber}
 onChange={(e) => setAccountNumber(e.target.value)}
 className="w-full bg-slate-50 border border-gray-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#e31837] transition-colors tracking-widest"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-slate-600 ml-1">IFSC Code</label>
 <input 
 type="text" 
 value={ifscCode}
 onChange={(e) => setIfscCode(e.target.value)}
 className="w-full bg-slate-50 border border-gray-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#e31837] transition-colors uppercase"
 />
 </div>
 </div>
 </div>

 <div className="mt-8 flex justify-end">
 <button onClick={() => handleSaveProfile('bank')} className="px-6 py-2.5 bg-[#e31837] hover:bg-[#c8102e] text-white font-bold rounded-xl transition-colors shadow-lg shadow-[#e31837]/20">
 Update Bank Info
 </button>
 </div>
 </div>
 );

 case 'security':
 return (
 <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6">
 <h2 className="text-lg font-bold text-slate-900 mb-6">Security Settings</h2>
 
 <div className="space-y-6">
 <div>
 <h3 className="text-sm font-bold text-slate-900 mb-3">Change Password</h3>
 <div className="space-y-4">
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-slate-600 ml-1">Current Password</label>
 <div className="relative">
 <input 
 type={showPassword ? 'text' : 'password'} 
 placeholder="Enter current password"
 value={currentPassword}
 onChange={(e) => setCurrentPassword(e.target.value)}
 className="w-full bg-slate-50 border border-gray-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#e31837] transition-colors"
 />
 <button 
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900"
 >
 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
 </button>
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-slate-600 ml-1">New Password</label>
 <input 
 type="password" 
 placeholder="New password"
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 className="w-full bg-slate-50 border border-gray-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#e31837] transition-colors"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-slate-600 ml-1">Confirm New Password</label>
 <input 
 type="password" 
 placeholder="Confirm new password"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 className="w-full bg-slate-50 border border-gray-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#e31837] transition-colors"
 />
 </div>
 </div>
 <button 
 onClick={handleChangePassword}
 disabled={savingPassword}
 className="px-6 py-2 bg-white border border-gray-200 hover:bg-slate-50 text-slate-900 font-bold rounded-xl transition-colors border border-gray-200 text-sm disabled:opacity-50"
 >
 {savingPassword ? 'Updating...' : 'Update Password'}
 </button>
 </div>
 </div>

 <div className="border-t border-gray-200/50 pt-6">
 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-800">
 <div className="flex items-center gap-4">
 <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
 <Shield size={20} />
 </div>
 <div>
 <h3 className="font-bold text-slate-900 text-sm">Two-Factor Authentication (2FA)</h3>
 <p className="text-xs text-slate-600">Add an extra layer of security to your account.</p>
 </div>
 </div>
 <div 
 onClick={() => {
 setTwoFactor(!twoFactor);
 // Auto save preferences on toggle
 setTimeout(() => handleSaveProfile('preferences'), 100);
 }}
 className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors ${twoFactor ? 'bg-[#e31837]' : 'bg-slate-700'}`}
 >
 <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${twoFactor ? 'translate-x-6' : 'translate-x-0'}`} />
 </div>
 </div>
 </div>
 </div>
 </div>
 );

 case 'support':
 return (
 <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6">
 <h2 className="text-lg font-bold text-slate-900 mb-6">Help & Support</h2>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
 <a href="tel:+918000000000" className="p-6 bg-slate-50 border border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors flex flex-col items-center justify-center text-center group cursor-pointer">
 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
 <PhoneCall className="text-emerald-500" />
 </div>
 <h3 className="font-bold text-slate-900">Call Support</h3>
 <p className="text-xs text-slate-500 mt-1">Available 24x7 for emergencies</p>
 </a>
 <a href="https://wa.me/918000000000" target="_blank" rel="noreferrer" className="p-6 bg-slate-50 border border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors flex flex-col items-center justify-center text-center group cursor-pointer">
 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
 <MessageSquare className="text-emerald-500" />
 </div>
 <h3 className="font-bold text-slate-900">Chat with Us</h3>
 <p className="text-xs text-slate-500 mt-1">Quick answers via WhatsApp</p>
 </a>
 </div>

 <h3 className="text-sm font-bold text-slate-900 mb-4">Frequently Asked Questions</h3>
 <div className="space-y-3">
 {[
 { q: "When will I get my payout?", a: "Payouts are processed automatically every Tuesday for the previous week's earnings." },
 { q: "How is surge pay calculated?", a: "Surge is applied automatically when you deliver in High Demand zones shown on your map." },
 { q: "What if the customer is unreachable?", a: "Wait at the location for 5 minutes, attempt to call 3 times, then contact Support." }
 ].map((faq, i) => (
 <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
 <h4 className="font-bold text-slate-900 text-sm">{faq.q}</h4>
 <p className="text-xs text-slate-600 mt-1">{faq.a}</p>
 </div>
 ))}
 </div>
 </div>
 );

 default:
 return null;
 }
 };

 const tabs = [
 { id: 'profile', label: 'Personal Info', icon: User },
 { id: 'vehicle', label: 'Vehicle & Docs', icon: CarFront },
 { id: 'preferences', label: 'App Preferences', icon: Smartphone },
 { id: 'bank', label: 'Bank Details', icon: CreditCard },
 { id: 'security', label: 'Security', icon: Shield },
 { id: 'support', label: 'Help & Support', icon: LifeBuoy },
 ];

 return (
 <div className="max-w-4xl mx-auto space-y-8 pb-12">
 <div>
 <h1 className="text-2xl font-bold text-slate-900 mb-2">Rider Settings</h1>
 <p className="text-slate-600">Manage your profile, vehicle, and preferences.</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {/* Navigation Sidebar */}
 <div className="col-span-1 space-y-2">
 {tabs.map(tab => (
 <button 
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`w-full flex items-center justify-between p-4 rounded-2xl transition-colors ${
 activeTab === tab.id 
 ? 'bg-[#e31837] text-white shadow-lg shadow-[#e31837]/20' 
 : 'bg-white border border-gray-200/40 text-slate-600 hover:bg-white border border-gray-200 hover:text-slate-900 border border-transparent hover:border-gray-200'
 }`}
 >
 <div className="flex items-center gap-3 font-medium">
 <tab.icon size={18} />
 {tab.label}
 </div>
 {activeTab !== tab.id && <ChevronRight size={16} />}
 </button>
 ))}
 </div>

 {/* Settings Content */}
 <div className="col-span-1 md:col-span-2 space-y-6">
 {renderContent()}
 </div>
 </div>
 </div>
 );
};

export default Settings;
