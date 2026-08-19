import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ShoppingBag } from 'lucide-react';
import ProductCard from '../../components/common/ProductCard';
import { CATEGORIES, PRODUCTS } from './Home';

const CategoryProducts = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const cat = CATEGORIES.find(c => c.id === id);
    if (cat) {
      setCategory(cat);
      // Mock filtering products by category
      setProducts(PRODUCTS.filter(p => p.category === id));
    } else if (id === 'search') {
      setCategory({ name: 'Search Results' });
      setProducts(PRODUCTS);
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-[#e31837] to-[#ff4b63] shadow-lg shadow-red-500/20 px-4 py-4 rounded-b-3xl">
        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="font-black text-2xl text-white flex-grow tracking-wide">
            {category ? category.name : 'Loading...'}
          </h1>
          <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm">
            <Search size={24} className="text-white" />
          </button>
        </div>
      </div>

      {/* Category Slider */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id}
              onClick={() => navigate(`/category/${cat.id}`)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all shrink-0 ${
                cat.id === id 
                  ? 'border-[#e31837] bg-red-50 text-[#e31837] font-bold shadow-sm shadow-red-500/10' 
                  : 'border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:bg-red-50/30'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden p-1">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <span className="text-xs whitespace-nowrap">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center mt-24 bg-white p-12 rounded-3xl shadow-sm border border-gray-100 max-w-md mx-auto">
            <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-[#e31837]">
              <ShoppingBag size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-3">Oops! No items found</h2>
            <p className="text-gray-500 font-medium mb-8">We couldn't find any products in this category right now. Check back later!</p>
            <button 
              onClick={() => navigate('/')} 
              className="bg-[#e31837] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#c8102e] shadow-lg shadow-red-500/30 transition-all hover:-translate-y-1"
            >
              Explore Other Categories
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
