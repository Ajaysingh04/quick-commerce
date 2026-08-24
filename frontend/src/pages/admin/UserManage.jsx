import React, { useState, useEffect } from 'react';
import API from '../../services/api.js';
import { Search, UserCog, ToggleLeft, ToggleRight, Check, X, ShieldAlert, Heart, ShoppingBag, Eye, Phone, Mail } from 'lucide-react';

const UserManage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users'); // GET /api/users is the admin route
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
      // Fallback
      setUsers([
        { _id: 'u-1', name: 'Rohan Malhotra', email: 'rohan@gmail.com', role: 'user', isVerified: true, isActive: true },
        { _id: 'u-2', name: 'Deepak Kumar', email: 'deepak@gmail.com', role: 'delivery', isVerified: true, isActive: true },
        { _id: 'u-3', name: 'Admin Ajay', email: 'admin@gmail.com', role: 'admin', isVerified: true, isActive: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    setDetailsLoading(true);
    try {
      const res = await API.get(`/users/${userId}/details`);
      setUserDetails(res.data);
    } catch (err) {
      console.error('Failed to fetch user details', err);
      // Fallback for demo users
      setUserDetails({
        user: users.find(u => u._id === userId),
        orders: []
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleOpenDetails = (user) => {
    setSelectedUser(user);
    fetchUserDetails(user._id);
  };

  const handleCloseDetails = () => {
    setSelectedUser(null);
    setUserDetails(null);
  };

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
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to page 1 if search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="bg-white rounded-3xl p-6 border border-emerald-200/60 shadow-premium flex flex-col gap-6 relative">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-200 pb-4">
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
            className="w-full bg-emerald-50 rounded-full pl-9 pr-4 py-2 text-xs outline-none focus:border focus:border-emerald-600 font-medium"
          />
        </div>
      </div>

      {success && <p className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 flex items-center gap-1"><Check className="w-4 h-4" /> {success}</p>}

      {loading ? (
        <div className="py-10 text-center text-slate-500 animate-pulse font-bold text-sm">Loading Users...</div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-emerald-200 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Account Holder</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Role Permission</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100 font-semibold">
              {currentUsers.map((u) => (
                <tr key={u._id} className="hover:bg-emerald-50 transition-colors">
                  <td className="py-3.5 px-4 cursor-pointer" onClick={() => handleOpenDetails(u)}>
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-normal text-slate-500 ">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <select 
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="bg-transparent border border-emerald-200 rounded-lg p-1 text-xs outline-none text-slate-600 cursor-pointer"
                    >
                      <option value="user">Customer</option>
                      <option value="delivery">Delivery Partner</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${u.isActive !== false ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {u.isActive !== false ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleOpenDetails(u)}
                      className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleToggleActive(u._id, u.isActive !== false)}
                      className="p-1 text-slate-400 hover:text-emerald-600"
                      title="Toggle Status"
                    >
                      {u.isActive !== false ? <ToggleRight className="w-6 h-6 text-emerald-600" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={handleCloseDetails}
          ></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-emerald-100 bg-emerald-50/30">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <UserCog className="text-emerald-600" /> User Details
              </h3>
              <button onClick={handleCloseDetails} className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              {detailsLoading ? (
                <div className="flex items-center justify-center h-40 text-emerald-600 font-bold animate-pulse">
                  Loading complete details...
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Profile Section */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center md:items-start">
                    {userDetails?.user?.avatar ? (
                      <img src={userDetails.user.avatar} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover shadow-sm border border-emerald-100" />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl font-black shadow-sm border border-emerald-200">
                        {userDetails?.user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-black text-slate-800">{userDetails?.user?.name}</h2>
                      <div className="mt-2 space-y-1">
                        <p className="flex items-center justify-center md:justify-start gap-2 text-sm text-slate-600 font-medium">
                          <Mail className="w-4 h-4 text-emerald-500" /> {userDetails?.user?.email}
                        </p>
                        <p className="flex items-center justify-center md:justify-start gap-2 text-sm text-slate-600 font-medium">
                          <Phone className="w-4 h-4 text-emerald-500" /> {userDetails?.user?.phone || 'Not Provided'}
                        </p>
                      </div>
                      <div className="mt-4 flex gap-2 justify-center md:justify-start">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 bg-slate-100 text-slate-600 rounded-full">ID: {userDetails?.user?._id}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full">Role: {userDetails?.user?.role}</span>
                      </div>
                    </div>
                  </div>

                  {/* Two Column Layout for Wishlist & Orders */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Wishlist */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <h4 className="font-black text-slate-800 flex items-center gap-2 mb-4">
                        <Heart className="w-5 h-5 text-rose-500" /> Wishlist ({userDetails?.user?.wishlist?.length || 0})
                      </h4>
                      {userDetails?.user?.wishlist?.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                          {userDetails.user.wishlist.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-center p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                              <img 
                                src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"} 
                                className="w-12 h-12 rounded-lg object-cover bg-slate-100" 
                                alt={item.name} 
                              />
                              <div>
                                <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</p>
                                <p className="text-xs font-semibold text-emerald-600">₹{item.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 font-medium py-4 text-center bg-slate-50 rounded-xl">No items in wishlist.</p>
                      )}
                    </div>

                    {/* Orders */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <h4 className="font-black text-slate-800 flex items-center gap-2 mb-4">
                        <ShoppingBag className="w-5 h-5 text-emerald-600" /> Orders ({userDetails?.orders?.length || 0})
                      </h4>
                      {userDetails?.orders?.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                          {userDetails.orders.map((order) => (
                            <div key={order._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-black text-slate-800 text-xs">#{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                                <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded ${
                                  order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                                  order.status === 'cancelled' ? 'bg-rose-100 text-rose-600' :
                                  'bg-amber-100 text-amber-600'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                <span className="text-emerald-700 font-black">₹{order.billDetails?.grandTotal || 0}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 font-medium py-4 text-center bg-slate-50 rounded-xl">No orders placed yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManage;
