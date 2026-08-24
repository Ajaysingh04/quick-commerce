import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, RefreshCw, FileText, Shield, Mail, Phone, Clock, Send, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext.jsx';
import API from '../../services/api.js';

const TABS = [
  { id: 'contact', name: 'Contact Support', icon: MessageSquare, description: 'Get in touch with our team' },
  { id: 'refund', name: 'Refund Policy', icon: RefreshCw, description: 'Learn about cancellations and refunds' },
  { id: 'terms', name: 'Terms of Service', icon: FileText, description: 'Our terms and order agreements' },
  { id: 'privacy', name: 'Privacy Settings', icon: Shield, description: 'Manage cookies and user data' }
];

const Support = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState('contact');

  // Contact Form State
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

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
    if (tabParam && TABS.some(t => t.id === tabParam)) {
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
    try {
      await API.post('/support', formData);
      setFormSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Failed to submit ticket', error);
      alert('Failed to send message. Please try again later.');
    } finally {
      setFormLoading(false);
    }
  };

  const handlePrivacySave = (e) => {
    e.preventDefault();
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 3000);
  };

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 via-emerald-900 to-emerald-800 text-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-emerald-900/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-white blur-[100px] rounded-full transform -rotate-45"></div>
          </div>
          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Help & Support Center</h1>
            <p className="text-emerald-50 font-bold text-sm md:text-lg max-w-2xl leading-relaxed opacity-90">
              Have questions about your order, refunds, or privacy preferences? We are here to help 24/7.
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          {/* Left Side: Navigation Links / Tab selector */}
          <motion.div 
            variants={staggerVariants}
            initial="hidden"
            animate="visible"
            className="w-full lg:w-1/3 flex flex-col gap-6"
          >
            <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-2 mb-4">
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
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group ${
                        active
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                          : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl transition-colors ${
                        active 
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' 
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className={`text-sm block leading-snug ${active ? 'font-black text-emerald-700' : 'font-bold text-slate-800'}`}>
                          {tab.name}
                        </span>
                        <span className={`text-[11px] mt-1 block leading-tight font-bold ${active ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {tab.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </motion.div>

            {/* Quick Help Contacts Card */}
            <motion.div variants={itemVariants} className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-900/20 flex flex-col gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full"></div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 relative z-10">
                Direct Contact
              </h3>
              <div className="space-y-4 text-sm font-bold relative z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-800 p-2 rounded-xl border border-slate-700"><Mail className="w-4 h-4 text-emerald-400 shrink-0" /></div>
                  <span className="text-slate-200">{settings.contactEmail || 'support@rosedash.com'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-800 p-2 rounded-xl border border-slate-700"><Phone className="w-4 h-4 text-emerald-400 shrink-0" /></div>
                  <span className="text-slate-200">{settings.contactPhone || '+1234567890'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-800 p-2 rounded-xl border border-slate-700"><Clock className="w-4 h-4 text-emerald-400 shrink-0" /></div>
                  <span className="text-slate-200">Average response: under 1 hour</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side: Displaying content of active tab */}
          <div className="w-full lg:w-2/3 bg-white border border-slate-100 rounded-3xl p-6 md:p-10 shadow-sm min-h-[500px] flex flex-col relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex-grow flex flex-col justify-between relative z-10"
              >
                {/* Tab 1: Contact Form */}
                {activeTab === 'contact' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Submit a Support Ticket</h2>
                      <p className="text-sm font-bold text-slate-400 mt-2">Our support specialists will resolve your inquiry as soon as possible.</p>
                    </div>

                    {formSubmitted ? (
                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-8 text-center space-y-4 py-16"
                      >
                        <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
                          <Check className="w-10 h-10" />
                        </div>
                        <h4 className="font-black text-emerald-800 text-2xl tracking-tight">Message Sent Successfully!</h4>
                        <p className="text-sm text-emerald-600 max-w-md mx-auto font-bold leading-relaxed">
                          Thank you for contacting us. A support staff has been assigned, and a confirmation email is on its way to your inbox.
                        </p>
                        <button
                          onClick={() => setFormSubmitted(false)}
                          className="mt-6 px-8 py-3 bg-white border-2 border-emerald-200 text-emerald-700 font-black rounded-xl shadow-sm hover:bg-emerald-50 hover:border-emerald-300 transition-all active:scale-95"
                        >
                          Send another query
                        </button>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleContactSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-400 pl-1">Your Name</label>
                            <input
                              type="text"
                              required
                              placeholder="John Doe"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 bg-slate-50 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold text-slate-800 transition-all shadow-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-400 pl-1">Email Address</label>
                            <input
                              type="email"
                              required
                              placeholder="you@example.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 bg-slate-50 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold text-slate-800 transition-all shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-wider text-slate-400 pl-1">Subject</label>
                          <input
                            type="text"
                            required
                            placeholder="Order inquiry, promo issues, delivery delays..."
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 bg-slate-50 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold text-slate-800 transition-all shadow-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-wider text-slate-400 pl-1">How can we help?</label>
                          <textarea
                            required
                            rows="5"
                            placeholder="Describe your issue or feedback in detail..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 bg-slate-50 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-bold text-slate-800 resize-none transition-all shadow-sm custom-scrollbar"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={formLoading}
                          className="w-full md:w-auto px-10 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:shadow-none text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] active:scale-95 transition-all self-end float-right"
                        >
                          {formLoading ? 'Submitting query...' : 'Send Message'} <Send className="w-4 h-4" />
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Tab 2: Refund Policy */}
                {activeTab === 'refund' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Refund & Cancellation Rules</h2>
                      <p className="text-sm font-bold text-slate-400 mt-2">Please review our guidelines to submit cancellations or refund queries.</p>
                    </div>

                    <div className="space-y-6 text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                      <div>
                        <h4 className="font-black text-slate-800 text-base mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-emerald-500"/> 1. Cancellation Window</h4>
                        <p className="pl-6">Orders can only be cancelled within 60 seconds of placement. Since we guarantee ultra-fast 10-minute delivery, processing begins immediately. Once the order leaves our micro-fulfillment center, cancellation is no longer possible.</p>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-base mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-emerald-500"/> 2. Damaged or Defective Items</h4>
                        <p className="pl-6">If you receive items that are damaged, expired, or significantly different from what was described, you may request a refund within 24 hours of delivery. Please provide a clear photograph of the item via our contact form.</p>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-base mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-emerald-500"/> 3. Refund Processing Time</h4>
                        <p className="pl-6">Approved refunds are processed to your original payment method within 3-5 business days. Wallet refunds, if applicable, are credited instantly.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Terms of Service */}
                {activeTab === 'terms' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Terms of Service</h2>
                      <p className="text-sm font-bold text-slate-400 mt-2">The legal agreements governing your use of our platform.</p>
                    </div>

                    <div className="space-y-6 text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-8 rounded-[2rem] border border-slate-100 h-96 overflow-y-auto custom-scrollbar shadow-inner">
                      <p>Welcome. By accessing our application and using our services, you agree to comply with and be bound by the following terms and conditions.</p>
                      
                      <h4 className="font-black text-slate-800 text-base mb-1">Service Availability</h4>
                      <p>Our 10-minute delivery guarantee is subject to operating hours, weather conditions, and rider availability in your specific geofenced area. We reserve the right to cancel orders if the delivery address falls outside our active radius.</p>
                      
                      <h4 className="font-black text-slate-800 text-base mt-6 mb-1">User Accounts</h4>
                      <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account.</p>

                      <h4 className="font-black text-slate-800 text-base mt-6 mb-1">Pricing and Promotions</h4>
                      <p>All prices are inclusive of applicable taxes unless stated otherwise. Delivery fees may apply based on order value and distance. Promotional codes are subject to specific terms and can be withdrawn without prior notice.</p>
                      
                      <h4 className="font-black text-slate-800 text-base mt-6 mb-1">Prohibited Use</h4>
                      <p>You may not use our service for any unlawful purpose. You agree not to attempt to compromise the security of the application or exploit any bugs or vulnerabilities.</p>
                    </div>
                  </div>
                )}

                {/* Tab 4: Privacy Settings */}
                {activeTab === 'privacy' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Privacy & Data Settings</h2>
                      <p className="text-sm font-bold text-slate-400 mt-2">Manage how we collect and use your data.</p>
                    </div>

                    <form onSubmit={handlePrivacySave} className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] shadow-sm">
                          <div className="pr-4">
                            <h4 className="font-black text-slate-800 mb-1">Strictly Necessary</h4>
                            <p className="text-xs text-slate-500 font-bold leading-relaxed">These cookies are required for basic app functionality, such as user authentication and secure checkout. They cannot be disabled.</p>
                          </div>
                          <div className="pt-1">
                            <input type="checkbox" checked disabled className="w-5 h-5 accent-emerald-500 rounded opacity-50 cursor-not-allowed" />
                          </div>
                        </div>

                        <label className="flex items-start justify-between p-6 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm hover:border-emerald-300 transition-colors cursor-pointer group">
                          <div className="pr-4">
                            <h4 className="font-black text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors">Analytics & Performance</h4>
                            <p className="text-xs text-slate-500 font-bold leading-relaxed">Allows us to track app usage anonymously to improve performance and user experience over time.</p>
                          </div>
                          <div className="pt-1">
                            <input 
                              type="checkbox" 
                              checked={privacyPrefs.analytics}
                              onChange={(e) => setPrivacyPrefs({...privacyPrefs, analytics: e.target.checked})}
                              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer" 
                            />
                          </div>
                        </label>

                        <label className="flex items-start justify-between p-6 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm hover:border-emerald-300 transition-colors cursor-pointer group">
                          <div className="pr-4">
                            <h4 className="font-black text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors">Personalized Marketing</h4>
                            <p className="text-xs text-slate-500 font-bold leading-relaxed">Enables us to show you relevant offers and tailored discounts based on your purchase history.</p>
                          </div>
                          <div className="pt-1">
                            <input 
                              type="checkbox" 
                              checked={privacyPrefs.marketing}
                              onChange={(e) => setPrivacyPrefs({...privacyPrefs, marketing: e.target.checked})}
                              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer" 
                            />
                          </div>
                        </label>

                        <label className="flex items-start justify-between p-6 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm hover:border-emerald-300 transition-colors cursor-pointer group">
                          <div className="pr-4">
                            <h4 className="font-black text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors">Location Services</h4>
                            <p className="text-xs text-slate-500 font-bold leading-relaxed">Allows the app to access your precise location for faster delivery routing and local store inventory checking.</p>
                          </div>
                          <div className="pt-1">
                            <input 
                              type="checkbox" 
                              checked={privacyPrefs.location}
                              onChange={(e) => setPrivacyPrefs({...privacyPrefs, location: e.target.checked})}
                              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer" 
                            />
                          </div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                        <div>
                          {prefsSaved && <span className="text-sm font-black text-emerald-600 flex items-center gap-2"><Check className="w-5 h-5"/> Preferences saved successfully!</span>}
                        </div>
                        <button
                          type="submit"
                          className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-sm shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] active:scale-95 transition-all"
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
