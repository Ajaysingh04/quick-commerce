import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Wallet, Clock, CheckCircle, XCircle, Search, FileText, X, TrendingUp, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_WITHDRAWALS = [
 {
 _id: 'wd-1001',
 deliveryPartner: { _id: 'rider-1', name: 'Rider Deepak', phone: '9876543210', email: 'deepak@rider.com' },
 bankDetails: { bankName: 'HDFC Bank', accountNumber: '501002345678', ifscCode: 'HDFC0001234', accountHolderName: 'Deepak Kumar' },
 amount: 2450,
 status: 'pending',
 createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
 },
 {
 _id: 'wd-1002',
 deliveryPartner: { _id: 'rider-2', name: 'Rider Sunil', phone: '9845321098', email: 'sunil@rider.com' },
 bankDetails: { bankName: 'SBI Bank', accountNumber: '30294857612', ifscCode: 'SBIN0004567', accountHolderName: 'Sunil Sharma' },
 amount: 1800,
 status: 'approved',
 createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
 },
 {
 _id: 'wd-1003',
 deliveryPartner: { _id: 'rider-3', name: 'Rider Amit', phone: '9812345678', email: 'amit@rider.com' },
 bankDetails: { bankName: 'ICICI Bank', accountNumber: '001122334455', ifscCode: 'ICIC0001234', accountHolderName: 'Amit Singh' },
 amount: 520,
 status: 'rejected',
 createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
 }
];

