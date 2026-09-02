import React from 'react';
import { Clock, Leaf, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
const imgAbout = '/assets/About.jpg';

const About = () => {
  const navigate = useNavigate();
  const [aboutBanner, setAboutBanner] = React.useState(null);

  React.useEffect(() => {
    const fetchBanner = async () => {
      try {
        const { default: API } = await import('../../services/api.js');
        const res = await API.get('/banners/active');
        const banners = res.data.filter(b => b.category === 'about');
        if (banners.length > 0) {
          setAboutBanner(banners[0]);
        }
      } catch (error) {
        console.error("Failed to fetch about banner", error);
      }
    };
    fetchBanner();
  }, []);

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="bg-white font-sans selection:bg-emerald-500/30">
      
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={aboutBanner?.imageUrl || imgAbout} 
            alt={aboutBanner?.title || "About Quick Commerce"} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col justify-center">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            <motion.span variants={fadeUp} className="text-emerald-400 font-black tracking-widest uppercase text-xs mb-4 block">About Us</motion.span>
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 tracking-tighter">
              {aboutBanner ? aboutBanner.title : (
                <>Redefining <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Quick Commerce</span></>
              )}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-300 font-semibold mb-8 max-w-xl">
              {aboutBanner?.subtitle || "Welcome to our platform. We believe that accessing fresh, premium-quality daily essentials shouldn't be a chore. It should be an experience."}
            </motion.p>
            <motion.button 
              variants={fadeUp}
              onClick={() => navigate('/shop')}
              className="bg-emerald-600 text-white px-10 py-4 rounded-xl font-black tracking-wide shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:bg-emerald-700 active:scale-95 transition-all"
            >
              Start Shopping
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Our Mission */}
      <div className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="md:w-1/2"
            >
              <div className="grid grid-cols-2 gap-4">
                <img src="https://images.unsplash.com/photo-1515706886582-54c73c5eaf41?auto=format&fit=crop&w=600&q=80" alt="Fresh Groceries" className="rounded-3xl shadow-xl shadow-slate-200/50 w-full h-72 object-cover transform translate-y-8" />
                <img src="https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=600&q=80" alt="Delivery" className="rounded-3xl shadow-xl shadow-slate-200/50 w-full h-72 object-cover" />
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="md:w-1/2"
            >
              <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 tracking-tight">Our Story</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6 font-medium">
                Born out of a desire to simplify urban living, <span className="text-emerald-600 font-black">Quick Commerce</span> was created to bridge the gap between farm-fresh quality and ultra-fast delivery. 
              </p>
              <p className="text-slate-600 text-lg leading-relaxed mb-10 font-medium">
                We observed that people were compromising either on time or on quality. Our vision is to ensure you never have to make that compromise again. We bring the freshest groceries, dairy, and household items directly to your doorstep in minutes.
              </p>
              
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-3 rounded-2xl"><CheckCircle2 className="w-6 h-6 text-emerald-600" /></div>
                  <span className="text-slate-700 font-bold text-lg">Sourced from top-tier local farms.</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-3 rounded-2xl"><CheckCircle2 className="w-6 h-6 text-emerald-600" /></div>
                  <span className="text-slate-700 font-bold text-lg">Rigorous quality checks every morning.</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-3 rounded-2xl"><CheckCircle2 className="w-6 h-6 text-emerald-600" /></div>
                  <span className="text-slate-700 font-bold text-lg">Zero-emission delivery fleet.</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Grid */}
      <div className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">Why Choose Us?</h2>
            <p className="text-slate-500 font-bold max-w-2xl mx-auto">We focus on what matters most to you. Speed, quality, and reliability.</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeUp} className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors pointer-events-none"></div>
              <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center shadow-sm mb-8 group-hover:-translate-y-2 transition-transform duration-300 border border-slate-100 group-hover:border-emerald-100">
                <Clock className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Lightning Fast</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Need it now? Our hyper-local micro-fulfillment centers ensure your order reaches you before you even realize it.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors pointer-events-none"></div>
              <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center shadow-sm mb-8 group-hover:-translate-y-2 transition-transform duration-300 border border-slate-100 group-hover:border-emerald-100">
                <Leaf className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Farm Fresh</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                We partner with trusted growers. If it's not fresh enough for our family, it doesn't make it to your basket.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors pointer-events-none"></div>
              <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center shadow-sm mb-8 group-hover:-translate-y-2 transition-transform duration-300 border border-slate-100 group-hover:border-emerald-100">
                <ShieldCheck className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Premium Quality</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                From luxury chocolates to daily staples, every item in our inventory is hand-picked for absolute perfection.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default About;
