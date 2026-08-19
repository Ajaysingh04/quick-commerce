import React from 'react';
import { X, Scale, Star, Zap, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductComparison = ({ items, onClose, onAddToCart }) => {
 if (!items || items.length === 0) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-pink-200 flex flex-col"
 >
 {/* Header */}
 <div className="px-6 py-4 bg-pink-50 border-b border-pink-200 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Scale className="w-5 h-5 text-brand-500" />
 <h3 className="text-lg font-black">Product Comparison</h3>
 </div>
 <button 
 onClick={onClose}
 className="p-1 rounded-full hover:bg-slate-200 :bg-slate-800 transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Content table */}
 <div className="flex-1 overflow-x-auto p-6">
 <table className="w-full border-collapse">
 <thead>
 <tr className="border-b border-pink-200 ">
 <th className="text-left py-4 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/4">Attributes</th>
 {items.map(item => (
 <th key={item._id || item.id} className="py-4 px-3 text-center w-1/3">
 <div className="flex flex-col items-center gap-2">
 <img onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"; }} src={item.image} alt={item.name} className="w-24 h-24 rounded-2xl object-cover shadow-sm bg-pink-100" />
 <h4 className="font-extrabold text-sm text-slate-800 leading-tight line-clamp-1">{item.name}</h4>
 <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
 item.isVeg 
 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
 : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
 }`}>
 {item.isVeg ? 'Veg' : 'Non-Veg'}
 </span>
 </div>
 </th>
 ))}
 {items.length === 1 && <th className="w-1/3 text-slate-400 text-xs italic">Select another product to compare!</th>}
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700 ">
 {/* Rating */}
 <tr>
 <td className="py-4 px-3 font-bold text-slate-400 ">Rating</td>
 {items.map(item => (
 <td key={item._id || item.id} className="py-4 px-3 text-center">
 <div className="flex items-center justify-center gap-1 font-bold text-slate-800 ">
 <Star className="w-4 h-4 text-emerald-600 fill-emerald-600" />
 <span>{item.rating || '4.5'}/5</span>
 </div>
 </td>
 ))}
 {items.length === 1 && <td></td>}
 </tr>

 {/* Price */}
 <tr>
 <td className="py-4 px-3 font-bold text-slate-400 ">Price</td>
 {items.map(item => (
 <td key={item._id || item.id} className="py-4 px-3 text-center text-sm font-black text-slate-900 ">
 ₹{item.price}
 </td>
 ))}
 {items.length === 1 && <td></td>}
 </tr>

 {/* Calories */}
 <tr>
 <td className="py-4 px-3 font-bold text-slate-400 ">Calories</td>
 {items.map(item => (
 <td key={item._id || item.id} className="py-4 px-3 text-center">
 <div className="flex items-center justify-center gap-1 font-semibold text-amber-500">
 <Zap className="w-3.5 h-3.5 fill-amber-500" />
 <span>{item.calories || 350 + Math.round(Math.random() * 200)} kcal</span>
 </div>
 </td>
 ))}
 {items.length === 1 && <td></td>}
 </tr>

 {/* Ingredients */}
 <tr>
 <td className="py-4 px-3 font-bold text-slate-400 ">Key Ingredients</td>
 {items.map(item => {
 const ingredientsList = item.ingredients || ['Fresh Dough', 'Cheese', 'House Sauce'];
 return (
 <td key={item._id || item.id} className="py-4 px-3 text-center max-w-[200px]">
 <div className="flex flex-wrap gap-1 justify-center">
 {ingredientsList.map(ing => (
 <span key={ing} className="px-2 py-1 bg-pink-100 rounded-md text-[10px]">
 {ing}
 </span>
 ))}
 </div>
 </td>
 );
 })}
 {items.length === 1 && <td></td>}
 </tr>

 {/* Description */}
 <tr>
 <td className="py-4 px-3 font-bold text-slate-400 ">Description</td>
 {items.map(item => (
 <td key={item._id || item.id} className="py-4 px-3 text-center text-slate-400 leading-relaxed text-[11px]">
 {item.description || 'Premium delicious product prepared with chef secret recipes.'}
 </td>
 ))}
 {items.length === 1 && <td></td>}
 </tr>

 {/* Action */}
 <tr>
 <td className="py-4 px-3 font-bold text-slate-400 ">Order</td>
 {items.map(item => (
 <td key={item._id || item.id} className="py-4 px-3 text-center">
 <button 
 onClick={() => onAddToCart(item)}
 className="px-4 py-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/10 active:scale-95 transition-all flex items-center justify-center gap-1.5 mx-auto"
 >
 <ShoppingBag className="w-3.5 h-3.5" />
 <span>Add to Cart</span>
 </button>
 </td>
 ))}
 {items.length === 1 && <td></td>}
 </tr>
 </tbody>
 </table>
 </div>
 </motion.div>
 </div>
 );
};

export default ProductComparison;
