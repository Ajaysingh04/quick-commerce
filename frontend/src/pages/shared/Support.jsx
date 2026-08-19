import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, RefreshCw, FileText, Shield, Mail, Phone, Clock, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  { id: 'contact', name: 'Contact Support', icon: MessageSquare, description: 'Get in touch with our team' },
  { id: 'refund', name: 'Refund Policy', icon: RefreshCw, description: 'Learn about cancellations and refunds' },
  { id: 'terms', name: 'Terms of Service', icon: FileText, description: 'Our terms and order agreements' },
  { id: 'privacy', name: 'Privacy Settings', icon: Shield, description: 'Manage cookies and user data' }
];

const Support = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  // Sync tab state with URL parameter (?tab=...)
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

  // Contact Form Submission Handler
  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormLoading(true);
    // Simulate API submission
    setTimeout(() => {
      setFormLoading(false);
      setFormSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  // Privacy Save Handler
  const handlePrivacySave = (e) => {
    e.preventDefault();
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 3000);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 font-sans selection:bg-red-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        
        {/* Page Header */}
        <div className="bg-gradient-to-br from-[#e31837] via-[#d61330] to-[#b30f26] text-white rounded-3xl p-8 md:p-12 shadow-lg shadow-red-500/20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-white blur-[100px] rounded-full transform -rotate-45"></div>
          </div>
          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Help & Support Center</h1>
            <p className="text-white/90 font-medium text-sm md:text-lg max-w-2xl leading-relaxed">
              Have questions about your order, refunds, or privacy preferences? We are here to help 24/7.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          {/* Left Side: Navigation Links / Tab selector */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2 mb-4">
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
                      className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all group ${
                        active
                          ? 'border-[#e31837] bg-red-50 shadow-sm shadow-red-500/10'
                          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-slate-900'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl transition-colors ${
                        active 
                          ? 'bg-[#e31837] text-white shadow-md shadow-red-500/30' 
                          : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={`text-sm block leading-snug ${active ? 'font-black text-[#e31837]' : 'font-bold text-slate-800'}`}>
                          {tab.name}
                        </span>
                        <span className={`text-[11px] mt-1 block leading-tight font-medium ${active ? 'text-red-400' : 'text-gray-500'}`}>
                          {tab.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Help Contacts Card */}
            <div className="bg-[#fdf8f8] border border-red-50 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Direct Contact
              </h3>
              <div className="space-y-4 text-sm text-slate-700 font-medium">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-full shadow-sm"><Mail className="w-4 h-4 text-[#e31837] shrink-0" /></div>
                  <span>support@rosedash.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-full shadow-sm"><Phone className="w-4 h-4 text-[#e31837] shrink-0" /></div>
                  <span>+91 1800 123 4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-full shadow-sm"><Clock className="w-4 h-4 text-[#e31837] shrink-0" /></div>
                  <span>Average response: under 1 hour</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Displaying content of active tab */}
          <div className="w-full lg:w-2/3 bg-white border border-gray-100 rounded-3xl p-6 md:p-10 shadow-sm min-h-[500px] flex flex-col relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex-grow flex flex-col justify-between relative z-10"
              >
                {/* Tab 1: Contact Form */}
                {activeTab === 'contact' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Submit a Support Ticket</h2>
                      <p className="text-sm font-medium text-gray-500 mt-2">Our support specialists will resolve your inquiry as soon as possible.</p>
                    </div>

                    {formSubmitted ? (
                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-green-50 border border-green-100 rounded-3xl p-8 text-center space-y-4 py-16"
                      >
                        <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-green-500/30">
                          <Check className="w-8 h-8" />
                        </div>
                        <h4 className="font-black text-green-700 text-xl">Message Sent Successfully!</h4>
                        <p className="text-sm text-green-600/80 max-w-sm mx-auto font-medium leading-relaxed">
                          Thank you for contacting RoseDash. A support staff has been assigned, and a confirmation email is on its way to your inbox.
                        </p>
                        <button
                          onClick={() => setFormSubmitted(false)}
                          className="mt-4 px-6 py-2 bg-white border border-green-200 text-green-700 font-bold rounded-xl shadow-sm hover:bg-green-100 transition-colors"
                        >
                          Send another query
                        </button>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleContactSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Your Name</label>
                            <input
                              type="text"
                              required
                              placeholder="John Doe"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-[#e31837] focus:border-transparent text-sm transition-all shadow-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Email Address</label>
                            <input
                              type="email"
                              required
                              placeholder="you@example.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-[#e31837] focus:border-transparent text-sm transition-all shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Subject</label>
                          <input
                            type="text"
                            required
                            placeholder="Order inquiry, promo issues, delivery delays..."
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-[#e31837] focus:border-transparent text-sm transition-all shadow-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-500">How can we help?</label>
                          <textarea
                            required
                            rows="5"
                            placeholder="Describe your issue or feedback in detail..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-[#e31837] focus:border-transparent text-sm resize-none transition-all shadow-sm"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={formLoading}
                          className="w-full md:w-auto px-8 py-3.5 bg-[#e31837] hover:bg-[#c8102e] disabled:bg-gray-300 disabled:shadow-none text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 active:scale-95 transition-all self-end float-right"
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
                      <p className="text-sm font-medium text-gray-500 mt-2">Please review our guidelines to submit cancellations or refund queries.</p>
                    </div>

                    <div className="space-y-6 text-sm text-slate-600 font-medium leading-relaxed bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <div>
                        <h4 className="font-bold text-slate-800 text-base mb-2">1. Cancellation Window</h4>
                        <p>Orders can only be cancelled within 60 seconds of placement. Since RoseDash guarantees ultra-fast 10-minute delivery, processing begins immediately. Once the order leaves our micro-fulfillment center, cancellation is no longer possible.</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-base mb-2">2. Damaged or Defective Items</h4>
                        <p>If you receive items that are damaged, expired, or significantly different from what was described, you may request a refund within 24 hours of delivery. Please provide a clear photograph of the item via our contact form.</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-base mb-2">3. Refund Processing Time</h4>
                        <p>Approved refunds are processed to your original payment method within 3-5 business days. Wallet refunds, if applicable, are credited instantly.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Terms of Service */}
                {activeTab === 'terms' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Terms of Service</h2>
                      <p className="text-sm font-medium text-gray-500 mt-2">The legal agreements governing your use of RoseDash.</p>
                    </div>

                    <div className="space-y-6 text-sm text-slate-600 font-medium leading-relaxed bg-gray-50 p-6 rounded-3xl border border-gray-100 h-96 overflow-y-auto custom-scrollbar">
                      <p>Welcome to RoseDash. By accessing our application and using our services, you agree to comply with and be bound by the following terms and conditions.</p>
                      
                      <h4 className="font-bold text-slate-800 text-base mb-1">Service Availability</h4>
                      <p>Our 10-minute delivery guarantee is subject to operating hours, weather conditions, and rider availability in your specific geofenced area. RoseDash reserves the right to cancel orders if the delivery address falls outside our active radius.</p>
                      
                      <h4 className="font-bold text-slate-800 text-base mt-6 mb-1">User Accounts</h4>
                      <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account.</p>

                      <h4 className="font-bold text-slate-800 text-base mt-6 mb-1">Pricing and Promotions</h4>
                      <p>All prices are inclusive of applicable taxes unless stated otherwise. Delivery fees may apply based on order value and distance. Promotional codes are subject to specific terms and can be withdrawn without prior notice.</p>
                      
                      <h4 className="font-bold text-slate-800 text-base mt-6 mb-1">Prohibited Use</h4>
                      <p>You may not use our service for any unlawful purpose. You agree not to attempt to compromise the security of the application or exploit any bugs or vulnerabilities.</p>
                    </div>
                  </div>
                )}

                {/* Tab 4: Privacy Settings */}
                {activeTab === 'privacy' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Privacy & Data Settings</h2>
                      <p className="text-sm font-medium text-gray-500 mt-2">Manage how RoseDash collects and uses your data.</p>
                    </div>

                    <form onSubmit={handlePrivacySave} className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between p-5 bg-white border border-gray-200 rounded-2xl shadow-sm">
                          <div className="pr-4">
                            <h4 className="font-bold text-slate-800 mb-1">Strictly Necessary</h4>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">These cookies are required for basic app functionality, such as user authentication and secure checkout. They cannot be disabled.</p>
                          </div>
                          <div className="pt-1">
                            <input type="checkbox" checked disabled className="w-5 h-5 accent-[#e31837] rounded opacity-50 cursor-not-allowed" />
                          </div>
                        </div>

                        <div className="flex items-start justify-between p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-red-200 transition-colors">
                          <div className="pr-4">
                            <h4 className="font-bold text-slate-800 mb-1">Analytics & Performance</h4>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">Allows us to track app usage anonymously to improve performance and user experience over time.</p>
                          </div>
                          <div className="pt-1">
                            <input 
                              type="checkbox" 
                              checked={privacyPrefs.analytics}
                              onChange={(e) => setPrivacyPrefs({...privacyPrefs, analytics: e.target.checked})}
                              className="w-5 h-5 accent-[#e31837] rounded cursor-pointer" 
                            />
                          </div>
                        </div>

                        <div className="flex items-start justify-between p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-red-200 transition-colors">
                          <div className="pr-4">
                            <h4 className="font-bold text-slate-800 mb-1">Personalized Marketing</h4>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">Enables RoseDash to show you relevant offers and tailored discounts based on your purchase history.</p>
                          </div>
                          <div className="pt-1">
                            <input 
                              type="checkbox" 
                              checked={privacyPrefs.marketing}
                              onChange={(e) => setPrivacyPrefs({...privacyPrefs, marketing: e.target.checked})}
                              className="w-5 h-5 accent-[#e31837] rounded cursor-pointer" 
                            />
                          </div>
                        </div>

                        <div className="flex items-start justify-between p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-red-200 transition-colors">
                          <div className="pr-4">
                            <h4 className="font-bold text-slate-800 mb-1">Location Services</h4>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">Allows the app to access your precise location for faster delivery routing and local store inventory checking.</p>
                          </div>
                          <div className="pt-1">
                            <input 
                              type="checkbox" 
                              checked={privacyPrefs.location}
                              onChange={(e) => setPrivacyPrefs({...privacyPrefs, location: e.target.checked})}
                              className="w-5 h-5 accent-[#e31837] rounded cursor-pointer" 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          {prefsSaved && <span className="text-sm font-bold text-green-600 flex items-center gap-2"><Check className="w-4 h-4"/> Preferences saved successfully!</span>}
                        </div>
                        <button
                          type="submit"
                          className="px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm shadow-md active:scale-95 transition-all"
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