const PayoutsList = () => {
 const [withdrawals, setWithdrawals] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');
 const [statusFilter, setStatusFilter] = useState('pending');

 // Analytics Modal State
 const [selectedRequest, setSelectedRequest] = useState(null);
 const [analytics, setAnalytics] = useState(null);
 const [loadingAnalytics, setLoadingAnalytics] = useState(false);
 const [isModalOpen, setIsModalOpen] = useState(false);

 useEffect(() => {
 fetchWithdrawals();
 }, []);

 const fetchWithdrawals = async () => {
 try {
 const res = await API.get('/withdrawals');
 if (res.data && res.data.length > 0) {
 setWithdrawals(res.data);
 } else {
 setWithdrawals(MOCK_WITHDRAWALS);
 }
 } catch (err) {
 console.error('Failed to fetch withdrawals', err);
 setWithdrawals(MOCK_WITHDRAWALS);
 } finally {
 setLoading(false);
 }
 };

 const handleOpenAnalytics = async (request) => {
 setSelectedRequest(request);
 setIsModalOpen(true);
 setLoadingAnalytics(true);
 try {
 const res = await API.get(`/withdrawals/analytics/${request.deliveryPartner._id}`);
 setAnalytics(res.data);
 } catch (err) {
 console.error('Failed to fetch analytics, falling back to mock analytics', err);
 // Fallback Mock Analytics
 setAnalytics({
 totalDeliveries: 45,
 totalRevenue: 12500,
 totalPayout: request.amount || 2450,
 deliveryDetails: [
 { orderId: 'ord-991', storeName: 'Burger King', customerAddress: 'MG Road, City', amount: 350, payout: 40, timeTakenMinutes: 25 },
 { orderId: 'ord-992', storeName: 'Pizza Hut', customerAddress: '2nd Cross, Phase 1', amount: 800, payout: 60, timeTakenMinutes: 35 }
 ]
 });
 } finally {
 setLoadingAnalytics(false);
 }
 };

 const handleUpdateStatus = async (status) => {
 try {
 await API.put(`/withdrawals/${selectedRequest._id}/status`, { status });
 setWithdrawals(prev => prev.map(w => w._id === selectedRequest._id ? { ...w, status } : w));
 setIsModalOpen(false);
 setSelectedRequest(null);
 } catch (err) {
 console.error('Failed to update status', err);
 alert('Failed to update status');
 }
 };

 const filteredWithdrawals = withdrawals.filter(w => {
 const searchLower = searchQuery.toLowerCase();
 const matchesSearch = 
 (w.deliveryPartner?.name && w.deliveryPartner.name.toLowerCase().includes(searchLower)) ||
 (w.bankDetails?.accountNumber && w.bankDetails.accountNumber.includes(searchLower));
 
 const matchesStatus = statusFilter === 'All' || w.status === statusFilter;
 
 return matchesSearch && matchesStatus;
 });

 const getStatusBadge = (status) => {
 switch(status) {
 case 'pending': return 'bg-amber-100 text-amber-600 border border-amber-200';
 case 'approved': return 'bg-emerald-100 text-emerald-600 border border-emerald-200';
 case 'rejected': return 'bg-rose-100 text-rose-600 border border-rose-200';
 default: return 'bg-emerald-100 text-slate-600';
 }
 };

 if (loading) {
 return (
 <div className="flex justify-center items-center h-64">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
 </div>
 );
 }

 return (
 <div className="bg-white border border-emerald-200/60 rounded-3xl shadow-sm overflow-hidden flex flex-col animate-in fade-in">
 {/* Header & Filters */}
 <div className="p-6 border-b border-emerald-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-emerald-50/50 ">
 <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
 Payouts Management
 <span className="bg-emerald-600 text-white text-xs px-2.5 py-0.5 rounded-full">{withdrawals.length}</span>
 </h3>

 <div className="flex flex-col sm:flex-row gap-3">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <input 
 type="text" 
 placeholder="Search partner or account..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white border border-emerald-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all "
 />
 </div>
 <select 
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="px-4 py-2 bg-white border border-emerald-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-600/20"
 >
 <option value="All">All Statuses</option>
 <option value="pending">Pending</option>
 <option value="approved">Approved</option>
 <option value="rejected">Rejected</option>
 </select>
 </div>
 </div>

 {/* Table Content */}
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse min-w-[800px]">
 <thead>
 <tr className="bg-emerald-50/50 border-b border-emerald-200 ">
 <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Partner Details</th>
 <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Bank Info</th>
 <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
 <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
 <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
 <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
 </tr>
 </thead>
 <tbody>
 {filteredWithdrawals.length > 0 ? (
 filteredWithdrawals.map((w, i) => (
 <motion.tr 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.05 }}
 key={w._id} 
 className="border-b border-slate-50 hover:bg-emerald-50/50 :bg-slate-800/20 transition-colors"
 >
 {/* Partner Details */}
 <td className="p-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold text-sm">
 {w.deliveryPartner?.name?.charAt(0).toUpperCase()}
 </div>
 <div>
 <p className="font-bold text-slate-900 text-sm">{w.deliveryPartner?.name}</p>
 <p className="text-xs text-slate-500">{w.deliveryPartner?.phone}</p>
 </div>
 </div>
 </td>

 {/* Bank Info */}
 <td className="p-4">
 <p className="text-sm font-semibold text-slate-800 ">{w.bankDetails?.bankName}</p>
 <p className="text-xs text-slate-500 font-mono">XXXX-{w.bankDetails?.accountNumber?.slice(-4)}</p>
 </td>

 {/* Amount */}
 <td className="p-4">
 <p className="text-lg font-black text-emerald-600">₹{w.amount}</p>
 </td>

 {/* Status */}
 <td className="p-4">
 <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider ${getStatusBadge(w.status)}`}>
 {w.status}
 </span>
 </td>

 {/* Date */}
 <td className="p-4 text-sm font-medium text-slate-600 ">
 {new Date(w.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
 </td>

 {/* Actions */}
 <td className="p-4">
 <button 
 onClick={() => handleOpenAnalytics(w)}
 className="text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors bg-emerald-50 text-emerald-600 hover:bg-emerald-100 :bg-emerald-600/20"
 >
 <FileText className="w-3.5 h-3.5" />
 Review & Analytics
 </button>
 </td>
 </motion.tr>
 ))
 ) : (
 <tr>
 <td colSpan="6" className="p-8 text-center text-slate-500">
 <div className="flex flex-col items-center gap-2">
 <Wallet className="w-8 h-8 text-slate-300" />
 <p>No withdrawal requests found.</p>
 </div>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>

 {/* Analytics Modal */}
 <AnimatePresence>
 {isModalOpen && selectedRequest && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <motion.div 
 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
 onClick={() => setIsModalOpen(false)}
 />
 <motion.div 
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
 >
 {/* Modal Header */}
 <div className="p-6 border-b border-emerald-200 flex justify-between items-center bg-emerald-50/50 ">
 <div>
 <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
 Payout Review: {selectedRequest.deliveryPartner?.name}
 <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-bold ${getStatusBadge(selectedRequest.status)}`}>
 {selectedRequest.status}
 </span>
 </h2>
 <p className="text-sm text-slate-500 mt-1">
 Requested Amount: <span className="font-bold text-emerald-600">₹{selectedRequest.amount}</span>
 </p>
 </div>
 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-emerald-100 :bg-slate-800 rounded-full transition-colors">
 <X className="w-5 h-5 text-slate-500" />
 </button>
 </div>

 {/* Modal Content */}
 <div className="p-6 overflow-y-auto space-y-6">
 
 {/* Analytics Summary */}
 {loadingAnalytics ? (
 <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>
 ) : analytics ? (
 <>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 {/* Bank Details */}
 <div className="md:col-span-1 bg-emerald-50 p-5 rounded-2xl border border-emerald-200 ">
 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Bank Details</h4>
 <div className="space-y-2 text-sm">
 <p><span className="text-slate-500">Bank:</span> <span className="font-semibold text-slate-800 ">{selectedRequest.bankDetails?.bankName}</span></p>
 <p><span className="text-slate-500">Account:</span> <span className="font-mono text-slate-800 ">{selectedRequest.bankDetails?.accountNumber}</span></p>
 <p><span className="text-slate-500">IFSC:</span> <span className="font-mono text-slate-800 ">{selectedRequest.bankDetails?.ifscCode}</span></p>
 <p><span className="text-slate-500">Name:</span> <span className="font-semibold text-slate-800 ">{selectedRequest.bankDetails?.accountHolderName}</span></p>
 </div>
 </div>

 {/* Stat Cards */}
 <div className="md:col-span-3 grid grid-cols-3 gap-4">
 <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl flex flex-col justify-center">
 <p className="text-blue-500 text-xs font-bold uppercase tracking-wider mb-1">Total Deliveries</p>
 <p className="text-3xl font-black text-slate-800 ">{analytics.totalDeliveries}</p>
 </div>
 <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl flex flex-col justify-center">
 <p className="text-emerald-500 text-xs font-bold uppercase tracking-wider mb-1">Generated Revenue</p>
 <p className="text-3xl font-black text-slate-800 ">₹{analytics.totalRevenue}</p>
 </div>
 <div className="bg-emerald-600/10 border border-emerald-600/20 p-5 rounded-2xl flex flex-col justify-center">
 <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">Total Payout Accrued</p>
 <p className="text-3xl font-black text-emerald-600">₹{analytics.totalPayout}</p>
 </div>
 </div>
 </div>

 {/* Detailed Delivery Table */}
 <div>
 <h4 className="text-lg font-bold text-slate-800 mb-4">Delivery History</h4>
 <div className="border border-emerald-200 rounded-2xl overflow-hidden">
 <table className="w-full text-left text-sm">
 <thead className="bg-emerald-50 border-b border-emerald-200 ">
 <tr>
 <th className="p-3 font-semibold text-slate-500">Order ID</th>
 <th className="p-3 font-semibold text-slate-500">Route</th>
 <th className="p-3 font-semibold text-slate-500">Time Taken</th>
 <th className="p-3 font-semibold text-slate-500">Order Value</th>
 <th className="p-3 font-semibold text-slate-500">Partner Payout</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 ">
 {analytics.deliveryDetails?.map(d => (
 <tr key={d.orderId} className="hover:bg-emerald-50 :bg-slate-800/50">
 <td className="p-3 font-mono text-xs text-slate-500">{d.orderId.substring(d.orderId.length - 6).toUpperCase()}</td>
 <td className="p-3">
 <div className="flex flex-col gap-1">
 <div className="flex items-center gap-1.5 text-slate-700 font-medium">
 <span className="w-2 h-2 rounded-full bg-blue-500"></span> {d.storeName}
 </div>
 <div className="flex items-center gap-1.5 text-slate-500 text-xs">
 <span className="w-2 h-2 rounded-full bg-emerald-600"></span> {d.customerAddress}
 </div>
 </div>
 </td>
 <td className="p-3">
 <div className="flex items-center gap-1.5 text-slate-700 ">
 <Clock className="w-4 h-4 text-slate-400" /> 
 {d.timeTakenMinutes > 0 ? `${d.timeTakenMinutes} mins` : 'Unknown'}
 </div>
 </td>
 <td className="p-3 font-semibold text-slate-700 ">₹{d.amount}</td>
 <td className="p-3 font-bold text-emerald-500">₹{d.payout}</td>
 </tr>
 ))}
 {analytics.deliveryDetails?.length === 0 && (
 <tr>
 <td colSpan="5" className="p-6 text-center text-slate-500">No delivery history found.</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </>
 ) : null}
 </div>

 {/* Modal Footer / Actions */}
 {selectedRequest.status === 'pending' && (
 <div className="p-6 border-t border-emerald-200 bg-emerald-50 flex justify-end gap-3">
 <button 
 onClick={() => handleUpdateStatus('rejected')}
 className="px-5 py-2.5 bg-white border border-emerald-200 text-rose-500 font-bold rounded-xl hover:bg-rose-50 :bg-rose-500/10 transition-colors flex items-center gap-2"
 >
 <XCircle className="w-4 h-4" /> Reject Payout
 </button>
 <button 
 onClick={() => handleUpdateStatus('approved')}
 className="px-5 py-2.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-500/30"
 >
 <CheckCircle className="w-4 h-4" /> Approve & Transfer ₹{selectedRequest.amount}
 </button>
 </div>
 )}
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 </div>
 );
};

export default PayoutsList;
