import React, { useState, useEffect } from 'react';
import { Tag, Copy, CheckCircle2, Percent, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../components/common/ProductCard';
import { PRODUCTS } from '../../data/mockProducts.js';
import API from '../../services/api.js';

const Offers = () => {
  const [copiedCoupon, setCopiedCoupon] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [offerBanner, setOfferBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoupons();
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    try {
      const res = await API.get('/banners/active');
      const offerBanners = res.data.filter(b => b.category === 'offer');
      if (offerBanners.length > 0) {
        setOfferBanner(offerBanners[0]);
      }
    } catch (err) {
      console.error("Failed to fetch offer banner", err);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await API.get('/coupons');
      setCoupons(res.data);
    } catch (err) {
      console.error("Failed to fetch coupons", err);
      // Fallback local mockup for design presentation
      setCoupons([
        { _id: 1, code: 'FRESH50', discountPercent: 50, maxDiscount: 250, minOrderValue: 499, title: '50% Off First Order', desc: 'Get 50% off on your first grocery order above ₹499.' },
        { _id: 2, code: 'FREEDEL', discountPercent: 100, maxDiscount: 40, minOrderValue: 199, title: 'Free Delivery', desc: 'Valid on all orders above ₹199. Limited time only.' },
        { _id: 3, code: 'WEEKEND20', discountPercent: 20, maxDiscount: 100, minOrderValue: 300, title: 'Weekend Special 20%', desc: 'Save big on snacks and beverages this weekend.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

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
      {offerBanner ? (
        <div className="relative w-full bg-slate-100 mb-8 cursor-pointer group" onClick={() => offerBanner.linkUrl && navigate(offerBanner.linkUrl)}>
          {offerBanner.imageUrl ? (
            <img src={offerBanner.imageUrl} alt={offerBanner.title} className="w-full h-auto max-h-[600px] object-contain" />
          ) : (
            <div className="w-full py-16 md:py-24 bg-gradient-to-br from-emerald-600 to-[#0a4733] flex flex-col items-center text-white text-center px-4">
              <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-md">{offerBanner.title}</h1>
              {offerBanner.subtitle && <p className="text-lg font-medium opacity-90 mb-8">{offerBanner.subtitle}</p>}
              {offerBanner.linkUrl && (
                <button className="bg-white text-emerald-800 px-8 py-3.5 rounded-xl font-bold shadow-lg hover:-translate-y-1 transition-all">Explore Offers</button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-[#0a4733] text-white py-16 md:py-24 shadow-lg shadow-emerald-500/20">
          {/* Subtle background patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-white blur-[100px] rounded-full transform -rotate-45"></div>
            <div className="absolute bottom-0 -right-1/4 w-1/2 h-full bg-white blur-[100px] rounded-full transform rotate-45"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-black tracking-widest uppercase mb-4 shadow-sm border border-white/30 text-emerald-50">Limited Time Only</span>
              <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tight drop-shadow-md">
                Monsoon <br/><span className="text-emerald-200 italic">Mega Sale</span>
              </h1>
              <p className="text-lg font-medium opacity-90 mb-8 max-w-md mx-auto md:mx-0">
                Stock up on your daily essentials with massive discounts and exclusive coupon codes.
              </p>
              <button onClick={() => navigate('/shop')} className="bg-white text-emerald-800 px-8 py-3.5 rounded-xl font-bold tracking-wide shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-gray-50 hover:-translate-y-1 transition-all">
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
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        
        {/* Coupon Codes Section */}
        <div className="mb-16 mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 px-4 py-6 bg-white rounded-3xl border border-emerald-100 shadow-sm">
            <div className="p-3 bg-emerald-50 rounded-2xl">
              <Tag className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Available Coupons</h2>
              <p className="text-sm font-semibold text-slate-500 mt-1">Tap to copy and apply at checkout for instant savings.</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 py-10 text-center text-slate-400 font-bold animate-pulse">Finding best coupons...</div>
            ) : coupons.length === 0 ? (
              <div className="col-span-3 py-10 text-center text-slate-400 font-bold bg-white rounded-3xl border border-dashed border-emerald-200">No active coupons available right now. Check back later!</div>
            ) : coupons.map((coupon, i) => {
              const colors = ['bg-emerald-500', 'bg-teal-600', 'bg-green-600', 'bg-cyan-600'];
              const accentColor = colors[i % colors.length];
              
              return (
              <div key={coupon._id} className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all group flex flex-col relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${accentColor}`}></div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-2">{coupon.title || `${coupon.discountPercent}% OFF`}</h3>
                <p className="text-sm text-gray-500 font-medium mb-6 flex-grow">{coupon.desc || `Get ${coupon.discountPercent}% off on orders above ₹${coupon.minOrderValue || 0}.`}</p>
                
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between">
                  <span className="font-mono font-black text-emerald-700 text-lg tracking-wider">{coupon.code}</span>
                  <button 
                    onClick={() => handleCopy(coupon.code)}
                    className="p-2 bg-white rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-100 transition-colors shadow-sm"
                  >
                    {copiedCoupon === coupon.code ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Top Deals Section */}
        <div>
          <div className="flex items-center justify-between mb-6 px-2 border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-emerald-600" />
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Top Deals for You</h2>
            </div>
            <span onClick={() => navigate('/shop')} className="text-emerald-600 text-sm font-bold uppercase tracking-wide cursor-pointer hover:underline">View All</span>
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
