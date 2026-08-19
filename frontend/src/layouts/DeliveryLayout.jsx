import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
 CarFront
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DeliveryLayout = () => {
 const [isSidebarOpen, setSidebarOpen] = useState(false);
 const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
 const [isOnline, setIsOnline] = useState(false);
 const [showNotifications, setShowNotifications] = useState(false);
 const [showProfileMenu, setShowProfileMenu] = useState(false);
 const navigate = useNavigate();
 const dispatch = useDispatch();
 const { signOut } = useAuth();
 const { settings } = useSettings();
 const { user } = useSelector(state => state.auth);

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

 const toggleSidebar = () => setSidebarOpen(prev => !prev);
 const closeSidebar = () => setSidebarOpen(false);

 const handleLogout = () => {
 signOut().catch(() => {}).finally(() => {
 dispatch(logout());
 window.location.href = '/';
 });
 };

 const navItems = [
 { name: 'Dashboard', path: '/delivery/dashboard', icon: LayoutDashboard },
 { name: 'Active Deliveries', path: '/delivery/active', icon: MapPin },
 { name: 'Earnings', path: '/delivery/earnings', icon: Wallet },
 { name: 'History', path: '/delivery/history', icon: History },
 { name: 'Settings', path: '/delivery/settings', icon: Settings },
 ];

 return (
 <div className="flex h-screen bg-[#f5f6fa] text-slate-900 overflow-hidden font-sans">
 {/* Mobile Sidebar Overlay */}
 <AnimatePresence>
 {isSidebarOpen && !isDesktop && (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="fixed inset-0 bg-slate-950/50 backdrop-blur-[1px] z-40 lg:hidden"
 onClick={closeSidebar}
 />
 )}
 </AnimatePresence>

 {/* Sidebar */}
 <motion.aside 
 initial={false}
 animate={{ 
 width: isDesktop ? 260 : isSidebarOpen ? 260 : 0,
 x: isDesktop ? 0 : isSidebarOpen ? 0 : -280,
 opacity: isDesktop || isSidebarOpen ? 1 : 0,
 }}
 transition={{ duration: 0.25, ease: 'easeInOut' }}
 className={`fixed lg:static z-50 h-full bg-[#e31837] text-white flex flex-col overflow-hidden shadow-2xl ${!isDesktop && !isSidebarOpen ? 'pointer-events-none' : ''}`}
 >
 <div className="p-6 flex items-center justify-between">
  <div className="flex items-center gap-3">
  <img src={settings?.logoUrl || '/logo.png'} alt="Logo" className="h-8 object-contain" onError={(e) => e.target.style.display = 'none'} />
  <span className="font-black text-2xl tracking-tighter text-white">
  {settings?.siteTitle || 'RoseDash'}
  </span>
  </div>
 <button onClick={closeSidebar} className="lg:hidden text-white/80 hover:text-white">
 <X size={20} />
 </button>
 </div>

 <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
 {navItems.map((item) => (
 <NavLink
 key={item.name}
 to={item.path}
 onClick={() => !isDesktop && closeSidebar()}
 className={({ isActive }) => 
 `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
 isActive 
 ? 'bg-white text-[#e31837] font-bold shadow-md' 
 : 'text-white/80 hover:bg-white/10 hover:text-white'
 }`
 }
 >
 <item.icon size={20} className="group-hover:scale-110 transition-transform" />
 <span className="whitespace-nowrap">{item.name}</span>
 </NavLink>
 ))}
 </nav>

 <div className="p-4 mb-6 border-t border-white/10 mt-auto">
 <button 
 onClick={handleLogout}
 className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-xl text-white hover:bg-white/20 transition-colors font-bold"
 >
 <LogOut size={20} />
 <span>Logout</span>
 </button>
 </div>
 </motion.aside>

 {/* Main Content */}
 <div className="flex-1 flex flex-col min-w-0">
 {/* Top Navbar */}
 <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-sm">
 <div className="flex items-center gap-3 sm:gap-4">
 <button 
 onClick={toggleSidebar}
 className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors lg:hidden"
 >
 <Menu size={20} />
 </button>
 <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-4 py-2 rounded-full font-medium">
 <Navigation size={14} className="text-[#e31837]" />
 <span>Current Zone: <strong className="text-slate-800 font-bold">Downtown</strong></span>
 </div>
 </div>

 <div className="flex items-center gap-3 sm:gap-6">
 {/* Online Toggle */}
 <div className="flex items-center gap-2 sm:gap-3 bg-slate-100 p-2 pr-3 sm:pr-4 rounded-full border border-gray-200">
 <div 
 onClick={() => setIsOnline(!isOnline)}
 className={`relative w-11 h-6 sm:w-12 sm:h-6 rounded-full cursor-pointer transition-colors duration-300 shadow-inner ${isOnline ? 'bg-[#e31837]' : 'bg-slate-400'}`}
 >
 <div 
 className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${isOnline ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'}`} 
 />
 </div>
 <span className={`text-xs sm:text-sm font-bold tracking-wide ${isOnline ? 'text-[#e31837]' : 'text-slate-500'}`}>
 {isOnline ? 'ONLINE' : 'OFFLINE'}
 </span>
 </div>

  <div className="relative">
  <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
  <Bell size={20} />
  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#e31837] rounded-full border-2 border-white"></span>
  </button>
  
  <AnimatePresence>
  {showNotifications && (
  <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 10 }}
  className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 shadow-2xl shadow-slate-200/50 rounded-2xl z-50 overflow-hidden"
  >
  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/80">
  <h3 className="font-bold text-slate-900">Notifications</h3>
  <span className="text-xs font-semibold text-[#e31837] bg-[#e31837]/10 px-2 py-1 rounded-full">2 New</span>
  </div>
  <div className="max-h-[300px] overflow-y-auto">
  <div className="p-4 border-b border-gray-50 hover:bg-slate-50 transition-colors cursor-pointer relative">
  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e31837]" />
  <p className="text-sm text-slate-800 font-medium">New delivery request near you!</p>
  <p className="text-xs text-slate-500 mt-1">2 mins ago</p>
  </div>
  <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer relative">
  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200" />
  <p className="text-sm text-slate-600 font-medium">Your KYC has been approved.</p>
  <p className="text-xs text-slate-400 mt-1">1 hour ago</p>
  </div>
  </div>
  <div className="p-3 border-t border-gray-100 text-center bg-white">
  <button onClick={() => setShowNotifications(false)} className="text-sm font-bold text-[#e31837] hover:underline">Mark all as read</button>
  </div>
  </motion.div>
  )}
  </AnimatePresence>
  </div>
  <div className="relative">
  <div 
  onClick={() => setShowProfileMenu(!showProfileMenu)}
  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#c8102e] to-[#e31837] border-2 border-white flex items-center justify-center shadow-lg cursor-pointer"
  >
  <span className="text-sm font-bold text-white">{userInitial}</span>
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
 <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f5f6fa] custom-scrollbar p-4 sm:p-6">
 <Outlet />
 </main>
 </div>
 </div>
 );
};

export default DeliveryLayout;
