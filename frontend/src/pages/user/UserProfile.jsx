import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, ShoppingBag, Phone, Mail, Plus, Edit, Trash2, Check, CheckCircle, Clock, Navigation, X, LogOut, Heart, Search, ShieldCheck, ChevronRight } from 'lucide-react';
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

// Animation Variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -20 }
};

const itemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
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
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    alternatePhone: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

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
      console.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders/myorders');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders');
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
        (error) => alert('Unable to retrieve your location.')
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await API.put('/users/profile', editForm);
      setProfileData(res.data);
      dispatch(setCredentials({ user: res.data, token }));
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full mb-4"
        />
        <p className="text-slate-500 font-semibold tracking-widest uppercase text-sm animate-pulse">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 overflow-hidden relative">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/20 blur-[120px] pointer-events-none"></div>
      
      {/* Premium Gradient Header */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 h-64 md:h-80 w-full relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="w-28 h-28 md:w-36 md:h-36 rounded-[2rem] bg-white/10 backdrop-blur-md p-1 shadow-2xl shrink-0 border border-white/20"
            >
              <div className="w-full h-full rounded-[1.8rem] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-inner">
                {profileData?.name ? (
                  <span className="text-5xl md:text-6xl font-black uppercase tracking-tighter">{profileData.name.charAt(0)}</span>
                ) : (
                  <User className="w-14 h-14" />
                )}
              </div>
            </motion.div>
            <div className="text-white drop-shadow-md text-center md:text-left flex-1 mb-2">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-5xl font-black mb-2 tracking-tight"
              >
                {profileData?.name || 'Hello, User'}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-emerald-100 font-medium md:text-lg opacity-90 flex items-center justify-center md:justify-start gap-2"
              >
                <Mail className="w-4 h-4" /> {profileData?.email}
                <ShieldCheck className="w-4 h-4 text-emerald-400 ml-2" /> <span className="text-emerald-400 text-sm font-bold uppercase tracking-wider">Verified</span>
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* Glassmorphism Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full xl:w-80 shrink-0"
          >
            <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white sticky top-24">
              <nav className="flex flex-row xl:flex-col gap-2 overflow-x-auto xl:overflow-visible pb-2 xl:pb-0 custom-scrollbar">
                {[
                  { id: 'personal', icon: User, label: 'My Profile', sub: 'Manage details' },
                  { id: 'orders', icon: ShoppingBag, label: 'Orders', sub: 'History & tracking' },
                  { id: 'addresses', icon: MapPin, label: 'Addresses', sub: 'Delivery locations' }
                ].map((tab, idx) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-3xl font-bold transition-all duration-300 text-left outline-none relative overflow-hidden group ${
                      activeTab === tab.id 
                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' 
                        : 'bg-transparent text-slate-600 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="activeTabIndicator" 
                        className="absolute inset-0 bg-slate-900 z-0 rounded-3xl"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <div className="relative z-10 flex items-center gap-4 w-full">
                      <div className={`p-2.5 rounded-2xl ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200'} transition-colors`}>
                        <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`} />
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm ${activeTab === tab.id ? 'text-white' : 'text-slate-800'}`}>{tab.label}</div>
                        <div className={`text-[10px] font-medium tracking-wider uppercase mt-0.5 ${activeTab === tab.id ? 'text-white/70' : 'text-slate-400'}`}>{tab.sub}</div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${activeTab === tab.id ? 'text-white/50' : 'text-transparent group-hover:text-slate-300'} transition-colors`} />
                    </div>
                  </motion.button>
                ))}
                <div className="hidden xl:block h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-4 mx-4"></div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="flex items-center gap-4 px-5 py-4 rounded-3xl font-bold transition-all duration-300 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100"
                >
                  <div className="p-2.5 rounded-2xl bg-rose-100/50">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span>Secure Logout</span>
                </motion.button>
              </nav>
            </div>
          </motion.div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              
              {/* PERSONAL INFO TAB */}
              {activeTab === 'personal' && (
                <motion.div
                  key="personal"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                    <motion.div variants={itemVariants}>
                      <h2 className="text-3xl font-black text-slate-800 tracking-tight">Personal Details</h2>
                      <p className="text-sm text-slate-500 mt-2 font-medium">Keep your information up to date.</p>
                    </motion.div>
                    {!isEditing && (
                      <motion.button 
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditing(true)} 
                        className="flex items-center gap-2 bg-emerald-50 text-emerald-600 font-bold px-6 py-3 rounded-2xl hover:bg-emerald-100 transition-colors shadow-sm"
                      >
                        <Edit className="w-4 h-4" /> Edit Profile
                      </motion.button>
                    )}
                  </div>

                  {isEditing ? (
                    <motion.form 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      onSubmit={handleProfileUpdate} 
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 relative group">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Full Name</label>
                          <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-white/50 backdrop-blur-sm border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 font-bold focus:border-emerald-500 focus:bg-white transition-all outline-none" required />
                        </div>
                        <div className="space-y-2 relative group">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Email Address</label>
                          <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full bg-white/50 backdrop-blur-sm border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 font-bold focus:border-emerald-500 focus:bg-white transition-all outline-none" required />
                        </div>
                        <div className="space-y-2 relative group">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Phone Number</label>
                          <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-white/50 backdrop-blur-sm border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 font-bold focus:border-emerald-500 focus:bg-white transition-all outline-none" placeholder="e.g. 9876543210" />
                        </div>
                        <div className="space-y-2 relative group">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Alternate Phone</label>
                          <input type="tel" value={editForm.alternatePhone} onChange={(e) => setEditForm({...editForm, alternatePhone: e.target.value})} className="w-full bg-white/50 backdrop-blur-sm border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 font-bold focus:border-emerald-500 focus:bg-white transition-all outline-none" placeholder="Optional" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-4 pt-8">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={() => setIsEditing(false)} className="px-8 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" disabled={isUpdating} className="px-10 py-4 rounded-2xl font-bold bg-slate-900 text-white shadow-xl shadow-slate-900/20 disabled:opacity-70 flex items-center gap-2">
                          {isUpdating ? 'Saving...' : 'Save Changes'} <Check className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: 'Full Name', value: profileData?.name, icon: User },
                        { label: 'Email Address', value: profileData?.email, icon: Mail },
                        { label: 'Phone Number', value: profileData?.phone, icon: Phone },
                        { label: 'Alternate Phone', value: profileData?.alternatePhone, icon: Phone }
                      ].map((field, i) => (
                        <motion.div variants={itemVariants} key={i} className="bg-white/60 p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-md transition-shadow group flex gap-5 items-center">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                            <field.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{field.label}</p>
                            <p className="text-lg font-bold text-slate-800">{field.value || <span className="text-slate-400 italic font-normal text-sm">Not provided</span>}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white"
                >
                  <div className="mb-10">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Order History</h2>
                    <p className="text-sm text-slate-500 mt-2 font-medium">Your recent purchases and their status.</p>
                  </div>
                  
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage).map((order, i) => (
                        <motion.div variants={itemVariants} key={order._id} className="bg-white border border-slate-100 hover:border-emerald-200 p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-lg hover:shadow-emerald-500/5 transition-all group">
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-slate-400" />
                              </div>
                              <span className="text-lg font-black text-slate-800">#{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                              <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl ${
                                order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                                order.status === 'cancelled' ? 'bg-rose-100 text-rose-600' :
                                'bg-amber-100 text-amber-600'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-semibold text-slate-500 ml-[52px]">
                              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              <span className="text-slate-700">{order.items?.length || 0} item(s)</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              <span className="text-slate-900 font-black">₹{order.billDetails?.grandTotal || 0}</span>
                            </div>
                          </div>
                          <div className="shrink-0 flex gap-3 ml-[52px] md:ml-0">
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedOrder(order)}
                              className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl text-sm shadow-md hover:shadow-xl transition-all"
                            >
                              Track / Details
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Pagination Controls */}
                      {Math.ceil(orders.length / ordersPerPage) > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8 pt-4">
                          <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm disabled:opacity-50 hover:bg-slate-50 transition-colors"
                          >
                            Prev
                          </button>
                          
                          <div className="flex gap-1">
                            {Array.from({ length: Math.ceil(orders.length / ordersPerPage) }).map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentPage(idx + 1)}
                                className={`w-8 h-8 rounded-xl font-bold text-sm transition-all ${currentPage === idx + 1 ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                              >
                                {idx + 1}
                              </button>
                            ))}
                          </div>

                          <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(orders.length / ordersPerPage)))}
                            disabled={currentPage === Math.ceil(orders.length / ordersPerPage)}
                            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm disabled:opacity-50 hover:bg-slate-50 transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <motion.div variants={itemVariants} className="py-20 text-center bg-white/50 rounded-[3rem] border border-dashed border-slate-200">
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50">
                        <ShoppingBag className="w-10 h-10 text-slate-300" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 mb-2">No orders yet</h3>
                      <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">Looks like you haven't placed any orders yet. Discover our amazing products!</p>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => window.location.href = '/shop'} className="bg-emerald-500 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-500/30 transition-all">
                        Start Shopping
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              )}


              {/* ADDRESSES TAB */}
              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                    <motion.div variants={itemVariants}>
                      <h2 className="text-3xl font-black text-slate-800 tracking-tight">Saved Addresses</h2>
                      <p className="text-sm text-slate-500 mt-2 font-medium">Manage your delivery locations.</p>
                    </motion.div>
                    <motion.button 
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsAddingAddress(!isAddingAddress)} 
                      className={`flex items-center gap-2 font-bold px-6 py-3 rounded-2xl shadow-sm transition-colors ${isAddingAddress ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20'}`}
                    >
                      {isAddingAddress ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {isAddingAddress ? 'Cancel' : 'Add New Address'}
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {isAddingAddress && (
                      <motion.form 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleAddAddress} 
                        className="bg-white rounded-[2.5rem] p-8 mb-10 border border-slate-100 shadow-xl shadow-slate-200/40 space-y-8 overflow-hidden"
                      >
                        <h3 className="font-black text-xl text-slate-800 flex items-center gap-2"><MapPin className="text-emerald-500" /> New Delivery Location</h3>
                        
                        <div className="mb-6 bg-slate-50 p-4 rounded-[2rem] border border-slate-100">
                          <div className="flex justify-between items-center mb-4 px-2">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Pin Location on Map</label>
                            <button type="button" onClick={handleGetCurrentLocation} className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-md">
                              <Navigation className="w-3.5 h-3.5" /> Locate Me
                            </button>
                          </div>
                          <div className="h-72 w-full rounded-[1.5rem] overflow-hidden border border-slate-200 relative z-0 shadow-inner">
                            <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              <LocationPicker position={mapPosition} setPosition={(pos) => setMapPosition(pos)} onLocationSelect={reverseGeocode} />
                            </MapContainer>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Address Label</label>
                            <select value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 font-bold focus:border-emerald-500 focus:bg-white outline-none transition-all">
                              <option value="Home">Home</option>
                              <option value="Work">Work</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Street Address</label>
                            <input type="text" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 font-bold focus:border-emerald-500 focus:bg-white outline-none transition-all" required placeholder="Flat, House no, Area" />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">City</label>
                            <input type="text" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 font-bold focus:border-emerald-500 focus:bg-white outline-none transition-all" required />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">State</label>
                              <input type="text" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 font-bold focus:border-emerald-500 focus:bg-white outline-none transition-all" required />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">PIN Code</label>
                              <input type="text" value={newAddress.zipCode} onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 font-bold focus:border-emerald-500 focus:bg-white outline-none transition-all" required />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end pt-4">
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="px-10 py-4 rounded-2xl font-bold bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 transition-all text-lg">Save Location</motion.button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profileData?.addresses?.length > 0 ? (
                      profileData.addresses.map((address, idx) => (
                        <motion.div variants={itemVariants} key={idx} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] relative group hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300">
                          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-100 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-2xl pointer-events-none"></div>
                          <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                <MapPin className="w-6 h-6" />
                              </div>
                              <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl shadow-md">{address.label}</span>
                            </div>
                            <button onClick={() => handleDeleteAddress(idx)} className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl p-3 opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          <p className="text-slate-800 font-black text-xl leading-tight mb-2 relative z-10">{address.street}</p>
                          <p className="text-sm font-semibold text-slate-500 relative z-10">{address.city}, {address.state} {address.zipCode}</p>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div variants={itemVariants} className="col-span-full py-20 text-center bg-white/50 rounded-[3rem] border border-dashed border-slate-200">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50">
                          <MapPin className="w-10 h-10 text-slate-300" />
                        </div>
                        <p className="text-slate-800 font-black text-2xl mb-2">No saved addresses</p>
                        <p className="text-slate-500 font-medium mb-8">Add an address so we can deliver to you quickly.</p>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsAddingAddress(true)} className="text-white bg-slate-900 font-bold px-10 py-4 rounded-2xl shadow-xl shadow-slate-900/20 transition-all">Add Address</motion.button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
              onClick={() => setSelectedOrder(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-white"
            >
              <div className="flex justify-between items-center p-8 border-b border-slate-100 bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">Order Details</h3>
                  <p className="text-sm text-slate-500 mt-1 font-bold">#{selectedOrder._id.substring(selectedOrder._id.length - 6).toUpperCase()}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-3 rounded-2xl hover:bg-slate-200 text-slate-500 transition-colors bg-white shadow-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Status</span>
                    <span className={`text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl shadow-sm ${
                      selectedOrder.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                      selectedOrder.status === 'cancelled' ? 'bg-rose-100 text-rose-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Order Time</span>
                    <span className="font-bold text-slate-800 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">{new Date(selectedOrder.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 pl-2">Items Ordered ({selectedOrder.items?.length || 0})</h4>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-4 max-w-[70%]">
                          <span className="font-black text-emerald-500 bg-emerald-50 w-10 h-10 flex items-center justify-center rounded-xl">{item.quantity}x</span>
                          <span className="font-bold text-slate-700">{item.productId?.name || 'Delicious Item'}</span>
                        </div>
                        <span className="font-black text-slate-900 text-lg">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-[2rem] space-y-3 text-sm shadow-xl shadow-slate-900/20">
                  <div className="flex justify-between font-medium opacity-80">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.billDetails?.itemTotal || 0}</span>
                  </div>
                  <div className="flex justify-between font-medium opacity-80">
                    <span>Delivery Fee</span>
                    <span>₹{selectedOrder.billDetails?.deliveryFee || 0}</span>
                  </div>
                  <div className="flex justify-between font-medium opacity-80">
                    <span>Taxes & Charges</span>
                    <span>₹{selectedOrder.billDetails?.taxAndCharges || 0}</span>
                  </div>
                  <div className="flex justify-between font-black text-2xl pt-4 border-t border-white/20 mt-2">
                    <span>Total</span>
                    <span className="text-brand-400">₹{selectedOrder.billDetails?.grandTotal || 0}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
