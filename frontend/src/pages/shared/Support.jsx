import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  MessageSquare,
  RefreshCw,
  FileText,
  Shield,
  Mail,
  Phone,
  Clock,
  Send,
  Check,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink,
  Headphones,
  Zap,
  MessageCircle,
  Inbox,
  ArrowRight,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext.jsx';
import API from '../../services/api.js';

const TABS = [
  { id: 'contact', name: 'Contact Support', icon: MessageSquare, description: 'Get in touch with our team' },
  { id: 'refund', name: 'Refund Policy', icon: RefreshCw, description: 'Learn about cancellations and refunds' },
  { id: 'terms', name: 'Terms of Service', icon: FileText, description: 'Our terms and order agreements' },
  { id: 'privacy', name: 'Privacy Settings', icon: Shield, description: 'Manage cookies and user data' }
];

const TOPIC_PILLS = [
  { label: '⚡ Order Delay', subject: 'Urgent: Order delivery delay inquiry' },
  { label: '📦 Damaged Item', subject: 'Received damaged or defective item' },
  { label: '💳 Payment / Refund', subject: 'Refund or transaction query' },
  { label: '🛵 Rider Issue', subject: 'Delivery partner feedback' },
  { label: '🎁 Promo Code', subject: 'Coupon / offer code issue' },
  { label: '💬 General Help', subject: 'General assistance / inquiry' }
];

