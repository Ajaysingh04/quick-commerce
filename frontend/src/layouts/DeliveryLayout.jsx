import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice.js';
import { useAuth } from '@clerk/clerk-react';
import { useSettings } from '../context/SettingsContext.jsx';
import { 
 LayoutDashboard, MapPin, Wallet, History, Settings, 
 LogOut, Bell, Menu, X, Navigation, Bike, CheckCircle2, TriangleAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
 const dispatch = useDispatch();
 const navigate = useNavigate();
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

 // Sync online state to localStorage and dispatch custom event
 useEffect(() => {
   window.localStorage.setItem('deliveryOnline', isOnline);
   window.dispatchEvent(new CustomEvent('deliveryOnlineChanged', { detail: isOnline }));
 }, [isOnline]);

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
   { name: 'Active Orders', path: '/delivery/active', icon: MapPin },
   { name: 'Earnings', path: '/delivery/earnings', icon: Wallet },
   { name: 'History', path: '/delivery/history', icon: History },
   { name: 'Settings', path: '/delivery/settings', icon: Settings },
 ];

 return (
   <div className="flex h-screen bg-[#f8f9fa] text-slate-900 overflow-hidden font-sans selection:bg-[#e31837] selection:text-white">
     {/* Mobile Sidebar Overlay */}
     <AnimatePresence>
       {isSidebarOpen && !isDesktop && (
         <motion.div 
           initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
           className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
           onClick={closeSidebar}
         />
       )}
     </AnimatePresence>

     {/* Sidebar */}
     <motion.aside 
       initial={false}
       animate={{ width: isDesktop ? 280 : isSidebarOpen ? 280 : 0, x: isDesktop ? 0 : isSidebarOpen ? 0 : -300 }}
       transition={{ type: 'spring', damping: 25, stiffness: 200 }}
       className={`fixed lg:static z-50 h-full bg-slate-950 border-r border-white/5 flex flex-col overflow-hidden shadow-2xl ${!isDesktop && !isSidebarOpen ? 'pointer-events-none' : ''}`}
     >
       <div className="relative h-full flex flex-col z-10">
         {/* Top Logo */}
         <div className="p-6 flex items-center justify-between mt-2">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-[#e31837] to-[#ff4d6d] rounded-xl flex items-center justify-center shadow-lg shadow-[#e31837]/30">
                <Bike className="text-white w-6 h-6" />
             </div>
             <span className="font-black text-2xl tracking-tight text-white">
               Rider<span className="text-[#e31837]">App</span>
             </span>
           </div>
           <button onClick={closeSidebar} className="lg:hidden text-white/50 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
             <X size={20} />
           </button>
         </div>

         {/* Navigation */}
         <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
           {navItems.map((item, i) => (
             <motion.div key={item.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
               <NavLink
                 to={item.path}
                 onClick={() => !isDesktop && closeSidebar()}
                 className={({ isActive }) => 
                   `group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 overflow-hidden ${
                     isActive 
                       ? 'text-white shadow-[0_0_20px_rgba(227,24,55,0.15)]' 
                       : 'text-slate-400 hover:text-white hover:bg-white/5'
                   }`
                 }
               >
                 {({ isActive }) => (
                   <>
                     {isActive && (
                       <motion.div 
                         layoutId="active-pill"
                         className="absolute inset-0 bg-gradient-to-r from-[#e31837]/20 to-transparent border-l-4 border-[#e31837]" 
                         transition={{ type: "spring", stiffness: 300, damping: 30 }}
                       />
                     )}
                     <item.icon size={22} className={`relative z-10 transition-transform duration-300 ${isActive ? 'text-[#e31837]' : 'group-hover:scale-110'}`} />
                     <span className={`relative z-10 font-bold ${isActive ? 'text-white' : ''}`}>{item.name}</span>
                   </>
                 )}
               </NavLink>
             </motion.div>
           ))}
         </nav>

         {/* Bottom Action */}
         <div className="p-6 mt-auto">
           <button 
             onClick={handleLogout}
             className="group relative flex items-center justify-center gap-3 px-4 py-3.5 w-full rounded-2xl text-white overflow-hidden"
           >
             <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-2xl transition-colors group-hover:bg-[#e31837]/10 group-hover:border-[#e31837]/30" />
             <LogOut size={20} className="relative z-10 group-hover:text-[#e31837] transition-colors" />
             <span className="relative z-10 font-bold">Sign Out</span>
           </button>
         </div>
         
         {/* Decorative Gradient */}
         <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#e31837]/10 to-transparent pointer-events-none" />
       </div>
     </motion.aside>

     {/* Main Content Area */}
     <div className="flex-1 flex flex-col min-w-0 relative">
       {/* Floating Top Navbar */}
       <div className="p-4 sm:p-6 pb-0 absolute top-0 w-full z-30">
         <header className="h-16 bg-white/70 backdrop-blur-xl border border-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center justify-between px-4 sm:px-6">
           
           <div className="flex items-center gap-4">
             <button onClick={toggleSidebar} className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors lg:hidden">
               <Menu size={20} />
             </button>
             {/* Desktop Right Actions */}
             <div className="hidden md:flex items-center gap-4">
               <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-full font-medium border border-slate-100">
                 <Navigation size={14} className="text-[#e31837]" />
                 <span>Zone: <strong className="text-slate-900 font-bold">Downtown</strong></span>
               </div>
             </div>
           </div>

           <div className="flex items-center gap-3 sm:gap-5">
             {/* Dynamic Online Toggle */}
             <div 
               onClick={() => setIsOnline(!isOnline)}
               className={`relative flex items-center gap-3 p-1.5 pr-4 rounded-full cursor-pointer transition-all duration-300 border ${
                 isOnline ? 'bg-emerald-50 border-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
               }`}
             >
               <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${isOnline ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
                 {isOnline && <motion.div className="absolute w-8 h-8 rounded-full border-2 border-emerald-500 animate-ping opacity-50" />}
                 <Bike size={16} className="relative z-10" />
               </div>
               <span className={`text-sm font-black tracking-wide ${isOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
                 {isOnline ? 'ONLINE' : 'OFFLINE'}
               </span>
             </div>

             <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

             {/* Notifications */}
             <div className="relative">
               <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors border border-slate-100">
                 <Bell size={20} />
                 <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#e31837] rounded-full border-2 border-white"></span>
               </button>
               
               <AnimatePresence>
                 {showNotifications && (
                   <motion.div
                     initial={{ opacity: 0, y: 15, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 15, scale: 0.95 }}
                     transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                     className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 shadow-2xl shadow-slate-200/50 rounded-2xl z-50 overflow-hidden"
                   >
                     <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
                       <div className="flex items-center gap-2">
                         <h3 className="font-bold text-slate-900">Notifications</h3>
                         <span className="text-[10px] font-bold text-[#e31837] bg-[#e31837]/10 px-2 py-0.5 rounded-full">2 New</span>
                       </div>
                       <button 
                         onClick={() => setShowNotifications(false)}
                         className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                       >
                         <X size={16} />
                       </button>
                     </div>
                     <div className="max-h-[300px] overflow-y-auto">
                       <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-4">
                         <div className="w-10 h-10 rounded-full bg-[#e31837]/10 flex items-center justify-center shrink-0">
                           <MapPin size={18} className="text-[#e31837]" />
                         </div>
                         <div>
                           <p className="text-sm text-slate-800 font-bold">New delivery request!</p>
                           <p className="text-xs text-slate-500 mt-1">2 mins ago</p>
                         </div>
                       </div>
                       <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-4 border-t border-gray-50">
                         <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                           <CheckCircle2 size={18} className="text-emerald-500" />
                         </div>
                         <div>
                           <p className="text-sm text-slate-600 font-medium">KYC verification approved.</p>
                           <p className="text-xs text-slate-400 mt-1">1 hour ago</p>
                         </div>
                       </div>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>

             {/* Profile */}
             <div className="relative">
               <div 
                 onClick={() => setShowProfileMenu(!showProfileMenu)}
                 className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#c8102e] to-[#e31837] flex items-center justify-center shadow-lg shadow-[#e31837]/20 cursor-pointer relative overflow-hidden ring-2 ring-white"
               >
                 <div className="absolute inset-0 bg-white/20 hover:opacity-0 transition-opacity" />
                 <span className="text-sm font-black text-white relative z-10">{userInitial}</span>
               </div>

               <AnimatePresence>
                 {showProfileMenu && (
                   <motion.div
                     initial={{ opacity: 0, y: 15, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 15, scale: 0.95 }}
                     transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                     className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 shadow-2xl shadow-slate-200/50 rounded-2xl z-50 overflow-hidden"
                   >
                     <div className="p-4 border-b border-gray-50 bg-slate-50/50">
                       <p className="font-bold text-slate-900 truncate">{user?.name || 'Rider'}</p>
                       <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                     </div>
                     <div className="p-2">
                       <button 
                         onClick={() => { setShowProfileMenu(false); navigate('/delivery/settings'); }}
                         className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                       >
                         <Settings size={16} /> Preferences
                       </button>
                       <button 
                         onClick={handleLogout}
                         className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm font-semibold text-[#e31837] hover:bg-red-50 rounded-xl transition-colors mt-1"
                       >
                         <LogOut size={16} /> Logout
                       </button>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
           </div>
         </header>
       </div>

       {/* Page Content */}
       <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar pt-28 px-4 sm:px-6 pb-6 relative z-10">
         <Outlet />
       </main>
     </div>
   </div>
 );
};

export default DeliveryLayout;
