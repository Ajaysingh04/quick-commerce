import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice.js';
import { useAuth } from '@clerk/clerk-react';
import { useSettings } from '../context/SettingsContext.jsx';
import {
  LayoutDashboard,
  MapPin,
  Wallet,
  History,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Navigation,
  Bike,
  CheckCircle2,
  ShieldAlert,
  Shield,
  PhoneCall,
  Zap,
  Radio,
  BatteryCharging,
  Clock,
  QrCode,
  Camera,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RiderQrScannerModal from '../components/delivery/RiderQrScannerModal.jsx';

const DeliveryLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = window.localStorage.getItem('deliveryOnline');
    return saved === null ? true : saved === 'true';
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [showGlobalQrScanner, setShowGlobalQrScanner] = useState(false);

  // Shift Timer Simulation
  const [shiftSeconds, setShiftSeconds] = useState(13240); // ~3.6 hours

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { settings } = useSettings();
  const { user } = useSelector((state) => state.auth);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'R';

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      setSidebarOpen(desktop);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let interval;
    if (isOnline) {
      interval = setInterval(() => {
        setShiftSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOnline]);

  const formatShiftTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    window.localStorage.setItem('deliveryOnline', isOnline);
    window.dispatchEvent(new CustomEvent('deliveryOnlineChanged', { detail: isOnline }));
  }, [isOnline]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    signOut().catch(() => {}).finally(() => {
      dispatch(logout());
      window.location.href = '/login';
    });
  };

  const navItems = [
    { name: 'Dashboard', path: '/delivery/dashboard', icon: LayoutDashboard },
    { name: 'Active Orders', path: '/delivery/active', icon: MapPin },
    { name: 'Earnings & Payouts', path: '/delivery/earnings', icon: Wallet },
    { name: 'Trip History', path: '/delivery/history', icon: History },
    { name: 'Profile & KYC', path: '/delivery/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans antialiased">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Desktop & Mobile Slide Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isDesktop ? 270 : isSidebarOpen ? 270 : 0, x: isDesktop ? 0 : isSidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed lg:static z-50 h-full bg-[#0B132B] border-r border-slate-800/80 flex flex-col overflow-hidden shadow-2xl ${
          !isDesktop && !isSidebarOpen ? 'pointer-events-none' : ''
        }`}
      >
        <div className="relative h-full flex flex-col z-10 text-white">
          
          {/* Brand Logo Header */}
          <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Bike className="text-slate-950 w-5 h-5 font-black" />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-white">
                  Rider<span className="text-emerald-400">Dash</span>
                </span>
                <div className="text-[9px] uppercase font-bold text-emerald-300 tracking-wider">Fulfillment Fleet</div>
              </div>
            </div>
            <button onClick={closeSidebar} className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10">
              <X size={18} />
            </button>
          </div>

          {/* Rider Status Badge Box */}
          <div className="p-3.5 border-b border-slate-800/60">
            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-3 backdrop-blur-md">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span className="text-xs font-black text-white">{isOnline ? 'ON DUTY' : 'OFF DUTY'}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{formatShiftTime(shiftSeconds)}</span>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-slate-400 font-semibold">
                <span>GPS: High Accuracy</span>
                <span className="text-emerald-400 font-bold">Zone: Hub #04</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
            {navItems.map((item, i) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => !isDesktop && closeSidebar()}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-white border border-emerald-400/30 shadow-[0_4px_20px_rgba(16,185,129,0.15)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                      isActive ? 'bg-emerald-500 text-slate-950 font-black shadow-md' : 'bg-slate-800/80 text-slate-400 group-hover:text-white'
                    }`}>
                      <item.icon size={16} />
                    </div>
                    <span className="relative z-10 font-bold">{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Scan Store QR Quick Button */}
          <div className="px-3.5 pb-2">
            <button
              onClick={() => setShowGlobalQrScanner(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs font-black uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/20 transition shadow-sm"
            >
              <QrCode className="h-4 w-4 text-emerald-400" />
              Scan Store QR
            </button>
          </div>

          {/* Safety SOS Quick Button */}
          <div className="px-3.5 pb-2">
            <button
              onClick={() => setShowSosModal(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-black uppercase tracking-wider text-rose-300 hover:bg-rose-500/20 transition"
            >
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              Emergency SOS
            </button>
          </div>

          {/* Bottom Rider Profile & Sign Out */}
          <div className="p-3.5 border-t border-slate-800/80">
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/5 bg-slate-900/60 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-xs font-black text-slate-950 shadow-md">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black text-white">{user?.name || 'Delivery Partner'}</p>
                <p className="truncate text-[10px] text-emerald-400 font-bold">⭐ 4.9 (420+ trips)</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white transition"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2.5 px-3 sm:px-6 py-2.5 sm:py-3">
            
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button onClick={toggleSidebar} className="p-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition lg:hidden border border-slate-200 shrink-0">
                <Menu size={18} />
              </button>
              
              {/* Location / Zone pill */}
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs truncate">
                <Navigation size={13} className="text-emerald-600 animate-pulse shrink-0" />
                <span className="truncate">Active Zone: <strong className="text-slate-900">Connaught Hub (Surge 1.2x)</strong></span>
              </div>
            </div>

            {/* Right Action Bar */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Scan Store QR Top Button */}
              <button
                type="button"
                onClick={() => setShowGlobalQrScanner(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition active:scale-95 shadow-sm text-xs font-black"
                title="Scan Store Pickup QR"
              >
                <QrCode size={15} className="text-emerald-400" />
                <span className="hidden sm:inline">Scan QR</span>
                <span className="sm:hidden text-[11px]">Scan</span>
              </button>

              {/* Duty Switch Button */}
              <button
                type="button"
                onClick={() => setIsOnline(!isOnline)}
                className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl cursor-pointer transition-all duration-300 border shadow-xs ${
                  isOnline
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-100 border-slate-300 text-slate-600'
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </button>

              {/* SOS Mobile Quick Trigger */}
              <button
                onClick={() => setShowSosModal(true)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 border border-rose-200 text-rose-600 sm:hidden shrink-0"
                title="Emergency SOS"
              >
                <ShieldAlert size={16} />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-2xs"
                >
                  <Bell size={17} />
                  <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-black text-white">
                    2
                  </span>
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl z-50 overflow-hidden"
                    >
                      <div className="p-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Fleet Alerts</h4>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                      </div>
                      <div className="divide-y divide-slate-100 text-xs">
                        <div className="p-3.5 hover:bg-slate-50 transition cursor-pointer">
                          <p className="font-bold text-slate-900">High Surge Active</p>
                          <p className="text-slate-500 text-[11px] mt-0.5">+₹25 bonus on next 3 deliveries in your area.</p>
                        </div>
                        <div className="p-3.5 hover:bg-slate-50 transition cursor-pointer">
                          <p className="font-bold text-slate-900">KYC Verified</p>
                          <p className="text-slate-500 text-[11px] mt-0.5">Your driving license is approved for deliveries.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Avatar */}
              <div
                onClick={() => navigate('/delivery/settings')}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-xs font-black text-slate-950 cursor-pointer shadow-xs shrink-0"
              >
                {userInitial}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>

        {/* Mobile Bottom Quick Bar with Centered QR Scanner Button */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 lg:hidden px-3 py-1.5 flex items-center justify-between shadow-lg">
          <NavLink
            to="/delivery/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
                isActive ? 'text-emerald-600 font-black' : 'text-slate-400 font-semibold'
              }`
            }
          >
            <LayoutDashboard size={18} />
            <span className="text-[10px]">Home</span>
          </NavLink>

          <NavLink
            to="/delivery/active"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
                isActive ? 'text-emerald-600 font-black' : 'text-slate-400 font-semibold'
              }`
            }
          >
            <MapPin size={18} />
            <span className="text-[10px]">Active</span>
          </NavLink>

          {/* Centered Big QR Scan Mobile Button */}
          <button
            onClick={() => setShowGlobalQrScanner(true)}
            className="flex flex-col items-center justify-center -mt-5 h-12 w-12 rounded-2xl bg-gradient-to-tr from-slate-950 to-slate-800 text-emerald-400 border-2 border-white shadow-xl active:scale-95 transition"
            title="Scan QR Code"
          >
            <QrCode size={22} />
          </button>

          <NavLink
            to="/delivery/earnings"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
                isActive ? 'text-emerald-600 font-black' : 'text-slate-400 font-semibold'
              }`
            }
          >
            <Wallet size={18} />
            <span className="text-[10px]">Earnings</span>
          </NavLink>

          <NavLink
            to="/delivery/history"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
                isActive ? 'text-emerald-600 font-black' : 'text-slate-400 font-semibold'
              }`
            }
          >
            <History size={18} />
            <span className="text-[10px]">History</span>
          </NavLink>
        </div>
      </div>

      {/* Global Rider QR Scanner Modal */}
      <RiderQrScannerModal
        isOpen={showGlobalQrScanner}
        onClose={() => setShowGlobalQrScanner(false)}
        onScanSuccess={() => {
          navigate('/delivery/active');
        }}
      />

      {/* Emergency SOS Modal */}
      <AnimatePresence>
        {showSosModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-rose-200"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4 mx-auto">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="text-center text-lg font-black text-slate-900">Emergency & Safety SOS</h3>
              <p className="mt-1 text-center text-xs font-medium text-slate-500">
                Are you facing an on-road emergency or security incident? Choose an option below for immediate assistance.
              </p>

              <div className="mt-5 space-y-2.5">
                <a
                  href="tel:112"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-rose-700 transition"
                >
                  <PhoneCall className="h-4 w-4" />
                  Call Police / Emergency (112)
                </a>
                <a
                  href="tel:+919876543210"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-800 hover:bg-slate-100 transition"
                >
                  <Shield className="h-4 w-4 text-emerald-600" />
                  24x7 Rider Support Desk
                </a>
              </div>

              <button
                onClick={() => setShowSosModal(false)}
                className="mt-4 w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Close / False Alarm
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeliveryLayout;
