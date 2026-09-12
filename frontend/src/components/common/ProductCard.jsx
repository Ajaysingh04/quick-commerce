import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Minus, Heart, ShoppingBag, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { addToCart, updateQuantity } from '../../store/cartSlice';
import { toggleWishlistThunk } from '../../store/wishlistSlice';

const ProductCard = ({ product, storeId = 'quick-store', storeName = 'Quick Commerce Store' }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const cartItem = cartItems.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isWishlisted = wishlistItems.some((item) => (item._id || item.id) === product.id);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const imageRef = React.useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAdd = () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart.');
      return;
    }

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
        clone.style.transition = 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
        clone.style.pointerEvents = 'none';

        document.body.appendChild(clone);

        requestAnimationFrame(() => {
          clone.style.left = `${cartRect.left + cartRect.width / 2}px`;
          clone.style.top = `${cartRect.top + cartRect.height / 2}px`;
          clone.style.width = '24px';
          clone.style.height = '24px';
          clone.style.opacity = '0.4';
          clone.style.transform = 'translate(-50%, -50%) scale(0.15) rotate(45deg)';
        });

        setTimeout(() => clone.remove(), 480);
      }
    }

    dispatch(
      addToCart({
        item: product,
        store: { id: storeId, name: storeName },
      })
    );
  };

  const handleUpdate = (amount) => {
    if (!isAuthenticated) {
      alert('Please login to update cart.');
      return;
    }
    dispatch(updateQuantity({ itemId: product.id, amount }));
  };

  const discountPercent = product.discount ||
    (product.originalPrice && product.originalPrice > product.price
      ? `${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF`
      : null);

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-3.5 shadow-[0_14px_35px_rgba(15,23,42,0.05)] transition-shadow duration-300 hover:border-emerald-200/70 hover:shadow-[0_24px_50px_rgba(16,185,129,0.12)]"
    >
      {/* Top Floating Badges */}
      <div className="absolute left-3.5 top-3.5 z-10 flex flex-wrap items-center gap-1.5">
        {discountPercent && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500 to-red-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white shadow-sm">
            <Zap className="h-2.5 w-2.5" />
            {discountPercent}
          </span>
        )}
        <span className="rounded-full border border-slate-200/60 bg-white/95 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-700 shadow-sm backdrop-blur-md">
          ⚡ 10m
        </span>
      </div>

      {/* Wishlist Button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        onClick={() => {
          if (!isAuthenticated) {
            alert('Please login to add items to wishlist.');
            return;
          }
          dispatch(toggleWishlistThunk(product));
        }}
        className="absolute right-3.5 top-3.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/70 bg-white/90 text-slate-400 shadow-sm backdrop-blur-md transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
      >
        <Heart size={15} fill={isWishlisted ? '#f43f5e' : 'none'} className={isWishlisted ? 'text-rose-500' : ''} />
      </motion.button>

      {/* Product Image Container */}
      <div className="relative mb-3 mt-1 flex h-44 items-center justify-center overflow-hidden rounded-[20px] bg-gradient-to-b from-slate-50/80 to-slate-100/50 p-3">
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton-shimmer rounded-[20px]" />
        )}
        <img
          ref={imageRef}
          src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          className={`h-full w-full object-contain transition-all duration-500 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Category & Rating */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700">
          {product.category?.name || product.category || 'Essential'}
        </span>
        <div className="flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
          <Sparkles className="h-3 w-3 text-amber-500" />
          {product.rating ? Number(product.rating).toFixed(1) : '4.8'}
        </div>
      </div>

      {/* Title & Weight */}
      <div className="flex flex-1 flex-col">
        <h3 className="line-clamp-2 text-sm font-black leading-snug tracking-[-0.01em] text-slate-900 transition-colors group-hover:text-emerald-700">
          {product.name}
        </h3>
        <p className="mt-1 text-xs font-semibold text-slate-400">{product.weight || '500 g'}</p>

        {/* Price & Action */}
        <div className="mt-3 flex items-end justify-between gap-2 pt-1 border-t border-slate-100">
          <div>
            <div className="text-lg font-black tracking-tight text-slate-900">₹{product.price}</div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-[10px] font-bold text-slate-400 line-through">₹{product.originalPrice}</div>
            )}
          </div>

          {quantity === 0 ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={handleAdd}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider text-white shadow-sm transition hover:bg-emerald-600 hover:shadow-md"
            >
              <ShoppingBag className="h-3 w-3" />
              Add
            </motion.button>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/90 px-1 py-1 text-emerald-800 shadow-sm">
              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={() => handleUpdate(-1)}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-black shadow-xs transition hover:bg-emerald-100"
              >
                <Minus className="h-3 w-3" />
              </motion.button>
              <span className="min-w-4 text-center text-xs font-black">{quantity}</span>
              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={() => handleUpdate(1)}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-black shadow-xs transition hover:bg-emerald-100"
              >
                <Plus className="h-3 w-3" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
