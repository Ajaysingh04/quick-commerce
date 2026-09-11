import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
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

  const activeHeroBanners = heroBanners.filter((b) => b.isActive !== false);
  const heroImages = activeHeroBanners.length > 0
    ? activeHeroBanners.map((b) => b.imageUrl).filter(Boolean)
    : [heroFallback];

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
        API.get('/stores'),
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

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
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
    { name: 'Fresh Picks', count: '120+', icon: Sparkles, color: 'from-emerald-500/20 to-emerald-100', accent: 'text-emerald-600' },
    { name: 'Express Delivery', count: '15 min', icon: Truck, color: 'from-sky-500/20 to-sky-100', accent: 'text-sky-600' },
    { name: 'Top Rated', count: '4.8/5', icon: Star, color: 'from-amber-500/20 to-amber-100', accent: 'text-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-[#0F172A] text-white shadow-[0_35px_80px_rgba(15,23,42,0.25)]"
        >
          <div className="relative grid gap-8 px-5 py-6 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(148,163,184,0.20),transparent_25%)]" />

            <div className="relative z-10 flex flex-col justify-center">
              <div className="mb-5 inline-flex w-max items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                Fresh. Fast. Premium.
              </div>

              <h1 className="max-w-xl text-4xl font-black leading-[0.98] tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
                Delivering daily essentials in a whole new way.
              </h1>

              <p className="mt-5 max-w-lg text-sm font-medium text-slate-300 sm:text-base">
                From pantry staples to midnight cravings, shop premium groceries and essentials in minutes with lightning-fast doorstep delivery.
              </p>

              <div className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <button
                  onClick={() => navigate('/shop')}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(16,185,129,0.35)] transition hover:bg-emerald-400"
                >
                  Shop now <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  <Play className="h-4 w-4" /> Explore deals
                </button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {categoryHighlights.map(({ name, count, icon: Icon, color, accent }) => (
                  <div key={name} className={`rounded-2xl border border-white/10 bg-gradient-to-br ${color} p-3`}>
                    <div className={`mb-2 inline-flex rounded-xl bg-white/80 p-2 ${accent}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-xs font-medium text-slate-300">{name}</div>
                    <div className="mt-1 text-base font-black text-white">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-center py-4 lg:py-0">
              <div className="relative w-full max-w-[520px]">
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -left-5 top-12 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 shadow-2xl backdrop-blur-md"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-100">
                    <BadgeCheck className="h-4 w-4 text-emerald-400" />
                    4.9 customer rating
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 14, 0] }}
                  transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -right-5 bottom-10 rounded-2xl border border-emerald-400/20 bg-emerald-500/20 px-3 py-2 shadow-2xl backdrop-blur-md"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100">
                    <Truck className="h-4 w-4" />
                    15 min delivery
                  </div>
                </motion.div>

                <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/50 p-3 shadow-[0_25px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),transparent_50%,rgba(16,185,129,0.12))]" />
                  <div className="relative rounded-[22px] bg-white p-3 shadow-2xl">
                    <img
                      src={heroImages[currentSlide] || heroFallback}
                      alt="Quick commerce essentials"
                      className="h-[350px] w-full rounded-[18px] object-cover"
                    />

                    <div className="mt-3 rounded-2xl bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Now delivering</p>
                          <p className="mt-1 text-lg font-black text-slate-900">Fresh groceries</p>
                        </div>
                        <div className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                          LIVE
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
                        <div className="rounded-xl bg-white p-2 shadow-sm">
                          <div className="text-base font-black text-slate-900">2.4k</div>
                          <div>orders</div>
                        </div>
                        <div className="rounded-xl bg-white p-2 shadow-sm">
                          <div className="text-base font-black text-slate-900">98%</div>
                          <div>happy</div>
                        </div>
                        <div className="rounded-xl bg-white p-2 shadow-sm">
                          <div className="text-base font-black text-slate-900">6m</div>
                          <div>saved</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="mt-8 rounded-[28px] border border-slate-200/80 bg-white/70 p-4 shadow-[0_22px_40px_rgba(15,23,42,0.04)] backdrop-blur-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Quick browse</div>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-slate-900">Popular categories</h2>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Connaught Place, Delhi
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {categories.slice(0, 4).map((category, index) => (
              <motion.button
                key={category._id || index}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/category/${category._id}`)}
                className="group rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-4 text-left transition hover:border-emerald-200 hover:shadow-[0_18px_40px_rgba(16,185,129,0.10)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                    <img
                      src={category.image || heroFallback}
                      alt={category.name}
                      className="h-9 w-9 object-cover"
                    />
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:text-emerald-600" />
                </div>
                <h3 className="mt-4 text-lg font-black text-slate-900">{category.name}</h3>
                <p className="mt-1 text-sm font-medium text-slate-500">{Math.floor(Math.random() * 80) + 30} essentials</p>
              </motion.button>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Curated for you</div>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-slate-900">Fresh picks</h2>
            </div>
            <button onClick={() => navigate('/products')} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-slate-700">
              View all <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {youMightNeedProducts.length > 0 ? youMightNeedProducts.map((product) => <ProductCard key={product.id} product={product} />) : <div className="col-span-full text-slate-500">No products found.</div>}
          </div>
        </section>

        <section className="mt-12 rounded-[32px] border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-[0_30px_60px_rgba(15,23,42,0.18)] sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Flash deal</div>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.06em]">Weekend essentials under ₹299</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200">
              <Clock3 className="h-4 w-4 text-emerald-300" />
              Ends in 02:42:18
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[26px] bg-white/5 p-4 ring-1 ring-white/10">
              <div className="grid gap-4 sm:grid-cols-2">
                {mostSellingProducts.slice(0, 4).map((product) => (
                  <div key={product.id} className="rounded-[22px] border border-white/10 bg-white/5 p-3">
                    <div className="flex h-24 items-center justify-center rounded-2xl bg-white/5">
                      <img src={product.image} alt={product.name} className="h-full w-full object-contain p-2" />
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-white">{product.name}</h3>
                        <p className="mt-1 text-xs text-slate-300">{product.weight || '500 g'}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-emerald-300">₹{product.price}</div>
                        <div className="text-[10px] text-slate-400 line-through">₹{product.originalPrice || product.price + 80}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[26px] border border-emerald-400/20 bg-gradient-to-br from-emerald-500/20 to-transparent p-5">
              <div className="flex items-center gap-2 text-emerald-300">
                <Flame className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-[0.18em]">Bestsellers</span>
              </div>
              <div className="mt-5 space-y-4">
                {mostSellingProducts.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex items-center gap-3 rounded-2xl bg-white/5 p-2.5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/8">
                      <img src={product.image} alt={product.name} className="h-12 w-12 object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-white">{product.name}</div>
                      <div className="mt-1 text-xs text-slate-300">{product.category?.name || product.category || 'Fresh'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-300">₹{product.price}</div>
                      <div className="text-[10px] text-slate-400 line-through">₹{product.originalPrice || product.price + 60}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Top picks</div>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-slate-900">Worth exploring</h2>
            </div>
            <button onClick={() => navigate('/products')} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-700 transition hover:border-slate-300">
              Browse all <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {allProducts.slice(0, 8).map((product) => (
              <div key={product.id} className="min-w-[260px] flex-1 sm:min-w-[300px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-[30px] border border-slate-200/80 bg-white p-5 shadow-[0_22px_40px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">This week</div>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-slate-900">Trending now</h2>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {['All', 'Fruits & Vegetables', 'Snacks', 'Dairy & Milk', 'Household'].map((pill) => (
                <button
                  key={pill}
                  onClick={() => setSelectedWeeklyCategory(pill)}
                  className={`rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${selectedWeeklyCategory === pill ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredWeeklyProducts.length > 0 ? filteredWeeklyProducts.map((product) => <ProductCard key={product.id + '_weekly'} product={product} />) : <div className="col-span-full text-slate-500">No products available in this category.</div>}
          </div>
        </section>

        <section className="mt-12 rounded-[32px] border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-5 shadow-[0_20px_45px_rgba(16,185,129,0.08)] sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white">
                <ShieldCheck className="h-4 w-4" />
                Trusted delivery
              </div>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.06em] text-slate-900 sm:text-4xl">
                A premium quick-commerce experience built for your daily rhythm.
              </h2>
              <p className="mt-4 max-w-lg text-base font-medium text-slate-600">
                Order from neighborhood stores, track updates in real time, and get fast, reliable delivery without the usual hassle.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                  <div className="text-2xl font-black text-slate-900">10k+</div>
                  <div className="mt-1 text-xs font-medium text-slate-500">orders delivered</div>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                  <div className="text-2xl font-black text-slate-900">18m</div>
                  <div className="mt-1 text-xs font-medium text-slate-500">avg. delivery time</div>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                  <div className="text-2xl font-black text-slate-900">99.9%</div>
                  <div className="mt-1 text-xs font-medium text-slate-500">service uptime</div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] bg-slate-900 p-5 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Live now</div>
                  <div className="mt-1 text-xl font-black">Delivery team</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/25 text-emerald-300">
                  <Zap className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {allStores.slice(0, 3).map((store) => (
                  <div key={store._id || store.name} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
                        <Store className="h-5 w-5 text-emerald-300" />
                      </div>
                      <div>
                        <div className="text-sm font-bold">{store.name || 'Local Market'}</div>
                        <div className="text-[11px] text-slate-300">{store.category || 'Groceries'}</div>
                      </div>
                    </div>
                    <div className="text-right text-xs font-semibold text-slate-200">
                      {store.distance ? `${store.distance} km` : '2.1 km'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-[32px] border border-slate-200 bg-slate-900 p-5 text-white shadow-[0_30px_60px_rgba(15,23,42,0.2)] sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Download app</div>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] sm:text-4xl">Your daily essentials, one tap away.</h2>
              <p className="mt-3 max-w-xl text-base font-medium text-slate-300">
                Enjoy a beautifully designed mobile shopping experience, smart suggestions, and lightning-fast doorstep delivery.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100">
                <ShoppingBag className="h-4 w-4" /> Get the app
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
                <Search className="h-4 w-4" /> Browse catalog
              </button>
            </div>
          </div>
        </section>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/10 backdrop-blur-sm">
          <div className="rounded-full border border-white/20 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 shadow-xl">
            Loading your market...
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
