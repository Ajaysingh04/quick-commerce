import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSettings } from '../../context/SettingsContext.jsx';
import { logout } from '../../store/authSlice.js';
import API from '../../services/api.js';
import { useAuth } from '@clerk/clerk-react';
import { LayoutDashboard, ShoppingBag, Store, Package, Users, LogOut, Menu, X, Star, Bell, LineChart, Tag, Truck, CheckCircle2 } from 'lucide-react';
import { io } from 'socket.io-client';
import { AnimatePresence, motion } from 'framer-motion';

const PartnerLayout = () => {
  const { settings } = useSettings();

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const approvalWelcomeKey = 'roseDashApprovalWelcomeSeen';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [approvalWelcome, setApprovalWelcome] = useState(null);
  const redirectTimerRef = useRef(null);
  const redirectGuardRef = useRef('');
  const approvalHandledRef = useRef(false);

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
        <aside className="hidden w-[268px] flex-col border-r border-slate-200 bg-slate-950 text-slate-100 shadow-[0_24px_60px_rgba(15,23,42,0.18)] md:flex">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-sm font-black text-white shadow-lg shadow-sky-600/30">
                {settings?.siteTitle?.slice(0, 2)?.toUpperCase() || 'RC'}
              </div>
              <div>
                <div className="text-base font-black tracking-[-0.04em] text-white">{settings?.siteTitle || 'QuickCart'}</div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Partner portal</div>
              </div>
            </div>
          </div>

          <div className="px-4 py-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-sm font-black text-white">QC</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-white">North Delhi NCR</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-emerald-300">Live store</div>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path || (item.path !== '/partner' && location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all ${
                    active ? 'bg-white text-slate-900 shadow-[0_12px_30px_rgba(255,255,255,0.12)]' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? 'bg-sky-100 text-sky-700' : 'bg-white/5 text-slate-300 group-hover:bg-white/10'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6 xl:px-8">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex">
                  <span className="text-slate-400">⌕</span>
                  <input
                    type="text"
                    placeholder="Search orders, inventory, customers"
                    className="w-64 border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600 shadow-sm">
                  This week
                </button>
                <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-sky-500 px-1 text-[9px] font-bold text-white">3</span>
                </button>
                <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm md:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-slate-700 text-[10px] font-black text-white">QC</div>
                  <div className="pr-1 text-left">
                    <div className="text-xs font-bold text-slate-900">QuickCart</div>
                    <div className="text-[10px] text-slate-500">Store Manager</div>
                  </div>
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
            className="relative w-[280px] bg-slate-950 p-4 text-white shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-sm font-black text-white">QC</div>
                <div>
                  <div className="text-lg font-black">{settings?.siteTitle || 'QuickCart'}</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Partner</div>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="rounded-xl bg-white/5 p-2">
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path || (item.path !== '/partner' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                      active ? 'bg-white text-slate-900' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        </div>
      )}
    </div>
  );
};

export default PartnerLayout;
