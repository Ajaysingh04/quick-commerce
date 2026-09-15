import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useSettings } from '../../context/SettingsContext.jsx';
import { logout } from '../../store/authSlice.js';
import API from '../../services/api.js';
import { useSafeAuth } from '../../utils/useSafeAuth.js';
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Package,
  Users,
  LogOut,
  Menu,
  X,
  Star,
  Bell,
  LineChart,
  Tag,
  Truck,
  CheckCircle2,
  ChevronDown,
  User,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { io } from 'socket.io-client';
import { AnimatePresence, motion } from 'framer-motion';

const PartnerLayout = () => {
  const { settings } = useSettings();
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useSafeAuth();

  const approvalWelcomeKey = 'roseDashApprovalWelcomeSeen';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [storeProfile, setStoreProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [approvalWelcome, setApprovalWelcome] = useState(null);

  const DEFAULT_PARTNER_NOTIFICATIONS = [
    {
      id: 'partner-notif-1',
      title: 'New Order Received',
      message: 'Order #A1842 received for 3 items (₹450). Please pack and prepare.',
      time: '2 mins ago',
      isUnread: true,
      link: '/partner/orders'
    },
    {
      id: 'partner-notif-2',
      title: 'Rider Assigned',
      message: 'Rajesh Kumar is arriving at your dark store to pick up Order #A1840.',
      time: '12 mins ago',
      isUnread: true,
      link: '/partner/orders'
    },
    {
      id: 'partner-notif-3',
      title: 'Low Stock Alert',
      message: 'Fresh Milk is running low (4 units left). Update stock levels.',
      time: '1 hour ago',
      isUnread: true,
      link: '/partner/inventory'
    }
  ];

  const [notificationHistory, setNotificationHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('partner_notification_list');
      if (saved) return JSON.parse(saved);
    } catch(e){}
    return DEFAULT_PARTNER_NOTIFICATIONS;
  });

  const redirectTimerRef = useRef(null);
  const redirectGuardRef = useRef('');
  const approvalHandledRef = useRef(false);
  const profileMenuRef = useRef(null);
  const notificationsMenuRef = useRef(null);

  const storeName = storeProfile?.name || user?.name || 'Partner Store';
  const storeInitials = storeName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'ST';

  useEffect(() => {
    const fetchPartnerProfile = async () => {
      try {
        const res = await API.get('/partner/profile');
        if (res.data) setStoreProfile(res.data);
      } catch (err) {
        // Fallback / silently ignore
      }
    };
    fetchPartnerProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasSeenApprovalWelcome = () => {
    try {
      return localStorage.getItem(approvalWelcomeKey) === 'true';
    } catch (error) {
      return false;
    }
  };

  const markApprovalWelcomeSeen = () => {
    try {
      localStorage.setItem(approvalWelcomeKey, 'true');
    } catch (error) {
      // no-op
    }
  };

  const dismissApprovalWelcome = () => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
    }
    approvalHandledRef.current = false;
    markApprovalWelcomeSeen();
    setApprovalWelcome(null);
  };

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

    socket.on('partnerNotification', (data) => {
      const newNotification = { ...data, id: Date.now() };
      setNotifications((prev) => [newNotification, ...prev]);

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id));
      }, 5000);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (!approvalWelcome) return undefined;

    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
    }

    redirectTimerRef.current = setTimeout(() => {
      markApprovalWelcomeSeen();
      setApprovalWelcome(null);
      approvalHandledRef.current = false;
      if (location.pathname === '/partner/onboarding') {
        navigate('/partner/dashboard', { replace: true });
      }
    }, 5000);

    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [approvalWelcome, location.pathname, navigate]);

  useEffect(() => {
    if (!location.pathname.startsWith('/partner')) return;

    let isActive = true;

    const checkPartnerAccess = async () => {
      try {
        const { data } = await API.get('/partner/access-status');
        if (!isActive) return;

        const canAccessDashboard = Boolean(data.canAccessDashboard);
        const currentPath = location.pathname;

        if (canAccessDashboard && currentPath === '/partner/onboarding') {
          if (hasSeenApprovalWelcome()) {
            if (currentPath !== '/partner/dashboard') {
              redirectGuardRef.current = 'approved-dashboard';
              navigate('/partner/dashboard', { replace: true });
            }
            return;
          }

          if (!approvalHandledRef.current) {
            approvalHandledRef.current = true;
            redirectGuardRef.current = 'approved-dashboard';
            markApprovalWelcomeSeen();

            setApprovalWelcome({
              title: 'Welcome to RoseDash',
              message: 'Your store has been approved. Opening your dashboard now...'
            });
          }
          return;
        }

        if (!canAccessDashboard && currentPath !== '/partner/onboarding' && redirectGuardRef.current !== 'go-onboarding') {
          redirectGuardRef.current = 'go-onboarding';
          navigate('/partner/onboarding', { replace: true });
          return;
        }

        if (canAccessDashboard && currentPath === '/partner/dashboard') {
          redirectGuardRef.current = 'dashboard-open';
        }

        if (!canAccessDashboard && currentPath === '/partner/onboarding') {
          redirectGuardRef.current = 'onboarding-open';
        }
      } catch (error) {
        if (!isActive) return;
        if (location.pathname !== '/partner/onboarding' && redirectGuardRef.current !== 'go-onboarding') {
          redirectGuardRef.current = 'go-onboarding';
          navigate('/partner/onboarding', { replace: true });
        }
      }
    };

    checkPartnerAccess();

    return () => {
      isActive = false;
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [location.pathname, navigate]);

  const markAllNotificationsRead = () => {
    setNotificationHistory((prev) => {
      const updated = prev.map(n => ({ ...n, isUnread: false }));
      try { localStorage.setItem('partner_notification_list', JSON.stringify(updated)); } catch(e){}
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotificationHistory([]);
    try { localStorage.setItem('partner_notification_list', JSON.stringify([])); } catch(e){}
  };

  const unreadNotificationsCount = notificationHistory.filter(n => n.isUnread).length;

  const handleLogout = () => {
    signOut().catch(() => {}).finally(() => {
      dispatch(logout());
      window.location.href = '/login';
    });
  };

  const menuItems = [
    { name: 'Dashboard', path: '/partner/dashboard', icon: LayoutDashboard },
    { name: 'Orders', path: '/partner/orders', icon: ShoppingBag },
    { name: 'Inventory', path: '/partner/inventory', icon: Package },
    { name: 'Store Profile', path: '/partner/profile', icon: Store },
    { name: 'Promos & Offers', path: '/partner/promos', icon: Tag },
    { name: 'Analytics', path: '/partner/analytics', icon: LineChart },
    { name: 'Reviews', path: '/partner/reviews', icon: Star },
    { name: 'Logistics', path: '/partner/deliveries', icon: Truck },
    { name: 'Notifications', path: '/partner/notifications', icon: Bell },
    { name: 'Staff', path: '/partner/staff', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
        {/* Fixed Desktop Sidebar */}
        <aside className="hidden w-[268px] h-screen sticky top-0 flex-col border-r border-slate-800 bg-slate-950 text-slate-100 shadow-[0_24px_60px_rgba(15,23,42,0.18)] md:flex z-20">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <Link to="/partner/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-sm font-black text-white shadow-lg shadow-sky-600/30">
                {settings?.siteTitle?.slice(0, 2)?.toUpperCase() || 'RC'}
              </div>
              <div>
                <div className="text-base font-black tracking-[-0.04em] text-white">{settings?.siteTitle || 'RoseDash'}</div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Partner Portal</div>
              </div>
            </Link>
          </div>

          {/* Interactive Live Store Sidebar Pill */}
          <div className="px-4 py-3 border-b border-white/5">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 hover:border-emerald-500/40 transition shadow-sm"
              title="Click to visit live customer storefront"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-black text-slate-950 shadow-md">
                  {storeInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold text-white group-hover:text-emerald-300 transition">
                    {storeName}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-emerald-400 flex items-center gap-1">
                      Live Store <ArrowUpRight className="h-3 w-3 inline" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Sidebar Nav Links */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3 no-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path || (item.path !== '/partner' && location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all ${
                    active ? 'bg-white text-slate-900 shadow-[0_12px_30px_rgba(255,255,255,0.12)]' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${active ? 'bg-sky-100 text-sky-700' : 'bg-white/5 text-slate-300 group-hover:bg-white/10'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Pinned Bottom Logout */}
          <div className="border-t border-white/10 p-3.5 bg-slate-950">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20 hover:text-rose-100 shadow-sm active:scale-98 cursor-pointer"
            >
              <LogOut className="h-4 w-4 text-rose-400" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Sticky Top Header */}
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6 xl:px-8">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm md:hidden cursor-pointer"
                  aria-label="Open menu"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex">
                  <span className="text-slate-400">⌕</span>
                  <input
                    type="text"
                    placeholder="Search orders, inventory, customers..."
                    className="w-64 border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Top Header Actions */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Working Live Store Button */}
                <Link
                  to="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/90 px-3.5 py-1.5 text-xs font-bold text-emerald-700 shadow-xs hover:bg-emerald-100 hover:border-emerald-300 transition cursor-pointer"
                  title="Open Customer Live Storefront in New Tab"
                >
                  <Store className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Live Store</span>
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                </Link>

                {/* Working Partner Notification Bell Dropdown */}
                <div className="relative" ref={notificationsMenuRef}>
                  <button 
                    onClick={() => setIsNotificationsOpen((prev) => !prev)}
                    className="relative rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 hover:text-slate-900 shadow-xs hover:border-sky-300 transition cursor-pointer active:scale-95"
                    title="Notifications"
                  >
                    <Bell className="h-4 w-4 text-slate-700" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[9px] font-black text-white shadow-xs animate-pulse">
                        {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200/90 z-50 overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[85vh]"
                      >
                        {/* Dropdown Header */}
                        <div className="p-3.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-slate-900">Partner Notifications</h4>
                            {unreadNotificationsCount > 0 && (
                              <span className="bg-sky-100 text-sky-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                                {unreadNotificationsCount} new
                              </span>
                            )}
                          </div>

                          {notificationHistory.length > 0 && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={markAllNotificationsRead}
                                className="text-[11px] font-bold text-sky-600 hover:text-sky-800 px-2 py-1 rounded-lg hover:bg-sky-50 transition cursor-pointer"
                                title="Mark all as read"
                              >
                                Mark read
                              </button>
                              <button
                                onClick={clearAllNotifications}
                                className="text-[11px] font-bold text-rose-500 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                title="Clear notifications"
                              >
                                Clear
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Dropdown Items List */}
                        <div className="divide-y divide-slate-100 overflow-y-auto max-h-80 custom-scrollbar">
                          {notificationHistory.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 font-semibold text-xs flex flex-col items-center gap-2">
                              <Bell className="w-8 h-8 opacity-20" />
                              <span>No new notifications</span>
                            </div>
                          ) : (
                            notificationHistory.map((notif) => (
                              <Link
                                key={notif.id}
                                to={notif.link || '/partner/orders'}
                                onClick={() => {
                                  setIsNotificationsOpen(false);
                                  setNotificationHistory(prev => prev.map(n => n.id === notif.id ? { ...n, isUnread: false } : n));
                                }}
                                className={`p-3.5 flex items-start gap-3 transition-colors hover:bg-slate-50 block ${
                                  notif.isUnread ? 'bg-sky-50/30' : 'bg-white'
                                }`}
                              >
                                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                                  <Sparkles className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <h5 className="font-bold text-xs text-slate-900 truncate">{notif.title}</h5>
                                    <span className="text-[10px] font-medium text-slate-400 shrink-0">{notif.time || 'Just now'}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-snug">{notif.message}</p>
                                </div>
                                {notif.isUnread && (
                                  <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0 mt-1.5 shadow-xs" />
                                )}
                              </Link>
                            ))
                          )}
                        </div>

                        {/* Dropdown Footer */}
                        <div className="p-2.5 border-t border-slate-100 bg-slate-50/60 text-center">
                          <Link
                            to="/partner/notifications"
                            onClick={() => setIsNotificationsOpen(false)}
                            className="text-xs font-bold text-slate-700 hover:text-sky-700 transition block py-1"
                          >
                            View All Notifications &rarr;
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Top Quick Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50/80 px-3 py-1.5 text-xs font-bold text-rose-600 shadow-xs hover:bg-rose-100 hover:border-rose-300 hover:text-rose-700 transition active:scale-95 cursor-pointer"
                  title="Logout from Store Partner Portal"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-600" />
                  <span className="hidden sm:inline">Logout</span>
                </button>

                {/* Interactive Store Manager Profile Menu */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 sm:pr-3 shadow-xs hover:border-slate-300 transition text-left cursor-pointer"
                    title="Store Partner Menu"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-indigo-700 text-[10px] font-black text-white shadow-xs">
                      {storeInitials}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[110px]">{storeName}</div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-sky-600">Store Manager</div>
                    </div>
                    <ChevronDown className={`hidden sm:block h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-60 rounded-2xl bg-white p-2 shadow-2xl border border-slate-200/80 z-50 overflow-hidden"
                      >
                        <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/70 rounded-xl mb-1.5">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-black text-slate-900 truncate">{storeName}</p>
                            <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[8px] font-black uppercase text-sky-700">Partner</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email || 'partner@quickcommerce.com'}</p>
                        </div>

                        <div className="space-y-0.5">
                          <Link
                            to="/partner/profile"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                          >
                            <User className="h-4 w-4 text-slate-500" />
                            Store Profile
                          </Link>
                          <Link
                            to="/partner/inventory"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                          >
                            <Package className="h-4 w-4 text-slate-500" />
                            Inventory
                          </Link>
                          <Link
                            to="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                          >
                            <Store className="h-4 w-4 text-emerald-600" />
                            View Live Storefront
                          </Link>
                        </div>

                        <div className="my-1.5 border-t border-slate-100" />

                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            handleLogout();
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer"
                        >
                          <LogOut className="h-4 w-4 text-rose-600" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 xl:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="pointer-events-none fixed bottom-6 right-6 z-[70] flex max-w-sm items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_20px_45px_rgba(15,23,42,0.12)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <Bell className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900">{notif.title}</div>
              <div className="text-xs text-slate-500">{notif.message}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {approvalWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.94, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 8 }}
              className="w-full max-w-md rounded-[30px] border border-sky-200 bg-white p-8 text-center shadow-[0_35px_80px_rgba(15,23,42,0.22)]"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Approved</p>
              <h3 className="mt-2 text-3xl font-black tracking-[-0.06em] text-slate-900">{approvalWelcome.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{approvalWelcome.message}</p>
              <button
                type="button"
                onClick={dismissApprovalWelcome}
                className="mt-6 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-700 hover:border-slate-300"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          <div onClick={() => setIsSidebarOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
          <motion.aside
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0 }}
            className="relative w-[280px] bg-slate-950 p-4 text-white shadow-2xl flex flex-col h-full"
          >
            <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-sm font-black text-white">
                  {storeInitials}
                </div>
                <div>
                  <div className="text-base font-black text-white truncate max-w-[150px]">{storeName}</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-400">Partner HQ</div>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="rounded-xl bg-white/5 p-2 text-slate-300 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-3">
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center justify-between gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-2 text-xs font-bold text-emerald-300"
              >
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-emerald-400" />
                  <span>Customer Live Store</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path || (item.path !== '/partner' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-bold transition ${
                      active ? 'bg-white text-slate-900' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-slate-800 pt-3 mt-2">
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/15 px-3 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-500/25 transition active:scale-98 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-400" />
                Sign Out
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </div>
  );
};

export default PartnerLayout;
