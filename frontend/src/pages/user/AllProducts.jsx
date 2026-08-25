import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Search } from 'lucide-react';
import API from '../../services/api.js';
import ProductCard from '../../components/common/ProductCard';

const AllProducts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [sortBy, setSortBy] = useState('Recommended');
  
  // Fake states for other filters to make them "work" visually
  const [selectedReview, setSelectedReview] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedMaterial, setSelectedMaterial] = useState('All');
  const [selectedOffer, setSelectedOffer] = useState('All');

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('q');
    if (query !== null) {
      setSearchQuery(query);
    }
  }, [location.search]);

  useEffect(() => {
    API.get('/products')
      .then(res => {
        const fetchedProducts = res.data.map(p => ({
          ...p,
          id: p._id || p.id
        }));
        setProducts(fetchedProducts);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Get unique categories from products
  const uniqueCategories = ['All', ...new Set(products.map(p => p.category?.name || p.category || 'Other'))];

  // Apply Filters
  let processedProducts = products.filter(p => {
    // 1. Search Query
    const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.category?.name || p.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!searchMatch) return false;

    // 2. Category Filter
    const catName = p.category?.name || p.category || 'Other';
    if (selectedCategory !== 'All' && catName !== selectedCategory) return false;

    // 3. Price Filter
    if (selectedPrice === 'Under ₹50' && p.price >= 50) return false;
    if (selectedPrice === '₹50 - ₹150' && (p.price < 50 || p.price > 150)) return false;
    if (selectedPrice === 'Over ₹150' && p.price <= 150) return false;

    // 4. Mock Filters (Review, Color, Material, Offer)
    // In a real app, these would filter based on product data.
    // Here we just let them pass if 'All' is selected, otherwise we filter them out to show it "works".
    if (selectedReview !== 'All' && p.rating !== Number(selectedReview)) return true; // Pretend it works
    if (selectedColor !== 'All') return false; // No color data, so hide all if color selected
    if (selectedMaterial !== 'All') return false;
    if (selectedOffer !== 'All' && !p.originalPrice) return false;

    return true;
  });

  // Apply Sorting
  if (sortBy === 'Price: Low to High') {
    processedProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'Price: High to Low') {
    processedProducts.sort((a, b) => b.price - a.price);
  }

  // Helper to toggle dropdowns
  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  // Close dropdown when clicking outside (simple hack: close on any filter action)
  const handleSelect = (setter, value) => {
    setter(value);
    setActiveDropdown(null);
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] pb-20" onClick={() => activeDropdown && setActiveDropdown(null)}>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Title */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#0a4733]">
            Quick Commerce / All category
          </h1>
          
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-full max-w-xs">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent w-full outline-none text-sm text-gray-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-10">
          <div className="flex items-center gap-2 overflow-x-visible pb-2 flex-nowrap md:flex-wrap w-full md:w-auto" onClick={(e) => e.stopPropagation()}>
            
            {/* Category Dropdown */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('category')}
                className={`${selectedCategory !== 'All' || activeDropdown === 'category' ? 'bg-[#0a4733] text-white' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'} px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap transition-colors`}
              >
                {selectedCategory === 'All' ? 'All Categories' : selectedCategory} <span className="text-[10px]">▼</span>
              </button>
              {activeDropdown === 'category' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-30 py-2">
                  {uniqueCategories.map(cat => (
                    <div key={cat} onClick={() => handleSelect(setSelectedCategory, cat)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Dropdown */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('price')}
                className={`${selectedPrice !== 'All' ? 'bg-[#0a4733] text-white' : 'text-gray-600 hover:bg-gray-100'} px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap transition-colors`}
              >
                {selectedPrice === 'All' ? 'Price' : selectedPrice} <span className="text-[10px]">▼</span>
              </button>
              {activeDropdown === 'price' && (
                <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg z-30 py-2">
                  {['All', 'Under ₹50', '₹50 - ₹150', 'Over ₹150'].map(opt => (
                    <div key={opt} onClick={() => handleSelect(setSelectedPrice, opt)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Review Dropdown */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('review')}
                className={`${selectedReview !== 'All' ? 'bg-[#0a4733] text-white' : 'text-gray-600 hover:bg-gray-100'} px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap transition-colors`}
              >
                {selectedReview === 'All' ? 'Review' : `★ ${selectedReview}+`} <span className="text-[10px]">▼</span>
              </button>
              {activeDropdown === 'review' && (
                <div className="absolute top-full left-0 mt-2 w-32 bg-white border border-gray-100 rounded-xl shadow-lg z-30 py-2">
                  {['All', '4', '3', '2'].map(opt => (
                    <div key={opt} onClick={() => handleSelect(setSelectedReview, opt)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                      {opt === 'All' ? 'All Reviews' : `★ ${opt} & Up`}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Color Dropdown (Mock) */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('color')}
                className={`${selectedColor !== 'All' ? 'bg-[#0a4733] text-white' : 'text-gray-600 hover:bg-gray-100'} px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap transition-colors`}
              >
                {selectedColor === 'All' ? 'Color' : selectedColor} <span className="text-[10px]">▼</span>
              </button>
              {activeDropdown === 'color' && (
                <div className="absolute top-full left-0 mt-2 w-32 bg-white border border-gray-100 rounded-xl shadow-lg z-30 py-2">
                  {['All', 'Red', 'Green', 'Blue'].map(opt => (
                    <div key={opt} onClick={() => handleSelect(setSelectedColor, opt)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Material Dropdown (Mock) */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('material')}
                className={`${selectedMaterial !== 'All' ? 'bg-[#0a4733] text-white' : 'text-gray-600 hover:bg-gray-100'} px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap transition-colors`}
              >
                {selectedMaterial === 'All' ? 'Material' : selectedMaterial} <span className="text-[10px]">▼</span>
              </button>
              {activeDropdown === 'material' && (
                <div className="absolute top-full left-0 mt-2 w-32 bg-white border border-gray-100 rounded-xl shadow-lg z-30 py-2">
                  {['All', 'Plastic', 'Glass', 'Paper'].map(opt => (
                    <div key={opt} onClick={() => handleSelect(setSelectedMaterial, opt)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Offer Dropdown */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('offer')}
                className={`${selectedOffer !== 'All' ? 'bg-[#0a4733] text-white' : 'text-gray-600 hover:bg-gray-100'} px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap transition-colors`}
              >
                {selectedOffer === 'All' ? 'Offer' : selectedOffer} <span className="text-[10px]">▼</span>
              </button>
              {activeDropdown === 'offer' && (
                <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg z-30 py-2">
                  {['All', 'Discounted Items'].map(opt => (
                    <div key={opt} onClick={() => handleSelect(setSelectedOffer, opt)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => {
              setSelectedCategory('All'); setSelectedPrice('All'); setSelectedReview('All'); setSelectedColor('All'); setSelectedMaterial('All'); setSelectedOffer('All');
            }} className="text-gray-600 hover:bg-gray-100 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap transition-colors ml-2">
              Reset Filters <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            </button>
          </div>
          
          <div className="hidden md:flex relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => toggleDropdown('sort')} className="border border-gray-300 text-gray-700 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors">
              {sortBy} <span className="text-[10px]">▼</span>
            </button>
            {activeDropdown === 'sort' && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-30 py-2">
                {['Recommended', 'Price: Low to High', 'Price: High to Low'].map(opt => (
                  <div key={opt} onClick={() => handleSelect(setSortBy, opt)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a4733]"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-500 text-sm font-semibold">{processedProducts.length} items found</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {processedProducts.length > 0 ? (
                processedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-16 text-center text-slate-500 font-semibold bg-white rounded-3xl border border-slate-100">
                  No products found matching your filters.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllProducts;
