import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Minus, Heart } from 'lucide-react';
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
    dispatch(updateQuantity({ itemId: product.id, amount }));
  };

  const discountPercent = product.discount || (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) + '% OFF' : null);

  return (
    <div className="bg-white rounded-[20px] p-4 flex flex-col h-full relative transition-all duration-300 transform shadow-sm hover:shadow-xl hover:-translate-y-1 group">
      
      {/* Product Image */}
      <div className="relative flex justify-center items-center h-32 mb-4 mt-2">
        <button 
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            if (isAuthenticated) {
              dispatch(toggleWishlistThunk(product));
            } else {
              dispatch(toggleWishlistItem(product));
            }
          }} 
          className="absolute -top-2 -right-2 p-1.5 bg-white/80 backdrop-blur rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors z-10 shadow-sm border border-gray-100"
        >
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "text-red-500" : ""} />
        </button>
        <img 
          ref={imageRef}
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      
      {/* Product Details */}
      <div className="flex flex-col flex-grow">
        <h3 className="text-[15px] font-bold text-gray-800 line-clamp-2 leading-tight mb-1">
          {product.name}
        </h3>
        <div className="text-xs text-gray-500 font-medium mb-3">
          {product.weight || '1 unit'}
        </div>
        
        {/* Price and Action Button */}
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through font-medium">₹{product.originalPrice}</span>
            )}
            <span className="text-lg font-black text-gray-900 tracking-tight">₹{product.price}</span>
          </div>
          
          {quantity === 0 ? (
            <button 
              onClick={handleAdd}
              className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full hover:bg-[#0a4733] hover:text-white transition-colors"
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
          ) : (
            <div className="flex items-center bg-[#0a4733] text-white rounded-full p-1 shadow-md">
              <button 
                onClick={() => handleUpdate(-1)}
                className="w-6 h-6 flex items-center justify-center hover:bg-[#073324] rounded-full transition-colors"
              >
                <Minus size={14} strokeWidth={2.5} />
              </button>
              <span className="font-bold text-sm px-2">{quantity}</span>
              <button 
                onClick={() => handleUpdate(1)}
                className="w-6 h-6 flex items-center justify-center hover:bg-[#073324] rounded-full transition-colors"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
