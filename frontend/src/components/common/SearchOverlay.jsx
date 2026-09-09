import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await API.get(`/products?search=${encodeURIComponent(query)}&limit=6`);
          setResults(res.data);
        } catch (error) {
          console.error('Search failed', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleResultClick = (productId) => {
    navigate(`/product/${productId}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex justify-center items-start pt-20 px-4 sm:px-6"
        >
          <div className="absolute inset-0" onClick={onClose}></div>
          
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header / Input */}
            <form onSubmit={handleSearchSubmit} className="flex items-center p-4 sm:p-6 border-b border-gray-100">
              <Search className="w-6 h-6 text-gray-400 ml-2" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for groceries, vegetables, and more..."
                className="flex-1 bg-transparent border-none outline-none px-4 text-xl sm:text-2xl font-medium text-gray-800 placeholder:text-gray-300"
              />
              {query && (
                <button 
                  type="button" 
                  onClick={() => setQuery('')}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button 
                type="button" 
                onClick={onClose}
                className="ml-2 p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-800 transition-colors"
              >
                Esc
              </button>
            </form>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto">
              {isSearching ? (
                <div className="flex justify-center items-center py-12 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                </div>
              ) : results.length > 0 ? (
                <div className="p-4 sm:p-6">
                  <h3 className="text-sm font-bold text-gray-400 mb-4 tracking-wider uppercase">Products</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.map((product) => (
                      <div 
                        key={product._id} 
                        onClick={() => handleResultClick(product._id)}
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100 group"
                      >
                        <div className="w-16 h-16 rounded-xl bg-white border border-gray-100 flex-shrink-0 flex items-center justify-center p-2">
                          <img 
                            src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e'} 
                            alt={product.name} 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 line-clamp-1 group-hover:text-brand-500 transition-colors">{product.name}</h4>
                          <p className="text-sm font-semibold text-brand-500 mt-1">₹{product.price}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </div>
                    ))}
                  </div>
                  
                  <div 
                    onClick={handleSearchSubmit}
                    className="mt-6 flex items-center justify-center p-4 bg-brand-50 text-brand-600 font-bold rounded-2xl cursor-pointer hover:bg-brand-100 transition-colors"
                  >
                    View all results for "{query}"
                  </div>
                </div>
              ) : query.trim().length > 1 ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">No results found</h3>
                  <p className="text-gray-500">We couldn't find anything matching "{query}".<br/>Try searching for something else.</p>
                </div>
              ) : (
                <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                  <p className="text-gray-400 font-medium">Type at least 2 characters to search</p>
                  <div className="flex gap-2 mt-6 flex-wrap justify-center max-w-lg">
                    {['Apple', 'Milk', 'Bread', 'Chicken', 'Chips', 'Cold Drink'].map(term => (
                      <span 
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-4 py-2 bg-gray-50 text-gray-600 rounded-full text-sm font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
