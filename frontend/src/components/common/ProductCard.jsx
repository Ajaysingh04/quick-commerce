import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Minus, Heart } from 'lucide-react';
import { addToCart, updateQuantity } from '../../store/cartSlice';
import { toggleWishlistItem } from '../../store/wishlistSlice';

const ProductCard = ({ product, storeId = 'quick-store', storeName = 'Quick Commerce Store' }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);
  const wishlistItems = useSelector(state => state.wishlist.items);
  
  const cartItem = cartItems.find(item => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isWishlisted = wishlistItems.includes(product.id);

  const handleAdd = () => {
    dispatch(addToCart({
      item: product,
      store: { id: storeId, name: storeName }
    }));
  };

  const handleUpdate = (amount) => {
    dispatch(updateQuantity({ itemId: product.id, amount }));
  };

  const discountPercent = product.discount || (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) + '% OFF' : null);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col h-full relative transition-all duration-300 transform shadow-sm hover:shadow-xl hover:shadow-red-500/10 hover:border-red-100 group">
      <div className="relative p-3 flex justify-center items-center bg-[#fdf8f8] h-36 rounded-t-2xl overflow-hidden m-1 mt-1 mx-1">
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); dispatch(toggleWishlistItem(product.id)); }} 
          className="absolute top-2 right-2 z-10 transition-transform hover:scale-110 bg-white/90 p-1.5 rounded-full backdrop-blur-sm shadow-sm"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'text-[#e31837] fill-[#e31837]' : 'text-gray-400 hover:text-red-400'}`} />
        </button>
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
        />
        {discountPercent && (
          <div className="absolute top-0 left-0 bg-[#e31837] text-white text-[10px] font-bold px-3 py-1 rounded-br-xl shadow-sm">
            {discountPercent}
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="text-xs text-gray-500 font-medium mb-1">{product.weight || '1 unit'}</div>
        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug flex-grow">
          {product.name}
        </h3>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through font-medium">₹{product.originalPrice}</span>
            )}
            <span className="text-lg font-black text-slate-900 tracking-tight">₹{product.price}</span>
          </div>
          
          {quantity === 0 ? (
            <button 
              onClick={handleAdd}
              className="bg-red-50 text-[#e31837] border border-red-200 px-5 py-1.5 rounded-xl text-sm font-extrabold hover:bg-red-100 hover:border-red-300 transition-colors shadow-sm"
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center bg-[#e31837] text-white rounded-xl px-2 py-1.5 shadow-md shadow-red-500/30">
              <button 
                onClick={() => handleUpdate(-1)}
                className="p-1 hover:bg-red-700 rounded-lg transition-colors"
              >
                <Minus size={16} strokeWidth={3} />
              </button>
              <span className="font-extrabold text-sm px-3 w-8 text-center">{quantity}</span>
              <button 
                onClick={() => handleUpdate(1)}
                className="p-1 hover:bg-red-700 rounded-lg transition-colors"
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
