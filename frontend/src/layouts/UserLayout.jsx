import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useSettings } from '../context/SettingsContext.jsx';
import { logout } from '../store/authSlice.js';
import { useAuth, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import { updateQuantity, selectSubtotal, selectCartTotal, clearCart } from '../store/cartSlice.js';
import { ShoppingBag, User as UserIcon, Menu, X, Plus, Minus, Search, ChevronRight, Mail, Phone, MapPin, ArrowUp, Heart, Smile, Gift, Smartphone } from 'lucide-react';
import { CATEGORIES } from '../pages/user/Home.jsx';

const UserLayout = () => {
  const { settings } = useSettings();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { items: cartItems, coupon } = useSelector(state => state.cart);
  
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
  }, [isLoaded, isSignedIn, isAuthenticated, dispatch]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
      
      {/* RoseDash Style Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Logo & Location */}
          <div className="flex flex-col">
            <div 
              onClick={() => { if(!isAuthenticated) navigate('/'); else navigate('/'); }}
              className="flex items-center gap-1 cursor-pointer transition-opacity"
            >
              <img src={settings.logoUrl} alt="Logo" className="h-8 object-contain" />
              <span className="font-black text-2xl tracking-tight text-[#e31837]">
                {settings.siteTitle || 'RoseDash'}
              </span>
            </div>
            <div 
              onClick={handleGetLocation}
              className={`flex items-center gap-1 text-[10px] text-gray-500 font-bold mt-1 cursor-pointer hover:text-[#e31837] ${isLocating ? 'animate-pulse' : ''}`}
            >
              <MapPin className="w-3 h-3 text-[#e31837]" />
              <span className="uppercase">{locationName}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-semibold text-gray-600">
            <Link to="/" className={`${location.pathname === '/' ? 'bg-[#e31837] text-white px-3 py-1.5 rounded' : 'hover:text-[#e31837] transition-colors'}`}>Home</Link>
            <Link to="/shop" className={`${location.pathname === '/shop' ? 'bg-[#e31837] text-white px-3 py-1.5 rounded' : 'hover:text-[#e31837] transition-colors'}`}>Shop</Link>
            <Link to="/offers" className={`${location.pathname === '/offers' ? 'bg-[#e31837] text-white px-3 py-1.5 rounded' : 'hover:text-[#e31837] transition-colors'}`}>Offers</Link>
            <Link to="/about" className={`${location.pathname === '/about' ? 'bg-[#e31837] text-white px-3 py-1.5 rounded' : 'hover:text-[#e31837] transition-colors'}`}>About</Link>
            <Link to="/support" className={`${location.pathname === '/support' ? 'bg-[#e31837] text-white px-3 py-1.5 rounded' : 'hover:text-[#e31837] transition-colors'}`}>Support</Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md items-center bg-gray-50 border border-gray-200 rounded-full overflow-hidden px-4 py-1.5">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input type="text" placeholder="Search groceries, dairy, snacks..." className="bg-transparent w-full outline-none text-sm text-gray-700" />
            <button className="text-[#e31837] p-1"><Search className="w-4 h-4" /></button>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4 lg:gap-6 min-w-max">
            {/* Download App */}
            <Link to="/app" className="hidden sm:flex text-[#e31837] hover:bg-red-50 p-2 rounded-full transition-colors border border-red-100">
              <Smartphone className="w-5 h-5" />
            </Link>

            {/* Cart Icon */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center text-gray-700 hover:text-[#e31837] transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#e31837] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Icon / Auth */}
            {isAuthenticated ? (
              <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 hover:border-red-200">
                <UserButton afterSignOutUrl="/" />
                <span 
                  onClick={() => navigate('/profile')} 
                  className="ml-2 text-sm font-semibold text-gray-700 hidden lg:block cursor-pointer hover:text-[#e31837]"
                >
                  {user?.name}
                </span>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 text-gray-700 hover:text-[#e31837] transition-colors font-semibold text-sm bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200"
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
          <div className="bg-gray-100 rounded-md h-10 flex items-center px-3 mb-4">
             <Search className="w-4 h-4 text-gray-500 mr-2" />
             <input type="text" placeholder="Search..." className="bg-transparent outline-none text-sm w-full" />
          </div>
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 py-2 border-b border-gray-200 text-gray-700 font-bold">
                <UserIcon className="w-5 h-5" />
                <span>{user?.name}</span>
              </div>
              <Link to={user?.role === 'admin' ? '/admin' : user?.role === 'delivery' ? '/delivery' : '/profile'} onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-brand-500 font-medium">Profile</Link>
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
            {CATEGORIES.map(cat => (
              <a key={cat} href={`#${cat.toLowerCase()}`} onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm text-gray-700 font-medium">
                {cat}
              </a>
            ))}
          </div>
        </nav>
      )}

      {/* Page Content */}
      <main className="flex-grow bg-[#f3f4f6]">
        <Outlet context={{ isMobileMenuOpen }} />
      </main>

      {/* Solid Red Footer */}
      <footer className="bg-[#b31b2e] text-white pt-16 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-red-800">
            
            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src={settings.logoUrl} alt="Logo" className="h-8 object-contain brightness-0 invert" />
                <span className="font-black text-2xl tracking-tighter text-white">
                  {settings.siteTitle || 'RoseDash'}
                </span>
              </div>
              <p className="text-sm text-red-100 mb-6 font-medium">
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
                  <span>15, Scheme No 54, PU4, Indore, Madhya Pradesh 452010, India</span>
                </li>
                <li className="flex gap-3 items-center">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>1800-267-4444</span>
                </li>
                <li className="flex gap-3 items-center">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>support@rosedash.com</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4">
             <p className="text-xs text-red-200">
                © {new Date().getFullYear()} {settings.siteTitle || 'RoseDash'}™ Ltd. All rights reserved.
             </p>
             <div className="flex gap-6 text-xs text-red-200 font-medium">
                 <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
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
              <div className="pointer-events-auto w-screen max-w-md transform transition-transform duration-300">
                <div className="flex h-full flex-col bg-white shadow-2xl border-l border-gray-200">
                  
                  {/* Header */}
                  <div className="px-6 py-6 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Your Shopping Bag</h3>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body Scrollable items list */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
                    {cartItems.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 gap-4">
                        <ShoppingBag className="w-16 h-16 text-gray-300 stroke-1" />
                        <div>
                          <h4 className="font-bold text-gray-800 mb-1">Your bag is empty</h4>
                          <p className="text-xs">Add items to it now.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="divide-y divide-gray-100 bg-white rounded-lg shadow-sm border border-gray-100 p-2">
                          {cartItems.map((item) => (
                            <div key={item.id} className="py-4 flex gap-4 items-center justify-between">
                              <div className="flex gap-3 items-start">
                                <img onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"; }} src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover border border-gray-200" />
                                <div>
                                  <h4 className="text-sm font-semibold leading-snug line-clamp-2 text-gray-800">
                                    {item.name}
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-1">₹{item.price}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center border border-gray-200 rounded px-2 py-1 gap-3 bg-white text-xs">
                                  <button onClick={() => dispatch(updateQuantity({ itemId: item.id, amount: -1 }))} className="hover:text-brand-500 p-0.5"><Minus className="w-3 h-3" /></button>
                                  <span className="font-bold min-w-4 text-center">{item.quantity}</span>
                                  <button onClick={() => dispatch(updateQuantity({ itemId: item.id, amount: 1 }))} className="hover:text-brand-500 p-0.5"><Plus className="w-3 h-3" /></button>
                                </div>
                                <span className="text-sm font-bold text-gray-900">₹{item.price * item.quantity}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Calculations & Checkout footer */}
                  {cartItems.length > 0 && (
                    <div className="border-t border-gray-200 px-6 py-6 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-10">
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span className="font-semibold text-gray-900">₹{subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span className="font-semibold text-gray-900">{subtotal >= 500 ? 'FREE' : '₹40'}</span>
                        </div>
                        {coupon && (
                          <div className="flex justify-between text-brand-500 font-semibold">
                            <span>Coupon "{coupon.code}"</span>
                            <span>-₹{coupon.discountAmount}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-black text-gray-900 border-t border-gray-200 pt-3 mt-2">
                          <span>Grand Total</span>
                          <span>₹{grandTotal}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          setIsCartOpen(false);
                          if (!isAuthenticated) {
                            navigate('/login?redirect=/checkout');
                          } else {
                            navigate('/checkout');
                          }
                        }}
                        className="w-full py-4 rounded bg-brand-500 hover:bg-brand-600 text-white font-bold text-center shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                      >
                        {isAuthenticated ? 'Proceed' : 'Login to Proceed'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-brand-500 text-white rounded-full shadow-xl hover:bg-brand-600 transition-all hover:-translate-y-1 z-50 flex items-center justify-center animate-in fade-in slide-in-from-bottom-4"
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
              By creating an account or logging in, you agree to RoseDash's <a href="#" className="text-[#971273] hover:underline">Terms of Use</a>, <a href="#" className="text-[#971273] hover:underline">Privacy Policy</a> and Shiprocket's <a href="#" className="text-[#971273] hover:underline">Terms of Use</a>, Privacy Policy and consent to the collection and use of your personal information/sensitive personal data or information.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserLayout;
