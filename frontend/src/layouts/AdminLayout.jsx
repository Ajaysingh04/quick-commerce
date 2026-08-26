import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSettings } from '../context/SettingsContext.jsx';
import { logout } from '../store/authSlice.js';
import { useAuth } from '@clerk/clerk-react';
import { LayoutDashboard, ShoppingCart, PieChart, Tag, LogOut, Menu, X, Store, Users, Star, Settings, Utensils, Image as ImageIcon, FileText, Bell, MessageSquare } from 'lucide-react';
import { io } from 'socket.io-client';
import { AnimatePresence, motion } from 'framer-motion';

const AdminLayout = () => {
  const { settings } = useSettings();
  
  const dispatch = useDispatch();
  const location = useLocation();
  const { signOut } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    
    socket.on('adminNotification', (data) => {
      const newNotification = { ...data, id: Date.now() };
      setNotifications(prev => [newNotification, ...prev]);
      
      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    });

    return () => socket.disconnect();
  }, []);

  const handleLogout = () => {
    signOut().catch(() => {}).finally(() => {
      dispatch(logout());
      window.location.href = '/login';
    });
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Live Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Dark Stores / Hubs', path: '/admin/stores', icon: Store },
    { name: 'Categories', path: '/admin/categories', icon: Tag },
    { name: 'Inventory', path: '/admin/products', icon: Utensils },
    { name: 'Customers', path: '/admin/users', icon: Users },
    { name: 'Delivery Partners', path: '/admin/delivery-partners', icon: Users },
    { name: 'Store Partners', path: '/admin/store-partners', icon: Store },
    { name: 'Offers', path: '/admin/coupons', icon: Tag },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Support', path: '/admin/support', icon: MessageSquare },
    { name: 'Banners', path: '/admin/banners', icon: ImageIcon },
    { name: 'Pages', path: '/admin/pages', icon: FileText },
    { name: 'Analytics', path: '/admin/analytics', icon: PieChart },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[#f5f6fa] text-slate-900 font-sans relative">
      
      {/* Toast Notifications Container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map(notif => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl shadow-2xl border border-emerald-100 p-4 min-w-[300px] flex gap-4 items-start pointer-events-auto"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 text-sm">{notif.title}</h4>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">{notif.message}</p>
                <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
                  {new Date(notif.date).toLocaleTimeString()}
                </div>
              </div>
              <button 
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-[260px] h-screen sticky top-0 bg-emerald-600 text-white shrink-0 shadow-xl rounded-br-[40px] z-20 overflow-hidden py-8">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 px-8 mb-8 group cursor-pointer shrink-0" title="Back to Home">
          <img src={settings?.logoUrl || '/logo.png'} alt="Logo" className="h-10 object-contain" onError={(e) => e.target.style.display = 'none'} />
          <span className="font-black text-2xl tracking-tighter text-white">
            {settings.adminHeaderText || settings.siteTitle || 'RoseDash'}
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2 pl-4 overflow-y-auto scrollbar-hide shrink-0 pb-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Match exactly or startswith if it's a subroute
            const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            
            return (
              <div key={item.name} className="relative pl-4">
                <Link
                  to={item.path}
                  className={`flex items-center gap-4 px-6 py-4 transition-all z-10 relative ${
                    active 
                      ? 'bg-[#f5f6fa] text-emerald-600 rounded-l-full' 
                      : 'text-white/80 hover:text-white hover:bg-white/10 rounded-l-full'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-white/80'}`} />
                  <span className={`font-semibold text-sm ${active ? '' : 'tracking-wide'}`}>{item.name}</span>
                </Link>
                
                {/* Custom Curved Cutout Effects for Active State */}
                {active && (
                  <>
                    <div className="absolute -top-6 right-0 w-6 h-6 bg-transparent rounded-br-3xl shadow-[10px_10px_0_0_#f5f6fa] z-0 pointer-events-none"></div>
                    <div className="absolute -bottom-6 right-0 w-6 h-6 bg-transparent rounded-tr-3xl shadow-[10px_-10px_0_0_#f5f6fa] z-0 pointer-events-none"></div>
                  </>
                )}
              </div>
            );
          })}

          {/* Logout Button right below Settings */}
          <div className="relative pl-4 mt-2 mb-8">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-6 py-4 transition-all z-10 relative text-rose-200 hover:text-white hover:bg-rose-500/20 rounded-l-full cursor-pointer text-left"
            >
              <LogOut className="w-5 h-5 text-rose-300" />
              <span className="font-semibold text-sm tracking-wide">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Core Area Wrapper */}
      <div className="flex-grow flex flex-col min-w-0 bg-[#f5f6fa] rounded-l-[40px] md:-ml-8 z-10 md:pl-8">
        
        {/* Mobile Header Toggle (Only visible on small screens since Top Header is removed) */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="h-8 object-contain" />}
            <span className="font-black text-xl tracking-tighter text-emerald-600">{settings.adminHeaderText || settings.siteTitle || 'RoseDash'}</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg text-slate-600 bg-slate-100">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Content View Outlet */}
        <main className="flex-grow overflow-y-auto p-4 md:p-8 relative">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          <div onClick={() => setIsSidebarOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
          <div className="relative w-64 max-w-xs bg-emerald-600 shadow-2xl flex flex-col py-6">
            
            <div className="flex items-center justify-between px-6 mb-8">
              <div className="flex items-center gap-2">
                <img src={settings?.logoUrl || '/logo.png'} alt="Logo" className="h-8 object-contain" onError={(e) => e.target.style.display = 'none'} />
                <span className="font-black text-2xl tracking-tighter text-white">
                  {settings?.adminHeaderText || settings?.siteTitle || 'RoseDash'}
                </span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded-full text-white/80 hover:bg-white/20 transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <nav className="flex-1 flex flex-col gap-2 pl-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                return (
                  <div key={item.name} className="relative pl-2">
                    <Link
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-4 px-6 py-4 transition-all z-10 relative ${
                        active 
                          ? 'bg-[#f5f6fa] text-emerald-600 rounded-l-full' 
                          : 'text-white/80 hover:text-white hover:bg-white/10 rounded-l-full'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-white/80'}`} />
                      <span className={`font-semibold text-sm ${active ? '' : 'tracking-wide'}`}>{item.name}</span>
                    </Link>
                    {active && (
                      <>
                        <div className="absolute -top-6 right-0 w-6 h-6 bg-transparent rounded-br-3xl shadow-[10px_10px_0_0_#f5f6fa] z-0 pointer-events-none"></div>
                        <div className="absolute -bottom-6 right-0 w-6 h-6 bg-transparent rounded-tr-3xl shadow-[10px_-10px_0_0_#f5f6fa] z-0 pointer-events-none"></div>
                      </>
                    )}
                  </div>
                );
              })}
            </nav>
            <div className="p-4 border-t border-white/10 mt-auto">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 text-white font-bold text-sm rounded-xl hover:bg-white/20"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminLayout;
