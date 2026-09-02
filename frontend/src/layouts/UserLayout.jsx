import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useSettings } from '../context/SettingsContext.jsx';
import { logout } from '../store/authSlice.js';
import { fetchWishlist, toggleWishlistThunk } from '../store/wishlistSlice.js';
import { useAuth, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import { updateQuantity, selectSubtotal, selectCartTotal, clearCart } from '../store/cartSlice.js';
import { ShoppingBag, User as UserIcon, Menu, X, Plus, Minus, Search, ChevronRight, Mail, Phone, MapPin, ArrowUp, Heart, Smile, Gift, Smartphone, ArrowLeft } from 'lucide-react';
import API from '../services/api.js';
import { motion, AnimatePresence } from 'framer-motion';

const UserLayout = () => {
  const { settings } = useSettings();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { items: cartItems, coupon, store } = useSelector(state => state.cart);
  const wishlistItems = useSelector(state => state.wishlist?.items || []);
  
  const subtotal = useSelector(selectSubtotal);
  const grandTotal = useSelector(selectCartTotal);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, isSignedIn, isLoaded } = useAuth();

  React.useEffect(() => {
    // Sync Clerk sign-out with Redux
    if (isLoaded && !isSignedIn && isAuthenticated) {
      dispatch(logout());
      dispatch(clearCart());
    }
    
    // Auto-sync if Clerk is signed in but Redux lost state (e.g. after refresh)
    if (isLoaded && isSignedIn && !isAuthenticated && location.pathname !== '/auth-sync') {
      navigate('/auth-sync');
    }
  }, [isLoaded, isSignedIn, isAuthenticated, dispatch, navigate, location.pathname]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  React.useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  React.useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.get('/products/categories');
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [globalSearch, setGlobalSearch] = useState('');
  
  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/products?q=${encodeURIComponent(globalSearch.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const [locationName, setLocationName] = useState(localStorage.getItem('userLocation') || 'Connaught Place');
  const [isLocating, setIsLocating] = useState(false);
  
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    setLocationName('Locating...');
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const area = data.address.neighbourhood || data.address.suburb || data.address.city || data.address.town || data.address.county || 'Current Location';
        setLocationName(area);
        localStorage.setItem('userLocation', area);
      } catch (err) {
        setLocationName('Failed to locate');
      } finally {
        setIsLocating(false);
      }
    }, () => {
      setLocationName('Connaught Place');
      setIsLocating(false);
    });
  };

  const handleLogout = () => {
    signOut().catch(() => {}).finally(() => {
      dispatch(logout());
      dispatch(clearCart());
      window.location.href = '/';
    });
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 transition-colors duration-300 font-sans">
      
      {settings.globalNotice && (
        <div className="bg-[#0a4733] text-white text-center py-1 text-xs font-bold tracking-widest px-4">
          {settings.globalNotice}
        </div>
      )}
      {/* RoseDash Style Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Logo & Location */}
          <div className="flex flex-col">
            <div 
              onClick={() => { if(!isAuthenticated) navigate('/'); else navigate('/'); }}
              className="flex items-center gap-2 cursor-pointer transition-opacity"
            >
              <img src={settings.logoUrl} alt="Logo" className="h-8 object-contain" />
              <span className="font-black text-2xl tracking-tight text-[#0a4733]">
                {settings.siteTitle || 'Gromuse'}
              </span>
            </div>
            <div 
              onClick={handleGetLocation}
              className={`flex items-center gap-1 text-[10px] text-gray-500 font-bold mt-1 cursor-pointer hover:text-[#0a4733] ${isLocating ? 'animate-pulse' : ''}`}
            >
              <MapPin className="w-3 h-3 text-[#0a4733]" />
              <span className="uppercase">{locationName}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-semibold text-gray-600">
            <Link to="/" className={`${location.pathname === '/' ? 'bg-[#0a4733] text-white px-3 py-1.5 rounded-full' : 'hover:text-[#0a4733] transition-colors'}`}>Home</Link>
            <Link to="/shop" className={`${location.pathname === '/shop' ? 'bg-[#0a4733] text-white px-3 py-1.5 rounded-full' : 'hover:text-[#0a4733] transition-colors'}`}>Shop</Link>
            <Link to="/offers" className={`${location.pathname === '/offers' ? 'bg-[#0a4733] text-white px-3 py-1.5 rounded-full' : 'hover:text-[#0a4733] transition-colors'}`}>Offers</Link>
            <Link to="/about" className={`${location.pathname === '/about' ? 'bg-[#0a4733] text-white px-3 py-1.5 rounded-full' : 'hover:text-[#0a4733] transition-colors'}`}>About</Link>
            <Link to="/support" className={`${location.pathname === '/support' ? 'bg-[#0a4733] text-white px-3 py-1.5 rounded-full' : 'hover:text-[#0a4733] transition-colors'}`}>Support</Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleGlobalSearch} className="hidden md:flex flex-1 max-w-md items-center bg-gray-50 border border-gray-200 rounded-full overflow-hidden px-4 py-1.5">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search groceries, dairy, snacks..." 
              className="bg-transparent w-full outline-none text-sm text-gray-700" 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
            <button type="submit" className="text-[#0a4733] p-1"><Search className="w-4 h-4" /></button>
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-4 lg:gap-6 min-w-max">
            {/* Download App */}
            <Link to="/app" className="hidden sm:flex text-[#0a4733] hover:bg-green-50 p-2 rounded-full transition-colors border border-green-100">
              <Smartphone className="w-5 h-5" />
            </Link>

            {/* Wishlist Icon */}
            <button 
              onClick={() => {
                if(!isAuthenticated) navigate('/login');
                else setIsWishlistOpen(true); 
              }}
              className="relative flex items-center justify-center text-gray-700 hover:text-red-500 transition-colors"
            >
              <Heart className="w-6 h-6" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                  {wishlistItems.length}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button 
              id="cart-icon"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center text-gray-700 hover:text-[#0a4733] transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#0a4733] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Icon / Auth */}
            {isAuthenticated ? (
              <button 
                onClick={() => {
                  if (user?.role === 'admin') navigate('/admin');
                  else if (user?.role === 'delivery') navigate('/delivery');
                  else if (user?.role === 'partner') navigate('/partner');
                  else navigate('/profile');
                }}
                className="flex items-center gap-2 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200 hover:border-[#0a4733] hover:text-[#0a4733] transition-colors"
              >
                <UserIcon className="w-4 h-4 text-gray-700" />
                <span className="hidden lg:block text-sm font-semibold text-gray-700">
                  {user?.name?.split(' ')[0] || 'Profile'}
                </span>
              </button>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 text-gray-700 hover:text-[#0a4733] transition-colors font-semibold text-sm bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200"
              >
                <UserIcon className="w-4 h-4" /> Sign
              </button>
            )}

            {/* Mobile menu trigger */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden text-gray-700">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <nav className="md:hidden w-full bg-white border-t border-gray-200 shadow-lg flex flex-col p-4 gap-3 z-30 relative">
          <form onSubmit={handleGlobalSearch} className="bg-gray-100 rounded-md h-10 flex items-center px-3 mb-4">
             <Search className="w-4 h-4 text-gray-500 mr-2" />
             <input 
               type="text" 
               placeholder="Search..." 
               className="bg-transparent outline-none text-sm w-full" 
               value={globalSearch}
               onChange={(e) => setGlobalSearch(e.target.value)}
             />
          </form>
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 py-2 border-b border-gray-200 text-gray-700 font-bold">
                <UserIcon className="w-5 h-5" />
                <span>{user?.name}</span>
              </div>
              <Link to={user?.role === 'admin' ? '/admin' : user?.role === 'delivery' ? '/delivery' : user?.role === 'partner' ? '/partner' : '/profile'} onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-brand-500 font-medium">Profile</Link>
            </>
          ) : (
            <div className="flex flex-col gap-2 border-b border-gray-200 pb-4">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/login');
                }} 
                className="py-2 text-left font-bold text-gray-700"
              >
                Sign In / Create Account
              </button>
            </div>
          )}
          <div className="flex flex-col gap-2 mt-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</h3>
            {categories.map(cat => (
              <a key={cat._id} href={`/shop/${cat._id}`} onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm text-gray-700 font-medium">
                {cat.name}
              </a>
            ))}
          </div>
        </nav>
      )}

      {/* Page Content */}
      <main className="flex-grow bg-[#f3f4f6]">
        <Outlet context={{ isMobileMenuOpen }} />
      </main>

      {/* Solid Footer */}
      <footer className="bg-[#0a4733] text-white pt-16 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#14664a]">
            
            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src={settings.logoUrl} alt="Logo" className="h-8 object-contain brightness-0 invert" />
                <span className="font-black text-2xl tracking-tighter text-white">
                  {settings.siteTitle || 'Gromuse'}
                </span>
              </div>
              <p className="text-sm text-green-100 mb-6 font-medium">
                Your daily dose of fresh, organic, and healthy products delivered straight to your door. Freshness guaranteed.
              </p>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Download App</h4>
              <div className="flex gap-3">
                <a href="#" className="hover:opacity-80 transition-opacity">
                  <img src="https://b.zmtcdn.com/data/webuikit/9f0c85a5e33adb783fa0aef667075f9e1556003622.png" alt="Google Play" className="h-8 object-contain rounded" />
                </a>
                <a href="#" className="hover:opacity-80 transition-opacity">
                  <img src="https://b.zmtcdn.com/data/webuikit/23e930757c3df49840c482a8638bf5c31556001144.png" alt="App Store" className="h-8 object-contain rounded" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-span-1">
              <h4 className="text-sm font-bold mb-6 text-white uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-3 text-sm text-red-100 font-medium">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/shop" className="hover:text-white transition-colors">Story</Link></li>
                <li><Link to="/support" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div className="col-span-1">
              <h4 className="text-sm font-bold mb-6 text-white uppercase tracking-wider">Categories</h4>
              <ul className="space-y-3 text-sm text-red-100 font-medium">
                <li><Link to="/category/fresh" className="hover:text-white transition-colors">Fruits & Vegetables</Link></li>
                <li><Link to="/category/dairy" className="hover:text-white transition-colors">Dairy & Breakfast</Link></li>
                <li><Link to="/category/munchies" className="hover:text-white transition-colors">Grocery</Link></li>
                <li><Link to="/category/drinks" className="hover:text-white transition-colors">Cold Drinks</Link></li>
                <li><Link to="/category/chicken-eggs" className="hover:text-white transition-colors">Chicken & Eggs</Link></li>
              </ul>
            </div>

            {/* Contact Us */}
            <div className="col-span-1">
              <h4 className="text-sm font-bold mb-6 text-white uppercase tracking-wider">Contact Us</h4>
              <ul className="space-y-4 text-sm text-red-100 font-medium">
                <li className="flex gap-3 items-start">
                  <MapPin className="w-5 h-5 shrink-0" />
                  <span>{settings.contactAddress || '15, Scheme No 54, PU4, Indore, Madhya Pradesh 452010, India'}</span>
                </li>
                <li className="flex gap-3 items-center">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{settings.contactPhone || '1800-267-4444'}</span>
                </li>
                <li className="flex gap-3 items-center">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>{settings.contactEmail || 'support@rosedash.com'}</span>
                </li>
              </ul>
              <div className="mt-6 flex gap-4">
                {settings.socialLinks?.facebook && <a href={settings.socialLinks.facebook} target="_blank" rel="noreferrer" className="text-white hover:text-red-200">FB</a>}
                {settings.socialLinks?.instagram && <a href={settings.socialLinks.instagram} target="_blank" rel="noreferrer" className="text-white hover:text-red-200">IG</a>}
                {settings.socialLinks?.twitter && <a href={settings.socialLinks.twitter} target="_blank" rel="noreferrer" className="text-white hover:text-red-200">TW</a>}
                {settings.socialLinks?.linkedin && <a href={settings.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-white hover:text-red-200">IN</a>}
              </div>
            </div>

          </div>

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4">
             <p className="text-xs text-green-200">
                © {new Date().getFullYear()} {settings.siteTitle || 'RoseDash'}™ Ltd. All rights reserved. Developed by Ajay.
             </p>
             <div className="flex gap-6 text-xs text-green-200 font-medium">
                 <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                 <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
             </div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer Sliding Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Overlay */}
            <div 
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
            ></div>

            {/* Slide-over panel */}
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="pointer-events-auto w-screen max-w-md"
              >
                <div className="flex h-full flex-col bg-white shadow-2xl border-l border-gray-200">
                  
                  {/* Header */}
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-[#0a4733]" /> Your Cart
                    </h3>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body Scrollable items list */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 bg-slate-50/50 no-scrollbar">
                    {cartItems.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 gap-4">
                        <ShoppingBag className="w-16 h-16 text-gray-300 stroke-1" />
                        <div>
                          <h4 className="font-bold text-gray-800 mb-1">Your bag is empty</h4>
                          <p className="text-xs">Add items to it now.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <AnimatePresence>
                          {cartItems.map((item) => (
                            <motion.div 
                              key={item.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow"
                            >
                              <div className="flex gap-4 items-center justify-between">
                                <div className="flex gap-3 items-center">
                                  <div className="relative">
                                    <img 
                                      onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"; }} 
                                      src={item.image} 
                                      alt={item.name} 
                                      className="w-16 h-16 rounded-lg object-cover border border-gray-100 shadow-sm" 
                                    />
                                    <button 
                                      onClick={() => dispatch(updateQuantity({ itemId: item.id, amount: -item.quantity }))}
                                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold leading-tight line-clamp-2 text-slate-800">
                                      {item.name}
                                    </h4>
                                    <p className="text-xs font-semibold text-[#0a4733] mt-1">₹{item.price}</p>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <div className="flex items-center border border-gray-200 rounded-lg p-1 gap-3 bg-slate-50 text-xs font-bold text-slate-700">
                                    <button onClick={() => dispatch(updateQuantity({ itemId: item.id, amount: -1 }))} className="hover:text-[#0a4733] p-1 bg-white rounded shadow-sm"><Minus className="w-3 h-3" /></button>
                                    <span className="min-w-[1rem] text-center">{item.quantity}</span>
                                    <button onClick={() => dispatch(updateQuantity({ itemId: item.id, amount: 1 }))} className="hover:text-[#0a4733] p-1 bg-white rounded shadow-sm"><Plus className="w-3 h-3" /></button>
                                  </div>
                                  <span className="text-sm font-black text-slate-900">₹{item.price * item.quantity}</span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Calculations & Checkout footer */}
                  {cartItems.length > 0 && (
                    <div className="border-t border-gray-100 px-6 py-6 bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-10">
                      <div className="space-y-3 text-sm text-slate-500 mb-6 font-medium">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span className="font-bold text-slate-800">₹{subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping & Handling</span>
                          <span className="font-bold text-[#0a4733]">
                            {(() => {
                              const delivery = subtotal >= 500 ? 0 : 40;
                              const distanceSurcharge = store?.distance > 5 ? Math.ceil(store.distance - 5) * 4.75 : 0;
                              
                              let customChargesTotal = 0;
                              const activeCustomCharges = settings?.customCharges?.filter(c => c.isActive && (c.season === 'all' || c.season === settings?.activeSeason)) || [];
                              activeCustomCharges.forEach(charge => {
                                if (charge.type === 'percentage') {
                                  customChargesTotal += Math.round(subtotal * (charge.value / 100));
                                } else {
                                  customChargesTotal += charge.value;
                                }
                              });

                              const totalShipping = delivery + distanceSurcharge + customChargesTotal;
                              return totalShipping === 0 ? 'FREE' : `₹${totalShipping}`;
                            })()}
                          </span>
                        </div>
                        {coupon && (
                          <div className="flex justify-between text-brand-500 font-semibold">
                            <span>Coupon "{coupon.code}"</span>
                            <span>-₹{coupon.discountAmount}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-lg font-black text-slate-900 border-t border-gray-100 pt-4 mt-2">
                          <span>Grand Total</span>
                          <span>
                            {(() => {
                              let customChargesTotal = 0;
                              const activeCustomCharges = settings?.customCharges?.filter(c => c.isActive && (c.season === 'all' || c.season === settings?.activeSeason)) || [];
                              activeCustomCharges.forEach(charge => {
                                if (charge.type === 'percentage') {
                                  customChargesTotal += Math.round(subtotal * (charge.value / 100));
                                } else {
                                  customChargesTotal += charge.value;
                                }
                              });
                              return `₹${grandTotal + customChargesTotal}`;
                            })()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3 flex-col sm:flex-row">
                        <button 
                          onClick={() => setIsCartOpen(false)}
                          className="flex-1 py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm text-center shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                          <ArrowLeft className="w-4 h-4" /> Continue Shopping
                        </button>
                        <button 
                          onClick={() => {
                            setIsCartOpen(false);
                            if (!isAuthenticated) {
                              navigate('/login?redirect=/checkout');
                            } else {
                              navigate('/checkout');
                            }
                          }}
                          className="flex-1 py-3.5 rounded-xl bg-[#0a4733] hover:bg-[#073324] text-white font-black text-sm text-center shadow-lg hover:shadow-xl active:scale-[0.98] transition-all uppercase tracking-wide"
                        >
                          {isAuthenticated ? 'Proceed to Pay' : 'Login to Pay'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      )}

      {/* Wishlist Drawer Sliding Sidebar */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            <div 
              onClick={() => setIsWishlistOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
            ></div>

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="pointer-events-auto w-screen max-w-md"
              >
                <div className="flex h-full flex-col bg-white shadow-2xl border-l border-gray-200">
                  
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" /> Your Wishlist
                    </h3>
                    <button 
                      onClick={() => setIsWishlistOpen(false)}
                      className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-4 bg-slate-50/50 no-scrollbar">
                    {wishlistItems.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 gap-4">
                        <Heart className="w-16 h-16 text-gray-300 stroke-1" />
                        <div>
                          <h4 className="font-bold text-gray-800 mb-1">Your wishlist is empty</h4>
                          <p className="text-xs">Save items you love here.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <AnimatePresence>
                          {wishlistItems.map((item) => (
                            <motion.div 
                              key={item._id || item.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow"
                            >
                              <div className="flex gap-4 items-center justify-between">
                                <div className="flex gap-3 items-center">
                                  <div className="relative">
                                    <img 
                                      onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"; }} 
                                      src={item.image} 
                                      alt={item.name} 
                                      className="w-16 h-16 rounded-lg object-cover border border-gray-100 shadow-sm" 
                                    />
                                    <button 
                                      onClick={() => dispatch(toggleWishlistThunk(item))}
                                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold leading-tight line-clamp-2 text-slate-800">
                                      {item.name}
                                    </h4>
                                    <p className="text-xs font-semibold text-[#0a4733] mt-1">₹{item.price}</p>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <button 
                                    onClick={() => {
                                      // Add to cart
                                      dispatch({ type: 'cart/addToCart', payload: { item, store: { id: 'quick-store', name: 'Quick Store' } } });
                                      dispatch(toggleWishlistThunk(item));
                                    }}
                                    className="bg-[#0a4733] text-white p-2 rounded-lg hover:bg-[#073324] transition-colors"
                                  >
                                    <ShoppingBag className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-[#0a4733] text-white rounded-full shadow-xl hover:bg-[#073324] transition-all hover:-translate-y-1 z-50 flex items-center justify-center animate-in fade-in slide-in-from-bottom-4"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      {/* Custom Auth Modal (Purplle Style) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsAuthModalOpen(false)}
          ></div>
          <div className="relative bg-white rounded shadow-2xl w-full max-w-[420px] p-6 animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute -top-3 -right-3 bg-white text-gray-800 rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Promo Banner inside Modal */}
            <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded border border-pink-100 p-3 flex justify-between items-center mb-6">
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Flat</div>
                <div className="text-2xl font-black text-gray-900 leading-none tracking-tighter">₹100 <span className="text-sm font-bold text-gray-500">OFF</span></div>
                <div className="text-[9px] font-bold text-gray-500 mt-1">on order above ₹399+</div>
              </div>
              <div className="text-center bg-white/60 px-3 py-1 rounded">
                <div className="text-[10px] font-bold text-gray-500 uppercase">Use Code:</div>
                <div className="text-sm font-black text-gray-800">ROSEFIRST</div>
              </div>
            </div>

            {/* Form */}
            <h2 className="text-center text-sm font-bold text-gray-800 mb-4">Login or Signup</h2>
            
            <div className="mb-4">
              <input 
                type="text" 
                placeholder="Enter a 10-digit mobile number" 
                className="w-full border border-gray-300 rounded p-3 text-sm outline-none focus:border-[#971273] transition-colors"
              />
            </div>

            <button className="w-full bg-[#e8eaf2] text-[#8692a6] font-bold py-3 rounded text-sm mb-4 cursor-not-allowed">
              CONTINUE
            </button>

            {/* Checkbox */}
            <label className="flex items-start gap-2 cursor-pointer mb-6 group">
              <div className="relative flex items-center justify-center w-5 h-5 rounded border border-[#971273] bg-[#971273] mt-0.5">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs text-gray-600 font-medium">Allow shiprocket to fetch address based on past orders ⓘ</span>
            </label>

            {/* Terms */}
            <p className="text-[10px] text-center text-gray-500 leading-relaxed px-2">
              By creating an account or logging in, you agree to RoseDash's <Link to="/terms" className="text-[#971273] hover:underline" onClick={() => setIsAuthModalOpen(false)}>Terms of Use</Link>, <Link to="/privacy" className="text-[#971273] hover:underline" onClick={() => setIsAuthModalOpen(false)}>Privacy Policy</Link> and consent to the collection and use of your personal information.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserLayout;
