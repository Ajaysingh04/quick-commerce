import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ChevronRight, ChevronLeft, Smartphone, Store, Truck, ShieldCheck, ThumbsUp, ShoppingBag } from 'lucide-react';
import ProductCard from '../../components/common/ProductCard';
import { useSettings } from '../../context/SettingsContext';
const imgMonsoonSale = '/assets/monsoon.jpg';
import { PRODUCTS } from '../../data/mockProducts';

// fallback image for hero
const imgHero = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop';



const Home = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [heroBanners, setHeroBanners] = useState([]);
  const [promoBanners, setPromoBanners] = useState([]);
  const [allStores, setAllStores] = useState([]);
  const [showAllStores, setShowAllStores] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // For weekly best selling filter
  const [selectedWeeklyCategory, setSelectedWeeklyCategory] = useState('All');

  const activeHeroBanners = heroBanners.filter(b => b.isActive !== false);
  const heroImages = activeHeroBanners.length > 0 
    ? activeHeroBanners.map(b => b.imageUrl)
    : ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop'];

  // For Hero Slider
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const fetchData = useCallback(async () => {
    try {
      const { default: API } = await import('../../services/api.js');
      const [bannersRes, productsRes, categoriesRes, storesRes] = await Promise.all([
        API.get('/banners/active'),
        API.get('/products?limit=100'),
        API.get('/products/categories'),
        API.get('/stores')
      ]);
      
      const banners = bannersRes.data;
      const homeBanners = banners.filter(b => !b.category || b.category === 'home');
      setHeroBanners(homeBanners.filter(b => b.position === 'hero'));
      setPromoBanners(homeBanners.filter(b => b.position === 'promotional'));

      setCategories(categoriesRes.data);

      const fetchedProducts = productsRes.data.map(p => ({
        ...p,
        id: p._id || p.id
      }));
      setAllProducts(fetchedProducts);
      setAllStores(storesRes.data);

    } catch (error) {
      console.error('Failed to fetch home data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socket.on('contentUpdated', (data) => {
      console.log('Real-time update received:', data);
      fetchData();
    });

    return () => socket.disconnect();
  }, [fetchData]);

  const mainHero = heroBanners.length > 0 ? heroBanners[0] : null;



  // Slicing products for the sections to 12 (divisible by 2, 3, 4, 6 columns perfectly)
  const youMightNeedProducts = allProducts.slice(0, 12);
  const mostSellingProducts = allProducts.slice(12, 24);
  
  // Filter weekly products based on selection
  const filteredWeeklyProducts = selectedWeeklyCategory === 'All'
    ? allProducts.slice(24, 36)
    : allProducts.filter(product => {
        // Simple substring match for simulation
        const pCat = (product.category?.name || product.category || '').toLowerCase();
        const sCat = selectedWeeklyCategory.toLowerCase();
        
        if (sCat === 'fruits & vegetables') return pCat.includes('fruit') || pCat.includes('vegetable');
        if (sCat === 'snacks') return pCat.includes('munchies') || pCat.includes('biscuit') || pCat.includes('snack');
        if (sCat === 'chicken & meat') return pCat.includes('chicken') || pCat.includes('mutton') || pCat.includes('meat');
        if (sCat === 'dairy & milk') return pCat.includes('dairy') || pCat.includes('milk') || pCat.includes('breakfast');
        return pCat.includes(sCat);
      }).slice(0, 12); // Take exactly 12 from the filtered pool

  return (
    <div className="bg-[#f9fafb] min-h-screen pb-20">
      
      {/* Hero Section */}
      <div className="bg-[#f8f9fa] w-full py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative flex flex-col md:flex-row items-center justify-between">
          <div className="relative z-10 flex flex-col items-start w-full md:w-1/2">
            <div className="bg-white px-4 py-1.5 rounded-full font-bold text-sm text-gray-600 shadow-sm flex items-center gap-2 mb-6">
              <ShoppingBag className="w-4 h-4 text-brand-500" /> The Best Online Grocery Store
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 leading-[1.1]">
              Your One-Stop Shop<br/>for <span className="text-brand-500">Quality Groceries</span>
            </h1>
            <p className="text-gray-500 font-medium mb-8 text-base">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.
            </p>
            <div className="flex items-center gap-6">
              <button onClick={() => navigate(mainHero?.linkUrl || '/shop')} className="bg-brand-500 text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:bg-brand-600 transition-colors flex items-center gap-2">
                Shop Now <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/products')} className="text-gray-600 font-bold hover:text-brand-500 transition-colors underline underline-offset-4 decoration-gray-300">
                View All Products
              </button>
            </div>
            <div className="mt-8 flex items-center gap-4 bg-white/60 p-3 rounded-xl border border-gray-100">
               <div className="flex -space-x-2">
                 <img src="https://i.pravatar.cc/100?img=1" className="w-8 h-8 rounded-full border-2 border-white"/>
                 <img src="https://i.pravatar.cc/100?img=2" className="w-8 h-8 rounded-full border-2 border-white"/>
                 <img src="https://i.pravatar.cc/100?img=3" className="w-8 h-8 rounded-full border-2 border-white"/>
                 <div className="w-8 h-8 rounded-full bg-accent-yellow flex items-center justify-center text-xs font-bold text-slate-800 border-2 border-white">+</div>
               </div>
               <div>
                 <p className="font-bold text-sm text-gray-900">4.8 Ratings+</p>
                 <p className="text-xs text-gray-500">Trusted by 75k+ Customers</p>
               </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 mt-10 md:mt-0 flex justify-end relative">
             {/* Decorative pills */}
             <div className="absolute top-10 -left-10 bg-white px-4 py-2 rounded-full shadow-lg font-bold text-sm text-gray-700 flex items-center gap-2 z-20">
               <ShieldCheck className="w-4 h-4 text-brand-500"/> Secure Payment
             </div>
             <div className="absolute bottom-10 left-10 bg-white px-4 py-2 rounded-full shadow-lg font-bold text-sm text-gray-700 flex items-center gap-2 z-20">
               <Truck className="w-4 h-4 text-brand-500"/> Fast Delivery
             </div>
             <img 
              src={heroImages[currentSlide]} 
              alt="Groceries" 
              className="w-[90%] h-[350px] object-cover rounded-3xl shadow-xl z-10 transition-all duration-500 ease-in-out"
             />
             
             {/* Slider Navigation Arrows */}
             <button 
               onClick={(e) => { e.stopPropagation(); setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length); }}
               className="absolute top-1/2 left-[5%] md:-left-4 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg z-20 text-brand-500 hover:bg-brand-500 hover:text-white transition-all hover:scale-110"
             >
               <ChevronLeft className="w-6 h-6" />
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); setCurrentSlide((prev) => (prev + 1) % heroImages.length); }}
               className="absolute top-1/2 right-[15%] md:-right-4 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg z-20 text-brand-500 hover:bg-brand-500 hover:text-white transition-all hover:scale-110"
             >
               <ChevronRight className="w-6 h-6" />
             </button>
             
             {/* Slider dots */}
             <div className="absolute bottom-4 right-[45%] flex gap-2 z-20 bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
               {heroImages.map((_, idx) => (
                 <button 
                   key={idx} 
                   onClick={() => setCurrentSlide(idx)}
                   className={`h-2 rounded-full transition-all ${currentSlide === idx ? 'bg-brand-500 w-4' : 'bg-gray-400 w-2 hover:bg-brand-400'}`}
                 />
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Categories Circular Scroll */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-16 text-center">
        <h4 className="text-sm font-semibold text-gray-500 tracking-wider mb-2">Categories</h4>
        <h2 className="text-3xl font-black text-gray-900 mb-10">Featured <span className="text-brand-500">Categories</span></h2>
        
        <div className="flex overflow-x-auto gap-8 pb-4 justify-start md:justify-center scrollbar-hide snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.slice(0, 8).map((cat, index) => (
            <div 
              key={cat._id || index}
              onClick={() => navigate(`/category/${cat._id}`)}
              className="flex flex-col items-center gap-4 cursor-pointer group snap-start"
            >
              <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center p-4 transition-transform group-hover:scale-105 border border-gray-100 shadow-sm">
                <img 
                  src={cat.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e'} 
                  alt={cat.name} 
                  className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm"
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-sm text-gray-800">{cat.name}</span>
                <span className="text-xs text-gray-400 mt-1">{Math.floor(Math.random() * 50) + 10} Products</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* You Might Need */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900">You might need</h2>
          <span onClick={() => navigate('/products')} className="text-gray-500 text-sm font-semibold cursor-pointer hover:text-brand-500 flex items-center gap-1">
            See more <ChevronRight className="w-4 h-4"/>
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-6">
          {youMightNeedProducts.length > 0 ? (
            youMightNeedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-10 text-center text-slate-500 font-semibold bg-white rounded-3xl border border-slate-100">
              No products found. Add items to inventory.
            </div>
          )}
        </div>
      </div>

      {/* Featured Stores */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900">{showAllStores ? 'All Stores' : 'Featured Stores'}</h2>
          <span onClick={() => setShowAllStores(!showAllStores)} className="text-gray-500 text-sm font-semibold cursor-pointer hover:text-brand-500 flex items-center gap-1">
            {showAllStores ? 'See less' : 'See more'} <ChevronRight className={`w-4 h-4 transition-transform ${showAllStores ? 'rotate-90' : ''}`}/>
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(() => {
            const displayedStores = showAllStores ? allStores : allStores.filter(store => store.featured);
            return displayedStores.length > 0 ? displayedStores.map(store => (
              <div key={store._id} className="bg-white rounded-[20px] p-4 flex gap-4 items-center cursor-pointer hover:shadow-md transition-shadow border border-gray-100">
                <img src={store.bannerImage || store.image} alt={store.name} className="w-16 h-16 rounded-full object-cover" />
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800">{store.name}</span>
                  <span className="text-xs text-gray-500">{store.category || store.cuisineTypes?.[0] || 'Store'}</span>
                  <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-gray-600">
                    <span className="text-yellow-500">★</span> {store.rating || '4.5'}
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-8 text-center text-slate-500 font-medium">No stores available.</div>
            );
          })()}
        </div>
      </div>

      {/* Festival Offer Dynamic Wide Banner */}
      {settings?.festivalOffer?.isActive && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="bg-[#fff4e5] rounded-[30px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/offers')}>
            <div className="relative z-10 w-full md:w-3/5">
              <span className="bg-[#ff4d4f] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
                {settings.festivalOffer.festivalName || 'Mega Sale'}
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-[#d97706] mb-3 leading-tight">
                {settings.festivalOffer.title || 'Up to 70% OFF'}
              </h2>
              <p className="text-gray-700 font-medium mb-6 max-w-md">
                {settings.festivalOffer.description || 'Stock up on your daily essentials.'}
              </p>
              <button className="bg-[#d97706] text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-[#b45309] transition-colors">
                {settings.festivalOffer.buttonText || 'Shop the Sale'}
              </button>
            </div>
            <div className="absolute right-0 bottom-0 md:w-2/5 h-full flex justify-end opacity-20 md:opacity-100">
               <img 
                src={settings.festivalOffer.imageUrl || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&h=400&fit=crop'} 
                alt="Festival Offer" 
                className="w-full h-full object-cover mix-blend-multiply rounded-r-[30px]" 
                style={{ maskImage: 'linear-gradient(to right, transparent, black 40%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }} 
               />
            </div>
          </div>
        </div>
      )}

      {/* Promo Banners (2 Column Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Promo */}
          <div className="bg-[#f4f5f7] rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden h-[280px]">
             <div className="relative z-10 w-3/5">
                <span className="bg-accent-yellow text-slate-800 text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">Flat 20% Discount</span>
                <h3 className="text-3xl font-black text-gray-900 mb-3 leading-tight">Purely Fresh<br/>Vegetables</h3>
                <p className="text-xs text-gray-500 mb-6 w-4/5">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <button className="bg-brand-500 text-white px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-brand-600 transition-colors w-max">
                  Shop Now <ChevronRight className="w-4 h-4"/>
                </button>
             </div>
             <img src="https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&h=400&fit=crop" alt="Vegetables" className="absolute right-0 bottom-0 top-0 h-full w-2/5 object-cover mix-blend-multiply" style={{ maskImage: 'linear-gradient(to right, transparent, black 40%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }} />
          </div>
          {/* Right Promo */}
          <div className="bg-accent-yellow rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden h-[280px]">
             <div className="relative z-10 w-3/5">
                <span className="bg-white/40 text-slate-800 text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block backdrop-blur-sm border border-white/20">Flat 25% Discount</span>
                <h3 className="text-3xl font-black text-gray-900 mb-3 leading-tight">Fresh Fruits,<br/>Pure Quality</h3>
                <p className="text-xs text-slate-800/70 mb-6 w-4/5">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <button className="bg-brand-500 text-white px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-brand-600 transition-colors w-max">
                  Shop Now <ChevronRight className="w-4 h-4"/>
                </button>
             </div>
             <img src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&h=400&fit=crop" alt="Fruits" className="absolute right-0 bottom-0 top-0 h-full w-2/5 object-cover mix-blend-multiply" style={{ maskImage: 'linear-gradient(to right, transparent, black 40%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }} />
          </div>
        </div>
      </div>

      {/* Most Selling Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900">Most selling products</h2>
          <span onClick={() => navigate('/products')} className="text-gray-500 text-sm font-semibold cursor-pointer hover:text-brand-500 flex items-center gap-1">
            See more <ChevronRight className="w-4 h-4"/>
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-6">
          {mostSellingProducts.length > 0 ? (
            mostSellingProducts.map((product) => (
              <ProductCard key={product.id + '_most'} product={product} />
            ))
          ) : (
            <div className="col-span-full py-10 text-center text-slate-500 font-semibold bg-white rounded-3xl border border-slate-100">
              No products found for this section.
            </div>
          )}
        </div>
      </div>

      {/* Weekly Best Selling Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900">Weekly best selling items</h2>
          <span onClick={() => navigate('/products')} className="text-gray-500 text-sm font-semibold cursor-pointer hover:text-brand-500 flex items-center gap-1">
            See more <ChevronRight className="w-4 h-4"/>
          </span>
        </div>
        
        {/* Category Pills */}
        <div className="flex overflow-x-auto gap-3 pb-4 mb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
           {['All', 'Fruits & Vegetables', 'Snacks', 'Chicken & Meat', 'Dairy & Milk'].map((pill, i) => (
             <div 
                key={i} 
                onClick={() => setSelectedWeeklyCategory(pill)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${selectedWeeklyCategory === pill ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
             >
               {pill}
             </div>
           ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-6">
          {filteredWeeklyProducts.length > 0 ? (
            filteredWeeklyProducts.map((product) => (
              <ProductCard key={product.id + '_weekly'} product={product} />
            ))
          ) : (
            <div className="col-span-full py-10 text-center text-slate-500 font-semibold bg-white rounded-3xl border border-slate-100">
              No products found for this category.
            </div>
          )}
        </div>
      </div>

      {/* App Download Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-8">
        <div className="bg-[#602741] rounded-[30px] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
          <div className="relative z-10 w-full md:w-1/2 flex flex-col items-start text-white">
            <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight tracking-tight">Stay Home and Get All<br/>Your Essentials From<br/>Our Market!</h2>
            <p className="text-sm font-medium opacity-80 mb-8">Download the app from app store or google play</p>
            <div className="flex gap-4">
              <a href="#" className="hover:opacity-80 transition-opacity bg-black rounded p-1">
                <img src="https://b.zmtcdn.com/data/webuikit/23e930757c3df49840c482a8638bf5c31556001144.png" alt="App Store" className="h-10 object-contain" />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity bg-black rounded p-1">
                <img src="https://b.zmtcdn.com/data/webuikit/9f0c85a5e33adb783fa0aef667075f9e1556003622.png" alt="Google Play" className="h-10 object-contain" />
              </a>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 md:w-1/2 h-full flex justify-end">
            {/* Adding a generic image to mimic the delivery person/groceries from the video banner */}
            <img src="https://i.pinimg.com/736x/25/35/d8/2535d8cbcdce20ec59a5e691ff8600db.jpg" alt="Delivery" className="object-cover md:object-contain w-full h-full translate-y-4 md:translate-y-10" />
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
