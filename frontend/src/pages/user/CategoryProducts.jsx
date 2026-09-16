import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ArrowLeft, Search, ShoppingBag, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../../components/common/ProductCard';
import API from '../../services/api.js';

const CategoryProducts = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategoryProducts = useCallback(async (catId) => {
    setLoading(true);
    try {
      let endpoint = '/products';
      if (catId && catId !== 'search') {
        endpoint = `/products?category=${catId}`;
      }
      
      const res = await API.get(endpoint);
      const fetchedProducts = (res.data || []).map((p) => ({
        ...p,
        id: p._id || p.id,
      }));

      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Failed to fetch category products', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setLoading(true);
    setSearchTerm('');

    const loadData = async () => {
      try {
        const catRes = await API.get('/products/categories');
        const cats = catRes.data || [];
        setCategories(cats);
        
        let currentCat = null;
        if (id === 'search') {
          currentCat = { name: 'Search Results' };
        } else {
          currentCat = cats.find((c) => c._id === id);
          if (!currentCat) {
            currentCat = { name: id.charAt(0).toUpperCase() + id.slice(1) };
          }
        }
        setCategory(currentCat);
        await fetchCategoryProducts(id);
      } catch (err) {
        console.error('Failed to load category', err);
        setLoading(false);
      }
    };

    loadData();

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socket.on('contentUpdated', () => {
      loadData();
    });

    return () => socket.disconnect();
  }, [id, fetchCategoryProducts]);

  const filteredProducts = products.filter((p) => {
    if (!searchTerm.trim()) return true;
    return p.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-900 font-sans">
      
      {/* Category Header Banner */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700 transition shadow-xs"
              aria-label="Go Back"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Link to="/" className="hover:text-slate-700 transition">Home</Link>
                <ChevronRight size={12} />
                <Link to="/shop" className="hover:text-slate-700 transition">Categories</Link>
                <ChevronRight size={12} />
                <span className="text-emerald-600 font-bold">{category ? category.name : 'Loading...'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 mt-0.5">
                {category ? category.name : 'Loading Category...'}
                {!loading && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    {filteredProducts.length} items
                  </span>
                )}
              </h1>
            </div>
          </div>

          {/* Quick Filter Search inside Category */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2 w-full sm:w-72 focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-xs">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder={`Search in ${category?.name || 'category'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent w-full outline-none text-xs sm:text-sm text-slate-800 font-medium placeholder:text-slate-400"
            />
          </div>

        </div>

        {/* Category Quick Switcher Pills */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 overflow-x-auto no-scrollbar flex gap-2">
          {categories.map((cat) => {
            const isActive = cat._id === id;
            return (
              <button 
                key={cat._id}
                onClick={() => navigate(`/category/${cat._id}`)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 border border-slate-200/60'
                }`}
              >
                {cat.image && (
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-4 h-4 object-contain rounded-full bg-white/80" 
                  />
                )}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {loading ? (
          /* Shimmer Loading Skeleton Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div 
                key={idx} 
                className="h-72 rounded-[26px] bg-white border border-slate-200/80 p-3.5 flex flex-col justify-between skeleton-shimmer shadow-xs"
              />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          /* Products Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty State (Only shown when loading is complete and 0 items match) */
          <div className="text-center mt-12 bg-white p-10 sm:p-14 rounded-3xl shadow-sm border border-slate-200/80 max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <ShoppingBag size={36} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
              {searchTerm ? 'No matching products' : 'No items in this category'}
            </h2>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
              {searchTerm 
                ? `We couldn't find any items matching "${searchTerm}". Try searching for something else.`
                : `We are currently restocking ${category?.name || 'this category'}. Check back shortly or browse other fresh essentials.`}
            </p>
            <div className="flex gap-3 justify-center">
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-xs transition"
                >
                  Clear Search
                </button>
              )}
              <button 
                onClick={() => navigate('/shop')} 
                className="bg-slate-900 hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all hover:scale-105"
              >
                Browse All Categories
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CategoryProducts;
