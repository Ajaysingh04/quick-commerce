import mealdb from '../../assets/mealdb_mapped.json';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import API from '../../services/api.js';
import { addToCart, updateQuantity } from '../../store/cartSlice.js';
import { Star, Clock, Info, Check, Plus, Minus, Search, ChevronRight } from 'lucide-react';
import { STORES, DINING_STORES, MOCK_DISHES } from './Home.jsx';

const getUniqueDishImage = (dishName, idx) => {
 let cleanKw = (dishName || 'product').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().split(' ')[0];
 let cat = 'product';
 if (cleanKw.includes('pizza')) cat = 'pizza';
 else if (cleanKw.includes('burger') || cleanKw.includes('mac')) cat = 'burger';
 else if (cleanKw.includes('chicken')) cat = 'chicken';
 else if (cleanKw.includes('beef') || cleanKw.includes('steak')) cat = 'beef';
 else if (cleanKw.includes('fish') || cleanKw.includes('salmon') || cleanKw.includes('prawn')) cat = 'seaproduct';
 else if (cleanKw.includes('cake') || cleanKw.includes('tart') || cleanKw.includes('pie') || cleanKw.includes('pudding') || cleanKw.includes('dessert') || cleanKw.includes('sweet')) cat = 'dessert';
 else if (cleanKw.includes('pasta') || cleanKw.includes('spaghetti') || cleanKw.includes('penne')) cat = 'pasta';
 else if (cleanKw.includes('salad') || cleanKw.includes('healthy')) cat = 'salad';
 else if (cleanKw.includes('curry') || cleanKw.includes('masala') || cleanKw.includes('tikka') || cleanKw.includes('indian')) cat = 'indian';
 else if (cleanKw.includes('noodle')) cat = 'noodles';
 else if (cleanKw.includes('sandwich') || cleanKw.includes('wrap') || cleanKw.includes('roll')) cat = 'sandwich';
 else if (cleanKw.includes('pork') || cleanKw.includes('bacon')) cat = 'pork';
 else if (cleanKw.includes('beverage') || cleanKw.includes('shake') || cleanKw.includes('coffee') || cleanKw.includes('tea')) cat = 'product';
 else if (mealdb[cleanKw]) cat = cleanKw;
 
 if (!mealdb[cat] || mealdb[cat].length === 0) cat = 'product';
 
 const arr = mealdb[cat];
 const seed = idx + 2000;
 return arr[seed % arr.length];
};



const BACKUP_INFO = {
 _id: 'res-gourmet-burger',
 name: 'The Burger Craft & Co.',
 rating: 4.4,
 reviewsCount: '2,543',
 deliveryTime: 25,
 costForTwo: 500,
 cuisineTypes: ['Burgers', 'American', 'Beverages', 'Fast Product'],
 address: 'Connaught Place, New Delhi',
 timings: '11am – 11pm (Today)',
 bannerImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=400&fit=crop'
};

const DINING_AMBIENCE_IMAGES = [
 "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4", // cafe interior
 "https://images.unsplash.com/photo-1552566626-52f8b828add9", // store table
 "https://images.unsplash.com/photo-1544148103-0773bf10d330", // fine dining
 "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b", // bar/lounge
 "https://images.unsplash.com/photo-1555396273-367ea4eb4db5", // seating
 "https://images.unsplash.com/photo-1572116469696-31de0f17cc34" // rooftop/outdoor
];

