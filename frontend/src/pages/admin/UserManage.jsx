import React, { useState } from 'react';
import API from '../../services/api.js';
import { Search, UserCog, ToggleLeft, ToggleRight, Check, ShieldAlert } from 'lucide-react';

const BACKUP_USERS = [
 { _id: 'u-1', name: 'Rohan Malhotra', email: 'rohan@gmail.com', role: 'user', isVerified: true, isActive: true },
 { _id: 'u-2', name: 'Deepak Kumar', email: 'deepak@gmail.com', role: 'delivery', isVerified: true, isActive: true },
 { _id: 'u-3', name: 'Admin Ajay', email: 'admin@gmail.com', role: 'admin', isVerified: true, isActive: true }
];

const UserManage = () => {
 const [users, setUsers] = useState(BACKUP_USERS);
 const [search, setSearch] = useState('');
 const [success, setSuccess] = useState('');

 const handleRoleChange = async (userId, newRole) => {
 try {
 await API.put(`/admin/users/${userId}/role`, { role: newRole });
 setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
 setSuccess('User role updated successfully!');
 } catch (err) {
 setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
 setSuccess('Simulated: User role updated locally.');
 }
 };

 const handleToggleActive = async (userId, currentStatus) => {
 try {
 await API.put(`/admin/users/${userId}/toggle-active`, { isActive: !currentStatus });
 setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
 setSuccess('User active state updated successfully!');
 } catch (err) {
 setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
 setSuccess('Simulated: User active state toggled locally.');
 }
 };

 const filteredUsers = users.filter(u => 
 u.name.toLowerCase().includes(search.toLowerCase()) || 
 u.email.toLowerCase().includes(search.toLowerCase())
 );

 return (
 <div className="bg-white rounded-3xl p-6 border border-pink-200/60 shadow-premium flex flex-col gap-6">
 
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-pink-200 pb-4">
 <div>
 <h3 className="text-lg font-black">User Accounts Management</h3>
 <p className="text-xs text-slate-400 mt-1">Review profiles, update credentials roles, and deactivate system accounts.</p>
 </div>

 <div className="relative w-full sm:w-64">
 <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
 <input 
 type="text" 
 placeholder="Search by name or email..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full bg-pink-50 rounded-full pl-9 pr-4 py-2 text-xs outline-none focus:border focus:border-brand-500 font-medium"
 />
 </div>
 </div>

 {success && <p className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 flex items-center gap-1"><Check className="w-4 h-4" /> {success}</p>}

 <div className="overflow-x-auto w-full">
 <table className="w-full text-left text-sm border-collapse">
 <thead>
 <tr className="border-b border-pink-200 text-xs font-bold uppercase tracking-wider text-slate-400">
 <th className="py-3 px-4">Account Holder</th>
 <th className="py-3 px-4">Email Address</th>
 <th className="py-3 px-4">Role Permission</th>
 <th className="py-3 px-4">Verify Status</th>
 <th className="py-3 px-4">Active State</th>
 <th className="py-3 px-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 font-semibold">
 {filteredUsers.map((u) => (
 <tr key={u._id} className="hover:bg-pink-50 :bg-slate-850">
 <td className="py-3.5 px-4">{u.name}</td>
 <td className="py-3.5 px-4 text-xs font-normal text-slate-500 ">{u.email}</td>
 <td className="py-3.5 px-4">
 <select 
 value={u.role}
 onChange={(e) => handleRoleChange(u._id, e.target.value)}
 className="bg-transparent border border-pink-200 rounded-lg p-1 text-xs outline-none text-slate-600 cursor-pointer"
 >
 <option value="user">Customer</option>
 <option value="delivery">Delivery Partner</option>
 <option value="admin">Administrator</option>
 </select>
 </td>
 <td className="py-3.5 px-4">
 <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${u.isVerified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
 {u.isVerified ? 'Verified' : 'Pending'}
 </span>
 </td>
 <td className="py-3.5 px-4">
 <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${u.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
 {u.isActive ? 'Active' : 'Banned'}
 </span>
 </td>
 <td className="py-3.5 px-4 text-right">
 <button 
 onClick={() => handleToggleActive(u._id, u.isActive)}
 className="p-1 text-slate-400 hover:text-brand-500"
 title="Toggle Status"
 >
 {u.isActive ? <ToggleRight className="w-6 h-6 text-brand-500" /> : <ToggleLeft className="w-6 h-6" />}
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 </div>
 );
};

export default UserManage;
