import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { Users, Share2, Link2, Lock, Unlock, Calculator, Plus, Minus, CheckCircle, AlertCircle } from 'lucide-react';
import API from '../../services/api.js';

const GroupOrder = () => {
 const [searchParams] = useSearchParams();
 const navigate = useNavigate();
 const user = useSelector(state => state.auth.user);
 
 const [code, setCode] = useState(searchParams.get('code') || '');
 const [groupCart, setGroupCart] = useState(null);
 const [stores, setStores] = useState([]);
 const [selectedRes, setSelectedRes] = useState('');
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');
 const [menuItems, setMenuItems] = useState([]);
 
 // Bill Split state
 const [splitDetails, setSplitDetails] = useState(null);
 const [socket, setSocket] = useState(null);

 // 1. Fetch available stores on load
 useEffect(() => {
 const loadStores = async () => {
 try {
 const res = await API.get('/stores');
 setStores(res.data);
 if (res.data.length > 0) setSelectedRes(res.data[0]._id);
 } catch (err) {
 console.warn('API Error, using fallback stores:', err);
 setStores([
 { _id: 'res-gourmet-burger', name: 'The Burger Craft & Co.' },
 { _id: 'res-la-piazza', name: 'La Piazza Woodfired' }
 ]);
 setSelectedRes('res-gourmet-burger');
 }
 };
 loadStores();
 }, []);

 // 2. Setup Socket connections
 useEffect(() => {
 if (!code) return;

 const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
 setSocket(newSocket);

 newSocket.on('connect', () => {
 console.log('Connected to socket group channel');
 newSocket.emit('joinGroupRoom', { code });
 });

 newSocket.on('groupCartUpdated', (updatedCart) => {
 setGroupCart(updatedCart);
 fetchBillSplit(code);
 });

 newSocket.on('groupCartLocked', () => {
 setSuccess('Cart has been locked. Ready for checkout!');
 setGroupCart(prev => prev ? { ...prev, status: 'locked' } : null);
 });

 // Initial load
 fetchGroupCartDetails(code);

 return () => {
 newSocket.emit('leaveGroupRoom', { code });
 newSocket.disconnect();
 };
 }, [code]);

 // Load Group Cart from backend
 const fetchGroupCartDetails = async (groupCode) => {
 try {
 // Join group cart in backend first
 const joinRes = await API.post('/advanced/group/join', { code: groupCode });
 setGroupCart(joinRes.data.data);
 fetchBillSplit(groupCode);
 loadStoreMenu(joinRes.data.data.store);
 } catch (err) {
 setError(err.response?.data?.message || 'Failed to load group cart details.');
 }
 };

 const loadStoreMenu = async (storeId) => {
 try {
 const menuRes = await API.get(`/stores/${storeId}/menu`);
 // Flatten menu categories for easy list selection
 const list = [];
 menuRes.data.forEach(cat => {
 cat.items.forEach(item => {
 list.push({ ...item, category: cat.category });
 });
 });
 setMenuItems(list);
 } catch (err) {
 // Fallback menu list
 setMenuItems([
 { _id: 'item-truffle-burger', name: 'Smoked Truffle Burger', price: 299, isVeg: false },
 { _id: 'item-crunchy-paneer-burger', name: 'Crispy Paneer Burger', price: 229, isVeg: true },
 { _id: 'item-margherita-pizza', name: 'Classic Margherita', price: 349, isVeg: true }
 ]);
 }
 };

 const fetchBillSplit = async (groupCode) => {
 try {
 const splitRes = await API.get(`/advanced/group/split/${groupCode}`);
 setSplitDetails(splitRes.data);
 } catch (err) {
 console.error(err);
 }
 };

 const handleCreateGroup = async () => {
 setError('');
 try {
 const res = await API.post('/advanced/group/create', { storeId: selectedRes });
 setCode(res.data.code);
 setGroupCart(res.data.data);
 navigate(`/group-order?code=${res.data.code}`);
 } catch (err) {
 setError('Could not create group cart session.');
 }
 };

 const handleJoinGroup = async (e) => {
 e.preventDefault();
 if (!code.trim()) return;
 setError('');
 fetchGroupCartDetails(code.trim().toUpperCase());
 };

 // Add / modify items inside shared cart
 const handleItemQuantityChange = async (productId, currentQty, amount) => {
 setError('');
 const newQty = currentQty + amount;
 try {
 await API.post('/advanced/group/add', {
 code,
 productId,
 quantity: newQty
 });
 } catch (err) {
 setError('Failed to update group item quantity.');
 }
 };

 const handleLockCart = async () => {
 setError('');
 try {
 await API.post('/advanced/group/lock', { code });
 setSuccess('Cart locked! Initiating checkout...');
 } catch (err) {
 setError('Failed to lock cart.');
 }
 };

 const handleCopyLink = () => {
 const link = `${window.location.origin}/group-order?code=${code}`;
 navigator.clipboard.writeText(link);
 setSuccess('Invite link copied to clipboard!');
 setTimeout(() => setSuccess(''), 3000);
 };

 return (
 <div className="max-w-6xl mx-auto px-4 py-8">
 {/* 1. If not joined or created yet */}
 {!groupCart ? (
 <div className="max-w-md mx-auto bg-white border border-pink-200 rounded-3xl p-8 shadow-xl text-center flex flex-col gap-6">
 <Users className="w-16 h-16 mx-auto text-brand-500 stroke-1" />
 
 <div>
 <h2 className="text-2xl font-black">Group Order</h2>
 <p className="text-xs text-slate-400 mt-1">Start a collaborative cart session with friends and automatically split the bill!</p>
 </div>

 {error && (
 <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-500 rounded-2xl flex items-center gap-2">
 <AlertCircle className="w-4 h-4" />
 <span>{error}</span>
 </div>
 )}

 {/* Option A: Create Session */}
 <div className="text-left border-t border-pink-200 pt-6">
 <h3 className="text-sm font-bold mb-2">Create New Group Session</h3>
 <div className="flex gap-2">
 <select 
 value={selectedRes}
 onChange={(e) => setSelectedRes(e.target.value)}
 className="flex-1 bg-pink-50 border border-pink-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-brand-500"
 >
 {stores.map(r => (
 <option key={r._id} value={r._id}>{r.name}</option>
 ))}
 </select>
 <button 
 onClick={handleCreateGroup}
 className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-md"
 >
 Create
 </button>
 </div>
 </div>

 {/* Option B: Join existing */}
 <div className="text-left border-t border-pink-200 pt-6">
 <h3 className="text-sm font-bold mb-2">Join Existing Cart</h3>
 <form onSubmit={handleJoinGroup} className="flex gap-2">
 <input 
 type="text"
 placeholder="Enter 6-digit Code (e.g. X5TYD7)"
 value={code}
 onChange={(e) => setCode(e.target.value.toUpperCase())}
 className="flex-grow bg-pink-50 border border-pink-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-brand-500 uppercase tracking-widest text-center font-bold"
 />
 <button 
 type="submit"
 className="px-5 py-2.5 bg-slate-900 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all"
 >
 Join
 </button>
 </form>
 </div>
 </div>
 ) : (
 // 2. Active Group Cart UI
 <div className="flex flex-col lg:flex-row gap-8 items-start">
 {/* Main Area: Menu Selection & Group Cart details */}
 <div className="flex-[2] w-full flex flex-col gap-6">
 
 {/* Header info */}
 <div className="p-6 bg-white rounded-3xl border border-pink-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <span className="text-[10px] font-black text-brand-500 uppercase bg-brand-500/10 px-2.5 py-1 rounded-full tracking-wider">
 Active Group Order
 </span>
 <h2 className="text-2xl font-black mt-2">Code: <span className="text-brand-500">{groupCart.code}</span></h2>
 <p className="text-xs text-slate-400 mt-0.5">Share code or copy link to invite friends to join this cart.</p>
 </div>

 <div className="flex gap-2">
 <button 
 onClick={handleCopyLink}
 className="flex items-center gap-1.5 px-4 py-2 border border-pink-200 hover:border-brand-500 rounded-xl text-xs font-bold transition-all bg-white "
 >
 <Share2 className="w-4 h-4" />
 <span>Share Link</span>
 </button>

 {groupCart.status === 'active' && groupCart.createdBy === user?._id && (
 <button 
 onClick={handleLockCart}
 className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/10"
 >
 <Lock className="w-4 h-4" />
 <span>Lock Cart</span>
 </button>
 )}
 </div>
 </div>

 {error && (
 <div className="p-3.5 bg-rose-50 border border-rose-200 text-xs text-rose-500 rounded-2xl flex items-center gap-2">
 <AlertCircle className="w-4 h-4" />
 <span>{error}</span>
 </div>
 )}

 {success && (
 <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-600 rounded-2xl flex items-center gap-2">
 <CheckCircle className="w-4 h-4" />
 <span>{success}</span>
 </div>
 )}

 {/* Menu Items to add (collapsible or scrollable grid) */}
 {groupCart.status === 'active' ? (
 <div className="p-6 bg-white rounded-3xl border border-pink-200 shadow-sm">
 <h3 className="text-lg font-black mb-4">Add Items to Cart</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2 no-scrollbar">
 {menuItems.map(item => {
 const currentItem = groupCart.items.find(i => i.product?._id === item._id && i.user === user?._id);
 const qty = currentItem ? currentItem.quantity : 0;
 return (
 <div key={item._id} className="p-3 border border-pink-200 bg-pink-50/50 rounded-2xl flex justify-between items-center">
 <div>
 <span className="text-[10px] text-slate-400 block mb-0.5">{item.category}</span>
 <h4 className="font-bold text-xs text-slate-800 ">{item.name}</h4>
 <span className="text-xs font-black mt-1 block">₹{item.price}</span>
 </div>
 <div className="flex items-center gap-2 bg-brand-500 text-white rounded-full p-0.5">
 <button 
 onClick={() => handleItemQuantityChange(item._id, qty, -1)}
 className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-brand-600"
 >
 <Minus className="w-2.5 h-2.5" />
 </button>
 <span className="text-xs font-black min-w-4 text-center">{qty}</span>
 <button 
 onClick={() => handleItemQuantityChange(item._id, qty, 1)}
 className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-brand-600"
 >
 <Plus className="w-2.5 h-2.5" />
 </button>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 ) : (
 <div className="p-8 bg-pink-100 border border-pink-200 rounded-3xl text-center flex flex-col items-center gap-3">
 <Lock className="w-10 h-10 text-rose-500" />
 <h4 className="font-bold text-sm">Cart is Locked</h4>
 <p className="text-xs text-slate-400 max-w-xs">The creator has locked this group order. No further items can be added.</p>
 </div>
 )}

 {/* List of items in cart split by member */}
 <div className="p-6 bg-white rounded-3xl border border-pink-200 shadow-sm">
 <h3 className="text-lg font-black mb-4">Cart Breakdown</h3>
 {groupCart.items.length === 0 ? (
 <p className="text-slate-400 text-xs py-6 text-center">Cart is currently empty. Start adding items!</p>
 ) : (
 <div className="space-y-6">
 {groupCart.members.map(member => {
 const memberItems = groupCart.items.filter(item => item.user === member.user?._id);
 if (memberItems.length === 0) return null;
 return (
 <div key={member.user?._id} className="p-4 bg-pink-50 rounded-2xl border border-pink-200 ">
 <h4 className="font-bold text-xs text-brand-500 mb-2">{member.name}'s Items</h4>
 <div className="divide-y divide-slate-100 ">
 {memberItems.map(item => (
 <div key={item._id} className="py-2.5 flex justify-between items-center text-xs">
 <span className="text-slate-700 font-medium">
 {item.product ? item.product.name : 'Dish'} <strong className="text-slate-400 text-[10px]">x {item.quantity}</strong>
 </span>
 <span className="font-bold">₹{item.price * item.quantity}</span>
 </div>
 ))}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>

 </div>

 {/* Right Sidebar: Bill Split Ledger & Connected Members */}
 <div className="flex-1 w-full flex flex-col gap-6">
 
 {/* Connected Members */}
 <div className="p-6 bg-white border border-pink-200 rounded-3xl shadow-sm">
 <h3 className="text-sm font-black mb-4 flex items-center gap-2">
 <Users className="w-4 h-4 text-brand-500" />
 Members Connected ({groupCart.members.length})
 </h3>
 <div className="flex flex-wrap gap-2">
 {groupCart.members.map(m => (
 <span key={m.user?._id} className="px-3 py-1.5 bg-pink-100 border border-pink-200 rounded-full text-xs font-bold flex items-center gap-1.5">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
 {m.name}
 </span>
 ))}
 </div>
 </div>

 {/* Split Bill Calculator */}
 {splitDetails && (
 <div className="p-6 bg-white border border-pink-200 rounded-3xl shadow-premium">
 <h3 className="text-sm font-black mb-4 flex items-center gap-2">
 <Calculator className="w-4 h-4 text-brand-500" />
 Bill Splitting Ledger
 </h3>

 {/* Subtotals */}
 <div className="space-y-2 text-xs border-b border-pink-200 pb-4 mb-4 text-slate-500">
 <div className="flex justify-between">
 <span>Items Subtotal</span>
 <span className="font-bold text-slate-700 ">₹{splitDetails.billDetails.subtotal}</span>
 </div>
 <div className="flex justify-between">
 <span>Proportional GST (5%)</span>
 <span className="font-bold text-slate-700 ">₹{splitDetails.billDetails.tax}</span>
 </div>
 <div className="flex justify-between">
 <span>Delivery Fee (Split)</span>
 <span className="font-bold text-slate-700 ">₹{splitDetails.billDetails.deliveryFee}</span>
 </div>
 <div className="flex justify-between text-sm font-black text-slate-900 pt-2">
 <span>Total Bill</span>
 <span>₹{splitDetails.billDetails.grandTotal}</span>
 </div>
 </div>

 {/* Split list */}
 <div className="space-y-4">
 <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Per Person Share</h4>
 {splitDetails.splitBreakdown.map(breakdown => (
 <div key={breakdown.userId} className="p-3 bg-pink-50 rounded-2xl text-xs space-y-1">
 <div className="flex justify-between font-bold border-b border-pink-200 pb-1">
 <span>{breakdown.userName}</span>
 <span className="text-brand-500 font-extrabold">₹{breakdown.memberTotal}</span>
 </div>
 <div className="flex justify-between text-[10px] text-slate-400 mt-1">
 <span>Items Price:</span>
 <span>₹{breakdown.itemsCost}</span>
 </div>
 <div className="flex justify-between text-[10px] text-slate-400">
 <span>Tax + Delivery Share:</span>
 <span>₹{breakdown.taxShare + breakdown.deliveryShare}</span>
 </div>
 </div>
 ))}
 </div>

 {/* Action button: checkout */}
 {groupCart.status === 'locked' && groupCart.createdBy === user?._id && (
 <button 
 onClick={() => {
 // Custom navigation passing group split details to checkout screen
 navigate(`/checkout?groupCode=${code}`);
 }}
 className="w-full mt-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs text-center rounded-full shadow-lg shadow-brand-500/10 active:scale-95 transition-all"
 >
 Proceed to Group Checkout
 </button>
 )}
 </div>
 )}

 </div>
 </div>
 )}
 </div>
 );
};

export default GroupOrder;
