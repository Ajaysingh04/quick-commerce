import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
 LayoutDashboard, ShoppingBag, UtensilsCrossed, Store, 
 LineChart, Bell, LogOut, Menu as MenuIcon, X, Wallet, Tag,
 Star, Bike, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice.js';
import { useAuth } from '@clerk/clerk-react';

const NAV_ITEMS = [
 { path: '/partner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
 { path: '/partner/orders', label: 'Orders', icon: ShoppingBag },
 { path: '/partner/menu', label: 'Menu Items', icon: UtensilsCrossed },
 { path: '/partner/profile', label: 'Store Profile', icon: Store },
 { path: '/partner/promos', label: 'Promos & Offers', icon: Tag },
 { path: '/partner/analytics', label: 'Analytics', icon: LineChart },
 { path: '/partner/reviews', label: 'Reviews & Ratings', icon: Star },
 { path: '/partner/deliveries', label: 'Delivery Management', icon: Bike },
 { path: '/partner/notifications', label: 'Notifications Center', icon: Bell },
 { path: '/partner/staff', label: 'Staff Management', icon: Users },
];

const PartnerLayout = () => {
 const [sidebarOpen, setSidebarOpen] = useState(false);
 const [showProfileMenu, setShowProfileMenu] = useState(false);
 const { user } = useSelector(state => state.auth);
 const { signOut } = useAuth();
 const dispatch = useDispatch();
 const navigate = useNavigate();
 const location = useLocation();

 const handleLogout = () => {
 signOut().catch(() => {}).finally(() => {
 dispatch(logout());
 window.location.href = '/';
 });
 };

  return (
    <div className="flex h-screen bg-[#f5f6fa] font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ x: sidebarOpen ? 0 : (window.innerWidth < 1024 ? -280 : 0) }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed lg:static top-0 left-0 h-full w-[260px] bg-[#e31837] text-white z-50 flex flex-col shadow-2xl lg:shadow-none shrink-0"
      >
        {/* Brand */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center">
              <Store className="w-4 h-4 text-[#e31837]" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">Store Panel</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-[#f5f6fa] text-[#e31837] shadow-lg font-bold' 
                    : 'text-white/80 hover:text-white hover:bg-white/10 font-semibold'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-[#e31837]' : 'text-white/80 group-hover:text-white'}`} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-[#e31837] uppercase">
              {user?.name?.charAt(0) || 'P'}
            </div>
            <div className="flex-1 min-w-0 text-white">
              <p className="text-sm font-bold truncate">{user?.name}</p>
              <p className="text-xs text-white/80 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-xl transition-colors font-bold text-sm"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative">
        
        {/* Top Header */}
        <header className="h-20 bg-white shadow-sm flex items-center justify-between px-4 sm:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-slate-900 capitalize">
                {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">Manage your store operations.</p>
            </div>
          </div>

           <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/partner/notifications')}
              className="relative p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#e31837] rounded-full border-2 border-white"></span>
            </button>

            <div className="relative">
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#c8102e] to-[#e31837] border-2 border-white flex items-center justify-center shadow-md cursor-pointer"
              >
                <span className="text-sm font-bold text-white uppercase">{user?.name?.charAt(0) || 'P'}</span>
              </div>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 shadow-2xl shadow-slate-200/50 rounded-xl z-50 overflow-hidden"
                  >
                    <div className="p-2">
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#e31837] rounded-lg transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col relative custom-scrollbar">
          <Outlet />
        </div>
        
      </main>
    </div>
  );
};

export default PartnerLayout;
