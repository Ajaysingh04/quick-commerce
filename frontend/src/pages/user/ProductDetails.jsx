import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Heart, 
  Star, 
  Zap, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Plus, 
  Minus, 
  Sparkles, 
  Share2, 
  Check, 
  Store as StoreIcon,
  ChevronRight,
  PackageCheck,
  AlertCircle
} from 'lucide-react';
import API from '../../services/api';
import { addToCart, updateQuantity } from '../../store/cartSlice';
import { toggleWishlistThunk } from '../../store/wishlistSlice';
import ProductCard from '../../components/common/ProductCard';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const cartItem = cartItems.find((item) => (item.id === id || item._id === id || item.id === product?._id));
  const quantity = cartItem ? cartItem.quantity : 0;
  const isWishlisted = wishlistItems.some((item) => (item._id || item.id) === (product?._id || id));

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    setLoading(true);
    setError(null);

    const fetchProductDetails = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        const data = res.data;
        const normalized = {
          ...data,
          id: data._id || data.id,
        };
        setProduct(normalized);
        setSelectedImage(normalized.image);

        // Fetch related products from same category or all products
        const catId = normalized.category?._id || normalized.category;
        const relatedRes = await API.get(`/products?limit=8${catId ? `&category=${catId}` : ''}`);
        const related = (relatedRes.data || [])
          .filter((p) => (p._id || p.id) !== normalized.id)
          .map((p) => ({ ...p, id: p._id || p.id }));
        setRelatedProducts(related);
      } catch (err) {
        console.error('Failed to fetch product details', err);
        // Fallback: try fetching all products and search locally
        try {
          const fallbackRes = await API.get('/products');
          const found = fallbackRes.data?.find((p) => (p._id === id || p.id === id || p.sku === id));
          if (found) {
            const normalized = { ...found, id: found._id || found.id };
            setProduct(normalized);
            setSelectedImage(normalized.image);
            const related = fallbackRes.data
              .filter((p) => (p._id || p.id) !== normalized.id)
              .slice(0, 6)
              .map((p) => ({ ...p, id: p._id || p.id }));
            setRelatedProducts(related);
          } else {
            setError('Product not found');
          }
        } catch (fErr) {
          setError('Could not load product details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart.');
      return;
    }
    if (!product) return;

    const storeId = product?.store?._id || product?.store || 'quick-store';
    const storeName = product?.store?.name || 'Quick Commerce Store';

    dispatch(
      addToCart({
        item: product,
        store: { id: storeId, name: storeName },
      })
    );
  };

  const handleUpdateQuantity = (amount) => {
    if (!isAuthenticated) {
      alert('Please login to update cart.');
      return;
    }
    if (!product) return;
    dispatch(updateQuantity({ itemId: product.id, amount }));
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      alert('Please login to add items to wishlist.');
      return;
    }
    if (!product) return;
    dispatch(toggleWishlistThunk(product));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name || 'Quick Commerce Product',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="h-6 w-48 skeleton-shimmer rounded-lg mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="h-96 skeleton-shimmer rounded-3xl" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 skeleton-shimmer rounded-lg" />
              <div className="h-5 w-1/4 skeleton-shimmer rounded-lg" />
              <div className="h-12 w-1/2 skeleton-shimmer rounded-lg" />
              <div className="h-28 w-full skeleton-shimmer rounded-2xl" />
              <div className="h-14 w-full skeleton-shimmer rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Item Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">
            The product you are looking for is currently unavailable or may have been removed.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="w-full py-3.5 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-2xl transition shadow-md"
          >
            Explore Other Products
          </button>
        </div>
      </div>
    );
  }

  const discountPercent = product.discount ||
    (product.originalPrice && product.originalPrice > product.price
      ? `${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF`
      : null);

  const categoryName = product.category?.name || product.category || 'Grocery';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Top Navigation & Breadcrumbs */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 p-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition shadow-xs"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Link to="/" className="hover:text-slate-900 transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to="/shop" className="hover:text-slate-900 transition">{categoryName}</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold truncate max-w-[150px] sm:max-w-xs">{product.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Product Main Showcase Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 sm:p-10 rounded-[32px] border border-slate-200/80 shadow-[0_15px_40px_rgba(15,23,42,0.04)]">
          
          {/* Left Column: Image Gallery Showcase */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="relative w-full aspect-square max-w-[480px] bg-gradient-to-b from-slate-50 to-slate-100/60 rounded-[28px] border border-slate-100 p-6 flex items-center justify-center overflow-hidden group">
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 items-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 shadow-md">
                  <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" /> 10-Min Delivery
                </span>
                {discountPercent && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500 to-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                    {discountPercent}
                  </span>
                )}
              </div>

              {/* Wishlist Icon */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/90 border border-slate-200 shadow-sm backdrop-blur-md hover:bg-rose-50 hover:border-rose-200 transition-colors"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-slate-400'
                  }`}
                />
              </button>

              <motion.img
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={selectedImage || product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Guarantees Strip */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[480px] mt-6">
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Truck className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-800">Superfast</span>
                <span className="text-[10px] text-slate-500">10-15 min drop</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-800">100% Quality</span>
                <span className="text-[10px] text-slate-500">Farm-fresh picks</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <RotateCcw className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-800">Instant Refund</span>
                <span className="text-[10px] text-slate-500">No questions asked</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Category & Veg indicator */}
              <div className="flex items-center gap-2.5 mb-3">
                <span className="rounded-lg bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-black uppercase tracking-wider">
                  {categoryName}
                </span>
                {product.isVeg !== undefined && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                    product.isVeg ? 'border-emerald-500 bg-emerald-50/60 text-emerald-700' : 'border-rose-500 bg-rose-50/60 text-rose-700'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${product.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {product.isVeg ? 'Veg' : 'Non-Veg'}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* Weight / Pack size */}
              <div className="mt-2 text-sm font-semibold text-slate-500">
                Pack Size: <span className="text-slate-800 font-bold">{product.weight || '500 g'}</span>
              </div>

              {/* Rating & Reviews Bar */}
              <div className="mt-4 flex items-center gap-3">
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200/60 px-2.5 py-1 text-xs font-black text-amber-800">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{product.rating ? Number(product.rating).toFixed(1) : '4.8'}</span>
                </div>
                <span className="text-xs font-semibold text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-500">1.4k+ Satisfied Customers</span>
              </div>

              {/* Price Box */}
              <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-baseline justify-between gap-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    ₹{product.price}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-lg font-bold text-slate-400 line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full uppercase tracking-wide">
                    Save ₹{product.originalPrice - product.price}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 mb-2">Product Description</h3>
                <p className="text-sm leading-relaxed text-slate-600 font-medium">
                  {product.description || `Fresh and hygienic ${product.name}, hand-picked and checked under strict quality standards. Perfect for daily consumption and family meals.`}
                </p>
              </div>

              {/* Store Partner Tag */}
              {product.store && (
                <div className="mt-6 flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700">
                    <StoreIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fulfilled by Dark Store</p>
                    <p className="text-sm font-bold text-slate-800">{product.store.name || 'QuickMart Express Hub'}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    ⚡ Verified
                  </span>
                </div>
              )}
            </div>

            {/* Action Bar (Cart buttons) */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4">
              {quantity === 0 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-slate-900/15 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart • ₹{product.price}
                </motion.button>
              ) : (
                <div className="w-full sm:flex-1 flex items-center justify-between p-2 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleUpdateQuantity(-1)}
                    className="w-12 h-12 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-800 hover:bg-emerald-100 transition shadow-xs"
                  >
                    <Minus className="w-5 h-5" />
                  </motion.button>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-black text-slate-900">{quantity} in Cart</span>
                    <span className="text-[11px] font-bold text-emerald-700">₹{product.price * quantity}</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleUpdateQuantity(1)}
                    className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition shadow-xs"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                </div>
              )}

              <button
                onClick={() => navigate('/shop')}
                className="w-full sm:w-auto py-4 px-6 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition text-center"
              >
                Browse Shop
              </button>
            </div>

          </div>

        </div>

        {/* Related & Similar Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">More Recommendations</div>
                <h2 className="mt-1 text-2xl font-black text-slate-900 tracking-tight">Similar Products You Might Like</h2>
              </div>
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 hover:text-emerald-600 transition"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetails;
