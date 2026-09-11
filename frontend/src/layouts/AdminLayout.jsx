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
  CircleUser
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

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

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
    { name: 'Live Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Dark Stores', path: '/admin/stores', icon: Store },
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

  const sidebarWidth = isSidebarCollapsed ? 'w-[92px]' : 'w-[260px]';

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900 font-sans relative">
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 min-w-[300px] flex gap-4 items-start pointer-events-auto"
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
                onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id))}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <aside className={`hidden md:flex flex-col h-screen sticky top-0 bg-[#0F172A] text-white shrink-0 shadow-[0_20px_60px_rgba(15,23,42,0.35)] z-20 overflow-hidden border-r border-slate-800 transition-all duration-300 ${sidebarWidth}`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-3 min-w-0 overflow-hidden" title="Back to home">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <div className="font-black text-lg tracking-tight text-white truncate">
                  {settings?.adminHeaderText || settings?.siteTitle || 'RoseDash'}
                </div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Operations</div>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/40 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        <div className="px-4 py-4 border-b border-slate-800">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-3 py-2 flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-slate-800 flex items-center justify-center text-[10px] font-black text-emerald-300">
              Q
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-white truncate">Quick Commerce</p>
                  <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">
                    Live
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">HQ Workspace</div>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-emerald-500/10 text-white border border-emerald-500/20 shadow-[inset_2px_0_0_#22C55E]'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                  title={isSidebarCollapsed ? item.name : undefined}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-300 group-hover:text-white'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {!isSidebarCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-black text-white">
              AD
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-white">Admin User</p>
                  <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">
                    Online
                  </span>
                </div>
                <p className="truncate text-[11px] text-slate-400">admin@quickcommerce.com</p>
              </div>
            )}
          </div>

          {!isSidebarCollapsed && (
            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-sm font-bold text-rose-200 transition hover:border-rose-400/30 hover:bg-rose-500/15"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          )}
        </div>
      </aside>

      <div className="flex-grow flex flex-col min-w-0 bg-[#f8fafc] md:rounded-tl-[32px] md:shadow-[inset_1px_0_0_rgba(148,163,184,0.24)]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
            <div className="flex items-center gap-3 md:hidden">
              <button onClick={() => setIsSidebarOpen(true)} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600">
                <Menu className="h-5 w-5" />
              </button>
            </div>

            <div className="hidden md:flex flex-1 items-center gap-4">
              <div className="relative w-full max-w-xl">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search orders, products, stores, customers..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="hidden md:inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300">
                <Plus className="h-4 w-4" />
                Quick Action
              </button>

              <button className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:text-slate-900">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-white">
                  7
                </span>
              </button>

              <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:text-slate-900">
                <CheckCheck className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-sm font-black text-white">
                  AD
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-bold text-slate-900">Admin</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Super Admin</div>
                </div>
                <ChevronDown className="hidden sm:block h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          <div onClick={() => setIsSidebarOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative w-[280px] bg-[#0F172A] p-4 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-black text-white">{settings?.siteTitle || 'RoseDash'}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Operations</div>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="rounded-lg border border-slate-700 p-2 text-slate-300">
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                      active ? 'border border-emerald-500/20 bg-emerald-500/10 text-white' : 'text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-black text-white">
                  AD
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Admin User</p>
                  <p className="text-[11px] text-slate-400">admin@quickcommerce.com</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-sm font-bold text-rose-200"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
