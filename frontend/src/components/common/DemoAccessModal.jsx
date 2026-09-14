import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Store,
  Bike,
  User,
  Sparkles,
  ArrowRight,
  Lock,
  CheckCircle2,
  ExternalLink,
  Zap,
  Globe,
} from 'lucide-react';
import { DEMO_PROFILES, loginAsDemo } from '../../utils/demoAuth.js';

const DemoAccessModal = ({ requestedRole, returnPath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [selectedRole, setSelectedRole] = useState(requestedRole || 'admin');
  const [isActivating, setIsActivating] = useState(false);

  const activeProfile = DEMO_PROFILES[selectedRole] || DEMO_PROFILES.admin;

  const handleInstantDemo = async (roleToUse) => {
    const role = roleToUse || selectedRole;
    setIsActivating(true);
    try {
      await loginAsDemo(role, dispatch);
      const target = returnPath || DEMO_PROFILES[role]?.targetPath || '/';
      // Small timeout for smooth UX transition
      setTimeout(() => {
        navigate(target, { replace: true });
      }, 300);
    } catch (e) {
      console.error('Demo login error:', e);
    } finally {
      setIsActivating(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'partner':
        return <Store className="w-5 h-5 text-sky-400" />;
      case 'delivery':
        return <Bike className="w-5 h-5 text-amber-400" />;
      case 'user':
        return <User className="w-5 h-5 text-rose-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.6)] text-white overflow-hidden my-auto"
      >
        {/* Background Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Sparkles className="w-5 h-5 text-slate-950 font-black" />
            </div>
            <div>
              <div className="text-base font-black tracking-tight flex items-center gap-2">
                <span>RoseDash Preview Portal</span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-400">
                  Client Evaluation
                </span>
              </div>
              <p className="text-xs text-slate-400">Official Interactive Demo Access</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="text-xs font-bold text-slate-400 hover:text-white transition flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/5"
            title="Browse Public Store"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Store</span>
          </button>
        </div>

        {/* Main Banner Question */}
        <div className="mt-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold mb-3">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Are you reviewing as a Demo User?</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Instant Access to <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">{activeProfile.title}</span>
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-xl">
            {activeProfile.desc} No credentials required — click below to enter directly as an authorized preview user.
          </p>
        </div>

        {/* Big Action Button */}
        <div className="mt-6">
          <button
            onClick={() => handleInstantDemo(selectedRole)}
            disabled={isActivating}
            className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 p-[1px] shadow-xl shadow-emerald-500/20 active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="w-full bg-slate-950/40 group-hover:bg-transparent transition-all rounded-2xl px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  {getRoleIcon(selectedRole)}
                </div>
                <div className="text-left">
                  <div className="text-base font-black text-white tracking-tight flex items-center gap-2">
                    {isActivating ? 'Unlocking Demo Access...' : `Yes, Enter as ${activeProfile.name}`}
                  </div>
                  <div className="text-[11px] text-emerald-300 font-semibold">
                    1-Click Instant Demo Authentication
                  </div>
                </div>
              </div>

              <div className="w-10 h-10 rounded-xl bg-emerald-400 text-slate-950 flex items-center justify-center font-black group-hover:translate-x-1 transition-transform">
                {isActivating ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Role Switcher Grid */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
            <span>Or Choose Another Evaluation Panel:</span>
            <span className="text-slate-500">4 Full Portals Available</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {Object.entries(DEMO_PROFILES).map(([roleKey, profile]) => {
              const isSelected = selectedRole === roleKey;
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => {
                    setSelectedRole(roleKey);
                    handleInstantDemo(roleKey);
                  }}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-white/15 border-emerald-400/50 shadow-md shadow-emerald-500/10'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                      {getRoleIcon(roleKey)}
                    </div>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                  </div>

                  <div>
                    <div className="text-xs font-black text-white truncate">{profile.title.split('/')[0]}</div>
                    <div className="text-[10px] text-slate-400 font-medium capitalize mt-0.5">{roleKey} Portal</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Alternative Options */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Demo Session with full dataset</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login', { state: { from: location } })}
              className="font-bold text-slate-300 hover:text-white transition underline underline-offset-4 cursor-pointer"
            >
              Sign In with Custom Email
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DemoAccessModal;
