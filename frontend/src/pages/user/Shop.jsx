import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Search } from 'lucide-react';
import { CATEGORIES } from './Home';

const Shop = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = CATEGORIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fdf8f8] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-6 flex flex-col items-start">
          <div 
            className="flex items-center gap-2 mb-1 cursor-pointer hover:text-red-600 transition-colors" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-6 h-6 font-bold" />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Categories</h1>
          </div>
          <p className="text-sm text-gray-500 font-medium ml-8">Browse departments · Tap a category to see products</p>
        </div>

        {/* Search Bar */}
        <div className="mb-12 ml-8">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm max-w-[1000px] hover:border-gray-300 transition-colors focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-400">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input 
              type="text" 
              placeholder="Search categories..." 
              className="bg-transparent w-full outline-none text-sm text-gray-700" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="ml-8">
          <h2 className="text-xl font-black text-[#1a1b2e] mb-8">Shop by category</h2>
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-6">
              {filteredCategories.map(c => (
                <Link key={c.id} to={`/category/${c.id}`} className="flex flex-col items-center cursor-pointer group">
                  <div className="w-full aspect-square max-w-[120px] rounded-[24px] bg-[#fff5f6] mb-3 overflow-hidden p-3 border border-red-50 group-hover:border-red-200 transition-all group-hover:shadow-sm flex items-center justify-center">
                    <img src={c.image} alt={c.name} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <span className="text-[10px] md:text-[11px] font-medium text-gray-800 text-center tracking-tight leading-snug px-1">{c.name}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm mt-8">No categories found matching "{searchQuery}"</div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Shop;
