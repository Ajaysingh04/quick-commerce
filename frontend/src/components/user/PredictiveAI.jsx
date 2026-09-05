import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ShoppingBag } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/cartSlice.js';
import { useNavigate } from 'react-router-dom';

const PredictiveAI = () => {
 const [isOpen, setIsOpen] = useState(false);
 const [prediction, setPrediction] = useState(null);
 const dispatch = useDispatch();
 const navigate = useNavigate();
 const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

 useEffect(() => {
 // Simulate AI analyzing time of day and routine
 const hour = new Date().getHours();
 let mockPrediction = null;

 if (hour >= 6 && hour < 11) {
 mockPrediction = {
 context: "Good Morning! ☀️",
 message: "Need to restock your daily morning essentials?",
 item: {
 id: "item-milk-eggs",
 name: "Amul Milk & Brown Eggs",
 price: 149,
 isVeg: false,
 image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop",
 storeName: "FreshMart Daily"
 }
 };
 } else if (hour >= 11 && hour < 16) {
 mockPrediction = {
 context: "Mid-day Restock! 🛒",
 message: "Running low on kitchen essentials?",
 item: {
 id: "item-grocery-staples",
 name: "Premium Atta & Rice Combo",
 price: 449,
 isVeg: true,
 image: "https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=200&h=200&fit=crop",
 storeName: "Super Grocers"
 }
 };
 } else if (hour >= 16 && hour < 19) {
 mockPrediction = {
 context: "Evening Munchies? ☕",
 message: "Time for some tea-time snacks?",
 item: {
 id: "item-snacks",
 name: "Lays, Kurkure & Biscuits",
 price: 169,
 isVeg: true,
 image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=200&h=200&fit=crop",
 storeName: "Quick Bites Store"
 }
 };
 } else {
 mockPrediction = {
 context: "Late Night Cravings? 🌙",
 message: "Ice cream or chocolates to end the day?",
 item: {
 id: "item-desserts",
 name: "Magnum Ice Cream & Dairy Milk",
 price: 349,
 isVeg: true,
 image: "https://images.unsplash.com/photo-1548883354-94cb0b23023f?w=200&h=200&fit=crop",
 storeName: "Sweet Cravings 24x7"
 }
 };
 }

 setPrediction(mockPrediction);

 // Auto popup after 3 seconds of entering the app
 const timer = setTimeout(() => {
 setIsOpen(true);
 }, 3000);

 return () => clearTimeout(timer);
 }, []);

 const handle1ClickDispatch = () => {
 if (!isAuthenticated) {
 alert("Please login to place an order.");
 return;
 }
 if (prediction && prediction.item) {
 dispatch(addToCart({
 item: prediction.item,
 store: {
 id: 'store-auto',
 name: prediction.item.storeName
 }
 }));
 setIsOpen(false);
 navigate('/checkout');
 }
 };

 return (
 <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
 <AnimatePresence>
 {isOpen && prediction && (
 <motion.div
 initial={{ opacity: 0, y: 20, scale: 0.9 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 20, scale: 0.9 }}
 className="mb-4 w-72 md:w-80 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-3xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
 >
 {/* Ambient AI Glow Background */}
 <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/30 rounded-full blur-3xl animate-pulse"></div>
 
 <button 
 onClick={() => setIsOpen(false)}
 className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors bg-slate-800/50 rounded-full p-1 z-10"
 >
 <X className="w-4 h-4" />
 </button>

 <div className="relative z-10">
 <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider mb-2">
 <Sparkles className="w-3.5 h-3.5" />
 AI Prediction
 </div>
 
 <h3 className="text-white font-black text-lg leading-tight">{prediction.context}</h3>
 <p className="text-slate-300 text-sm mt-1 mb-4">{prediction.message}</p>

 <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50 mb-4">
 <img src={prediction.item.image} alt="Product" className="w-12 h-12 rounded-xl object-cover border border-slate-600" />
 <div className="flex-1 min-w-0">
 <h4 className="text-white font-bold text-xs truncate">{prediction.item.name}</h4>
 <p className="text-slate-400 text-[10px]">{prediction.item.storeName}</p>
 <p className="text-emerald-400 font-black text-xs mt-0.5">₹{prediction.item.price}</p>
 </div>
 </div>

 <button 
 onClick={handle1ClickDispatch}
 className="w-full py-3 bg-gradient-to-r from-brand-500 to-rose-600 hover:from-brand-400 hover:to-rose-500 text-white rounded-xl font-black text-sm shadow-[0_0_15px_rgba(244,63,94,0.5)] transition-all flex justify-center items-center gap-2 active:scale-95"
 >
 <ShoppingBag className="w-4 h-4" />
 1-Click Order
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Floating Orb Trigger */}
 {!isOpen && (
 <motion.button
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.9 }}
 onClick={() => setIsOpen(true)}
 className="w-14 h-14 bg-gradient-to-tr from-brand-600 to-rose-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.6)] border-2 border-white/20 relative group"
 >
 <Sparkles className="w-6 h-6 text-white group-hover:animate-spin" />
 <span className="absolute -top-1 -right-1 flex h-4 w-4">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
 <span className="relative inline-flex rounded-full h-4 w-4 bg-white border-2 border-brand-500"></span>
 </span>
 </motion.button>
 )}
 </div>
 );
};

export default PredictiveAI;
