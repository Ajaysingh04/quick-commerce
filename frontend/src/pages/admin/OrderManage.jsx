import { useState } from 'react';
import { Search, Bell, Calendar, ChevronDown, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';

const MOCK_ORDERS = [
  { _id: '#2632', user: { name: 'Brooklyn Zoe', avatar: 'https://i.pravatar.cc/150?u=1' }, address: '302 Snider Street, RUTLAND, VT, 05701', date: '31 Jul 2020', price: '$64.00', status: 'Pending' },
  { _id: '#2633', user: { name: 'John McCormick', avatar: 'https://i.pravatar.cc/150?u=2' }, address: '1096 Wiseman Street, CALMAR, IA, 52132', date: '01 Aug 2020', price: '$35.00', status: 'Dispatch' },
  { _id: '#2634', user: { name: 'Sandra Pugh', avatar: 'https://i.pravatar.cc/150?u=3' }, address: '1640 Thorn Street, SALE CITY, GA, 98106', date: '02 Aug 2020', price: '$74.00', status: 'Completed' },
  { _id: '#2635', user: { name: 'Vernie Hart', avatar: 'https://i.pravatar.cc/150?u=4' }, address: '3898 Oak Drive, DOVER, DE, 19906', date: '02 Aug 2020', price: '$82.00', status: 'Pending' },
  { _id: '#2636', user: { name: 'Mark Clark', avatar: 'https://i.pravatar.cc/150?u=5' }, address: '1915 Augusta Park, NASSAU, NY, 12062', date: '03 Aug 2020', price: '$39.00', status: 'Dispatch' },
  { _id: '#2637', user: { name: 'Rebekah Foster', avatar: 'https://i.pravatar.cc/150?u=6' }, address: '3445 Park Boulevard, BIOLA, CA, 93606', date: '03 Aug 2020', price: '$67.00', status: 'Pending' },
];

const OrderManage = () => {
  const [orders] = useState(MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState('All orders');
  const [hoveredRow, setHoveredRow] = useState('#2633'); // Default hover simulation like the image
  const { user } = useSelector(state => state.auth);

  const tabs = ['All orders', 'Dispatch', 'Pending', 'Completed'];

  return (
    <div className="h-full flex flex-col font-sans max-w-7xl mx-auto w-full pt-4">
      
      {/* Top Header Area (Integrated into content view now) */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Order</h2>
          <p className="text-sm font-semibold text-slate-500 mt-2">28 orders found</p>
        </div>
        <div className="flex items-center gap-6">
          <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer ml-2">
            <img 
              src={user?.imageUrl || 'https://i.pravatar.cc/150?u=admin'} 
              alt="Admin" 
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
            />
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
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
                activeTab === tab ? 'text-[#e31837]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-[#e31837] rounded-t-full"></span>
              )}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg border border-gray-100 shadow-sm text-sm font-bold text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400 mr-2" />
          <span>31 Jul 2020</span>
          <span className="text-slate-400 font-medium mx-2">To</span>
          <Calendar className="w-4 h-4 text-slate-400 mr-2" />
          <span>03 Aug 2020</span>
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
        <div className="space-y-3">
          {orders.map((order) => {
            const isHovered = hoveredRow === order._id;
            
            return (
              <div 
                key={order._id}
                onMouseEnter={() => setHoveredRow(order._id)}
                className={`grid grid-cols-12 gap-4 px-6 py-4 rounded-2xl items-center transition-all cursor-pointer relative ${
                  isHovered 
                    ? 'bg-[#e31837] text-white shadow-lg shadow-blue-500/30 scale-[1.01] z-10' 
                    : 'bg-white text-slate-600 border border-gray-100'
                }`}
              >
                <div className={`col-span-1 text-xs font-bold ${isHovered ? 'text-white' : 'text-slate-800'}`}>
                  {order._id}
                </div>
                
                <div className="col-span-3 flex items-center gap-3">
                  <img src={order.user.avatar} alt={order.user.name} className="w-8 h-8 rounded-full border border-white/50 bg-gray-200" />
                  <span className={`text-sm font-bold ${isHovered ? 'text-white' : 'text-slate-800'}`}>{order.user.name}</span>
                </div>
                
                <div className="col-span-4 text-xs font-semibold truncate pr-4">
                  {order.address}
                </div>
                
                <div className="col-span-2 text-xs font-semibold">
                  {order.date}
                </div>
                
                <div className={`col-span-1 text-sm font-bold ${isHovered ? 'text-white' : 'text-slate-800'}`}>
                  {order.price}
                </div>
                
                <div className="col-span-1 flex items-center justify-between">
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      order.status === 'Pending' ? 'bg-rose-500' :
                      order.status === 'Dispatch' ? 'bg-emerald-500' :
                      'bg-slate-400'
                    }`}></div>
                    <span className={`text-xs font-bold ${
                      isHovered ? 'text-white/90' :
                      order.status === 'Pending' ? 'text-rose-500' :
                      order.status === 'Dispatch' ? 'text-emerald-500' :
                      'text-slate-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Action Icons */}
                  <div className="flex items-center gap-2">
                    <button className={`p-1.5 rounded-full transition-colors ${isHovered ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-100 text-slate-800'}`}>
                      <Settings className="w-4 h-4" />
                    </button>
                    <button className={`p-1 rounded bg-white border transition-colors ${isHovered ? 'border-transparent text-blue-600' : 'border-gray-200 text-slate-500 hover:bg-slate-50'}`}>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-200">
        <div className="text-xs font-bold text-slate-500">
          Showing 06-12 of 28
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded-md text-slate-400 hover:text-slate-800 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          {[1, 2, 3, 4, 5].map((page) => (
            <button 
              key={page} 
              className={`w-8 h-8 rounded-md text-xs font-bold flex items-center justify-center transition-colors ${
                page === 2 ? 'bg-[#f0f4ff] text-[#e31837]' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {page}
            </button>
          ))}
          <button className="p-1 rounded-md text-slate-400 hover:text-slate-800 transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

    </div>
  );
};

export default OrderManage;
