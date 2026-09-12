import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Clock3,
  Flame,
  MapPin,
  Play,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Truck,
  Zap,
  TrendingUp,
  Percent,
} from 'lucide-react';
import ProductCard from '../../components/common/ProductCard';
import { useSettings } from '../../context/SettingsContext';

const heroFallback =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80';

const Home = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [heroBanners, setHeroBanners] = useState([]);
  const [allStores, setAllStores] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeeklyCategory, setSelectedWeeklyCategory] = useState('All');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Countdown timer simulation for Flash Deal
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 3, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeHeroBanners = heroBanners.filter((b) => b.isActive !== false);
  const heroImages = activeHeroBanners.length > 0
    ? activeHeroBanners.map((b) => b.imageUrl).filter(Boolean)
    : [heroFallback];

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const fetchData = useCallback(async () => {
    try {
      const { default: API } = await import('../../services/api.js');
      const [bannersRes, productsRes, categoriesRes, storesRes] = await Promise.all([
        API.get('/banners/active').catch(() => ({ data: [] })),
        API.get('/products?limit=100').catch(() => ({ data: [] })),
        API.get('/products/categories').catch(() => ({ data: [] })),
        API.get('/stores').catch(() => ({ data: [] })),
      ]);

      const banners = bannersRes.data || [];
      const homeBanners = banners.filter((b) => !b.category || b.category === 'home');
      setHeroBanners(homeBanners.filter((b) => b.position === 'hero'));

      const rawCategories = categoriesRes.data || [];
      const desiredOrder = [
        'fruits & vegetables',
        'dairy & breakfast',
        'munchies',
        'cold drinks',
        'sweet cravings',
        'chicken & eggs',
        'cleaning',
        'frozen & instant food',
        'dry fruits & nuts',
      ];

      const filteredCategories = rawCategories.filter((cat) => {
        const name = (cat.name || '').toLowerCase().trim();
        return name !== 'vegetables';
      });

      const sortedCategories = [...filteredCategories].sort((a, b) => {
        const aName = (a.name || '').toLowerCase().trim();
        const bName = (b.name || '').toLowerCase().trim();

        let aIndex = desiredOrder.findIndex((cat) => aName.includes(cat.split(' ')[0]) || cat.includes(aName.split(' ')[0]));
        let bIndex = desiredOrder.findIndex((cat) => bName.includes(cat.split(' ')[0]) || cat.includes(bName.split(' ')[0]));

        const aExact = desiredOrder.indexOf(aName);
        const bExact = desiredOrder.indexOf(bName);
        if (aExact !== -1) aIndex = aExact;
        if (bExact !== -1) bIndex = bExact;

        if (aIndex === -1) aIndex = 999;
        if (bIndex === -1) bIndex = 999;

        return aIndex - bIndex;
      });

      setCategories(sortedCategories);
      setAllProducts((productsRes.data || []).map((p) => ({ ...p, id: p._id || p.id })));
      setAllStores(storesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch home data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const getSocketUrl = () => {
      const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      if (isLocalhost) return 'http://localhost:5000';
      return import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    };

    const socket = io(getSocketUrl());
    socket.on('contentUpdated', () => fetchData());

    return () => socket.disconnect();
  }, [fetchData]);

  const youMightNeedProducts = allProducts.slice(0, 6);
  const mostSellingProducts = allProducts.slice(6, 12);
  const filteredWeeklyProducts = selectedWeeklyCategory === 'All'
    ? allProducts.slice(12, 18)
    : allProducts.filter((product) => {
        const pCat = (product.category?.name || product.category || '').toLowerCase();
        const sCat = selectedWeeklyCategory.toLowerCase();

        if (sCat === 'fruits & vegetables') return pCat.includes('fruit') || pCat.includes('vegetable');
        if (sCat === 'snacks') return pCat.includes('munchies') || pCat.includes('biscuit') || pCat.includes('snack');
        if (sCat === 'chicken & meat') return pCat.includes('chicken') || pCat.includes('mutton') || pCat.includes('meat');
        if (sCat === 'dairy & milk') return pCat.includes('dairy') || pCat.includes('milk') || pCat.includes('breakfast');
        return pCat.includes(sCat);
      }).slice(0, 6);

  const categoryHighlights = [
    { name: 'Fresh Picks', count: '120+', icon: Sparkles, color: 'from-emerald-500/20 via-emerald-500/10 to-transparent', accent: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'Express Delivery', count: '10-15 min', icon: Truck, color: 'from-sky-500/20 via-sky-500/10 to-transparent', accent: 'text-sky-400', bg: 'bg-sky-500/10' },
    { name: 'Top Rated Quality', count: '4.9/5', icon: Star, color: 'from-amber-500/20 via-amber-500/10 to-transparent', accent: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-5 sm:px-6 lg:px-8">
        
        {/* HERO SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[36px] border border-slate-800/80 bg-[#0B132B] text-white shadow-[0_30px_90px_rgba(11,19,43,0.35)]"
        >
          {/* Ambient Glowing Orbs */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />

          <div className="relative grid gap-8 px-6 py-8 sm:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:py-12">
            
            {/* Left Content */}
            <div className="relative z-10 flex flex-col justify-center">
              <div className="mb-4 inline-flex w-max items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-black tracking-wide text-emerald-300 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-spin-slow" />
                <span>FRESH • FAST • 10-MIN DELIVERY</span>
              </div>

              <h1 className="max-w-xl text-3xl font-black leading-[1.05] tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                Daily essentials <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  delivered in 10 mins.
                </span>
              </h1>

              <p className="mt-4 max-w-lg text-sm font-medium leading-relaxed text-slate-300 sm:text-base">
                From morning dairy and organic vegetables to midnight munchies, get instant doorstep delivery at local market prices.
              </p>

              {/* Action Buttons */}
              <div className="mt-7 flex flex-wrap items-center gap-3.5">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/shop')}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-7 py-3.5 text-sm font-black uppercase tracking-wider text-slate-950 shadow-[0_12px_35px_rgba(16,185,129,0.4)] transition hover:brightness-110"
                >
                  <ShoppingBag className="h-4 w-4" /> Shop Now
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/products')}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/15"
                >
                  <Percent className="h-4 w-4 text-emerald-400" /> Explore Deals
                </motion.button>
              </div>

              {/* Highlights Ticker */}
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {categoryHighlights.map(({ name, count, icon: Icon, color, accent, bg }) => (
                  <div key={name} className={`rounded-2xl border border-white/10 bg-gradient-to-br ${color} p-3.5 backdrop-blur-sm`}>
                    <div className={`mb-2 inline-flex rounded-xl p-2 ${bg} ${accent}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-[11px] font-semibold text-slate-400">{name}</div>
                    <div className="mt-0.5 text-sm font-black text-white">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Hero Visual Showcase */}
            <div className="relative z-10 flex items-center justify-center py-2 lg:py-0">
              <div className="relative w-full max-w-[480px]">
                
                {/* Floating Badge 1 */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -left-4 top-8 z-20 rounded-2xl border border-white/15 bg-slate-900/80 px-3.5 py-2 shadow-2xl backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-300">
                    <BadgeCheck className="h-4 w-4 text-emerald-400" />
                    <span>100% Quality Checked</span>
                  </div>
                </motion.div>

                {/* Floating Badge 2 */}
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -right-4 bottom-8 z-20 rounded-2xl border border-emerald-400/30 bg-emerald-950/80 px-3.5 py-2 shadow-2xl backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-200">
                    <Truck className="h-4 w-4 text-emerald-400" />
                    <span>⚡ Lightning Fast</span>
                  </div>
                </motion.div>

                {/* Main Card Frame */}
                <div className="relative overflow-hidden rounded-[30px] border border-white/15 bg-gradient-to-b from-white/10 to-white/5 p-3 shadow-2xl backdrop-blur-2xl">
                  <div className="relative overflow-hidden rounded-[24px] bg-slate-950">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentSlide}
                        src={heroImages[currentSlide] || heroFallback}
                        alt="Hero Banner"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="h-[340px] w-full object-cover"
                      />
                    </AnimatePresence>

                    {/* Image Footer Live Pill */}
                    <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-white/15 bg-slate-900/80 p-3 backdrop-blur-xl">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Live Delivery Hub</p>
                          <p className="mt-0.5 text-sm font-black text-white">Delivering across your city</p>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300 border border-emerald-500/30">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                          ONLINE
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Carousel Dots */}
                  {heroImages.length > 1 && (
                    <div className="mt-3 flex justify-center gap-1.5">
                      {heroImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            currentSlide === idx ? 'w-6 bg-emerald-400' : 'w-2 bg-white/30 hover:bg-white/60'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* POPULAR CATEGORIES */}
        <section className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Quick Browse</div>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-900">Explore by Category</h2>
            </div>
            <button
              onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 hover:text-emerald-600 transition"
            >
              All Categories <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-36 rounded-[22px] skeleton-shimmer" />
              ))
            ) : (
              categories.slice(0, 6).map((category, idx) => (
                <motion.button
                  key={category._id || idx}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate(`/category/${category._id}`)}
                  className="group relative flex flex-col items-center justify-center overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_25px_rgba(15,23,42,0.04)] transition hover:border-emerald-300 hover:shadow-[0_16px_35px_rgba(16,185,129,0.12)] text-center"
                >
                  <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-emerald-50 to-slate-50 p-2 ring-1 ring-slate-100 transition group-hover:scale-110">
                    <img
                      src={category.image || heroFallback}
                      alt={category.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <h3 className="line-clamp-1 text-xs font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {category.name}
                  </h3>
                  <p className="mt-0.5 text-[10px] font-bold text-emerald-600">Explore →</p>
                </motion.button>
              ))
            )}
          </div>
        </section>

        {/* CURATED FOR YOU / FRESH PICKS */}
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Handpicked Quality</div>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-900">Fresh & Essential Picks</h2>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-sm transition hover:bg-emerald-600"
            >
              View All <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 rounded-[26px] skeleton-shimmer" />
              ))
            ) : youMightNeedProducts.length > 0 ? (
              youMightNeedProducts.map((product) => <ProductCard key={product.id} product={product} />)
            ) : (
              <div className="col-span-full py-8 text-center text-sm font-semibold text-slate-500">
                No products available at the moment.
              </div>
            )}
          </div>
        </section>

        {/* FLASH DEAL LUXURY BANNER */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mt-14 overflow-hidden rounded-[36px] border border-slate-800 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0F1D] p-6 text-white shadow-[0_30px_70px_rgba(15,23,42,0.4)] sm:p-10 lg:p-12"
        >
          {/* Subtle Ambient Radial Highlights */}
          <div className="pointer-events-none absolute -left-10 top-0 h-80 w-80 rounded-full bg-emerald-500/15 blur-[90px]" />
          <div className="pointer-events-none absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-rose-500/15 blur-[90px]" />

          <div className="relative z-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-rose-400 backdrop-blur-md">
                  <Flame className="h-4 w-4 animate-bounce" />
                  Flash Deals of the Day
                </div>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
                  Mega Savings Fest <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                    Up to 50% OFF Essentials
                  </span>
                </h2>
                <p className="mt-3 max-w-xl text-sm font-medium text-slate-300 sm:text-base">
                  Stock up on highest rated household & pantry favorites. Limited quantities at exclusive prices.
                </p>
              </div>

              {/* Countdown Clock Box */}
              <div className="flex w-max items-center gap-3.5 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deal Ends In</div>
                  <div className="mt-0.5 text-xl font-black tracking-tight text-white tabular-nums">
                    {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    <span className="text-emerald-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Flash Deal Products Showcase */}
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {mostSellingProducts.slice(0, 4).map((product) => (
                <div key={product.id} className="rounded-[26px] bg-slate-900/60 p-2 border border-white/10 backdrop-blur-md">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* TRENDING BY CATEGORY */}
        <section className="mt-14 rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] sm:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Trending Now</div>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-900">Weekly Top Sellers</h2>
            </div>
            
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {['All', 'Fruits & Vegetables', 'Snacks', 'Dairy & Milk'].map((pill) => (
                <button
                  key={pill}
                  onClick={() => setSelectedWeeklyCategory(pill)}
                  className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
                    selectedWeeklyCategory === pill
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {filteredWeeklyProducts.length > 0 ? (
              filteredWeeklyProducts.map((product) => (
                <ProductCard key={product.id + '_weekly'} product={product} />
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-sm font-semibold text-slate-500">
                No items available in this category.
              </div>
            )}
          </div>
        </section>

        {/* TRUST & LOCAL STORES */}
        <section className="mt-14 rounded-[36px] border border-slate-200/80 bg-gradient-to-br from-white via-emerald-50/40 to-slate-50 p-6 shadow-[0_20px_50px_rgba(16,185,129,0.08)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-sm">
                <ShieldCheck className="h-4 w-4" />
                Guaranteed Satisfaction
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-slate-900 sm:text-4xl">
                Superfast delivery directly from verified neighborhood stores.
              </h2>
              <p className="mt-3.5 max-w-lg text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
                We partner with top local supermarkets and dark stores so you get the freshest produce, certified brands, and zero-compromise speed.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="text-2xl font-black text-slate-900">10k+</div>
                  <div className="mt-0.5 text-xs font-semibold text-slate-500">Orders Delivered</div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="text-2xl font-black text-emerald-600">10-15m</div>
                  <div className="mt-0.5 text-xs font-semibold text-slate-500">Average Delivery</div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="text-2xl font-black text-slate-900">99.8%</div>
                  <div className="mt-0.5 text-xs font-semibold text-slate-500">Happy Shoppers</div>
                </div>
              </div>
            </div>

            {/* Dark Store Widget */}
            <div className="rounded-[30px] border border-slate-800 bg-[#0F172A] p-6 text-white shadow-2xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Neighborhood Hub</div>
                  <div className="mt-0.5 text-lg font-black text-white">Active Stores Nearby</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <Store className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {allStores.length > 0 ? (
                  allStores.slice(0, 3).map((store) => (
                    <div
                      key={store._id || store.name}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 transition hover:bg-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                          <Store className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm font-black text-white">{store.name || 'Local Store'}</div>
                          <div className="text-xs font-medium text-slate-400">{store.category || 'Daily Needs'}</div>
                        </div>
                      </div>
                      <div className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                        {store.distance ? `${store.distance} km` : '1.8 km'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400">Stores loading...</div>
                )}
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;
