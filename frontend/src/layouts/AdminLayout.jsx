import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSettings } from '../context/SettingsContext.jsx';
import { logout } from '../store/authSlice.js';
import { useAuth } from '@clerk/clerk-react';
import {
  LayoutDashboard,
  ShoppingCart,
  PieChart,
  Tag,
  LogOut,
  Menu,
  X,
  Store,
  Users,
  Star,
  Settings,
  Utensils,
  Image as ImageIcon,
  FileText,
  Bell,
  MessageSquare,
  Search,
  Plus,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  CheckCheck,
  CircleUser,
  ShieldCheck,
  Activity,
  Zap,
} from 'lucide-react';
import { io } from 'socket.io-client';
import { AnimatePresence, motion } from 'framer-motion';

const AdminLayout = () => {
  const { settings } = useSettings();

  const dispatch = useDispatch();
  const location = useLocation();
  const { signOut } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl);

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('adminNotification', (data) => {
      const newNotification = { ...data, id: Date.now() };
      setNotifications((prev) => [newNotification, ...prev]);

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id));
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
    { name: 'Live Orders', path: '/admin/orders', icon: ShoppingCart, badge: 'Live' },
    { name: 'Dark Stores', path: '/admin/stores', icon: Store },
    { name: 'Categories', path: '/admin/categories', icon: Tag },
    { name: 'Inventory', path: '/admin/products', icon: Utensils },
    { name: 'Customers', path: '/admin/users', icon: Users },
    { name: 'Delivery Partners', path: '/admin/delivery-partners', icon: Users },
    { name: 'Store Partners', path: '/admin/store-partners', icon: Store },
    { name: 'Offers & Coupons', path: '/admin/coupons', icon: Tag },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Support', path: '/admin/support', icon: MessageSquare },
    { name: 'Banners', path: '/admin/banners', icon: ImageIcon },
    { name: 'Pages', path: '/admin/pages', icon: FileText },
    { name: 'Analytics', path: '/admin/analytics', icon: PieChart },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const sidebarWidth = isSidebarCollapsed ? 'w-[84px]' : 'w-[270px]';

  return (
    <div className="min-h-screen flex bg-[#F1F5F9] text-slate-900 font-sans relative antialiased">
      {/* Real-time Toast Notifications */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10 p-4 min-w-[320px] flex gap-3.5 items-start pointer-events-auto backdrop-blur-xl"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white text-sm">{notif.title || 'New Notification'}</h4>
                <p className="text-slate-300 text-xs mt-1 leading-relaxed">{notif.message}</p>
                <div className="text-[10px] font-bold text-emerald-400 mt-2 uppercase tracking-wider">
                  {new Date(notif.date || Date.now()).toLocaleTimeString()}
                </div>
              </div>
              <button
                onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id))}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col h-screen sticky top-0 bg-[#0B132B] text-white shrink-0 shadow-[0_25px_60px_rgba(0,0,0,0.35)] z-20 overflow-hidden border-r border-slate-800/80 transition-all duration-300 ${sidebarWidth}`}>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/80">
          <Link to="/" className="flex items-center gap-3 min-w-0 overflow-hidden group" title="Visit Storefront">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 text-slate-950 font-black" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <div className="font-black text-lg tracking-tight text-white truncate">
                  {settings?.adminHeaderText || settings?.siteTitle || 'RoseDash'}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-400">HQ Console</div>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800/60 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Live Sync Pill */}
        <div className="px-3.5 py-3 border-b border-slate-800/60">
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 px-3 py-2 flex items-center gap-2.5 backdrop-blur-md">
            <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            {!isSidebarCollapsed && (
              <div className="flex-1 flex items-center justify-between min-w-0">
                <span className="text-xs font-bold text-slate-300 truncate">
                  {isConnected ? 'Realtime Engine' : 'Reconnecting...'}
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300 border border-emerald-500/20">
                  Live
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-white border border-emerald-400/30 shadow-[0_4px_20px_rgba(16,185,129,0.15)]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
                title={isSidebarCollapsed ? item.name : undefined}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                  active ? 'bg-emerald-500 text-slate-950 font-black shadow-md' : 'bg-slate-800/80 text-slate-400 group-hover:text-white'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile & Logout */}
        <div className="border-t border-slate-800/80 p-3.5">
          <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-900/60 p-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-xs font-black text-slate-950 shadow-md">
              AD
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate text-xs font-black text-white">Super Admin</p>
                  <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[8px] font-bold text-emerald-300">Active</span>
                </div>
                <p className="truncate text-[10px] text-slate-400">admin@quickcommerce.com</p>
              </div>
            )}
          </div>

          {!isSidebarCollapsed && (
            <button
              onClick={handleLogout}
              className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-3.5 md:px-8">
            <div className="flex items-center gap-3 md:hidden">
              <button onClick={() => setIsSidebarOpen(true)} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm">
                <Menu className="h-5 w-5" />
              </button>
              <span className="font-black text-base text-slate-900">Admin Control</span>
            </div>

            {/* Quick Search */}
            <div className="hidden md:flex flex-1 items-center gap-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Quick search across orders, products, stores..."
                  className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/80 py-2 pl-10 pr-4 text-xs font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:shadow-sm"
                />
              </div>
            </div>

            {/* Header Right Action Items */}
            <div className="flex items-center gap-3">
              <Link
                to="/"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:border-emerald-300 hover:text-emerald-700 transition"
              >
                <Store className="h-3.5 w-3.5 text-emerald-600" />
                Live Store
              </Link>

              <button className="relative rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 hover:text-slate-900 shadow-xs transition">
                <Bell className="h-4 w-4" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-white shadow-xs">
                  3
                </span>
              </button>

              <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 shadow-xs">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 text-xs font-black text-white">
                  A
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-black text-slate-900 leading-tight">Admin Console</div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">Full Access</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          <div onClick={() => setIsSidebarOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
          <div className="relative w-[280px] bg-[#0B132B] p-4 shadow-2xl flex flex-col h-full text-white">
            <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-black">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-base font-black text-white">{settings?.siteTitle || 'RoseDash'}</div>
                  <div className="text-[9px] uppercase font-bold text-emerald-400">Admin HQ</div>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="rounded-lg border border-slate-700 p-1.5 text-slate-300">
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar py-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-bold transition ${
                      active ? 'border border-emerald-400/30 bg-emerald-500/15 text-white' : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-4 w-4 text-emerald-400" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
