import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/cartSlice';
import { ChevronRight, Heart, MapPin, Store, CheckCircle, Smartphone, Truck, ShieldCheck, ThumbsUp } from 'lucide-react';
import { PRODUCTS } from '../../data/mockProducts';
import ProductCard from '../../components/common/ProductCard';

import imgFresh from '../../assets/Fruits & Vegetables.jpg';
import imgDairy from '../../assets/Dairy & Breakfast.jpg';
import imgPersonal from '../../assets/Personal Care.jpg';
import imgCleaning from '../../assets/Cleaning.jpg';
import imgGrocery from '../../assets/grocery.jpg';
import imgDrinks from '../../assets/Cold Drinks.jpg';
import imgHome from '../../assets/Home & Office.jpg';
import imgSweet from '../../assets/Sweet Cravings.jpg';
import imgHero from '../../assets/Hero Section1.jpg';
import imgMonsoonSale from '../../assets/monsoon.jpg';

import imgPackaging from '../../assets/Packaging Material.jpg';
import imgMasala from '../../assets/Masala, Salt & Sugar.jpg';
import imgChicken from '../../assets/Chicken & Eggs.jpg';
import imgSauces from '../../assets/Sauces & Seasoning.jpg';
import imgCanned from '../../assets/Canned & Imported Items.jpg';
import imgCustomPkg from '../../assets/Custom Packaging.jpg';
import imgOils from '../../assets/Edible Oils.jpg';
import imgFrozen from '../../assets/Frozen & Instant Food.jpg';
import imgFlours from '../../assets/Flours.jpg';
import imgPulses from '../../assets/Pulses.jpg';
import imgDryFruits from '../../assets/Dry Fruits & Nuts.jpg';
import imgRice from '../../assets/Rice & Rice Products.jpg';
import imgMutton from '../../assets/Mutton, Duck & Lamb.jpg';
import imgFish from '../../assets/Fish, Prawns & Seafood.jpg';
import imgKitchenware from '../../assets/Kitchenware.jpg';

export { PRODUCTS };

export const CATEGORIES = [
  { id: 'fresh', name: 'Fruits, Vegetables & Apples', image: imgFresh },
  { id: 'dairy', name: 'Dairy & Breakfast', image: imgDairy },
  { id: 'munchies', name: 'Grocery', image: imgGrocery },
  { id: 'drinks', name: 'Cold Drinks', image: imgDrinks },
  { id: 'sweet', name: 'Sweet Cravings', image: imgSweet },
  { id: 'home', name: 'Home & Office', image: imgHome },
  { id: 'cleaning', name: 'Cleaning', image: imgCleaning },
  { id: 'personal', name: 'Personal Care', image: imgPersonal },
  { id: 'packaging-material', name: 'Packaging Material', image: imgPackaging },
  { id: 'masala-salt-sugar', name: 'Masala, Salt & Sugar', image: imgMasala },
  { id: 'chicken-eggs', name: 'Chicken & Eggs', image: imgChicken },
  { id: 'sauces-seasoning', name: 'Sauces & Seasoning', image: imgSauces },
  { id: 'canned-imported', name: 'Canned & Imported Items', image: imgCanned },
  { id: 'custom-packaging', name: 'Custom Packaging', image: imgCustomPkg },
  { id: 'edible-oils', name: 'Edible Oils', image: imgOils },
  { id: 'frozen-food', name: 'Frozen & Instant Food', image: imgFrozen },
  { id: 'flours', name: 'Flours', image: imgFlours },
  { id: 'pulses', name: 'Pulses', image: imgPulses },
  { id: 'dry-fruits-nuts', name: 'Dry Fruits & Nuts', image: imgDryFruits },
  { id: 'rice', name: 'Rice & Rice Products', image: imgRice },
  { id: 'mutton-duck-lamb', name: 'Mutton, Duck & Lamb', image: imgMutton },
  { id: 'fish-seafood', name: 'Fish, Prawns & Seafood', image: imgFish },
  { id: 'kitchenware', name: 'Kitchenware', image: imgKitchenware },
];

