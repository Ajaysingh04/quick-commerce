import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Minus, Heart, ShoppingBag } from 'lucide-react';
import { addToCart, updateQuantity } from '../../store/cartSlice';
import { toggleWishlistItem, toggleWishlistThunk } from '../../store/wishlistSlice';

const ProductCard = ({ product, storeId = 'quick-store', storeName = 'Quick Commerce Store' }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);
  const wishlistItems = useSelector(state => state.wishlist.items);
  
  const cartItem = cartItems.find(item => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isWishlisted = wishlistItems.some(item => (item._id || item.id) === product.id);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  const imageRef = React.useRef(null);

  const handleAdd = (e) => {
    if (!isAuthenticated) {
      alert("Please login to add items to cart.");
      return;
    }
    // Fly animation logic
    if (imageRef.current) {
      const cartIcon = document.getElementById('cart-icon');
      if (cartIcon) {
        const imgRect = imageRef.current.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();

        const clone = imageRef.current.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.left = `${imgRect.left}px`;
        clone.style.top = `${imgRect.top}px`;
        clone.style.width = `${imgRect.width}px`;
        clone.style.height = `${imgRect.height}px`;
        clone.style.zIndex = '9999';
        clone.style.transition = 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        clone.style.pointerEvents = 'none';

        document.body.appendChild(clone);

        requestAnimationFrame(() => {
          clone.style.left = `${cartRect.left + cartRect.width / 2}px`;
          clone.style.top = `${cartRect.top + cartRect.height / 2}px`;
          clone.style.width = '20px';
          clone.style.height = '20px';
          clone.style.opacity = '0.5';
          clone.style.transform = 'translate(-50%, -50%) scale(0.1)';
        });

        setTimeout(() => {
          clone.remove();
        }, 400);
      }
    }

    dispatch(addToCart({
      item: product,
      store: { id: storeId, name: storeName }
    }));
  };

  const handleUpdate = (amount) => {
    if (!isAuthenticated) {
      alert("Please login to update cart.");
      return;
    }
    dispatch(updateQuantity({ itemId: product.id, amount }));
  };

  const discountPercent = product.discount || (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) + '% OFF' : null);

  return (
    <div className="bg-white rounded-[24px] p-4 flex flex-col h-full relative transition-all duration-300 transform shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-10px_rgba(4,106,71,0.15)] hover:-translate-y-1.5 group border border-gray-100/80 hover:border-brand-200">
      
      {/* Top badges & actions */}
      <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10">
        {discountPercent ? (
          <span className="bg-[#FF4545] text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-sm tracking-wide">
            {discountPercent}
          </span>
        ) : (
          <span />
        )}
        <button 
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            if (!isAuthenticated) {
              alert("Please login to add items to wishlist.");
              return;
            }
            dispatch(toggleWishlistThunk(product));
          }} 
          className="p-2 bg-white/95 backdrop-blur-md rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all hover:scale-110 shadow-sm border border-gray-100"
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "text-red-500" : ""} />
        </button>
      </div>

      {/* Product Image */}
      <div className="relative flex justify-center items-center h-44 mb-5 mt-2 bg-[#f4f6f8] rounded-[20px] p-4 group-hover:bg-[#eefcf4] transition-colors duration-500 overflow-hidden">
        <img 
          ref={imageRef}
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      
      {/* Product Details */}
      <div className="flex flex-col flex-grow px-1">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] text-brand-600 font-black tracking-widest uppercase bg-brand-50 px-2 py-0.5 rounded-md">{product.category?.name || product.category || 'Fresh'}</span>
          <div className="flex items-center text-[12px] font-black text-slate-700 gap-1 bg-yellow-50 px-2 py-0.5 rounded-md">
            <span className="text-[#F5B300] text-[14px]">★</span> {product.rating || '4.8'}
          </div>
        </div>
        
        <h3 className="text-[16px] font-bold text-slate-800 line-clamp-2 leading-tight mb-1.5 group-hover:text-brand-500 transition-colors">
          {product.name}
        </h3>
        <div className="text-[13px] text-slate-400 font-semibold mb-5">
          {product.weight || '500 g'}
        </div>
        
        {/* Price and Action Button */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5">
              <span className="text-[20px] font-black text-slate-900 tracking-tight">₹{product.price}</span>
            </div>
            {product.originalPrice && (
              <span className="text-[12px] text-slate-400 line-through font-bold">M.R.P: ₹{product.originalPrice}</span>
            )}
          </div>
          
          {quantity === 0 ? (
            <button 
              onClick={handleAdd}
              className="flex items-center gap-1.5 border-[2px] border-brand-100 text-brand-600 px-4 py-2 rounded-full hover:bg-brand-500 hover:border-brand-500 hover:text-white transition-all text-sm font-black bg-white shadow-sm hover:shadow-md"
            >
              <ShoppingBag size={16} strokeWidth={2.5}/> Add
            </button>
          ) : (
            <div className="flex items-center border-[2px] border-brand-500 text-white rounded-full px-2 py-1 shadow-md bg-brand-500">
              <button 
                onClick={() => handleUpdate(-1)}
                className="w-7 h-7 flex items-center justify-center hover:bg-brand-600 rounded-full transition-colors"
              >
                <Minus size={14} strokeWidth={3} />
              </button>
              <span className="font-black text-[15px] px-3">{quantity}</span>
              <button 
                onClick={() => handleUpdate(1)}
                className="w-7 h-7 flex items-center justify-center hover:bg-brand-600 rounded-full transition-colors"
              >
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
