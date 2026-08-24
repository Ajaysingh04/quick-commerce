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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        
        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-gray-200 w-full lg:w-auto">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-bold transition-all relative ${
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
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg border border-gray-100 shadow-sm text-sm font-bold text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400 mr-2" />
          <span>Today</span>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 w-full bg-transparent mb-8">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs font-extrabold text-slate-800 tracking-wide uppercase">
          <div className="col-span-1 flex items-center gap-1 cursor-pointer">Id <ChevronDown className="w-3 h-3 text-slate-400"/></div>
          <div className="col-span-3">Name</div>
          <div className="col-span-4">Address</div>
          <div className="col-span-2 flex items-center gap-1 cursor-pointer">Date <ChevronDown className="w-3 h-3 text-slate-400"/></div>
          <div className="col-span-1 flex items-center gap-1 cursor-pointer">Price <ChevronDown className="w-3 h-3 text-slate-400"/></div>
          <div className="col-span-1 text-center">Status</div>
        </div>

        {/* Table Rows */}
        <div className="space-y-3 pb-24">
          {loading ? (
            <div className="text-center py-10 text-slate-500 font-bold animate-pulse">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-bold">No orders found.</div>
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

            return (
              <>
                {currentItems.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 font-bold">No orders in this tab.</div>
                ) : (
                  currentItems.map((order) => {
              const isHovered = hoveredRow === order._id;
              const shortId = '#' + order._id.substring(order._id.length - 5);
              const userName = order.user?.name || 'Guest User';
              const userAvatar = order.user?.avatar || `https://ui-avatars.com/api/?name=${userName}&background=random`;
              const address = order.deliveryAddress ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}` : 'N/A';
              const dateObj = new Date(order.createdAt);
              const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
              const price = `₹${order.billDetails?.grandTotal || 0}`;
              
              // Map DB status to UI status
              let displayStatus = 'Pending';
              if (order.status === 'out-for-delivery') displayStatus = 'Dispatch';
              else if (order.status === 'delivered') displayStatus = 'Completed';
              else if (order.status === 'cancelled') displayStatus = 'Cancelled';
              else displayStatus = 'Pending'; // for placed, confirmed, preparing, ready

              return (
                <div 
                  key={order._id}
                  onMouseEnter={() => setHoveredRow(order._id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 rounded-2xl items-center transition-all cursor-pointer relative ${
                    isHovered 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-blue-500/30 scale-[1.01] z-10' 
                      : 'bg-white text-slate-600 border border-gray-100'
                  }`}
                >
                  <div className={`col-span-1 text-xs font-bold ${isHovered ? 'text-white' : 'text-slate-800'} uppercase`}>
                    {shortId}
                  </div>
                  
                  <div className="col-span-3 flex items-center gap-3">
                    <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full border border-white/50 bg-gray-200" />
                    <span className={`text-sm font-bold ${isHovered ? 'text-white' : 'text-slate-800'}`}>{userName}</span>
                  </div>
                  
                  <div className="col-span-4 text-xs font-semibold truncate pr-4">
                    {address}
                  </div>
                  
                  <div className="col-span-2 text-xs font-semibold">
                    {formattedDate}
                  </div>
                  
                  <div className={`col-span-1 text-sm font-bold ${isHovered ? 'text-white' : 'text-slate-800'}`}>
                    {price}
                  </div>
                  
                  <div className="col-span-1 flex items-center justify-between relative">
                    {/* Status Indicator */}
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        displayStatus === 'Pending' ? 'bg-emerald-500' :
                        displayStatus === 'Dispatch' ? 'bg-amber-500' :
                        displayStatus === 'Completed' ? 'bg-emerald-500' :
                        'bg-slate-400'
                      }`}></div>
                      <span className={`text-xs font-bold ${
                        isHovered ? 'text-white/90' :
                        displayStatus === 'Pending' ? 'text-rose-500' :
                        displayStatus === 'Dispatch' ? 'text-amber-500' :
                        displayStatus === 'Completed' ? 'text-emerald-500' :
                        'text-slate-400'
                      }`}>
                        {displayStatus}
                      </span>
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center gap-2">
                      <div className="relative group">
                        <button className={`p-1 rounded bg-white border transition-colors ${isHovered ? 'border-transparent text-blue-600' : 'border-gray-200 text-slate-500 hover:bg-slate-50'}`}>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        
                        {/* Dropdown Menu on Hover */}
                        <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateOrderStatus(order._id, 'placed'); }}
                            className="w-full text-left px-4 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-50"
                          >
                            Mark as Pending
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateOrderStatus(order._id, 'out-for-delivery'); }}
                            className="w-full text-left px-4 py-2 text-sm font-semibold text-amber-500 hover:bg-amber-50"
                          >
                            Mark as Dispatch
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateOrderStatus(order._id, 'delivered'); }}
                            className="w-full text-left px-4 py-2 text-sm font-semibold text-emerald-500 hover:bg-emerald-50"
                          >
                            Mark as Completed
                          </button>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteOrder(order._id); }}
                            className="w-full text-left px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center justify-between"
                          >
                            Delete <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }))}
            
            {/* Pagination Footer */}
            {totalPages > 0 && (
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200">
                <div className="text-xs font-bold text-slate-500">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length}
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-800 transition-colors disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button 
                      key={page} 
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-md text-xs font-bold flex items-center justify-center transition-colors ${
                        page === currentPage ? 'bg-[#f0f4ff] text-emerald-600' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-800 transition-colors disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default OrderManage;