export const STORES = [];
export const DINING_STORES = [];
export const MOCK_DISHES = [];

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <div className="bg-white">
      
      {/* Hero Banner */}
      <div className="w-full bg-[#f4f7f6] relative overflow-hidden h-[300px] md:h-[400px]">
        <div className="absolute inset-0 z-0">
          <img 
            src={imgHero} 
            alt="Groceries" 
            className="w-full h-full object-cover opacity-60 md:opacity-100 md:w-2/3 float-right"
            style={{ maskImage: 'linear-gradient(to right, transparent, black 40%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex flex-col justify-center">
          <div className="max-w-lg">
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight drop-shadow-md">All Product</h1>
            <p className="text-gray-700 font-bold mb-8 text-sm md:text-base bg-white/50 inline-block p-1 rounded">RoseDash Healthy Choice get all product from one app</p>
            <div>
              <button onClick={() => navigate('/shop')} className="bg-[#e31837] text-white px-8 py-3 rounded-full font-bold text-sm shadow-xl shadow-red-500/30 hover:bg-[#c8102e] transition-colors">Explore More</button>
            </div>
          </div>
        </div>
      </div>

      {/* Shop by category */}
      <div className="w-full bg-[#fdf8f8] py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-[#1a1b2e] mb-8">Shop by category</h2>
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-x-4 gap-y-8">
            {CATEGORIES.slice(0, 8).map(c => (
              <Link key={c.id} to={`/category/${c.id}`} className="flex flex-col items-center cursor-pointer group w-full">
                <div className="w-full aspect-square rounded-3xl bg-[#fff5f6] mb-3 overflow-hidden p-4 sm:p-6 transition-all group-hover:-translate-y-2 group-hover:shadow-lg group-hover:shadow-red-500/10 flex items-center justify-center">
                  <img src={c.image} alt={c.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-800 text-center tracking-tight leading-snug px-1">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Banners */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 flex flex-col gap-6">
        <div className="w-full h-48 md:h-64 rounded-3xl overflow-hidden relative shadow-lg group cursor-pointer">
           <img src={imgMonsoonSale} alt="Monsoon Sale" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
           <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-12">
             <span className="text-white font-bold tracking-widest text-sm mb-2">SPECIAL OFFER</span>
             <h2 className="text-5xl font-black text-white italic mb-4">monsoon<br/>sale</h2>
             <span className="text-red-400 font-bold text-xl mb-4">UPTO 45% OFF</span>
             <button onClick={() => navigate('/offers')} className="bg-[#e31837] text-white px-6 py-2 rounded-full font-bold text-sm w-max">Explore More</button>
           </div>
        </div>

        <div className="w-full h-32 md:h-40 rounded-3xl overflow-hidden relative shadow-lg group cursor-pointer bg-[#fff5f5]">
           <img src="https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1200&q=80" alt="Delicious Chocolate" className="absolute right-0 top-0 bottom-0 w-1/2 object-cover mask-image-gradient group-hover:scale-105 transition-transform duration-700" style={{ maskImage: 'linear-gradient(to right, transparent, black 20%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%)' }} />
           <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-12 z-10 w-full md:w-2/3">
             <span className="text-red-500 font-bold tracking-widest text-xs mb-1">NEW ARRIVALS</span>
             <h2 className="text-2xl font-black text-gray-900 mb-2">Delicious assorted chocolates</h2>
             <span onClick={() => navigate('/shop')} className="text-[#e31837] font-bold text-xs cursor-pointer hover:underline">Explore More &gt;</span>
           </div>
        </div>
      </div>

      {/* Popular Picks */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex justify-between items-end mb-6 border-b border-gray-200/60 pb-3">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Popular picks</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">Best selling items in your area</p>
          </div>
          <span onClick={() => navigate('/shop')} className="text-[#e31837] text-sm font-bold cursor-pointer hover:underline uppercase tracking-wide bg-red-50 px-3 py-1.5 rounded-full transition-colors">See all</span>
        </div>
        {/* Mobile: Horizontal Scroll, Desktop: Grid */}
        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {PRODUCTS.slice(0, 10).map((product) => (
            <div key={product.id} className="min-w-[160px] sm:min-w-0 w-[45vw] sm:w-auto shrink-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Hyperlocal Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-16">
        <div className="flex flex-col md:flex-row gap-8 items-stretch">
          <div className="flex-1 flex flex-col justify-center pr-0 md:pr-12">
            <span className="text-red-500 font-bold tracking-widest text-[10px] mb-4 bg-red-50 inline-block w-max px-2 py-1 rounded">FASTEST DELIVERY</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 leading-tight tracking-tight">
              Hyperlocal groceries, <span className="text-[#e31837]">hub-powered</span> delivery
            </h2>
            <p className="text-gray-500 mb-8 font-medium leading-relaxed text-sm">
              As the grocery delivery space continues to evolve, our hub-based model ensures fresh items, faster delivery, and cost-effective solutions. We process orders near you, making it super fast to get what you need, right when you need it.
            </p>
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('/shop')} className="bg-[#e31837] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-[#c8102e] transition-colors shadow-lg flex items-center gap-2">
                Start Shopping <ChevronRight className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <Truck className="w-5 h-5 text-[#e31837]" /> Free delivery on ₹500+
              </div>
            </div>
          </div>
          <div className="flex-1 bg-[#b31b2e] rounded-[40px] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <h3 className="text-2xl font-black mb-6 relative z-10 tracking-tight">Built for your neighborhood</h3>
            <p className="text-red-100 text-sm mb-8 leading-relaxed font-medium relative z-10">
              We operate exclusively through local hubs, meaning your groceries don't travel across the city. This means fresher produce and reliable delivery.
            </p>
            <ul className="space-y-4 relative z-10 text-sm font-bold">
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-red-200" /> The freshest quality produce</li>
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-red-200" /> Zero plastic environment model</li>
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-red-200" /> 10-20 minute rapid delivery</li>
            </ul>
            <button onClick={() => navigate('/about')} className="mt-8 text-white text-xs font-black uppercase tracking-widest border-b-2 border-red-300 pb-1 hover:border-white transition-colors relative z-10">Read more about us</button>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-[#fcfafb] py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-3">How it works</h2>
            <p className="text-sm font-bold text-gray-500">From tap to doorstep — the quickest and freshest delivery process.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
             <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 bg-red-50 text-[#e31837] rounded-xl flex items-center justify-center mb-6">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3">Get your choices</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">We source directly from farms & partners ensuring the best quality ingredients.</p>
             </div>
             
             <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 bg-red-50 text-[#e31837] rounded-xl flex items-center justify-center mb-6">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3">Secure payment</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">Pay seamlessly through UPI, cards, or wallets with 100% secure processing.</p>
             </div>

             <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 bg-red-50 text-[#e31837] rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3">Hub fulfillment</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">Orders process at your local hub making sure it reaches your door within minutes.</p>
             </div>

             <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 bg-red-50 text-[#e31837] rounded-xl flex items-center justify-center mb-6">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3">Packed & delivered</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">Riders deliver your packed order securely and safely to your exact location.</p>
             </div>
          </div>
        </div>
      </div>

      {/* Why shop with us */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-3">Why shop with us</h2>
            <p className="text-sm font-bold text-gray-500">Trusted by millions for our pristine quality and unmatched speed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="bg-[#fcfafb] border border-red-50 p-8 rounded-3xl flex flex-col items-center text-center hover:bg-red-50/50 transition-colors">
                <div className="w-14 h-14 bg-white shadow-sm border border-red-100 text-[#e31837] rounded-full flex items-center justify-center mb-6">
                  <ThumbsUp className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Premium Quality Assured</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">Every item goes through strict quality checks to ensure you get only the best produce and products.</p>
             </div>

             <div className="bg-[#fcfafb] border border-red-50 p-8 rounded-3xl flex flex-col items-center text-center hover:bg-red-50/50 transition-colors">
                <div className="w-14 h-14 bg-white shadow-sm border border-red-100 text-[#e31837] rounded-full flex items-center justify-center mb-6">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Superfast Dispatch</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">With localized hubs in your neighborhood, orders are processed and dispatched within seconds.</p>
             </div>

             <div className="bg-[#fcfafb] border border-red-50 p-8 rounded-3xl flex flex-col items-center text-center hover:bg-red-50/50 transition-colors">
                <div className="w-14 h-14 bg-white shadow-sm border border-red-100 text-[#e31837] rounded-full flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Transparent Pricing</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">No hidden charges, no surge pricing. You get exactly what you see with straightforward billing always.</p>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
