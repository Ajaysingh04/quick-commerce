import { useState, useEffect } from 'react';
import { Search, Bell, Calendar, ChevronDown, Settings, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import API from '../../services/api.js';

const OrderManage = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('All orders');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const { user } = useSelector(state => state.auth);

  const tabs = ['All orders', 'Dispatch', 'Pending', 'Completed'];

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get('/orders/admin/all');
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await API.put(`/orders/${id}/status`, { status: newStatus });
      setOrders(prev => prev.map(order => 
        order._id === id ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await API.delete(`/orders/${id}`);
      setOrders(prev => prev.filter(order => order._id !== id));
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order');
    }
  };

  return (
    <div className="h-full flex flex-col font-sans max-w-7xl mx-auto w-full pt-4">
      
      {/* Top Header Area */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Order</h2>
          <p className="text-sm font-semibold text-slate-500 mt-2">{orders.length} orders found</p>
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        
        {/* Tabs - Scrollable on mobile */}
        <div className="flex items-center gap-4 sm:gap-8 border-b border-gray-200 w-full sm:w-auto overflow-x-auto no-scrollbar whitespace-nowrap pb-0.5">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-bold transition-all relative shrink-0 ${
                activeTab === tab ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-emerald-600 rounded-t-full"></span>
              )}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-sm text-xs sm:text-sm font-bold text-slate-700 self-end sm:self-auto">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Today</span>
        </div>
      </div>

      {/* Orders Content Area */}
      <div className="flex-1 w-full bg-transparent mb-8">
        {loading ? (
          <div className="text-center py-16 text-slate-500 font-bold animate-pulse">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-500 font-bold">No orders found.</div>
        ) : (() => {
          const filteredOrders = orders.filter(order => {
            let displayStatus = 'Pending';
            if (order.status === 'out-for-delivery') displayStatus = 'Dispatch';
            else if (order.status === 'delivered') displayStatus = 'Completed';
            else if (order.status === 'cancelled') displayStatus = 'Cancelled';
            else displayStatus = 'Pending';

            if (activeTab === 'All orders') return true;
            return displayStatus === activeTab;
          });
          
          const indexOfLastItem = currentPage * itemsPerPage;
          const indexOfFirstItem = indexOfLastItem - itemsPerPage;
          const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
          const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

          if (currentItems.length === 0) {
            return (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-500 font-bold">
                No orders found in &quot;{activeTab}&quot;.
              </div>
            );
          }

          return (
            <div className="space-y-4 pb-20">
              
              {/* MOBILE CARDS VIEW (md:hidden) */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {currentItems.map((order) => {
                  const shortId = '#' + order._id.substring(order._id.length - 5).toUpperCase();
                  const userName = order.user?.name || 'Guest User';
                  const userAvatar = order.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=10b981&color=fff&bold=true`;
                  const address = order.deliveryAddress ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}` : 'Address N/A';
                  const dateObj = new Date(order.createdAt);
                  const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                  const price = `₹${order.billDetails?.grandTotal || 0}`;

                  let displayStatus = 'Pending';
                  if (order.status === 'out-for-delivery') displayStatus = 'Dispatch';
                  else if (order.status === 'delivered') displayStatus = 'Completed';
                  else if (order.status === 'cancelled') displayStatus = 'Cancelled';
                  else displayStatus = 'Pending';

                  const statusStyles = {
                    Pending: 'bg-rose-50 text-rose-600 border-rose-200 dot-rose-500',
                    Dispatch: 'bg-amber-50 text-amber-600 border-amber-200 dot-amber-500',
                    Completed: 'bg-emerald-50 text-emerald-600 border-emerald-200 dot-emerald-500',
                    Cancelled: 'bg-slate-100 text-slate-500 border-slate-200 dot-slate-400'
                  };

                  return (
                    <div key={order._id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
                      {/* Card Top: ID + Date + Status Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs px-2 py-0.5 bg-slate-100 text-slate-800 rounded-lg">{shortId}</span>
                          <span className="text-[11px] font-semibold text-slate-400">{formattedDate}</span>
                        </div>

                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black border ${statusStyles[displayStatus] || statusStyles.Pending}`}>
                          <span className={`w-2 h-2 rounded-full ${
                            displayStatus === 'Pending' ? 'bg-rose-500' :
                            displayStatus === 'Dispatch' ? 'bg-amber-500' :
                            displayStatus === 'Completed' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}></span>
                          <span>{displayStatus}</span>
                        </div>
                      </div>

                      {/* Card Middle: Customer info & Address */}
                      <div className="flex items-start gap-3 pt-1 border-t border-slate-100">
                        <img src={userAvatar} alt={userName} className="w-10 h-10 rounded-full border border-slate-200 bg-slate-100 shrink-0 object-cover" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{userName}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{address}</p>
                        </div>
                      </div>

                      {/* Card Bottom: Total Price & Quick Action Dropdown */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                          <span className="text-base font-black text-emerald-600">{price}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={order.status === 'out-for-delivery' ? 'out-for-delivery' : order.status === 'delivered' ? 'delivered' : 'placed'}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className="bg-slate-50 text-slate-700 text-xs font-bold py-1.5 px-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                          >
                            <option value="placed">Pending</option>
                            <option value="out-for-delivery">Dispatch</option>
                            <option value="delivered">Completed</option>
                          </select>

                          <button
                            onClick={() => deleteOrder(order._id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP TABLE VIEW (hidden on mobile, block on md+) */}
              <div className="hidden md:block overflow-x-auto rounded-3xl border border-slate-100 shadow-sm bg-white">
                <div className="min-w-[800px]">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs font-extrabold text-slate-500 bg-slate-50/80 border-b border-slate-100 tracking-wider uppercase">
                    <div className="col-span-1 flex items-center gap-1 cursor-pointer">ID <ChevronDown className="w-3 h-3 text-slate-400"/></div>
                    <div className="col-span-3">Customer</div>
                    <div className="col-span-4">Address</div>
                    <div className="col-span-2 flex items-center gap-1 cursor-pointer">Date <ChevronDown className="w-3 h-3 text-slate-400"/></div>
                    <div className="col-span-1 flex items-center gap-1 cursor-pointer">Price <ChevronDown className="w-3 h-3 text-slate-400"/></div>
                    <div className="col-span-1 text-center">Status</div>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-slate-100">
                    {currentItems.map((order) => {
                      const isHovered = hoveredRow === order._id;
                      const shortId = '#' + order._id.substring(order._id.length - 5).toUpperCase();
                      const userName = order.user?.name || 'Guest User';
                      const userAvatar = order.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=10b981&color=fff&bold=true`;
                      const address = order.deliveryAddress ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}` : 'N/A';
                      const dateObj = new Date(order.createdAt);
                      const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                      const price = `₹${order.billDetails?.grandTotal || 0}`;

                      let displayStatus = 'Pending';
                      if (order.status === 'out-for-delivery') displayStatus = 'Dispatch';
                      else if (order.status === 'delivered') displayStatus = 'Completed';
                      else if (order.status === 'cancelled') displayStatus = 'Cancelled';
                      else displayStatus = 'Pending';

                      return (
                        <div 
                          key={order._id}
                          onMouseEnter={() => setHoveredRow(order._id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          className="grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-slate-50/70"
                        >
                          <div className="col-span-1 text-xs font-mono font-bold text-slate-800 uppercase">
                            {shortId}
                          </div>
                          
                          <div className="col-span-3 flex items-center gap-3 min-w-0">
                            <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full border border-slate-200 bg-gray-100 shrink-0 object-cover" />
                            <span className="text-sm font-bold text-slate-800 truncate">{userName}</span>
                          </div>
                          
                          <div className="col-span-4 text-xs font-semibold text-slate-600 truncate pr-4">
                            {address}
                          </div>
                          
                          <div className="col-span-2 text-xs font-semibold text-slate-500">
                            {formattedDate}
                          </div>
                          
                          <div className="col-span-1 text-sm font-black text-slate-900">
                            {price}
                          </div>
                          
                          <div className="col-span-1 flex items-center justify-between relative">
                            {/* Status Indicator */}
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${
                                displayStatus === 'Pending' ? 'bg-rose-500' :
                                displayStatus === 'Dispatch' ? 'bg-amber-500' :
                                displayStatus === 'Completed' ? 'bg-emerald-500' :
                                'bg-slate-400'
                              }`}></div>
                              <span className={`text-xs font-bold ${
                                displayStatus === 'Pending' ? 'text-rose-500' :
                                displayStatus === 'Dispatch' ? 'text-amber-500' :
                                displayStatus === 'Completed' ? 'text-emerald-500' :
                                'text-slate-400'
                              }`}>
                                {displayStatus}
                              </span>
                            </div>

                            {/* Action Menu */}
                            <div className="relative group">
                              <button className="p-1 rounded-lg bg-white border border-gray-200 text-slate-500 hover:bg-slate-50 transition-colors">
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              
                              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); updateOrderStatus(order._id, 'placed'); }}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50"
                                >
                                  Mark as Pending
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); updateOrderStatus(order._id, 'out-for-delivery'); }}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-amber-500 hover:bg-amber-50"
                                >
                                  Mark as Dispatch
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); updateOrderStatus(order._id, 'delivered'); }}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-emerald-500 hover:bg-emerald-50"
                                >
                                  Mark as Completed
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); deleteOrder(order._id); }}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center justify-between"
                                >
                                  Delete <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Pagination Footer */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 pt-4 border-t border-gray-200">
                  <div className="text-xs font-bold text-slate-500">
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length}
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button 
                        key={page} 
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                          page === currentPage ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default OrderManage;