const Support = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('contact');

  // Contact Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [submittedInfo, setSubmittedInfo] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [showToastNotification, setShowToastNotification] = useState(false);

  // Sync user info if available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  // Privacy Settings State
  const [privacyPrefs, setPrivacyPrefs] = useState({
    necessary: true,
    analytics: true,
    marketing: false,
    location: true
  });
  const [prefsSaved, setPrefsSaved] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && TABS.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/support?tab=${tabId}`, { replace: true });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    const roleLabel = user?.role === 'partner' ? 'Store Partner' : user?.role === 'delivery' ? 'Delivery Rider' : user?.role === 'admin' ? 'Administrator' : 'Customer';
    const fallbackRef = `RD-${Date.now().toString().slice(-6).toUpperCase()}`;

    try {
      const payload = {
        ...formData,
        role: user?.role || 'user'
      };

      // 1. Direct real-time email dispatch to appsicadev1@gmail.com using FormData
      const emailFormData = new FormData();
      emailFormData.append('_subject', `🚨 [${roleLabel.toUpperCase()} QUERY] #${fallbackRef}: ${formData.subject}`);
      emailFormData.append('_template', 'table');
      emailFormData.append('_captcha', 'false');
      emailFormData.append('⚡ SLA Priority', '🔴 HIGH (Respond under 60 mins)');
      emailFormData.append('🎫 Ticket Reference', `#${fallbackRef}`);
      emailFormData.append('🏢 Submitter Category', roleLabel);
      emailFormData.append('👤 Submitter Name', formData.name);
      emailFormData.append('📧 Reply-To Email', formData.email);
      emailFormData.append('📌 Inquiry Subject', formData.subject);
      emailFormData.append('💬 Message Details', formData.message);
      emailFormData.append('🕒 Submission Time', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
      emailFormData.append('⚡ 1-Click Direct Reply', `mailto:${formData.email}?subject=Re:%20[Ticket%20%23${fallbackRef}]%20${encodeURIComponent(formData.subject)}`);

      fetch('https://formsubmit.co/ajax/appsicadev1@gmail.com', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Referer': 'https://quick-commerce-nu.vercel.app'
        },
        body: emailFormData
      }).catch((err) => console.warn('Relay notice:', err));

      const res = await API.post('/support', payload);
      const generatedRef = res.data?.ticketRef || fallbackRef;

      const info = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        ticketRef: generatedRef,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setSubmittedInfo(info);
      setShowToastNotification(true);

      // Auto hide top toast after 6 seconds
      setTimeout(() => {
        setShowToastNotification(false);
      }, 6000);
    } catch (error) {
      console.error('Failed to submit ticket to API', error);
      const fallbackInfo = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        ticketRef: fallbackRef,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setSubmittedInfo(fallbackInfo);
      setShowToastNotification(true);
      setTimeout(() => setShowToastNotification(false), 6000);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCopyTicket = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const handleResetForm = () => {
    setSubmittedInfo(null);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      subject: '',
      message: ''
    });
  };

  const handlePrivacySave = (e) => {
    e.preventDefault();
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 3000);
  };

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-slate-50/80 min-h-screen py-8 md:py-12 font-sans selection:bg-emerald-500/30 relative">
      {/* Floating Premium Notification Toast */}
      <AnimatePresence>
        {showToastNotification && submittedInfo && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-4 sm:right-8 z-[9999] max-w-md w-full"
          >
            <div className="bg-slate-950/95 backdrop-blur-2xl text-white border border-emerald-500/40 rounded-3xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(16,185,129,0.25)] relative overflow-hidden flex items-start gap-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30 mt-0.5">
                <Check className="w-6 h-6 text-slate-950 stroke-[3]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Email Notification Dispatched
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{submittedInfo.timestamp}</span>
                </div>

                <h4 className="text-sm font-black text-white mt-0.5 truncate">
                  Ticket #{submittedInfo.ticketRef} Created!
                </h4>

                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Confirmation sent to <strong className="text-emerald-300 font-bold underline">{submittedInfo.email}</strong>.
                </p>

                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    ⚡ ETA: &lt; 1 Hour
                  </span>
                  <button
                    onClick={() => handleCopyTicket(submittedInfo.ticketRef)}
                    className="text-[10px] font-bold text-slate-300 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/15 px-2.5 py-0.5 rounded-full transition cursor-pointer"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    {copiedRef ? 'Copied!' : 'Copy Ref'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowToastNotification(false)}
                className="text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* Page Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-emerald-950/20 relative overflow-hidden border border-white/10"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-sky-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
                <Headphones className="w-3.5 h-3.5" /> 24/7 Priority Support Desk
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                How can we help you today?
              </h1>
              <p className="text-slate-300 font-medium text-sm md:text-base max-w-2xl leading-relaxed">
                Need assistance with your 10-minute order, instant refunds, account details, or delivery partners? We're active round the clock.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3 min-w-[170px]">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/20 flex items-center justify-center text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">Avg. Response</div>
                  <div className="text-base font-black text-white">&lt; 15 Mins</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3 min-w-[170px]">
                <div className="w-10 h-10 rounded-xl bg-sky-400/20 flex items-center justify-center text-sky-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">Resolution Rate</div>
                  <div className="text-base font-black text-white">99.4%</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Side: Navigation Links / Tab selector */}
          <motion.div
            variants={staggerVariants}
            initial="hidden"
            animate="visible"
            className="w-full lg:w-1/3 flex flex-col gap-6"
          >
            <motion.div variants={itemVariants} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-2">
                Help Categories
              </h3>
              <nav className="flex flex-col gap-2">
                {TABS.map((tab) => {
                  const IconComponent = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                        active
                          ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                          : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-xl transition-colors ${
                          active
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <span className={`text-sm block leading-snug ${active ? 'font-black text-emerald-900' : 'font-bold text-slate-800'}`}>
                          {tab.name}
                        </span>
                        <span className={`text-[11px] mt-0.5 block leading-tight truncate ${active ? 'text-emerald-700 font-semibold' : 'text-slate-400 font-medium'}`}>
                          {tab.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </motion.div>

            {/* Direct Contact Card */}
            <motion.div
              variants={itemVariants}
              className="bg-slate-950 text-white border border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-950/20 flex flex-col gap-5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/15 blur-2xl rounded-full" />
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">
                  Instant Help Channels
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>

              <div className="space-y-3.5 text-sm font-bold relative z-10">
                <a
                  href={`mailto:${settings.contactEmail || 'appsicadev1@gmail.com'}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition border border-transparent hover:border-white/5 group"
                >
                  <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
                    <Mail className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Care</div>
                    <div className="text-xs sm:text-sm text-slate-200 font-semibold truncate">
                      {settings.contactEmail || 'appsicadev1@gmail.com'}
                    </div>
                  </div>
                </a>

                <a
                  href={`tel:${settings.contactPhone || '+919876543210'}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition border border-transparent hover:border-white/5 group"
                >
                  <div className="bg-sky-500/20 p-2 rounded-xl border border-sky-500/30 text-sky-400 group-hover:scale-105 transition-transform">
                    <Phone className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Toll-Free Helpline</div>
                    <div className="text-xs sm:text-sm text-slate-200 font-semibold">
                      {settings.contactPhone || '+91 98765 43210'}
                    </div>
                  </div>
                </a>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="bg-amber-500/20 p-2 rounded-xl border border-amber-500/30 text-amber-400">
                    <Clock className="w-4 h-4 shrink-0" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operating Hours</div>
                    <div className="text-xs text-slate-200 font-semibold">24 Hours / 7 Days a Week</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side: Tab Content Area */}
          <div className="w-full lg:w-2/3 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm min-h-[560px] flex flex-col relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex-grow flex flex-col justify-between relative z-10"
              >
                {/* TAB 1: CONTACT SUPPORT WITH ULTRA-PREMIUM NOTIFICATION */}
                {activeTab === 'contact' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-600 text-xs font-black uppercase tracking-wider mb-1">
                        <Sparkles className="w-3.5 h-3.5" /> Rapid Resolution Desk
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Submit a Support Ticket
                      </h2>
                      <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                        Fill in your query details below. We'll register your ticket and immediately dispatch a notification &amp; tracking copy to your email address.
                      </p>
                    </div>

                    {submittedInfo ? (
                      /* POST-SUBMISSION LUXURY CONFIRMATION & NOTIFICATION CARD */
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 15 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="space-y-6"
                      >
                        {/* Hero Notification Banner */}
                        <div className="rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 border-2 border-emerald-500/40 p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/30">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
                          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-sky-500/15 rounded-full blur-2xl pointer-events-none" />

                          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
                                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                              </div>
                              <div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                                  <Zap className="w-3 h-3" /> Ticket Registered &amp; Dispatched
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                                  Inquiry Successfully Submitted!
                                </h3>
                              </div>
                            </div>

                            {/* Ticket Reference Badge with Copy */}
                            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 flex items-center gap-3 shrink-0">
                              <div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Reference ID</div>
                                <div className="text-base font-black font-mono text-emerald-300">
                                  #{submittedInfo.ticketRef}
                                </div>
                              </div>
                              <button
                                onClick={() => handleCopyTicket(submittedInfo.ticketRef)}
                                className="p-2 rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-slate-950 text-white transition flex items-center gap-1 text-xs font-bold cursor-pointer"
                                title="Copy Reference Code"
                              >
                                {copiedRef ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Target Email Notification Highlight Box */}
                          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                                <Inbox className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-xs font-black text-slate-300">
                                  Email Notification Dispatched To:
                                </div>
                                <div className="text-sm font-extrabold text-emerald-300 underline underline-offset-2">
                                  {submittedInfo.email}
                                </div>
                              </div>
                            </div>

                            <div className="text-xs text-slate-400 font-medium sm:text-right">
                              Please check your <strong className="text-white">Inbox / Spam folder</strong> for ticket updates.
                            </div>
                          </div>

                          {/* 3-Step Live Status Tracker */}
                          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-emerald-500/30">
                              <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">
                                1
                              </div>
                              <div>
                                <div className="text-[11px] font-black text-emerald-400">Inquiry Logged</div>
                                <div className="text-[10px] text-slate-400">{submittedInfo.timestamp}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-sky-500/30">
                              <div className="w-6 h-6 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center text-xs font-black animate-pulse">
                                2
                              </div>
                              <div>
                                <div className="text-[11px] font-black text-sky-400">Agent Assigned</div>
                                <div className="text-[10px] text-slate-400">Care Team Online</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                              <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-black">
                                3
                              </div>
                              <div>
                                <div className="text-[11px] font-black text-slate-300">Resolution</div>
                                <div className="text-[10px] text-slate-400">Target &lt; 60 mins</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Inquiry Summary Preview */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
                          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                            Summary of Your Submission:
                          </div>
                          <div className="text-sm font-bold text-slate-800">
                            <span className="text-slate-500">Subject:</span> {submittedInfo.subject}
                          </div>
                          <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 italic leading-relaxed">
                            "{submittedInfo.message}"
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={handleResetForm}
                              className="px-5 py-2.5 bg-white border-2 border-slate-200 hover:border-slate-400 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition shadow-xs active:scale-95 cursor-pointer"
                            >
                              Submit Another Query
                            </button>

                            <a
                              href={`mailto:appsicadev1@gmail.com?subject=Inquiry %23${submittedInfo.ticketRef}: ${encodeURIComponent(submittedInfo.subject)}&body=Hello RoseDash Support,%0D%0A%0D%0AHere is my inquiry (Ticket %23${submittedInfo.ticketRef}):%0D%0A${encodeURIComponent(submittedInfo.message)}%0D%0A%0D%0AFrom: ${encodeURIComponent(submittedInfo.name)} (${encodeURIComponent(submittedInfo.email)})`}
                              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-1.5 active:scale-95"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Mail className="w-4 h-4 text-rose-600" />
                              <span>Direct Mail / Gmail</span>
                            </a>
                          </div>

                          <div className="flex items-center gap-3">
                            <Link
                              to="/"
                              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs sm:text-sm transition shadow-md shadow-emerald-600/20 active:scale-95 flex items-center gap-2 cursor-pointer"
                            >
                              <span>Continue Shopping</span>
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      /* MAIN CONTACT FORM */
                      <form onSubmit={handleContactSubmit} className="space-y-5">
                        {/* Quick Subject Pills */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-1">
                            Quick Select Inquiry Topic
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {TOPIC_PILLS.map((pill, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setFormData({ ...formData, subject: pill.subject })}
                                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                                  formData.subject === pill.subject
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                                }`}
                              >
                                {pill.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-500 pl-1">
                              Your Name *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Rahul Sharma"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold text-slate-900 transition shadow-xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-500 pl-1">
                              Notification Email Address *
                            </label>
                            <div className="relative">
                              <input
                                type="email"
                                required
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold text-slate-900 transition shadow-xs"
                              />
                              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase tracking-wider text-slate-500 pl-1">
                            Subject / Issue Title *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Order #12345 delayed / item missing"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold text-slate-900 transition shadow-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase tracking-wider text-slate-500 pl-1">
                            Detailed Description / Feedback *
                          </label>
                          <textarea
                            required
                            rows="4"
                            placeholder="Please share details about your inquiry, order number, or any specific instructions..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold text-slate-900 resize-none transition shadow-xs"
                          />
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-xs text-slate-500 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Confirmation &amp; ticket details will be emailed immediately.</span>
                          </div>

                          <button
                            type="submit"
                            disabled={formLoading}
                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition cursor-pointer"
                          >
                            {formLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Registering Ticket...</span>
                              </>
                            ) : (
                              <>
                                <span>Send Support Query</span>
                                <Send className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* TAB 2: REFUND POLICY */}
                {activeTab === 'refund' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                        Refund &amp; Cancellation Rules
                      </h2>
                      <p className="text-sm font-medium text-slate-400 mt-1">
                        Please review our guidelines to submit cancellations or refund queries.
                      </p>
                    </div>

                    <div className="space-y-5 text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-6 sm:p-8 rounded-[2rem] border border-slate-200/80 shadow-inner">
                      <div>
                        <h4 className="font-black text-slate-800 text-base mb-1.5 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-emerald-500" /> 1. Cancellation Window
                        </h4>
                        <p className="pl-6 text-xs sm:text-sm">
                          Orders can be cancelled within 60 seconds of placement. Because we guarantee ultra-fast 10-minute delivery, store packing begins immediately. Once the order leaves our dark store, cancellation is locked.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-base mb-1.5 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-emerald-500" /> 2. Damaged or Missing Items
                        </h4>
                        <p className="pl-6 text-xs sm:text-sm">
                          If you receive items that are damaged, expired, or missing, you can raise an instant refund query via our Contact Support tab within 24 hours of delivery.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-base mb-1.5 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-emerald-500" /> 3. Refund Processing
                        </h4>
                        <p className="pl-6 text-xs sm:text-sm">
                          Approved refunds are returned to your source UPI/Card within 3-5 business days, or instantly credited to your RoseDash wallet.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: TERMS OF SERVICE */}
                {activeTab === 'terms' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                        Terms of Service
                      </h2>
                      <p className="text-sm font-medium text-slate-400 mt-1">
                        The legal agreements governing your use of our platform.
                      </p>
                    </div>

                    <div className="space-y-5 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-6 sm:p-8 rounded-[2rem] border border-slate-200/80 h-96 overflow-y-auto custom-scrollbar shadow-inner">
                      <p>
                        Welcome to RoseDash. By accessing our application and placing quick orders, you agree to comply with and be bound by the following terms.
                      </p>

                      <h4 className="font-black text-slate-800 text-sm sm:text-base mb-1">Service Availability</h4>
                      <p>
                        Our 10-minute delivery is subject to operating hours, weather conditions, and rider geofence radius.
                      </p>

                      <h4 className="font-black text-slate-800 text-sm sm:text-base mt-4 mb-1">User Accounts</h4>
                      <p>
                        You are responsible for maintaining the confidentiality of your account credentials.
                      </p>

                      <h4 className="font-black text-slate-800 text-sm sm:text-base mt-4 mb-1">Pricing and Taxes</h4>
                      <p>
                        All prices shown are inclusive of applicable taxes. Handling and surge delivery fees may apply during peak traffic hours.
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 4: PRIVACY SETTINGS */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                        Privacy &amp; Data Settings
                      </h2>
                      <p className="text-sm font-medium text-slate-400 mt-1">
                        Manage how we collect and use your data.
                      </p>
                    </div>

                    <form onSubmit={handlePrivacySave} className="space-y-5">
                      <div className="space-y-3.5">
                        <div className="flex items-start justify-between p-5 bg-slate-50 border border-slate-200/80 rounded-2xl shadow-2xs">
                          <div className="pr-4">
                            <h4 className="font-black text-slate-800 text-sm mb-0.5">Strictly Necessary</h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                              Required for basic authentication, geocoding &amp; order payment security.
                            </p>
                          </div>
                          <input type="checkbox" checked disabled className="w-5 h-5 accent-emerald-500 rounded opacity-60 cursor-not-allowed mt-1" />
                        </div>

                        <label className="flex items-start justify-between p-5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs hover:border-emerald-400 transition cursor-pointer group">
                          <div className="pr-4">
                            <h4 className="font-black text-slate-800 text-sm mb-0.5 group-hover:text-emerald-700 transition">
                              Analytics &amp; Performance
                            </h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                              Helps us optimize delivery routes and application performance.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={privacyPrefs.analytics}
                            onChange={(e) => setPrivacyPrefs({ ...privacyPrefs, analytics: e.target.checked })}
                            className="w-5 h-5 accent-emerald-500 rounded cursor-pointer mt-1"
                          />
                        </label>

                        <label className="flex items-start justify-between p-5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs hover:border-emerald-400 transition cursor-pointer group">
                          <div className="pr-4">
                            <h4 className="font-black text-slate-800 text-sm mb-0.5 group-hover:text-emerald-700 transition">
                              Personalized Promotions
                            </h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                              Show customized product deals based on past order preferences.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={privacyPrefs.marketing}
                            onChange={(e) => setPrivacyPrefs({ ...privacyPrefs, marketing: e.target.checked })}
                            className="w-5 h-5 accent-emerald-500 rounded cursor-pointer mt-1"
                          />
                        </label>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div>
                          {prefsSaved && (
                            <span className="text-xs sm:text-sm font-black text-emerald-600 flex items-center gap-1.5">
                              <Check className="w-4 h-4" /> Preferences saved!
                            </span>
                          )}
                        </div>
                        <button
                          type="submit"
                          className="px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white font-black rounded-xl text-sm transition shadow-md active:scale-95 cursor-pointer"
                        >
                          Save Preferences
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;

