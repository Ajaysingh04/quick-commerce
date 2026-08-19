import React, { useState } from 'react';
import { Tag, Copy, CheckCircle2, Percent, Clock } from 'lucide-react';
import ProductCard from '../../components/common/ProductCard';
import { PRODUCTS } from './Home';

const Offers = () => {
  const [copiedCoupon, setCopiedCoupon] = useState(null);

  const coupons = [
    { id: 1, code: 'ROSE50', title: '50% Off First Order', desc: 'Get 50% off on your first grocery order above ₹499.', color: 'bg-red-500' },
    { id: 2, code: 'FREEDEL', title: 'Free Delivery', desc: 'Valid on all orders above ₹199. Limited time only.', color: 'bg-rose-600' },
    { id: 3, code: 'WEEKEND20', title: 'Weekend Special 20%', desc: 'Save big on snacks and beverages this weekend.', color: 'bg-pink-600' },
  ];

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  // Get products with some logic to simulate discounts
  const discountedProducts = PRODUCTS.slice(0, 10).map((p, idx) => ({
    ...p,
    discount: idx % 2 === 0 ? '20% OFF' : '15% OFF',
    originalPrice: p.price + Math.floor(p.price * 0.25)
  }));

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#e31837] via-[#d61330] to-[#b30f26] text-white py-16 md:py-24 shadow-lg shadow-red-500/20">
        {/* Subtle background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-white blur-[100px] rounded-full transform -rotate-45"></div>
          <div className="absolute bottom-0 -right-1/4 w-1/2 h-full bg-white blur-[100px] rounded-full transform rotate-45"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold tracking-widest uppercase mb-4 shadow-sm border border-white/30">Limited Time Only</span>
            <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tight drop-shadow-md">
              Monsoon <br/><span className="text-red-200 italic">Mega Sale</span>
            </h1>
            <p className="text-lg font-medium opacity-90 mb-8 max-w-md mx-auto md:mx-0">
              Stock up on your daily essentials with massive discounts and exclusive coupon codes.
            </p>
            <button className="bg-white text-[#e31837] px-8 py-3.5 rounded-xl font-bold tracking-wide shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-gray-50 hover:-translate-y-1 transition-all">
              Shop Now
            </button>
          </div>
          <div className="md:w-1/2 flex justify-center relative">
            <div className="relative w-64 h-64 md:w-80 md:h-80 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-2xl flex items-center justify-center animate-pulse">
               <Percent className="w-32 h-32 md:w-40 md:h-40 text-white opacity-80" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        
        {/* Coupon Codes Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6 px-2">
            <Tag className="w-6 h-6 text-[#e31837]" />
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Available Coupons</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {coupons.map(coupon => (
              <div key={coupon.id} className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm hover:shadow-xl hover:shadow-red-500/10 transition-all group flex flex-col relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${coupon.color}`}></div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-2">{coupon.title}</h3>
                <p className="text-sm text-gray-500 font-medium mb-6 flex-grow">{coupon.desc}</p>
                
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center justify-between">
                  <span className="font-mono font-black text-[#e31837] text-lg tracking-wider">{coupon.code}</span>
                  <button 
                    onClick={() => handleCopy(coupon.code)}
                    className="p-2 bg-white rounded-lg text-gray-500 hover:text-[#e31837] hover:bg-red-100 transition-colors shadow-sm"
                  >
                    {copiedCoupon === coupon.code ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Deals Section */}
        <div>
          <div className="flex items-center justify-between mb-6 px-2 border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-[#e31837]" />
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Top Deals for You</h2>
            </div>
            <span className="text-[#e31837] text-sm font-bold uppercase tracking-wide cursor-pointer hover:underline">View All</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {discountedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Offers;
