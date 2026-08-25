import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ChevronRight, Smartphone, Store, Truck, ShieldCheck, ThumbsUp } from 'lucide-react';
import ProductCard from '../../components/common/ProductCard';
import { useSettings } from '../../context/SettingsContext';
import imgMonsoonSale from '../../assets/monsoon.jpg';
import { PRODUCTS } from '../../data/mockProducts';

// fallback image for hero
const imgHero = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop';



const Home = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [heroBanners, setHeroBanners] = useState([]);
  const [promoBanners, setPromoBanners] = useState([]);
  const [featuredStores, setFeaturedStores] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // For weekly best selling filter
  const [selectedWeeklyCategory, setSelectedWeeklyCategory] = useState('All');

  const fetchData = useCallback(async () => {
    try {
      const { default: API } = await import('../../services/api.js');
      const [bannersRes, productsRes, categoriesRes, storesRes] = await Promise.all([
        API.get('/banners/active'),
        API.get('/products'),
        API.get('/products/categories'),
        API.get('/stores?featured=true')
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
      setFeaturedStores(storesRes.data);

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

  // Slicing products for the sections
  const youMightNeedProducts = allProducts.slice(0, 20); // First 20
  const mostSellingProducts = allProducts.slice(60, 80); // Most selling
  // Filter weekly products based on selection
  const filteredWeeklyProducts = selectedWeeklyCategory === 'All'
    ? allProducts.slice(20, 40)
    : allProducts.filter(product => {
        // Simple substring match for simulation
        const pCat = (product.category?.name || product.category || '').toLowerCase();
        const sCat = selectedWeeklyCategory.toLowerCase();
        
        if (sCat === 'fruits & vegetables') return pCat.includes('fruit') || pCat.includes('vegetable');
        if (sCat === 'snacks') return pCat.includes('munchies') || pCat.includes('biscuit') || pCat.includes('snack');
        if (sCat === 'chicken & meat') return pCat.includes('chicken') || pCat.includes('mutton') || pCat.includes('meat');
        if (sCat === 'dairy & milk') return pCat.includes('dairy') || pCat.includes('milk') || pCat.includes('breakfast');
        return pCat.includes(sCat);
      }).slice(0, 20); // Take up to 20 from the filtered pool

  return (
    <div className="bg-[#f9fafb] min-h-screen pb-20">
      
      {/* Hero Section (Pinterest Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-[#0a4733] rounded-[30px] w-full overflow-hidden relative flex flex-col md:flex-row items-center justify-between p-10 md:p-16 h-auto md:h-[350px]">
          
          <div className="relative z-10 flex flex-col items-start w-full md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              We bring the store<br/>to your door
            </h1>
            <p className="text-green-100 font-medium mb-8 text-sm md:text-base">
              Get organic produce and sustainably sourced groceries delivery at up to 40% off grocery.
            </p>
            <button onClick={() => navigate(mainHero?.linkUrl || '/shop')} className="bg-[#8ec252] text-[#0a4733] px-8 py-3 rounded-full font-bold shadow-lg hover:bg-[#7cb044] transition-colors">
              Shop now
            </button>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:block">
            {/* The mask makes the image fade into the green background seamlessly on the left side */}
            <img 
              src={mainHero?.imageUrl || imgHero} 
              alt="Groceries" 
              className="w-full h-full object-cover opacity-90"
              style={{ maskImage: 'linear-gradient(to right, transparent, black 40%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }}
            />
          </div>
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.map((cat, index) => (
            <div 
              key={cat._id}
              onClick={() => navigate(`/category/${cat._id}`)}
              className="min-w-[200px] flex-shrink-0 bg-white rounded-[20px] p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow border border-gray-100 snap-start"
            >
              <img 
                src={cat.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e'} 
                alt={cat.name} 
                className="w-12 h-12 rounded-full object-cover border border-gray-100"
              />
              <div className="flex flex-col">
                <span className="font-bold text-sm text-gray-800 line-clamp-1">{cat.name}</span>
                <span className="text-xs text-gray-400">Shop now</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* You Might Need */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900">You might need</h2>
          <span onClick={() => navigate('/products')} className="text-gray-500 text-sm font-semibold cursor-pointer hover:text-[#0a4733] flex items-center gap-1">
            See more <ChevronRight className="w-4 h-4"/>
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
          <h2 className="text-2xl font-black text-gray-900">Featured Stores</h2>
          <span onClick={() => navigate('/stores')} className="text-gray-500 text-sm font-semibold cursor-pointer hover:text-[#0a4733] flex items-center gap-1">
            See more <ChevronRight className="w-4 h-4"/>
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredStores.length > 0 ? featuredStores.map(store => (
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
            <div className="col-span-full py-8 text-center text-slate-500 font-medium">No featured stores available.</div>
          )}
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

      {/* Banners (Colorful Grid Style) */}
      {promoBanners.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {promoBanners.map((banner, index) => {
              const bgColors = ['bg-[#fdf0f2]', 'bg-[#fff5e6]', 'bg-[#f0f9ff]', 'bg-[#f5f0ff]'];
              const textColors = ['text-[#d84451]', 'text-[#d97706]', 'text-[#0284c7]', 'text-[#7e22ce]'];
              return (
                <div key={banner._id} className={`${bgColors[index % 4]} rounded-[20px] p-6 flex flex-col justify-between h-48 cursor-pointer relative overflow-hidden`} onClick={() => banner.linkUrl && navigate(banner.linkUrl)}>
                  <div className="z-10 w-2/3">
                    <h3 className={`text-xl font-black ${textColors[index % 4]} mb-2`}>{banner.title}</h3>
                    <p className="text-xs font-semibold text-gray-600 line-clamp-3">{banner.subtitle}</p>
                  </div>
                  <img src={banner.imageUrl} alt={banner.title} className="absolute -right-4 -bottom-4 w-32 h-32 object-contain mix-blend-multiply opacity-80" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Most Selling Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900">Most selling products</h2>
          <span onClick={() => navigate('/products')} className="text-gray-500 text-sm font-semibold cursor-pointer hover:text-[#0a4733] flex items-center gap-1">
            See more <ChevronRight className="w-4 h-4"/>
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
          <span onClick={() => navigate('/products')} className="text-gray-500 text-sm font-semibold cursor-pointer hover:text-[#0a4733] flex items-center gap-1">
            See more <ChevronRight className="w-4 h-4"/>
          </span>
        </div>
        
        {/* Category Pills */}
        <div className="flex overflow-x-auto gap-3 pb-4 mb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
           {['All', 'Fruits & Vegetables', 'Snacks', 'Chicken & Meat', 'Dairy & Milk'].map((pill, i) => (
             <div 
                key={i} 
                onClick={() => setSelectedWeeklyCategory(pill)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${selectedWeeklyCategory === pill ? 'bg-[#0a4733] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
             >
               {pill}
             </div>
           ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
