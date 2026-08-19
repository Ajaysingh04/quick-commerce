import { useState } from 'react';
import { Star, MapPin, Clock, DollarSign, Bookmark, Search, ChevronDown, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StoreListing = () => {
 const [selectedCuisine, setSelectedCuisine] = useState(null);
 const [sortBy, setSortBy] = useState('relevance');
 const [searchTerm, setSearchTerm] = useState('');
 const [showMobileFilters, setShowMobileFilters] = useState(false);

 const stores = [
 {
 id: 1,
 name: 'Spice Villa',
 image: '/rest1.jpg',
 rating: 4.6,
 reviews: 2543,
 cuisines: ['North Indian', 'Mughlai'],
 costFor2: 450,
 deliveryTime: '35-45',
 deliveryFee: 40,
 offers: ['20% off on orders above ₹500'],
 isPromoted: true
 },
 {
 id: 2,
 name: 'Coastal Bites',
 image: '/rest2.jpg',
 rating: 4.4,
 reviews: 1856,
 cuisines: ['Seaproduct', 'Continental'],
 costFor2: 600,
 deliveryTime: '40-50',
 deliveryFee: 50,
 offers: ['Free dessert on orders above ₹750'],
 isPromoted: false
 },
 {
 id: 3,
 name: 'Urban Pizza',
 image: '/rest3.jpg',
 rating: 4.2,
 reviews: 1234,
 cuisines: ['Pizza', 'Italian'],
 costFor2: 400,
 deliveryTime: '25-35',
 deliveryFee: 30,
 offers: ['Buy 1 Get 1 on select pizzas'],
 isPromoted: true
 }
 ];

 const cuisines = ['North Indian', 'South Indian', 'Chinese', 'Continental', 'Seaproduct', 'Pizza', 'Deserts'];
 const filterOptions = [
 { label: 'Veg Only', value: 'veg' },
 { label: 'Rating 4+', value: '4plus' },
 { label: 'Fast Delivery', value: 'fast' }
 ];

 const FilterSidebar = () => (
 <div className="space-y-6">
 {/* Sort By */}
 <div>
 <h3 className="font-bold text-lg mb-3">Sort By</h3>
 <div className="space-y-2">
 {['Relevance', 'Delivery Time', 'Rating', 'Cost: Low to High'].map(option => (
 <label key={option} className="flex items-center gap-3 cursor-pointer">
 <input
 type="radio"
 name="sort"
 value={option}
 checked={sortBy === option}
 onChange={(e) => setSortBy(e.target.value)}
 className="w-4 h-4"
 />
 <span className="text-sm text-slate-700">{option}</span>
 </label>
 ))}
 </div>
 </div>

 {/* Cuisines */}
 <div>
 <h3 className="font-bold text-lg mb-3">Cuisines</h3>
 <div className="space-y-2">
 {cuisines.map(cuisine => (
 <label key={cuisine} className="flex items-center gap-3 cursor-pointer">
 <input
 type="checkbox"
 className="w-4 h-4 rounded"
 checked={selectedCuisine === cuisine}
 onChange={() => setSelectedCuisine(selectedCuisine === cuisine ? null : cuisine)}
 />
 <span className="text-sm text-slate-700">{cuisine}</span>
 </label>
 ))}
 </div>
 </div>

 {/* Rating */}
 <div>
 <h3 className="font-bold text-lg mb-3">Rating</h3>
 <div className="space-y-2">
 {['4.5+', '4.0+', '3.5+', 'All'].map(rating => (
 <label key={rating} className="flex items-center gap-3 cursor-pointer">
 <input
 type="radio"
 name="rating"
 className="w-4 h-4"
 />
 <span className="text-sm text-slate-700">{rating}</span>
 </label>
 ))}
 </div>
 </div>

 {/* Cost for Two */}
 <div>
 <h3 className="font-bold text-lg mb-3">Cost for Two</h3>
 <div className="space-y-2">
 {['₹300-600', '₹600-1000', '₹1000+', 'Any'].map(cost => (
 <label key={cost} className="flex items-center gap-3 cursor-pointer">
 <input type="radio" name="cost" className="w-4 h-4" />
 <span className="text-sm text-slate-700">{cost}</span>
 </label>
 ))}
 </div>
 </div>
 </div>
 );

 return (
 <div className="min-h-screen bg-white">
 {/* Header */}
 <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-pink-200 sticky top-0 bg-white z-30">
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-2">
 <div className="w-10 h-10 rounded-lg bg-[#FF6B00] flex items-center justify-center text-white font-bold">B</div>
 <span className="text-2xl font-bold hidden sm:block">RoseDash</span>
 </div>
 <div className="flex items-center gap-2 text-sm">
 <MapPin className="h-4 w-4 text-slate-600" />
 <span className="text-slate-700 hidden sm:block">Indore</span>
 <ChevronDown className="h-4 w-4" />
 </div>
 </div>

 {/* Search Bar */}
 <div className="flex gap-2">
 <div className="flex-1 relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
 <input
 type="text"
 placeholder="Search stores..."
 className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-sm sm:text-base"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 <button 
 onClick={() => setShowMobileFilters(!showMobileFilters)}
 className="lg:hidden p-3 border border-slate-300 rounded-lg hover:bg-pink-50 transition"
 >
 {showMobileFilters ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
 </button>
 </div>
 </header>

 {/* Mobile Filter Overlay */}
 <AnimatePresence>
 {showMobileFilters && (
 <>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-black/20 z-40 lg:hidden"
 onClick={() => setShowMobileFilters(false)}
 />
 <motion.div
 initial={{ x: -320 }}
 animate={{ x: 0 }}
 exit={{ x: -320 }}
 transition={{ type: 'spring', damping: 25 }}
 className="fixed left-0 top-0 w-80 h-full bg-white z-50 overflow-y-auto shadow-xl"
 >
 <div className="p-6">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-bold">Filters</h2>
 <button onClick={() => setShowMobileFilters(false)}>
 <X className="h-6 w-6" />
 </button>
 </div>
 <FilterSidebar />
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6 lg:gap-8">
 
 {/* Left Sidebar - Filters (Desktop only) */}
 <aside className="hidden lg:block w-56 flex-shrink-0">
 <FilterSidebar />
 </aside>

 {/* Main Content */}
 <main className="flex-1 min-w-0">
 {/* Filter Chips */}
 <div className="mb-6 flex flex-wrap gap-2">
 {filterOptions.map(filter => (
 <button key={filter.value} className="px-4 py-2 border border-slate-300 rounded-full text-sm hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors bg-white">
 {filter.label}
 </button>
 ))}
 </div>

 {/* Store Cards */}
 <div className="space-y-3 sm:space-y-4">
 {stores.map((store, idx) => (
 <motion.div
 key={store.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.1 }}
 className="flex flex-col sm:flex-row gap-4 border border-pink-200 rounded-lg hover:shadow-lg transition-shadow p-3 sm:p-4 bg-white"
 >
 {/* Store Image */}
 <div className="relative w-full sm:w-40 sm:flex-shrink-0 h-40 rounded-lg overflow-hidden">
 <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
 {store.isPromoted && (
 <div className="absolute top-2 left-2 bg-[#FF6B00] text-white px-2 py-1 rounded text-xs font-bold">
 PROMOTED
 </div>
 )}
 <button className="absolute top-2 right-2 bg-white/90 p-2 rounded-full hover:bg-white transition">
 <Bookmark className="h-5 w-5" />
 </button>
 </div>

 {/* Store Info */}
 <div className="flex-1 min-w-0">
 <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
 <div className="min-w-0">
 <h3 className="text-lg font-bold text-slate-900 truncate">{store.name}</h3>
 <p className="text-sm text-slate-600 truncate">{store.cuisines.join(', ')}</p>
 </div>
 <div className="text-right flex-shrink-0">
 <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded font-semibold text-sm w-fit">
 <Star className="h-4 w-4 fill-green-700" />
 {store.rating}
 </div>
 <p className="text-xs text-slate-500 mt-1">{store.reviews.toLocaleString()}</p>
 </div>
 </div>

 {/* Offers */}
 {store.offers.length > 0 && (
 <div className="mb-2 text-sm text-green-700 font-semibold line-clamp-1">
 {store.offers[0]}
 </div>
 )}

 {/* Bottom Info */}
 <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600">
 <div className="flex items-center gap-1">
 <Clock className="h-4 w-4 flex-shrink-0" />
 <span>{store.deliveryTime} mins</span>
 </div>
 <div className="flex items-center gap-1">
 <DollarSign className="h-4 w-4 flex-shrink-0" />
 <span>₹{store.costFor2}</span>
 </div>
 <div className="text-slate-500">
 Delivery: ₹{store.deliveryFee}
 </div>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 </main>
 </div>
 </div>
 );
};

export default StoreListing;
