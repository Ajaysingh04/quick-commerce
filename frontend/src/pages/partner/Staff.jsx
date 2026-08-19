import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, ChefHat, Key, Trash2, Check, Lock, Mail, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api.js';

const Staff = () => {
 const [isAdding, setIsAdding] = useState(false);
 const [newStaff, setNewStaff] = useState({ email: '', role: 'Manager' });
 const [loading, setLoading] = useState(true);
 
 const [staffList, setStaffList] = useState([]);
 const [invites, setInvites] = useState([]);

 useEffect(() => {
 fetchStaff();
 }, []);

 const fetchStaff = async () => {
 try {
 const res = await API.get('/partner/staff');
 setStaffList(res.data.staff || []);
 setInvites(res.data.invites || []);
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };

 const handleInviteStaff = async (e) => {
 e.preventDefault();
 if (!newStaff.email) return;
 
 try {
 await API.post('/partner/staff/invite', { email: newStaff.email, role: newStaff.role });
 setNewStaff({ email: '', role: 'Manager' });
 setIsAdding(false);
 fetchStaff();
 alert("Invite sent successfully!");
 } catch (err) {
 alert(err.response?.data?.message || "Failed to send invite");
 }
 };

 const toggleStatus = async (staffId) => {
 setStaffList(staffList.map(s => s._id === staffId ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s));
 };

 const removeStaff = async (staffId) => {
 setStaffList(staffList.filter(s => s._id !== staffId));
 };

 return (
 <div className="max-w-6xl mx-auto space-y-6">
 
 {/* Header */}
 <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
 <Users className="w-6 h-6 text-[#e31837]" /> Staff & Access Management
 </h2>
 <p className="text-sm text-slate-500 mt-1">Send invites to your team members and manage role-based permissions.</p>
 </div>
 <button 
 onClick={() => setIsAdding(!isAdding)}
 className="px-5 py-2.5 bg-[#e31837] text-white font-bold rounded-xl flex items-center gap-2 hover:bg-[#c8102e] transition-all shadow-md shadow-[#e31837]/20"
 >
 {isAdding ? <Lock className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
 {isAdding ? 'Cancel' : 'Send Invite Link'}
 </button>
 </div>

 {/* Add Staff Form */}
 <AnimatePresence>
 {isAdding && (
 <motion.form 
 initial={{ opacity: 0, height: 0 }} 
 animate={{ opacity: 1, height: 'auto' }} 
 exit={{ opacity: 0, height: 0 }}
 className="bg-white border border-[#e31837] rounded-3xl p-6 shadow-lg shadow-[#e31837]/10 overflow-hidden"
 onSubmit={handleInviteStaff}
 >
 <div className="flex items-center gap-2 mb-6 text-[#c8102e] font-bold">
 <Mail className="w-4 h-4" /> Send Email Invitation
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="md:col-span-1">
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Staff Email Address</label>
 <input type="email" placeholder="staff@example.com" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-semibold" required />
 </div>
 <div className="md:col-span-1">
 <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Role / Access Level</label>
 <select value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} className="w-full px-4 py-2.5 bg-[#f5f6fa] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e31837] font-bold text-slate-700 ">
 <option value="Manager">Manager (Full Access)</option>
 <option value="Kitchen Staff">Kitchen Staff (Orders & Menu only)</option>
 </select>
 </div>
 <div className="md:col-span-1 flex items-end">
 <button type="submit" className="w-full px-6 py-2.5 bg-[#e31837] text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
 Send Invite Link
 </button>
 </div>
 </div>
 
 {/* Role Permissions Info */}
 <div className="mt-6 p-4 bg-[#f5f6fa] rounded-2xl border border-gray-200 flex gap-6">
 <div className="flex-1 border-r border-gray-200 pr-6">
 <h4 className="text-xs font-black text-slate-700 mb-2 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-blue-500"/> Manager Permissions</h4>
 <ul className="text-[10px] text-slate-500 space-y-1 font-semibold list-disc list-inside">
 <li>Can access Analytics & Revenue</li>
 <li>Can manage Payouts & Bank details</li>
 <li>Can create Offers & Promos</li>
 <li>Can add/remove other staff</li>
 </ul>
 </div>
 <div className="flex-1">
 <h4 className="text-xs font-black text-slate-700 mb-2 flex items-center gap-1.5"><ChefHat className="w-3.5 h-3.5 text-orange-500"/> Kitchen Staff Permissions</h4>
 <ul className="text-[10px] text-slate-500 space-y-1 font-semibold list-disc list-inside">
 <li>Can only view and accept Orders</li>
 <li>Can update Product preparation status</li>
 <li>Can toggle items In/Out of stock</li>
 <li>Cannot see Revenue or Profile details</li>
 </ul>
 </div>
 </div>
 </motion.form>
 )}
 </AnimatePresence>

 {/* Staff List */}
 <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm overflow-x-auto custom-scrollbar">
 <table className="w-full text-left text-sm whitespace-nowrap">
 <thead className="bg-[#f5f6fa] text-xs uppercase font-bold text-slate-500 tracking-wider">
 <tr>
 <th className="px-6 py-4">Team Member</th>
 <th className="px-6 py-4">Role & Access</th>
 <th className="px-6 py-4">Status</th>
 <th className="px-6 py-4">Added On</th>
 <th className="px-6 py-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 ">
 {/* Active Staff */}
 {staffList.map((staff) => (
 <tr key={staff._id || Math.random()} className="hover:bg-[#f5f6fa] :bg-slate-800/20 transition-colors group">
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${
 staff.role === 'Manager' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
 }`}>
 {staff.user?.name ? staff.user.name.charAt(0) : 'U'}
 </div>
 <div>
 <div className="font-bold text-slate-800 ">{staff.user?.name || 'Unknown User'}</div>
 <div className="text-[10px] font-semibold text-slate-500">{staff.user?.email || 'N/A'}</div>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
 staff.role === 'Manager' ? 'bg-blue-50 text-blue-600 border-blue-200 ' : 'bg-orange-50 text-orange-600 border-orange-200 '
 }`}>
 {staff.role === 'Manager' ? <Shield className="w-3.5 h-3.5" /> : <ChefHat className="w-3.5 h-3.5" />} {staff.role}
 </span>
 </td>
 <td className="px-6 py-4">
 <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
 staff.status === 'Active' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-100'
 }`}>
 <div className={`w-1.5 h-1.5 rounded-full ${staff.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
 {staff.status}
 </span>
 </td>
 <td className="px-6 py-4 text-slate-500 font-medium">
 {new Date(staff.addedOn).toLocaleDateString()}
 </td>
 <td className="px-6 py-4 text-right">
 <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
 <button onClick={() => toggleStatus(staff._id)} className="p-1.5 text-slate-400 hover:text-[#e31837] hover:bg-[#e31837]/10 rounded-lg transition-colors" title={staff.status === 'Active' ? 'Deactivate access' : 'Activate access'}>
 {staff.status === 'Active' ? <Lock className="w-4 h-4" /> : <Check className="w-4 h-4" />}
 </button>
 <button onClick={() => removeStaff(staff._id)} className="p-1.5 text-slate-400 hover:text-[#e31837] hover:bg-[#e31837]/10 rounded-lg transition-colors" title="Remove Staff">
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 
 {/* Pending Invites */}
 {invites.map((invite) => (
 <tr key={invite._id || Math.random()} className="hover:bg-[#f5f6fa] :bg-slate-800/20 transition-colors bg-amber-50/30 ">
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full border border-dashed border-amber-300 flex items-center justify-center font-black text-sm text-amber-500">
 <Clock className="w-4 h-4" />
 </div>
 <div>
 <div className="font-bold text-slate-800 flex items-center gap-2">Pending Invite</div>
 <div className="text-[10px] font-semibold text-slate-500">{invite.email}</div>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border bg-[#f5f6fa] text-slate-600 border-gray-200 ">
 {invite.role}
 </span>
 </td>
 <td className="px-6 py-4">
 <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-100 border border-amber-200 ">
 <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
 Awaiting Join
 </span>
 </td>
 <td className="px-6 py-4 text-slate-500 font-medium">
 {new Date(invite.invitedOn).toLocaleDateString()}
 </td>
 <td className="px-6 py-4 text-right">
 <button className="text-[10px] font-bold text-amber-600 hover:text-amber-700 underline">Resend Link</button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 {!loading && staffList.length === 0 && invites.length === 0 && (
 <div className="text-center py-12 text-slate-400">
 <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
 <p className="font-semibold text-sm">No team members or pending invites.</p>
 </div>
 )}
 </div>

 </div>
 );
};

export default Staff;
