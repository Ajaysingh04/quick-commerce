import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, ShoppingBag, Phone, Mail, Plus, Edit, Trash2, Check, CheckCircle, Clock, Navigation, X, LogOut, Heart, Search } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setCredentials, logout } from '../../store/authSlice';
import { clearCart } from '../../store/cartSlice';
import { useAuth } from '@clerk/clerk-react';
import API from '../../services/api';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ProductCard from '../../components/common/ProductCard';
import { PRODUCTS } from '../../data/mockProducts';

const customMarkerIcon = new L.Icon({
 iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
 iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
 shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
 iconSize: [25, 41],
 iconAnchor: [12, 41],
 popupAnchor: [1, -34],
 shadowSize: [41, 41]
});

const LocationPicker = ({ position, setPosition, onLocationSelect }) => {
 useMapEvents({
 click(e) {
 setPosition(e.latlng);
 if (onLocationSelect) onLocationSelect(e.latlng.lat, e.latlng.lng);
 },
 });
 return position ? <Marker position={position} icon={customMarkerIcon} /> : null;
};

const UserProfile = () => {
 const { user, token } = useSelector(state => state.auth);
 const dispatch = useDispatch();
 const { signOut } = useAuth();
 
 const handleLogout = () => {
 signOut().catch(() => {}).finally(() => {
 dispatch(logout());
 dispatch(clearCart());
 localStorage.removeItem('userLocation');
 window.location.href = '/';
 });
 };
 
 const [activeTab, setActiveTab] = useState('personal');
 const [profileData, setProfileData] = useState(null);
 const [orders, setOrders] = useState([]);
 const [loading, setLoading] = useState(true);
 const [selectedOrder, setSelectedOrder] = useState(null);
 
 // Wishlist from Redux
 const wishlistItems = useSelector(state => state.wishlist.items);
 const wishlistedProducts = PRODUCTS.filter(p => wishlistItems.includes(p.id));
 
 // Edit States
 const [isEditing, setIsEditing] = useState(false);
 const [editForm, setEditForm] = useState({
 name: '',
 email: '',
 phone: '',
 alternatePhone: ''
 });

 // Address States
 const [isAddingAddress, setIsAddingAddress] = useState(false);
 const [mapPosition, setMapPosition] = useState({ lat: 28.6139, lng: 77.2090 });
 const [newAddress, setNewAddress] = useState({
 label: 'Home',
 street: '',
 city: '',
 state: '',
 zipCode: '',
 coordinates: { lat: 28.6139, lng: 77.2090 }
 });

 useEffect(() => {
 fetchProfile();
 fetchOrders();
 }, []);

 const fetchProfile = async () => {
 try {
 const res = await API.get('/users/profile');
 setProfileData(res.data);
 setEditForm({
 name: res.data.name || '',
 email: res.data.email || '',
 phone: res.data.phone || '',
 alternatePhone: res.data.alternatePhone || ''
 });
 } catch (err) {
 alert('Failed to load profile');
 } finally {
 setLoading(false);
 }
 };

 const fetchOrders = async () => {
 try {
 const res = await API.get('/orders/myorders');
 setOrders(res.data);
 } catch (err) {
 console.error('Failed to fetch orders', err);
 }
 };

 const reverseGeocode = async (lat, lon) => {
 try {
 const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
 const data = await res.json();
 if (data && data.address) {
 setNewAddress(prev => ({
 ...prev,
 street: data.address.road || data.address.suburb || data.display_name.split(',')[0] || '',
 city: data.address.city || data.address.town || data.address.village || '',
 state: data.address.state || '',
 zipCode: data.address.postcode || '',
 coordinates: { lat, lng: lon }
 }));
 }
 } catch (error) {
 console.error("Geocoding failed", error);
 }
 };

 const handleGetCurrentLocation = () => {
 if (navigator.geolocation) {
 navigator.geolocation.getCurrentPosition(
 (position) => {
 const lat = position.coords.latitude;
 const lng = position.coords.longitude;
 setMapPosition({ lat, lng });
 reverseGeocode(lat, lng);
 },
 (error) => {
 alert('Unable to retrieve your location. Please check your browser permissions.');
 }
 );
 } else {
 alert('Geolocation is not supported by your browser');
 }
 };

 const handleProfileUpdate = async (e) => {
 e.preventDefault();
 try {
 const res = await API.put('/users/profile', editForm);
 setProfileData(res.data);
 dispatch(setCredentials({ user: res.data, token }));
 setIsEditing(false);
 alert('Profile updated successfully');
 } catch (err) {
 alert(err.response?.data?.message || 'Failed to update profile');
 }
 };

 const handleAddAddress = async (e) => {
 e.preventDefault();
 try {
 const updatedAddresses = [...(profileData.addresses || []), newAddress];
 const res = await API.put('/users/profile', { addresses: updatedAddresses });
 setProfileData(res.data);
 dispatch(setCredentials({ user: res.data, token }));
 setIsAddingAddress(false);
 setNewAddress({ label: 'Home', street: '', city: '', state: '', zipCode: '' });
 alert('Address added successfully');
 } catch (err) {
 alert('Failed to add address');
 }
 };

 const handleDeleteAddress = async (idx) => {
 try {
 const updatedAddresses = profileData.addresses.filter((_, i) => i !== idx);
 const res = await API.put('/users/profile', { addresses: updatedAddresses });
 setProfileData(res.data);
 dispatch(setCredentials({ user: res.data, token }));
 } catch (err) {
 alert('Failed to delete address');
 }
 };

 const handleCancelOrder = async (orderId) => {
 if (!window.confirm('Are you sure you want to cancel this order?')) return;
 try {
 const res = await API.put(`/orders/${orderId}/cancel`);
 setSelectedOrder(res.data);
 fetchOrders();
 } catch (err) {
 alert(err.response?.data?.message || 'Failed to cancel order');
 }
 };

 const handleRefundRequest = async (orderId) => {
 if (!window.confirm('Initiate a refund for this cancelled order?')) return;
 try {
 const res = await API.put(`/orders/${orderId}/refund`);
 setSelectedOrder(res.data);
 fetchOrders();
 } catch (err) {
 alert(err.response?.data?.message || 'Failed to request refund');
 }
 };

 if (loading) {
 return (
 <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
 <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-500"></div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-slate-50 pb-20">
 {/* Premium Gradient Header */}
 <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-rose-400 h-64 md:h-80 w-full relative overflow-hidden">
 <div className="absolute inset-0 bg-black/10"></div>
 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
 <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/20 blur-3xl rounded-full"></div>
 <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/20 blur-3xl rounded-full"></div>
 
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-12 relative z-10">
 <div className="flex items-center gap-6">
 <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white p-1 shadow-2xl shrink-0 rotate-3 transform hover:rotate-0 transition-transform duration-300">
 <div className="w-full h-full rounded-2xl bg-gradient-to-br from-brand-100 to-rose-50 flex items-center justify-center text-brand-500">
 {profileData?.name ? (
 <span className="text-4xl md:text-5xl font-black uppercase">{profileData.name.charAt(0)}</span>
 ) : (
 <User className="w-12 h-12 md:w-16 md:h-16" />
 )}
 </div>
 </div>
 <div className="text-white drop-shadow-md">
 <h1 className="text-3xl md:text-5xl font-black mb-1">{profileData?.name || 'Hello, User'}</h1>
 <p className="text-brand-50 font-medium md:text-lg opacity-90 flex items-center gap-2">
 <Mail className="w-4 h-4" /> {profileData?.email}
 </p>
 </div>
 </div>
 </div>
 </div>

 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
 <div className="flex flex-col lg:flex-row gap-8">
 {/* Premium Sidebar */}
 <div className="w-full lg:w-72 shrink-0">
 <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-xl shadow-slate-200/50 border border-white sticky top-24">
 <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 custom-scrollbar">
 {[
 { id: 'personal', icon: User, label: 'Personal Info' },
 { id: 'orders', icon: ShoppingBag, label: 'Order History' },
 { id: 'wishlist', icon: Heart, label: 'My Wishlist' },
 { id: 'addresses', icon: MapPin, label: 'Saved Addresses' }
 ].map(tab => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap outline-none ${
 activeTab === tab.id 
 ? 'bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-lg shadow-brand-500/30 scale-[1.02]' 
 : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-brand-500'
 }`}
 >
 <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
 {tab.label}
 </button>
 ))}
 <div className="hidden lg:block h-px bg-slate-100 my-2 mx-4"></div>
 <button
 onClick={handleLogout}
 className="flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap text-rose-500 hover:bg-rose-50"
 >
 <LogOut className="w-5 h-5" /> Log Out
 </button>
 </nav>
 </div>
 </div>

 {/* Content Area */}
 <div className="flex-1 min-w-0">
 <AnimatePresence mode="wait">
 
 {/* PERSONAL INFO TAB */}
 {activeTab === 'personal' && (
 <motion.div
 key="personal"
 initial={{ opacity: 0, scale: 0.95, y: 10 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: -10 }}
 transition={{ duration: 0.3 }}
 className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-white"
 >
 <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
 <div>
 <h2 className="text-2xl font-black text-slate-800">Personal Information</h2>
 <p className="text-sm text-slate-500 mt-1 font-medium">Manage your basic account details.</p>
 </div>
 {!isEditing && (
 <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-brand-500 font-bold hover:bg-brand-50 transition-colors px-5 py-2.5 rounded-xl border border-brand-100 shadow-sm">
 <Edit className="w-4 h-4" /> Edit Details
 </button>
 )}
 </div>

 {isEditing ? (
 <form onSubmit={handleProfileUpdate} className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
 <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none" required />
 </div>
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
 <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none" required />
 </div>
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
 <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none" placeholder="e.g. 9876543210" />
 </div>
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Alternate Phone</label>
 <input type="tel" value={editForm.alternatePhone} onChange={(e) => setEditForm({...editForm, alternatePhone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none" placeholder="Optional" />
 </div>
 </div>
 <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
 <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
 <button type="submit" className="px-8 py-3 rounded-xl font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/30 transition-all active:scale-95">Save Changes</button>
 </div>
 </form>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
 <p className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-2">Full Name</p>
 <p className="text-lg font-black text-slate-800 flex items-center gap-3"><User className="w-5 h-5 text-slate-400" /> {profileData?.name}</p>
 </div>
 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
 <p className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-2">Email Address</p>
 <p className="text-lg font-black text-slate-800 flex items-center gap-3"><Mail className="w-5 h-5 text-slate-400" /> {profileData?.email}</p>
 </div>
 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
 <p className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-2">Phone Number</p>
 <p className="text-lg font-black text-slate-800 flex items-center gap-3"><Phone className="w-5 h-5 text-slate-400" /> {profileData?.phone || <span className="text-slate-400 italic font-normal text-sm">Not provided</span>}</p>
 </div>
 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
 <p className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-2">Alternate Phone</p>
 <p className="text-lg font-black text-slate-800 flex items-center gap-3"><Phone className="w-5 h-5 text-slate-400" /> {profileData?.alternatePhone || <span className="text-slate-400 italic font-normal text-sm">Not provided</span>}</p>
 </div>
 </div>
 )}
 </motion.div>
 )}

 {/* ORDERS TAB */}
 {activeTab === 'orders' && (
 <motion.div
 key="orders"
 initial={{ opacity: 0, scale: 0.95, y: 10 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: -10 }}
 transition={{ duration: 0.3 }}
 className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-white"
 >
 <div className="mb-8 border-b border-slate-100 pb-4">
 <h2 className="text-2xl font-black text-slate-800">Order History</h2>
 <p className="text-sm text-slate-500 mt-1 font-medium">Track and manage your previous orders.</p>
 </div>
 
 {orders.length > 0 ? (
 <div className="space-y-4">
 {orders.map((order) => (
 <div key={order._id} className="bg-white border border-slate-100 hover:border-brand-200 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all group">
 <div>
 <div className="flex items-center gap-3 mb-3">
 <span className="text-base font-black text-slate-800">Order #{order._id.substring(order._id.length - 6).toUpperCase()}</span>
 <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg ${
 order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
 order.status === 'cancelled' ? 'bg-rose-100 text-rose-600' :
 'bg-amber-100 text-amber-600'
 }`}>
 {order.status}
 </span>
 </div>
 <div className="flex items-center gap-4 text-sm font-semibold text-slate-500">
 <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
 <span>•</span>
 <span className="text-slate-700">{order.items?.length || 0} item(s)</span>
 <span>•</span>
 <span className="text-slate-900 font-black">₹{order.billDetails?.grandTotal || 0}</span>
 </div>
 </div>
 <div className="shrink-0 flex gap-3">
 {order.status === 'delivered' && (
 <button className="px-5 py-2.5 bg-slate-50 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-100 transition-colors border border-slate-200">
 Reorder
 </button>
 )}
 <button 
 onClick={() => setSelectedOrder(order)}
 className="px-5 py-2.5 bg-brand-50 text-brand-600 font-bold rounded-xl text-sm hover:bg-brand-100 transition-colors border border-brand-100 group-hover:bg-brand-500 group-hover:text-white"
 >
 View Details
 </button>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
 <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
 <ShoppingBag className="w-10 h-10 text-slate-300" />
 </div>
 <h3 className="text-xl font-black text-slate-800 mb-2">No orders yet</h3>
 <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">Looks like you haven't placed any orders yet. Discover our amazing products!</p>
 <button onClick={() => window.location.href = '/shop'} className="bg-brand-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-600 transition-colors">
 Start Shopping
 </button>
 </div>
 )}
 </motion.div>
 )}

 {/* WISHLIST TAB */}
 {activeTab === 'wishlist' && (
 <motion.div
 key="wishlist"
 initial={{ opacity: 0, scale: 0.95, y: 10 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: -10 }}
 transition={{ duration: 0.3 }}
 className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-white"
 >
 <div className="mb-8 border-b border-slate-100 pb-4 flex justify-between items-end">
 <div>
 <h2 className="text-2xl font-black text-slate-800">My Wishlist</h2>
 <p className="text-sm text-slate-500 mt-1 font-medium">Items you've saved for later.</p>
 </div>
 <span className="bg-brand-50 text-brand-500 px-3 py-1 rounded-full text-xs font-black border border-brand-100">{wishlistedProducts.length} Items</span>
 </div>
 
 {wishlistedProducts.length > 0 ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
 {wishlistedProducts.map(product => (
 <div key={product.id} className="relative group">
 <ProductCard product={product} />
 </div>
 ))}
 </div>
 ) : (
 <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
 <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
 <Heart className="w-10 h-10 text-slate-300" />
 </div>
 <h3 className="text-xl font-black text-slate-800 mb-2">Your wishlist is empty</h3>
 <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">Save your favorite items here to buy them later.</p>
 <button onClick={() => window.location.href = '/shop'} className="bg-brand-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-600 transition-colors">
 Browse Products
 </button>
 </div>
 )}
 </motion.div>
 )}

 {/* ADDRESSES TAB */}
 {activeTab === 'addresses' && (
 <motion.div
 key="addresses"
 initial={{ opacity: 0, scale: 0.95, y: 10 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: -10 }}
 transition={{ duration: 0.3 }}
 className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-white"
 >
 <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
 <div>
 <h2 className="text-2xl font-black text-slate-800">Saved Addresses</h2>
 <p className="text-sm text-slate-500 mt-1 font-medium">Manage your delivery locations.</p>
 </div>
 <button onClick={() => setIsAddingAddress(!isAddingAddress)} className={`flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors border ${isAddingAddress ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200' : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'}`}>
 {isAddingAddress ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
 {isAddingAddress ? 'Cancel' : 'Add New'}
 </button>
 </div>

 {isAddingAddress && (
 <form onSubmit={handleAddAddress} className="bg-slate-50 rounded-3xl p-8 mb-8 border border-slate-100 shadow-sm space-y-6">
 <h3 className="font-black text-lg text-slate-800 mb-2 border-b border-slate-200 pb-4">Add New Location</h3>
 
 <div className="mb-6">
 <div className="flex justify-between items-center mb-3">
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Pin Location on Map</label>
 <button type="button" onClick={handleGetCurrentLocation} className="text-xs font-bold text-brand-500 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
 <Navigation className="w-3.5 h-3.5" /> Locate Me
 </button>
 </div>
 <div className="h-64 w-full rounded-2xl overflow-hidden border-2 border-brand-100 relative z-0 shadow-inner">
 <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
 <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
 <LocationPicker position={mapPosition} setPosition={(pos) => setMapPosition(pos)} onLocationSelect={reverseGeocode} />
 </MapContainer>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Address Label</label>
 <select value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-slate-800 font-semibold focus:ring-2 focus:ring-brand-500/20 outline-none">
 <option value="Home">Home</option>
 <option value="Work">Work</option>
 <option value="Other">Other</option>
 </select>
 </div>
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Street Address</label>
 <input type="text" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-slate-800 font-semibold focus:ring-2 focus:ring-brand-500/20 outline-none" required placeholder="Flat, House no, Area" />
 </div>
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">City</label>
 <input type="text" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-slate-800 font-semibold focus:ring-2 focus:ring-brand-500/20 outline-none" required />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">State</label>
 <input type="text" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-slate-800 font-semibold focus:ring-2 focus:ring-brand-500/20 outline-none" required />
 </div>
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">ZIP Code</label>
 <input type="text" value={newAddress.zipCode} onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-slate-800 font-semibold focus:ring-2 focus:ring-brand-500/20 outline-none" required />
 </div>
 </div>
 </div>
 <div className="flex justify-end pt-4">
 <button type="submit" className="px-8 py-3.5 rounded-xl font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/30 transition-all active:scale-95 text-lg">Save Address</button>
 </div>
 </form>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {profileData?.addresses?.length > 0 ? (
 profileData.addresses.map((address, idx) => (
 <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl relative group hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/5 transition-all">
 <div className="flex justify-between items-start mb-3">
 <span className="bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-brand-100">{address.label}</span>
 <button onClick={() => handleDeleteAddress(idx)} className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-all">
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 <p className="text-slate-800 font-bold text-lg leading-tight mb-1">{address.street}</p>
 <p className="text-sm font-medium text-slate-500">{address.city}, {address.state} {address.zipCode}</p>
 </div>
 ))
 ) : (
 <div className="col-span-full py-16 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
 <MapPin className="w-8 h-8 text-slate-300" />
 </div>
 <p className="text-slate-800 font-bold text-lg mb-1">No saved addresses</p>
 <p className="text-slate-500 font-medium text-sm mb-4">Add an address so we can deliver to you quickly.</p>
 <button onClick={() => setIsAddingAddress(true)} className="text-brand-500 bg-brand-50 font-bold px-6 py-2 rounded-xl hover:bg-brand-100 transition-colors">Add Address</button>
 </div>
 )}
 </div>
 </motion.div>
 )}

 </AnimatePresence>
 </div>
 </div>
 </div>
 
 {/* Order Details Modal (Preserved UI style with slight polish) */}
 {selectedOrder && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
 <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
 {/* Header */}
 <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
 <div>
 <h3 className="text-xl font-black text-slate-800">Order Details</h3>
 <p className="text-sm text-slate-500 mt-1 font-medium">#{selectedOrder._id.substring(selectedOrder._id.length - 6).toUpperCase()}</p>
 </div>
 <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 transition-colors bg-white border border-slate-200 shadow-sm">
 <X className="w-5 h-5" />
 </button>
 </div>
 
 {/* Body */}
 <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
 {/* Status and Times */}
 <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
 <div className="flex justify-between items-center">
 <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Status</span>
 <span className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg ${
 selectedOrder.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
 selectedOrder.status === 'cancelled' ? 'bg-rose-100 text-rose-600' :
 'bg-amber-100 text-amber-600'
 }`}>
 {selectedOrder.status}
 </span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-slate-500 font-bold uppercase tracking-wider">Order Time</span>
 <span className="font-bold text-slate-800">{new Date(selectedOrder.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-slate-500 font-bold uppercase tracking-wider">Delivery Time</span>
 <span className="font-bold text-slate-800">
 {selectedOrder.status === 'delivered' 
 ? new Date(new Date(selectedOrder.createdAt).getTime() + 35*60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
 : 'Est. 35 mins'}
 </span>
 </div>
 </div>

 {/* Items */}
 <div>
 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Items Ordered ({selectedOrder.items?.length || 0})</h4>
 <div className="space-y-4">
 {selectedOrder.items?.map((item, idx) => (
 <div key={idx} className="flex justify-between items-center text-sm">
 <div className="flex items-center gap-3 max-w-[70%]">
 <span className="font-black text-brand-500 bg-brand-50 px-2 py-1 rounded-lg">{item.quantity}x</span>
 <span className="font-semibold text-slate-700">{item.productId?.name || 'Delicious Item'}</span>
 </div>
 <span className="font-black text-slate-900">₹{item.price * item.quantity}</span>
 </div>
 ))}
 </div>
 </div>

 {/* Bill Details */}
 <div className="border-t border-slate-100 pt-5 space-y-3 text-sm">
 <div className="flex justify-between text-slate-500 font-medium">
 <span>Subtotal</span>
 <span>₹{selectedOrder.billDetails?.itemTotal || 0}</span>
 </div>
 <div className="flex justify-between text-slate-500 font-medium">
 <span>Delivery Fee</span>
 <span>₹{selectedOrder.billDetails?.deliveryFee || 0}</span>
 </div>
 <div className="flex justify-between text-slate-500 font-medium">
 <span>Taxes & Charges</span>
 <span>₹{selectedOrder.billDetails?.taxAndCharges || 0}</span>
 </div>
 <div className="flex justify-between font-black text-xl text-slate-900 pt-3 border-t border-slate-100 mt-2">
 <span>Grand Total</span>
 <span className="text-brand-500">₹{selectedOrder.billDetails?.grandTotal || 0}</span>
 </div>
 </div>
 </div>

 {/* Footer */}
 <div className="p-6 border-t border-slate-100 space-y-3 bg-slate-50">
 
 {/* Cancel Button */}
 {['placed', 'confirmed', 'preparing'].includes(selectedOrder.status) && (
 <button 
 onClick={() => handleCancelOrder(selectedOrder._id)}
 className="w-full py-3.5 bg-white hover:bg-rose-50 text-rose-600 font-bold rounded-xl transition-colors border border-rose-200 shadow-sm"
 >
 Cancel Order
 </button>
 )}

 {/* Refund Logic */}
 {selectedOrder.status === 'cancelled' && selectedOrder.paymentDetails?.method !== 'cod' && (
 <>
 {['paid', 'completed'].includes(selectedOrder.paymentDetails?.status) ? (
 <button 
 onClick={() => handleRefundRequest(selectedOrder._id)}
 className="w-full py-3.5 bg-brand-50 hover:bg-brand-100 text-brand-600 font-bold rounded-xl transition-colors border border-brand-200 shadow-sm"
 >
 Request Refund
 </button>
 ) : selectedOrder.paymentDetails?.status === 'refund_requested' ? (
 <div className="w-full py-3.5 bg-amber-50 text-amber-600 font-bold rounded-xl border border-amber-200 text-center flex items-center justify-center gap-2">
 <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
 Refund Requested
 </div>
 ) : selectedOrder.paymentDetails?.status === 'refunded' ? (
 <div className="w-full py-3.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl border border-emerald-200 text-center flex items-center justify-center gap-2">
 <Check className="w-5 h-5" />
 Refund Processed
 </div>
 ) : null}
 </>
 )}

 <button 
 onClick={() => setSelectedOrder(null)}
 className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors shadow-md"
 >
 Close Details
 </button>
 </div>
 </div>
 </div>
 )}

 </div>
 );
};

export default UserProfile;
