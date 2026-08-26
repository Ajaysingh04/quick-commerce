import React, { useState, useEffect } from 'react';
import API from '../../services/api.js';
import { Search, ShieldAlert, Check, X, Eye, FileText, CheckCircle, XCircle, FileVideo, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DeliveryManage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State for KYC Verification
  const [selectedUser, setSelectedUser] = useState(null);
  const [kycLoading, setKycLoading] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDeliveryUsers();
  }, []);

  const fetchDeliveryUsers = async () => {
    try {
      const res = await API.get('/users'); 
      // Filter only delivery role
      const deliveryPartners = res.data.filter(u => u.role === 'delivery');
      setUsers(deliveryPartners);
    } catch (err) {
      console.error('Failed to fetch users', err);
      // Fallback
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenKyc = (user) => {
    setSelectedUser(user);
  };

  const handleCloseKyc = () => {
    setSelectedUser(null);
  };

  const updateKycStatus = async (userId, status) => {
    setKycLoading(true);
    try {
      await API.put(`/users/${userId}/kyc`, { status });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, kyc: { ...u.kyc, status } } : u));
      setSuccess(`KYC ${status === 'approved' ? 'Approved' : 'Rejected'} successfully!`);
      handleCloseKyc();
    } catch (err) {
      alert('Failed to update KYC status. ' + (err.response?.data?.message || ''));
    } finally {
      setKycLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Approved</span>;
      case 'pending_review':
        return <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse">Needs Review</span>;
      case 'rejected':
        return <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">Rejected</span>;
      default:
        return <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-600 border border-slate-500/20">Not Submitted</span>;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-emerald-200/60 shadow-premium flex flex-col gap-6 relative">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-200 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-800">Delivery Partners</h3>
          <p className="text-xs text-slate-500 mt-1">Manage delivery riders, review vehicle documents, and approve KYC.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search riders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-emerald-50 rounded-full pl-9 pr-4 py-2 text-xs outline-none focus:border focus:border-emerald-600 font-medium"
          />
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[11px] font-bold text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {success}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="py-10 text-center text-slate-500 animate-pulse font-bold text-sm">Loading Delivery Partners...</div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-emerald-200 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Rider Details</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Vehicle Type</th>
                <th className="py-3 px-4 text-center">KYC Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100 font-semibold">
              {currentUsers.map((u) => (
                <tr key={u._id} className="hover:bg-emerald-50 transition-colors">
                  <td className="py-3.5 px-4 cursor-pointer" onClick={() => handleOpenKyc(u)}>
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e31837] to-[#c8102e] text-white flex items-center justify-center text-sm font-black shadow-sm">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className="text-slate-800">{u.name}</span>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Rider ID: {u._id.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-xs text-slate-600">{u.email}</div>
                    <div className="text-xs text-slate-500 mt-1">{u.phone || 'N/A'}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs text-slate-600 capitalize bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                      {u.deliveryDetails?.vehicleType || 'Not Set'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {getStatusBadge(u.kyc?.status)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button 
                      onClick={() => handleOpenKyc(u)}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm inline-flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" /> Review KYC
                    </button>
                  </td>
                </tr>
              ))}
              {currentUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-slate-500 font-medium">No delivery partners found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredUsers.length > 0 && (
        <div className="flex justify-between items-center pt-4 border-t border-emerald-100 mt-2">
          <div className="text-xs font-bold text-slate-500">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length}
          </div>
          <div className="flex items-center gap-1">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50 text-xs font-bold border border-slate-200"
            >
              Prev
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button 
                  key={page} 
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                    page === currentPage ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'text-slate-500 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50 text-xs font-bold border border-slate-200"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* KYC Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
              onClick={handleCloseKyc}
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200"
            >
              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <FileText className="text-[#e31837]" /> KYC Verification
                </h3>
                <button onClick={handleCloseKyc} className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-white space-y-8">
                
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                   {selectedUser.avatar ? (
                        <img src={selectedUser.avatar} alt="Avatar" className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-black shadow-sm">
                          {selectedUser.name?.charAt(0)?.toUpperCase()}
                        </div>
                   )}
                   <div className="flex-1">
                     <h2 className="text-lg font-black text-slate-900">{selectedUser.name}</h2>
                     <p className="text-sm text-slate-500">{selectedUser.email} • {selectedUser.phone || 'No Phone'}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] font-bold text-slate-400 uppercase">Current Status</p>
                     <div className="mt-1">{getStatusBadge(selectedUser.kyc?.status)}</div>
                   </div>
                </div>

                {!selectedUser.kyc?.pan && !selectedUser.kyc?.aadhar && !selectedUser.kyc?.license ? (
                   <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                     <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                     <h4 className="text-lg font-bold text-slate-600">No Documents Uploaded</h4>
                     <p className="text-sm text-slate-400">This user hasn't submitted their KYC documents yet.</p>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* PAN Card */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <h4 className="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider">PAN Card</h4>
                      {selectedUser.kyc?.pan ? (
                        <a href={selectedUser.kyc.pan} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-xl border border-slate-200">
                          <img src={selectedUser.kyc.pan} alt="PAN Card" className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <Eye className="text-white w-8 h-8" />
                          </div>
                        </a>
                      ) : <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md">Missing</span>}
                    </div>

                    {/* Aadhar Card */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <h4 className="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider">Aadhar Card</h4>
                      {selectedUser.kyc?.aadhar ? (
                        <a href={selectedUser.kyc.aadhar} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-xl border border-slate-200">
                          <img src={selectedUser.kyc.aadhar} alt="Aadhar Card" className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <Eye className="text-white w-8 h-8" />
                          </div>
                        </a>
                      ) : <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md">Missing</span>}
                    </div>

                    {/* Driving License */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <h4 className="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider">Driving License</h4>
                      {selectedUser.kyc?.license ? (
                        <a href={selectedUser.kyc.license} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-xl border border-slate-200">
                          <img src={selectedUser.kyc.license} alt="Driving License" className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <Eye className="text-white w-8 h-8" />
                          </div>
                        </a>
                      ) : <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md">Missing</span>}
                    </div>

                    {/* Selfie Video */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <h4 className="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
                        Selfie Video <FileVideo className="w-4 h-4 text-slate-400" />
                      </h4>
                      {selectedUser.kyc?.selfieVideo ? (
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black">
                          <video src={selectedUser.kyc.selfieVideo} controls className="w-full h-40 object-cover" />
                        </div>
                      ) : <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md">Missing</span>}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
                <button 
                  onClick={() => updateKycStatus(selectedUser._id, 'rejected')}
                  disabled={kycLoading || selectedUser.kyc?.status === 'rejected'}
                  className="px-6 py-2.5 bg-white border border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  <XCircle className="w-4 h-4" /> Reject KYC
                </button>
                <button 
                  onClick={() => updateKycStatus(selectedUser._id, 'approved')}
                  disabled={kycLoading || selectedUser.kyc?.status === 'approved'}
                  className="px-6 py-2.5 bg-[#e31837] text-white font-bold rounded-xl hover:bg-[#c8102e] transition-colors disabled:opacity-50 flex items-center gap-2 shadow-[0_4px_15px_rgba(227,24,55,0.3)]"
                >
                  {kycLoading ? 'Processing...' : <><CheckCircle className="w-4 h-4" /> Approve KYC</>}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DeliveryManage;
