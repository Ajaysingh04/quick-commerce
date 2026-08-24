import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../../services/api.js';

const Shop = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);

  React.useEffect(() => {
    API.get('/products/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-slate-50 py-10 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-6 flex flex-col items-start">
          <div 
            className="flex items-center gap-2 mb-1 cursor-pointer hover:text-emerald-600 transition-colors" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-6 h-6 font-black" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Categories</h1>
          </div>
          <p className="text-sm text-slate-500 font-bold ml-8 uppercase tracking-widest">Browse departments &bull; Discover our products</p>
        </div>

        {/* Search Bar */}
        <div className="mb-12 ml-8">
          <div className="flex items-center bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 shadow-sm max-w-[1000px] hover:border-slate-200 transition-all focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:shadow-md group">
            <Search className="w-5 h-5 text-slate-400 mr-3 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search categories..." 
              className="bg-transparent w-full outline-none text-sm font-bold text-slate-800 placeholder:text-slate-300" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="ml-8">
          <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">Shop by category</h2>
          {filteredCategories.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-6"
            >
              {filteredCategories.map(c => (
                <motion.div variants={itemVariants} key={c._id}>
                  <Link to={`/category/${c._id}`} className="flex flex-col items-center cursor-pointer group">
                    <div className="w-full aspect-square max-w-[120px] rounded-[2rem] bg-white mb-3 overflow-hidden p-4 border border-slate-100 shadow-sm group-hover:border-emerald-200 group-hover:bg-emerald-50/50 group-hover:shadow-xl group-hover:shadow-emerald-500/10 group-active:scale-95 transition-all duration-300 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <img src={c.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e'} alt={c.name} className="w-full h-full object-contain mix-blend-multiply relative z-10 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 text-center tracking-tight leading-snug px-1 group-hover:text-emerald-600 transition-colors">{c.name}</span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-slate-500 font-medium text-sm mt-8 bg-slate-100/50 rounded-2xl p-8 border border-dashed border-slate-200 inline-block">No categories found matching "{searchQuery}"</div>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default Shop;
