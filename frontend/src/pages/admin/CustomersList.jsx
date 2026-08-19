import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { User, Mail, Phone, MapPin, Shield, Search, MoreVertical, Bike, UserCircle, FileText, X, Check, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomersList = () => {
 const [users, setUsers] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');
 const [roleFilter, setRoleFilter] = useState('All');
 
 // KYC Modal State
 const [selectedKycUser, setSelectedKycUser] = useState(null);
 const [isKycModalOpen, setIsKycModalOpen] = useState(false);

 useEffect(() => {
 fetchUsers();
 }, []);

 const fetchUsers = async () => {
 try {
 const res = await API.get('/users');
 setUsers(res.data);
 } catch (err) {
 console.error('Failed to fetch users', err);
 } finally {
 setLoading(false);
 }
 };

 const handleUpdateKycStatus = async (userId, status) => {
 try {
 await API.put(`/users/${userId}/kyc`, { status });
 setUsers(prev => prev.map(u => u._id === userId ? { ...u, kyc: { ...u.kyc, status } } : u));
 if (selectedKycUser?._id === userId) {
 setSelectedKycUser({ ...selectedKycUser, kyc: { ...selectedKycUser.kyc, status } });
 }
 } catch (err) {
 console.error('Failed to update KYC status', err);
 alert('Failed to update KYC status');
 }
 };

 const filteredUsers = users.filter(user => {
 const matchesSearch = 
 (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
 (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
 (user.phone && user.phone.includes(searchQuery));
 
 const matchesRole = roleFilter === 'All' || user.role === roleFilter.toLowerCase();
 
 return matchesSearch && matchesRole;
 });

 const getRoleIcon = (role) => {
 switch(role) {
 case 'admin': return <Shield className="w-4 h-4 text-rose-500" />;
 case 'delivery': return <Bike className="w-4 h-4 text-blue-500" />;
 default: return <UserCircle className="w-4 h-4 text-emerald-500" />;
 }
 };

 const getRoleBadgeColor = (role) => {
 switch(role) {
 case 'admin': return 'bg-rose-100 text-rose-600 ';
 case 'delivery': return 'bg-blue-100 text-blue-600 ';
 default: return 'bg-emerald-100 text-emerald-600 ';
 }
 };

 if (loading) {
 return (
 <div className="flex justify-center items-center h-64">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
 </div>
 );
 }

 return (
 <>
 <div className="bg-white border border-pink-200/60 rounded-3xl shadow-sm overflow-hidden flex flex-col animate-in fade-in">
 {/* Header & Filters */}
 <div className="p-6 border-b border-pink-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-pink-50/50 ">
 <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
 User Management
 <span className="bg-brand-500 text-white text-xs px-2.5 py-0.5 rounded-full">{users.length}</span>
 </h3>

 <div className="flex flex-col sm:flex-row gap-3">
 {/* Search */}
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <input 
 type="text" 
 placeholder="Search users..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white border border-pink-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all "
 />
 </div>
 {/* Role Filter */}
 <select 
 value={roleFilter}
 onChange={(e) => setRoleFilter(e.target.value)}
 className="px-4 py-2 bg-white border border-pink-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/20"
 >
 {['All', 'User', 'Delivery', 'Admin'].map(role => (
 <option key={role} value={role}>{role}</option>
 ))}
 </select>
 </div>
 </div>

 {/* Table Content */}
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse min-w-[800px]">
 <thead>
 <tr className="bg-pink-50/50 border-b border-pink-200 ">
 <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User Details</th>
 <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
 <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Info</th>
 <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Saved Addresses</th>
 <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Joined Date</th>
 <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
 </tr>
 </thead>
 <tbody>
 {filteredUsers.length > 0 ? (
 filteredUsers.map((user, i) => (
 <motion.tr 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.05 }}
 key={user._id} 
 className="border-b border-slate-50 hover:bg-pink-50/50 :bg-slate-800/20 transition-colors"
 >
 {/* User Details */}
 <td className="p-4">
 <div className="flex items-center gap-3">
 {user.avatar ? (
 <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
 ) : (
 <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-sm">
 {user.name?.charAt(0).toUpperCase()}
 </div>
 )}
 <div>
 <p className="font-bold text-slate-900 text-sm">{user.name}</p>
 <p className="text-xs text-slate-500">{user._id}</p>
 </div>
 </div>
 </td>

 {/* Role */}
 <td className="p-4">
 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider ${getRoleBadgeColor(user.role)}`}>
 {getRoleIcon(user.role)}
 {user.role}
 </span>
 </td>

 {/* Contact */}
 <td className="p-4 space-y-1.5">
 <div className="flex items-center gap-2 text-sm text-slate-700 ">
 <Mail className="w-3.5 h-3.5 text-slate-400" />
 {user.email}
 </div>
 {user.phone && (
 <div className="flex items-center gap-2 text-sm text-slate-700 ">
 <Phone className="w-3.5 h-3.5 text-slate-400" />
 {user.phone}
 </div>
 )}
 {user.alternatePhone && (
 <div className="flex items-center gap-2 text-xs text-slate-500">
 <Phone className="w-3.5 h-3.5 text-slate-400" />
 {user.alternatePhone} (Alt)
 </div>
 )}
 </td>

 {/* Addresses */}
 <td className="p-4">
 <div className="flex items-center gap-2">
 <MapPin className={`w-4 h-4 ${user.addresses?.length > 0 ? 'text-brand-500' : 'text-slate-300'}`} />
 <span className="text-sm font-semibold text-slate-700 ">
 {user.addresses?.length || 0} Saved
 </span>
 </div>
 {user.addresses?.length > 0 && (
 <p className="text-xs text-slate-500 mt-1 truncate max-w-[200px]">
 {user.addresses[0].street}, {user.addresses[0].city}
 </p>
 )}
 </td>

 {/* Joined Date */}
 <td className="p-4 text-sm font-medium text-slate-600 ">
 {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
 </td>

 {/* Actions */}
 <td className="p-4">
 {user.role === 'delivery' && user.kyc && (
 <button 
 onClick={() => {
 setSelectedKycUser(user);
 setIsKycModalOpen(true);
 }}
 className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
 user.kyc.status === 'pending_review' 
 ? 'bg-amber-100 text-amber-600 hover:bg-amber-200 '
 : user.kyc.status === 'approved'
 ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 '
 : user.kyc.status === 'rejected'
 ? 'bg-rose-100 text-rose-600 hover:bg-rose-200 '
 : 'bg-pink-100 text-slate-600 hover:bg-slate-200 '
 }`}
 >
 <FileText className="w-3.5 h-3.5" />
 {user.kyc.status === 'pending_review' ? 'Review KYC' : 'View KYC'}
 </button>
 )}
 </td>
 </motion.tr>
 ))
 ) : (
 <tr>
 <td colSpan="5" className="p-8 text-center text-slate-500">
 <div className="flex flex-col items-center gap-2">
 <Search className="w-8 h-8 text-slate-300" />
 <p>No users found matching your search.</p>
 </div>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* KYC Modal */}
 <AnimatePresence>
 {isKycModalOpen && selectedKycUser && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <motion.div 
 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
 onClick={() => setIsKycModalOpen(false)}
 />
 <motion.div 
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
 >
 {/* Header */}
 <div className="p-6 border-b border-pink-200 flex justify-between items-center bg-pink-50/50 ">
 <div>
 <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
 KYC Verification
 <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-bold ${
 selectedKycUser.kyc.status === 'pending_review' ? 'bg-amber-100 text-amber-600' :
 selectedKycUser.kyc.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
 selectedKycUser.kyc.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-pink-100 text-slate-600'
 }`}>
 {selectedKycUser.kyc.status.replace('_', ' ')}
 </span>
 </h2>
 <p className="text-sm text-slate-500 mt-1">Delivery Partner: <span className="font-semibold text-slate-700 ">{selectedKycUser.name}</span> ({selectedKycUser.email})</p>
 </div>
 <button onClick={() => setIsKycModalOpen(false)} className="p-2 hover:bg-pink-100 :bg-slate-800 rounded-full transition-colors">
 <X className="w-5 h-5 text-slate-500" />
 </button>
 </div>

 {/* Content (Scrollable) */}
 <div className="p-6 overflow-y-auto space-y-8">
 {/* PAN & Aadhar */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
 <FileText className="w-4 h-4 text-brand-500" /> PAN Card
 </h4>
 {selectedKycUser.kyc.pan ? (
 <img src={selectedKycUser.kyc.pan} alt="PAN Card" className="w-full h-48 object-cover rounded-xl border border-pink-200 " />
 ) : (
 <div className="w-full h-48 bg-pink-100 rounded-xl flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-300 ">Not uploaded</div>
 )}
 </div>
 <div>
 <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
 <FileText className="w-4 h-4 text-brand-500" /> Aadhar Card
 </h4>
 {selectedKycUser.kyc.aadhar ? (
 <img src={selectedKycUser.kyc.aadhar} alt="Aadhar Card" className="w-full h-48 object-cover rounded-xl border border-pink-200 " />
 ) : (
 <div className="w-full h-48 bg-pink-100 rounded-xl flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-300 ">Not uploaded</div>
 )}
 </div>
 </div>

 {/* License & Video */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
 <FileText className="w-4 h-4 text-brand-500" /> Driving License
 </h4>
 {selectedKycUser.kyc.license ? (
 <img src={selectedKycUser.kyc.license} alt="Driving License" className="w-full h-48 object-cover rounded-xl border border-pink-200 " />
 ) : (
 <div className="w-full h-48 bg-pink-100 rounded-xl flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-300 ">Not uploaded</div>
 )}
 </div>
 <div>
 <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
 <User className="w-4 h-4 text-brand-500" /> Selfie Video
 </h4>
 {selectedKycUser.kyc.selfieVideo ? (
 <video src={selectedKycUser.kyc.selfieVideo} controls className="w-full h-48 object-cover rounded-xl border border-pink-200 bg-black" />
 ) : (
 <div className="w-full h-48 bg-pink-100 rounded-xl flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-300 ">Not uploaded</div>
 )}
 </div>
 </div>
 </div>

 {/* Footer / Actions */}
 <div className="p-6 border-t border-pink-200 bg-pink-50 flex justify-end gap-3">
 <button 
 onClick={() => handleUpdateKycStatus(selectedKycUser._id, 'rejected')}
 className="px-5 py-2.5 bg-white border border-pink-200 text-rose-500 font-bold rounded-xl hover:bg-rose-50 :bg-rose-500/10 transition-colors flex items-center gap-2"
 >
 <XCircle className="w-4 h-4" /> Reject KYC
 </button>
 <button 
 onClick={() => handleUpdateKycStatus(selectedKycUser._id, 'approved')}
 className="px-5 py-2.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-500/30"
 >
 <Check className="w-4 h-4" /> Approve KYC
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </>
 );
};

export default CustomersList;
