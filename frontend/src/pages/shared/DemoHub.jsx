import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Store,
  Bike,
  User,
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Package,
  Clock,
  Layers,
} from 'lucide-react';
import { DEMO_PROFILES, loginAsDemo } from '../../utils/demoAuth.js';

const DemoHub = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loadingRole, setLoadingRole] = useState(null);

  const handleLaunchDemo = async (roleKey) => {
    setLoadingRole(roleKey);
    try {
      await loginAsDemo(roleKey, dispatch);
      const target = DEMO_PROFILES[roleKey]?.targetPath || '/';
      setTimeout(() => {
        navigate(target);
      }, 300);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRole(null);
    }
  };

  const demoCards = [
    {
      key: 'admin',
      title: 'Admin Control HQ',
      subtitle: 'Platform Master Console',
      desc: 'Real-time revenue metrics, order dispatch board, dark store telemetry, category & inventory management, user permissions.',
      roleBadge: 'Super Admin',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      gradient: 'from-emerald-500 to-teal-600',
      borderGlow: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
      icon: ShieldCheck,
      features: ['Live Order Management', 'Dark Store Networks', 'Inventory & Stock Control', 'Financial Analytics', 'Store Partners & Banners'],
      urlPath: '/admin'
    },
    {
      key: 'partner',
      title: 'Store Partner Portal',
      subtitle: 'Dark Store & Vendor Operations',
      desc: 'Live store dashboard, incoming order processing, product catalogs, promo codes, delivery handoff & performance charts.',
      roleBadge: 'Vendor / Merchant',
      badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      gradient: 'from-sky-500 to-indigo-600',
      borderGlow: 'hover:border-sky-500/50 hover:shadow-sky-500/10',
      icon: Store,
      features: ['Real-time Order Processing', 'Product & SKU Inventory', 'Promotions & Coupons', 'Sales Analytics', 'Live Store Status Toggle'],
      urlPath: '/partner/dashboard'
    },
    {
      key: 'delivery',
      title: 'Delivery Partner App',
      subtitle: 'Rider Fleet & Logistics',
      desc: 'Active delivery trips, route maps, QR code verification, earnings ledger, trip history & KYC profile.',
      roleBadge: 'Delivery Fleet',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      gradient: 'from-amber-500 to-orange-600',
      borderGlow: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
      icon: Bike,
      features: ['Real-time Trip Requests', 'Turn-by-turn Navigation', 'Order QR Handover Scanner', 'Daily / Weekly Earnings', 'KYC & Vehicle Verified'],
      urlPath: '/delivery/dashboard'
    },
    {
      key: 'user',
      title: 'Customer Experience',
      subtitle: 'Consumer Profile & Loyalty',
      desc: 'Customer account dashboard, real-time live order tracking, address book, rewards wallet, and group orders.',
      roleBadge: 'VIP Customer',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      gradient: 'from-rose-500 to-pink-600',
      borderGlow: 'hover:border-rose-500/50 hover:shadow-rose-500/10',
      icon: User,
      features: ['Live GPS Order Tracking', 'Personal Wallet & Points', 'Saved Delivery Addresses', 'Group Ordering Cart', 'Exclusive Coupons & Deals'],
      urlPath: '/profile'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070D1E] text-white font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px]" />
      </div>

      {/* Navigation Bar */}
      <header className="relative z-20 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-slate-950 font-black" />
            </div>
            <div>
              <div className="font-black text-xl tracking-tight text-white">RoseDash</div>
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-400">Client Preview Suite</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 transition"
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>Public Storefront</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-4">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Evaluation Gateway</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Explore All <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">4 Live Ecosystem Panels</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Select any role below for instant 1-click preview authentication. Experience the complete quick-commerce platform as an Admin, Store Partner, Delivery Partner, or Customer.
          </p>
        </div>

        {/* 4 Panels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {demoCards.map((card) => {
            const Icon = card.icon;
            const isLoading = loadingRole === card.key;

            return (
              <motion.div
                key={card.key}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className={`relative rounded-[32px] bg-slate-900/80 border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all ${card.borderGlow}`}
              >
                <div>
                  {/* Card Top Pill */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${card.gradient} flex items-center justify-center text-slate-950 font-black shadow-lg`}>
                      <Icon className="w-6 h-6 text-slate-950" />
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${card.badgeColor}`}>
                      {card.roleBadge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-2xl font-black text-white tracking-tight">{card.title}</h3>
                  <div className="text-xs font-bold text-slate-400 mt-0.5">{card.subtitle}</div>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">{card.desc}</p>

                  {/* Key Features List */}
                  <div className="mt-5 pt-5 border-t border-white/10 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Key Highlights:</div>
                    {card.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Launch Button */}
                <div className="mt-8 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-400 font-mono">
                    Direct: <span className="text-slate-300 font-semibold">{card.urlPath}</span>
                  </div>

                  <button
                    onClick={() => handleLaunchDemo(card.key)}
                    disabled={isLoading}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${card.gradient} text-slate-950 font-black text-xs shadow-lg hover:opacity-95 transition-all active:scale-95 cursor-pointer`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Launching...</span>
                      </>
                    ) : (
                      <>
                        <span>Enter Demo Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default DemoHub;
