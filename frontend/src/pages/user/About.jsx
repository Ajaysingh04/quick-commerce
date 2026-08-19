import React from 'react';
import { Clock, Leaf, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import imgAbout from '../../assets/About.jpg';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white font-sans selection:bg-red-500/30">
      
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={imgAbout} 
            alt="About RoseDash" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a]/90 via-[#1a1a1a]/70 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col justify-center">
          <div className="max-w-2xl">
            <span className="text-[#e31837] font-bold tracking-widest uppercase text-sm mb-4 block">About Us</span>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 tracking-tighter">
              Redefining <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#e31837]">Quick Commerce</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 font-medium mb-8 max-w-xl">
              Welcome to RoseDash. We believe that accessing fresh, premium-quality daily essentials shouldn't be a chore. It should be an experience.
            </p>
            <button 
              onClick={() => navigate('/shop')}
              className="bg-[#e31837] text-white px-8 py-3.5 rounded-xl font-bold tracking-wide shadow-lg shadow-red-500/30 hover:bg-[#c8102e] hover:-translate-y-1 transition-all"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>

      {/* Our Mission */}
      <div className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                <img src="https://images.unsplash.com/photo-1515706886582-54c73c5eaf41?auto=format&fit=crop&w=600&q=80" alt="Fresh Groceries" className="rounded-3xl shadow-xl w-full h-64 object-cover transform translate-y-8 animate-float" />
                <img src="https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=600&q=80" alt="Delivery" className="rounded-3xl shadow-xl w-full h-64 object-cover animate-float-delayed" />
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-6 tracking-tight">Our Story</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6 font-medium">
                Born out of a desire to simplify urban living, <span className="text-[#e31837] font-bold">RoseDash</span> was created to bridge the gap between farm-fresh quality and ultra-fast delivery. 
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8 font-medium">
                We observed that people were compromising either on time or on quality. Our vision is to ensure you never have to make that compromise again. We bring the freshest groceries, dairy, and household items directly to your doorstep in minutes.
              </p>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-full"><CheckCircle2 className="w-5 h-5 text-[#e31837]" /></div>
                  <span className="text-slate-700 font-bold">Sourced from top-tier local farms.</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-full"><CheckCircle2 className="w-5 h-5 text-[#e31837]" /></div>
                  <span className="text-slate-700 font-bold">Rigorous quality checks every morning.</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-full"><CheckCircle2 className="w-5 h-5 text-[#e31837]" /></div>
                  <span className="text-slate-700 font-bold">Zero-emission delivery fleet.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Grid */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 tracking-tight">Why Choose RoseDash?</h2>
            <p className="text-gray-500 font-medium max-w-2xl mx-auto">We focus on what matters most to you. Speed, quality, and reliability.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#fdf8f8] p-8 rounded-3xl border border-red-50 hover:shadow-xl hover:shadow-red-500/10 transition-all group">
              <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:-translate-y-2 transition-transform">
                <Clock className="w-8 h-8 text-[#e31837]" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Lightning Fast</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Need it now? Our hyper-local micro-fulfillment centers ensure your order reaches you before you even realize it.
              </p>
            </div>

            <div className="bg-[#fdf8f8] p-8 rounded-3xl border border-red-50 hover:shadow-xl hover:shadow-red-500/10 transition-all group">
              <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:-translate-y-2 transition-transform">
                <Leaf className="w-8 h-8 text-[#e31837]" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Farm Fresh</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                We partner with trusted growers. If it's not fresh enough for our family, it doesn't make it to your basket.
              </p>
            </div>

            <div className="bg-[#fdf8f8] p-8 rounded-3xl border border-red-50 hover:shadow-xl hover:shadow-red-500/10 transition-all group">
              <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:-translate-y-2 transition-transform">
                <ShieldCheck className="w-8 h-8 text-[#e31837]" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Premium Quality</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                From luxury chocolates to daily staples, every item in our inventory is hand-picked for absolute perfection.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default About;
