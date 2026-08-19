import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSettings } from '../context/SettingsContext.jsx';
import { logout } from '../store/authSlice.js';
import { useAuth } from '@clerk/clerk-react';
import { LayoutDashboard, ShoppingCart, PieChart, Tag, LogOut, Menu, X, Store, Users, Star, Settings, Utensils } from 'lucide-react';

const AdminLayout = () => {
  const { settings } = useSettings();
  
  const dispatch = useDispatch();
  const location = useLocation();
  const { signOut } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    signOut().catch(() => {}).finally(() => {
      dispatch(logout());
      window.location.href = '/login';
    });
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Live Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Stores', path: '/admin/stores', icon: Store },
    { name: 'Menu/Products', path: '/admin/products', icon: Utensils },
    { name: 'Customers', path: '/admin/users', icon: Users },
    { name: 'Offers', path: '/admin/coupons', icon: Tag },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Analytics', path: '/admin/analytics', icon: PieChart },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[#f5f6fa] text-slate-900 font-sans">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-[260px] bg-[#e31837] text-white shrink-0 shadow-xl rounded-br-[40px] z-20 overflow-hidden py-8">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 px-8 mb-12 group cursor-pointer" title="Back to Home">
          <img src={settings?.logoUrl || '/logo.png'} alt="Logo" className="h-10 object-contain" onError={(e) => e.target.style.display = 'none'} />
          <span className="font-black text-2xl tracking-tighter text-white">
            {settings.adminHeaderText || settings.siteTitle || 'RoseDash'}
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2 pl-4">
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
                      ? 'bg-[#f5f6fa] text-[#e31837] rounded-l-full' 
                      : 'text-white/80 hover:text-white hover:bg-white/10 rounded-l-full'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-[#e31837]' : 'text-white/80'}`} />
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
        </nav>

        {/* Footer Socials */}
        <div className="px-8 mt-auto flex items-center gap-4 pt-10">
           <a href="#" className="text-xs text-white/70 hover:text-white hover:underline decoration-white/50 underline-offset-4">Facebook</a>
           <a href="#" className="text-xs text-white/70 hover:text-white hover:underline decoration-white/50 underline-offset-4">Twitter</a>
           <a href="#" className="text-xs text-white/70 hover:text-white hover:underline decoration-white/50 underline-offset-4">Google</a>
        </div>
      </aside>

      {/* Main Core Area Wrapper */}
      <div className="flex-grow flex flex-col min-w-0 bg-[#f5f6fa] rounded-l-[40px] md:-ml-8 z-10 md:pl-8">
        
        {/* Mobile Header Toggle (Only visible on small screens since Top Header is removed) */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="h-8 object-contain" />}
            <span className="font-black text-xl tracking-tighter text-[#e31837]">{settings.adminHeaderText || settings.siteTitle || 'RoseDash'}</span>
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
          <div className="relative w-64 max-w-xs bg-[#e31837] shadow-2xl flex flex-col py-6">
            
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
                          ? 'bg-[#f5f6fa] text-[#e31837] rounded-l-full' 
                          : 'text-white/80 hover:text-white hover:bg-white/10 rounded-l-full'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-[#e31837]' : 'text-white/80'}`} />
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