const StoreDetails = () => {
 const { id } = useParams();
 const dispatch = useDispatch();
 
 const [store, setStore] = useState(null);
 const [menu, setMenu] = useState([]);
 const [loading, setLoading] = useState(true);
 const [activeCategory, setActiveCategory] = useState('');
 const [activeTab, setActiveTab] = useState('order');
 
 const cartItems = useSelector(state => state.cart.items);
 const cartStore = useSelector(state => state.cart.store);

 const getAmbienceImage = (offset) => {
 const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
 const index = (hash + offset) % DINING_AMBIENCE_IMAGES.length;
 return DINING_AMBIENCE_IMAGES[index];
 };

 useEffect(() => {
 window.scrollTo(0, 0);
 }, [id]);

 useEffect(() => {
 fetchStoreData();
 }, [id]);

 const fetchStoreData = async () => {
 setLoading(true);
 try {
 const infoRes = await API.get(`/stores/${id}`);
 setStore(infoRes.data);
 const menuRes = await API.get(`/stores/${id}/menu`);
 if (menuRes.data && menuRes.data.length > 0) {
 const enhancedMenu = menuRes.data.map(cat => ({
 ...cat,
 items: cat.items.map((item, idx) => ({
 ...item,
 image: (item.image && item.image.trim() !== '' && !item.image.includes('dish_default.jpg')) 
 ? item.image 
 : getUniqueDishImage(cat.category, idx)
 }))
 }));
 setMenu(enhancedMenu);
 setActiveCategory(enhancedMenu[0].category);
 } else {
 throw new Error("Menu is empty in database, using fallback");
 }
 } catch (err) {
 const mockRes = STORES.find(r => r.id === id) || DINING_STORES.find(r => r.id === id) || BACKUP_INFO;
 setStore({ 
 ...BACKUP_INFO,
 ...mockRes, 
 _id: mockRes.id, 
 reviewsCount: '1,240', 
 timings: '11am - 11pm (Today)', 
 bannerImage: mockRes.image 
 });

 let mockMenu = [];
 const cuisines = mockRes.cuisineTypes || ['Default'];
 
 cuisines.forEach((cuisine, idx) => {
 let items = [];
 for (let i = 1; i <= 5; i++) {
 items.push({
 id: `dish-${cuisine.replace(/\s+/g, '')}-${i}`,
 name: `${cuisine} Special Dish ${i}`,
 price: Math.floor(Math.random() * 300) + 150,
 description: `A highly recommended and delicious ${cuisine} preparation.`,
 isVeg: mockRes.isVeg || Math.random() > 0.3,
 image: getUniqueDishImage(cuisine, i),
 rating: (Math.random() * 1 + 4.0).toFixed(1),
 votes: Math.floor(Math.random() * 200) + 50
 });
 }
 mockMenu.push({
 category: cuisine,
 items: items
 });
 });
 
 setMenu(mockMenu);
 setActiveCategory(mockMenu[0].category);
 } finally {
 setLoading(false);
 }
 };

 const handleAddItem = (item) => {
 const confirmClear = cartItems.length > 0 && cartStore && cartStore.id !== store._id;
 if (confirmClear) {
 const ok = window.confirm(`Clear cart and start a new order from "${store.name}"?`);
 if (!ok) return;
 }

 dispatch(addToCart({
 item: { id: item.id || item._id, name: item.name, price: item.price, image: item.image, isVeg: item.isVeg, resName: store.name },
 store: { id: store._id, name: store.name }
 }));
 };

 const getItemQuantity = (itemId) => {
 const item = cartItems.find(i => i.id === itemId);
 return item ? item.quantity : 0;
 };

 if (loading) {
 return <div className="max-w-6xl mx-auto p-8 animate-pulse text-xl text-slate-500">Loading Zomato experience...</div>;
 }

 if (!store) return <div className="p-8 text-center">Store not found</div>;

 return (
 <div className="bg-white min-h-screen pb-20">
 
 {/* Breadcrumbs */}
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-[11px] text-slate-400 flex items-center gap-1.5">
 <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
 <span>/</span>
 <Link to="/" className="hover:text-slate-900 transition-colors">India</Link>
 <span>/</span>
 <span className="text-slate-500">{(store.address || 'Delhi').split(',')[0]} Stores</span>
 <span>/</span>
 <span className="text-slate-500">{store.name}</span>
 </div>

 {/* Hero Image Gallery */}
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 mb-6">
 <div className="flex gap-2 h-[200px] sm:h-[300px] md:h-[400px]">
 <div className="w-[60%] h-full hover:brightness-95 transition-all cursor-pointer overflow-hidden">
 <img src={store.bannerImage} className="w-full h-full object-cover rounded-l-lg hover:scale-105 transition-transform duration-500" alt={store.name} />
 </div>
 <div className="w-[40%] flex flex-col gap-2 h-full">
 <div className="h-[calc(50%-4px)] w-full hover:brightness-95 transition-all cursor-pointer overflow-hidden">
 <img src={id.startsWith('dine-') ? getAmbienceImage(0) + "?w=400&h=200&fit=crop" : (menu[0]?.items[0]?.image || "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=200&fit=crop")} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="store interior" />
 </div>
 <div 
 className="h-[calc(50%-4px)] w-full hover:brightness-95 transition-all cursor-pointer overflow-hidden relative"
 onClick={() => {
 setActiveTab('photos');
 const tabsEl = document.getElementById('store-tabs');
 if (tabsEl) {
 window.scrollTo({ top: tabsEl.offsetTop - 80, behavior: 'smooth' });
 }
 }}
 >
 <img src={id.startsWith('dine-') ? getAmbienceImage(1) + "?w=400&h=200&fit=crop" : (menu[0]?.items[1]?.image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=200&fit=crop")} className="w-full h-full object-cover rounded-br-lg hover:scale-105 transition-transform duration-500" alt="product gallery 2" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=200&fit=crop"; }} />
 <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-sm">View Gallery</div>
 </div>
 </div>
 </div>
 </div>

 {/* Store Info Header */}
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
 <div className="flex justify-between items-start">
 <div>
 <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 ">{store.name}</h1>
 <p className="text-slate-600 mt-2 text-base">{(store.cuisineTypes || []).join(', ')}</p>
 <p className="text-slate-500 text-sm mt-0.5">{store.address || 'Connaught Place, New Delhi'}</p>
 <p className="text-slate-500 text-sm mt-0.5">
 <span className="text-rose-500 font-medium mr-2">Open now</span>
 {store.timings || '11am - 11pm (Today)'}
 </p>
 </div>
 <div className="flex items-center gap-4">
 <div className="flex flex-col items-end">
 <div className="flex items-center gap-1.5 bg-green-700 text-white px-2 py-1 rounded-lg">
 <span className="text-lg font-bold">{store.rating}</span>
 <Star className="w-3.5 h-3.5 fill-white" />
 </div>
 <div className="text-[10px] text-slate-500 font-semibold border-b border-dashed border-slate-400 mt-1 cursor-pointer">
 {store.reviewsCount || '1,240'} Delivery Reviews
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Tabs */}
 <div id="store-tabs" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-pink-200 sticky top-16 bg-white z-30 pt-2">
 <div className="flex gap-8 text-lg font-medium text-slate-500">
 <button onClick={() => setActiveTab('overview')} className={`pb-4 border-b-2 transition-colors ${activeTab === 'overview' ? 'border-brand-500 text-brand-500 font-semibold' : 'border-transparent hover:text-slate-800'}`}>Overview</button>
 <button onClick={() => setActiveTab('order')} className={`pb-4 border-b-2 transition-colors ${activeTab === 'order' ? 'border-brand-500 text-brand-500 font-semibold' : 'border-transparent hover:text-slate-800'}`}>Order Online</button>
 <button onClick={() => setActiveTab('reviews')} className={`pb-4 border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-brand-500 text-brand-500 font-semibold' : 'border-transparent hover:text-slate-800'}`}>Reviews</button>
 <button onClick={() => setActiveTab('photos')} className={`pb-4 border-b-2 transition-colors ${activeTab === 'photos' ? 'border-brand-500 text-brand-500 font-semibold' : 'border-transparent hover:text-slate-800'}`}>Photos</button>
 </div>
 </div>

 {/* Order Online Section */}
 {activeTab === 'order' && (
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
 <div className="flex flex-col md:flex-row gap-8 relative">
 
 {/* Left Sidebar (Categories) */}
 <div className="hidden md:block w-64 shrink-0">
 <div className="sticky top-40 border-r border-pink-200 pr-2 pb-10">
 {menu.map((cat) => (
 <button
 key={cat.category}
 onClick={() => {
 setActiveCategory(cat.category);
 const el = document.getElementById(`category-${cat.category}`);
 if(el) {
 const y = el.getBoundingClientRect().top + window.scrollY - 150;
 window.scrollTo({top: y, behavior: 'smooth'});
 }
 }}
 className={`block w-full text-left py-4 pl-4 pr-2 text-[15px] transition-colors border-r-4 ${
 activeCategory === cat.category
 ? 'border-brand-500 font-bold bg-gradient-to-r from-transparent to-brand-50/50 text-brand-500'
 : 'border-transparent font-medium text-slate-600 hover:text-slate-900'
 }`}
 >
 {cat.category} ({cat.items.length})
 </button>
 ))}
 </div>
 </div>

 {/* Right Menu Items */}
 <div className="flex-1 min-w-0 pb-20">
 
 {/* Mobile Category Nav */}
 <div className="md:hidden overflow-x-auto pb-4 mb-4 flex gap-3 custom-scrollbar border-b border-pink-200">
 {menu.map((cat) => (
 <button
 key={cat.category}
 onClick={() => {
 setActiveCategory(cat.category);
 const el = document.getElementById(`category-${cat.category}`);
 if(el) {
 const y = el.getBoundingClientRect().top + window.scrollY - 150;
 window.scrollTo({top: y, behavior: 'smooth'});
 }
 }}
 className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
 activeCategory === cat.category
 ? 'bg-brand-500 text-white shadow-md'
 : 'bg-pink-50 text-slate-600 border border-pink-100'
 }`}
 >
 {cat.category}
 </button>
 ))}
 </div>

 {/* Search Within Menu */}
 <div className="flex items-center gap-2 text-slate-400 mb-8 border-b border-pink-200 pb-4">
 <Search className="w-4 h-4" />
 <input type="text" placeholder="Search within menu" className="bg-transparent border-none outline-none text-sm w-full placeholder-slate-400" />
 </div>
 
 {/* Promo Banner */}
 <div className="flex items-center gap-3 bg-brand-50 border border-brand-200 p-4 rounded-xl mb-8">
 <img src="https://b.zmtcdn.com/data/o2_assets/3e10825313a17f22ddb1a13a9d5da2511634568194.png" className="w-8 h-8" alt="offer" />
 <span className="text-brand-700 font-bold text-sm">60% OFF up to ₹120. Use code ZOMATO60</span>
 </div>

 {menu.map((cat) => (
 <div key={cat.category} id={`category-${cat.category}`} className="mb-10">
 <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
 {cat.category}
 </h3>
 
 <div className="flex flex-col gap-8">
 {cat.items.map((item) => {
 const qty = getItemQuantity(item.id || item._id);
 return (
 <div key={item.id || item._id} className="flex justify-between gap-4 border-b border-pink-200 pb-8 last:border-0 last:pb-0">
 <div className="flex-1 min-w-0 pr-4">
 <div className="flex items-center gap-2 mb-1.5">
 <span className={`flex items-center justify-center w-4 h-4 rounded-sm border ${item.isVeg ? 'border-emerald-600 bg-emerald-50' : 'border-rose-600 bg-rose-50'}`}>
 <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
 </span>
 {item.bestSeller && <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">Bestseller</span>}
 </div>
 <h4 className="font-semibold text-lg text-slate-800 mb-0.5">{item.name}</h4>
 <div className="font-medium text-slate-800 text-[15px] mb-2">₹{item.price}</div>
 
 {item.rating && (
 <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-yellow-50 px-1.5 py-0.5 rounded w-max mb-3">
 <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
 {item.rating} ({item.votes})
 </div>
 )}

 <p className="text-[13px] text-slate-500 leading-snug max-w-xl">{item.description}</p>
 </div>
 
 {/* Image & Add Button Zomato style */}
 <div className="w-36 flex flex-col items-center shrink-0 relative pt-2">
 {item.image && (
 <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-sm">
 <img 
 src={item.image} 
 alt={item.name} 
 className="w-full h-full object-cover hover:scale-105 transition-transform" 
 onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop"; }}
 />
 </div>
 )}
 {!item.image && (
 <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-sm bg-pink-100 flex items-center justify-center">
 <span className="text-slate-400 font-bold text-xs">No Image</span>
 </div>
 )}
 
 <div className="absolute -bottom-4 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] rounded-lg w-28 h-9 overflow-hidden border border-pink-200 z-10">
 {qty > 0 ? (
 <div className="flex h-full text-brand-500 font-bold items-center justify-between px-2 bg-brand-50 ">
 <button onClick={() => dispatch(updateQuantity({ itemId: item.id || item._id, amount: -1 }))} className="p-1 hover:bg-white rounded"><Minus className="w-4 h-4" /></button>
 <span className="text-[15px]">{qty}</span>
 <button onClick={() => dispatch(updateQuantity({ itemId: item.id || item._id, amount: 1 }))} className="p-1 hover:bg-white rounded"><Plus className="w-4 h-4" /></button>
 </div>
 ) : (
 <button 
 onClick={() => handleAddItem(item)}
 className="w-full h-full text-brand-600 font-extrabold text-[15px] uppercase tracking-wide hover:bg-pink-50 :bg-slate-800 transition-colors flex items-center justify-center gap-1"
 >
 Add
 </button>
 )}
 </div>
 </div>
 </div>
 )
 })}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}

 {/* Overview Section */}
 {activeTab === 'overview' && (
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-20 animate-in fade-in duration-300">
 <h3 className="text-2xl font-bold text-slate-900 mb-4">About this place</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="bg-pink-50 p-6 rounded-2xl border border-pink-200 ">
 <h4 className="font-semibold text-lg mb-4 text-slate-800 ">Cuisines</h4>
 <div className="flex flex-wrap gap-2">
 {store.cuisineTypes.map(c => (
 <span key={c} className="px-3 py-1.5 border border-pink-200 rounded-full text-slate-600 text-sm font-medium hover:text-brand-500 hover:border-brand-500 transition-colors cursor-pointer">{c}</span>
 ))}
 </div>
 <h4 className="font-semibold text-lg mt-8 mb-2 text-slate-800 ">Average Cost</h4>
 <p className="text-slate-600 ">₹{store.costForTwo} for two people (approx.)</p>
 </div>
 <div className="bg-pink-50 p-6 rounded-2xl border border-pink-200 ">
 <h4 className="font-semibold text-lg mb-2 text-slate-800 ">More Info</h4>
 <ul className="space-y-3 text-slate-600 ">
 <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-500" /> Home Delivery</li>
 <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-500" /> Takeaway Available</li>
 <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-500" /> Indoor Seating</li>
 </ul>
 </div>
 </div>
 </div>
 )}

 {/* Reviews Section */}
 {activeTab === 'reviews' && (
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-20 animate-in fade-in duration-300">
 <h3 className="text-2xl font-bold text-slate-900 mb-6">{store.reviewsCount} Delivery Reviews</h3>
 <div className="space-y-6 max-w-3xl">
 {[1, 2, 3].map(i => (
 <div key={i} className="bg-white p-6 rounded-2xl border border-pink-200 shadow-sm">
 <div className="flex items-center gap-4 mb-4">
 <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">U{i}</div>
 <div>
 <h5 className="font-bold text-slate-900 ">Productie User {i}</h5>
 <div className="text-xs text-slate-500">2 days ago</div>
 </div>
 <div className="ml-auto bg-green-700 text-white px-2 py-1 rounded flex items-center gap-1">
 <span className="text-sm font-bold">4.0</span>
 <Star className="w-3 h-3 fill-white" />
 </div>
 </div>
 <p className="text-slate-600 ">Great product, nice packaging, and delivered on time. The {store.cuisineTypes[0]} dishes here are really amazing!</p>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Photos Section */}
 {activeTab === 'photos' && (
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-20 animate-in fade-in duration-300">
 <h3 className="text-2xl font-bold text-slate-900 mb-6">Gallery</h3>
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
 {(() => {
 const menuImgs = menu.flatMap(cat => cat.items.map(item => item.image));
 const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
 const reorderedAmbience = [...DINING_AMBIENCE_IMAGES.slice(hash % 3), ...DINING_AMBIENCE_IMAGES.slice(0, hash % 3)];
 const galleryImgs = id.startsWith('dine-') 
 ? [...reorderedAmbience, ...menuImgs] 
 : menuImgs;
 return galleryImgs.filter((img, i, arr) => arr.indexOf(img) === i).slice(0, 8).map((img, i) => (
 <div key={i} className="aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow">
 <img src={`${img.includes('?') ? img.split('?')[0] : img}?w=300&h=300&fit=crop`} alt={`gallery ${i}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
 </div>
 ));
 })()}
 </div>
 </div>
 )}

 {/* Sticky Cart Banner */}
 {cartItems.length > 0 && (
 <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-pink-200 p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-full duration-300">
 <div className="max-w-6xl mx-auto flex items-center justify-between">
 <div className="flex flex-col">
 <span className="font-semibold text-xs text-slate-500 tracking-wider">
 {cartItems.reduce((acc, item) => acc + item.quantity, 0)} ITEM{cartItems.length > 1 ? 'S' : ''} ADDED
 </span>
 <span className="font-black text-lg text-slate-900 flex items-center gap-2">
 ₹{cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)}
 <span className="text-xs font-semibold text-slate-400">plus taxes</span>
 </span>
 </div>
 <Link to="/checkout" className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-brand-500/30">
 Next <ChevronRight className="w-5 h-5" />
 </Link>
 </div>
 </div>
 )}
 </div>
 );
};

export default StoreDetails;
