import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Minus, Heart, ShoppingBag, Sparkles } from 'lucide-react';
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
        clone.style.transition = 'all 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
        clone.style.pointerEvents = 'none';

        document.body.appendChild(clone);

        requestAnimationFrame(() => {
          clone.style.left = `${cartRect.left + cartRect.width / 2}px`;
          clone.style.top = `${cartRect.top + cartRect.height / 2}px`;
          clone.style.width = '22px';
          clone.style.height = '22px';
          clone.style.opacity = '0.5';
          clone.style.transform = 'translate(-50%, -50%) scale(0.12)';
        });

        setTimeout(() => clone.remove(), 420);
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
    (product.originalPrice ? `${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF` : null);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
        {discountPercent ? (
          <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-sm">
            {discountPercent}
          </span>
        ) : null}
        <span className="rounded-full bg-white/90 px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-700 shadow-sm backdrop-blur-sm">
          10-15 min
        </span>
      </div>

      <button
        type="button"
        onClick={() => {
          if (!isAuthenticated) {
            alert('Please login to add items to wishlist.');
            return;
          }
          dispatch(toggleWishlistThunk(product));
        }}
        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 shadow-sm backdrop-blur-sm transition hover:border-rose-200 hover:text-rose-500"
      >
        <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} className={isWishlisted ? 'text-rose-500' : ''} />
      </button>

      <div className="relative mb-4 mt-2 flex h-44 items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-3">
        <img
          ref={imageRef}
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain transition duration-500 group-hover:scale-110"
        />
      </div>

      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-700">
          {product.category?.name || product.category || 'Fresh'}
        </span>
        <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
          <Sparkles className="h-3 w-3" />
          {product.rating || '4.8'}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="mb-1 line-clamp-2 text-base font-black tracking-[-0.02em] text-slate-900 transition group-hover:text-emerald-700">
          {product.name}
        </h3>
        <p className="mb-4 text-xs font-medium text-slate-500">{product.weight || '500 g'}</p>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <div className="text-xl font-black tracking-[-0.04em] text-slate-900">₹{product.price}</div>
            {product.originalPrice && (
              <div className="text-[11px] font-semibold text-slate-400 line-through">₹{product.originalPrice}</div>
            )}
          </div>

          {quantity === 0 ? (
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-emerald-600"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Add
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-1.5 text-emerald-700 shadow-sm">
              <button type="button" onClick={() => handleUpdate(-1)} className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-black transition hover:bg-emerald-100">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-5 text-center text-sm font-black">{quantity}</span>
              <button type="button" onClick={() => handleUpdate(1)} className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-black transition hover:bg-emerald-100">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
