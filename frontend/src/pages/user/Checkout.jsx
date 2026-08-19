import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import API from '../../services/api.js';
import { clearCart, applyCoupon, removeCoupon, selectSubtotal, selectCartTotal } from '../../store/cartSlice.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { MapPin, Ticket, ShieldAlert, CreditCard, Landmark, Truck, ArrowLeft, Check, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default leaflet icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
 iconUrl: icon,
 shadowUrl: iconShadow,
 iconSize: [25, 41],
 iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const Checkout = () => {
 const navigate = useNavigate();
 const dispatch = useDispatch();
 const { settings } = useSettings();

 const { items: cartItems, store, coupon } = useSelector(state => state.cart);
 const { user } = useSelector(state => state.auth);

 const subtotal = useSelector(selectSubtotal);
 const baseGrandTotal = useSelector(selectCartTotal);
 
 // Calculate dynamic COD charge
 const distance = store?.distance || 2;
 const codCharge = Math.ceil(distance) * 5;
 
 // Form states
 const [address, setAddress] = useState({
 street: '',
 city: 'New Delhi',
 state: 'Delhi',
 zipCode: '110001'
 });
 const [position, setPosition] = useState({ lat: 28.6139, lng: 77.2090 });
 const [paymentMethod, setPaymentMethod] = useState('cod'); // cod, card, upi
 const [promoCode, setPromoCode] = useState('');
 
 const [couponError, setCouponError] = useState('');
 const [couponSuccess, setCouponSuccess] = useState('');
 const [placingOrder, setPlacingOrder] = useState(false);
 const [showPaymentModal, setShowPaymentModal] = useState(false);
 const [isPaymentDone, setIsPaymentDone] = useState(false);
 const [razorpayDetails, setRazorpayDetails] = useState(null);
 const [mockPaymentId, setMockPaymentId] = useState('');
 
 const grandTotal = paymentMethod === 'cod' ? baseGrandTotal + codCharge : baseGrandTotal;

 // Apply promo coupon
 const handleApplyCoupon = async (e) => {
 e.preventDefault();
 setCouponError('');
 setCouponSuccess('');
 
 if (!promoCode) return;

 try {
 const res = await API.post('/coupons/validate', {
 code: promoCode,
 subtotal
 });

 dispatch(applyCoupon({
 code: res.data.code,
 discountPercent: res.data.discountPercent,
 discountAmount: res.data.discountAmount
 }));
 setCouponSuccess(`Coupon "${res.data.code}" applied! Discount: ₹${res.data.discountAmount}`);
 } catch (err) {
 console.warn('API Coupon error, running client-side mock validation:', err);
 
 // Fallback local coupon checker
 if (promoCode.toUpperCase() === 'ZOMATO60') {
 let amt = Math.round(subtotal * 0.6);
 if (amt > 120) amt = 120;
 dispatch(applyCoupon({
 code: 'ZOMATO60',
 discountPercent: 60,
 discountAmount: amt
 }));
 setCouponSuccess(`Coupon "ZOMATO60" applied! Save 60% up to ₹120.`);
 } else {
 setCouponError(err.response?.data?.message || 'Invalid coupon code. Try code "ZOMATO60".');
 }
 }
 };

 const loadRazorpayScript = () => {
 return new Promise((resolve) => {
 const script = document.createElement("script");
 script.src = "https://checkout.razorpay.com/v1/checkout.js";
 script.onload = () => resolve(true);
 script.onerror = () => resolve(false);
 document.body.appendChild(script);
 });
 };

 const reverseGeocode = async (lat, lon) => {
 try {
 const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
 const data = await res.json();
 if (data && data.address) {
 setAddress(prev => ({
 ...prev,
 street: data.address.road || data.address.suburb || data.display_name.split(',')[0] || prev.street,
 city: data.address.city || data.address.town || data.address.village || prev.city,
 state: data.address.state || prev.state,
 zipCode: data.address.postcode || prev.zipCode
 }));
 }
 } catch (error) {
 console.error("Geocoding failed", error);
 }
 };

 const handleGetCurrentLocation = () => {
 if (navigator.geolocation) {
 navigator.geolocation.getCurrentPosition(
 (pos) => {
 const lat = pos.coords.latitude;
 const lng = pos.coords.longitude;
 setPosition({ lat, lng });
 reverseGeocode(lat, lng);
 },
 (error) => {
 alert('Unable to retrieve your location. Please check browser permissions.');
 }
 );
 } else {
 alert('Geolocation is not supported by your browser');
 }
 };

 function LocationMarker() {
 useMapEvents({
 click(e) {
 setPosition(e.latlng);
 reverseGeocode(e.latlng.lat, e.latlng.lng);
 },
 });
 return <Marker position={position}></Marker>;
 }

 const handleProceedToPayment = async () => {
 if (!document.getElementById('checkout-form').reportValidity()) return;
 
 try {
 setPlacingOrder(true);
 const itemsPayload = cartItems.map(item => ({ productId: item.id, quantity: item.quantity }));
 const res = await API.post('/orders/razorpay-intent', {
 storeId: store.id,
 items: itemsPayload,
 paymentMethod,
 couponCode: coupon ? coupon.code : undefined
 });

 if (res.data.mockOrderId) {
 setMockPaymentId(res.data.mockOrderId);
 setShowPaymentModal(true);
 } else if (res.data.razorpayOrderId) {
 const resScript = await loadRazorpayScript();
 if (!resScript) {
 alert('Razorpay SDK failed to load');
 return;
 }

 const options = {
 key: res.data.key,
 amount: res.data.amount,
 currency: res.data.currency,
 order_id: res.data.razorpayOrderId,
 name: "RoseDash",
 description: "Premium Product Delivery",
 handler: function (response) {
 setRazorpayDetails(response);
 setIsPaymentDone(true);
 },
 prefill: {
 name: user?.name || 'Customer',
 email: user?.email || 'customer@example.com',
 },
 theme: { color: "#f97316" },
 };

 const paymentObject = new window.Razorpay(options);
 paymentObject.open();
 }
 } catch (err) {
 console.error('Failed to initiate payment', err);
 alert('Could not connect to payment gateway.');
 } finally {
 setPlacingOrder(false);
 }
 };

 const handlePlaceOrder = async (e) => {
 e.preventDefault();
 if (cartItems.length === 0) return;

 setPlacingOrder(true);
 try {
 const itemsPayload = cartItems.map(item => ({
 productId: item.id,
 quantity: item.quantity
 }));

 const payload = {
 storeId: store.id,
 items: itemsPayload,
 deliveryAddress: { ...address, coordinates: position },
 paymentMethod,
 couponCode: coupon ? coupon.code : undefined,
 preVerified: isPaymentDone,
 razorpayPaymentDetails: razorpayDetails
 };

 const res = await API.post('/orders', payload);

 // Successfully processed order
 dispatch(clearCart());
 navigate(`/order-success?orderId=${res.data.order._id}`);
 } catch (err) {
 console.warn('API checkout order creation failed, running simulated order success redirection:', err);
 
 // Mock sandbox checkout fallback
 const mockOrderId = 'BD-' + Math.floor(1000000 + Math.random() * 9000000);
 dispatch(clearCart());
 
 // Redirect to Order Tracking screen
 navigate(`/order-success?orderId=${mockOrderId}`);
 } finally {
 setPlacingOrder(false);
 }
 };

 if (cartItems.length === 0) {
 return (
 <div className="max-w-md mx-auto px-4 py-24 text-center flex flex-col items-center gap-4 text-slate-400">
 <Truck className="w-16 h-16 stroke-1 text-slate-300 " />
 <div>
 <h3 className="text-lg font-bold text-slate-800 mb-1">Your cart is empty</h3>
 <p className="text-xs">Add products from home before trying to checkout.</p>
 </div>
 <Link to="/" className="mt-4 px-6 py-2.5 rounded-full bg-brand-500 text-white font-bold text-sm">Shop Now</Link>
 </div>
 );
 }

 return (
 <div className="bg-pink-50 min-h-screen pb-20">
 
 {/* Header */}
 <header className="bg-white border-b border-pink-200 py-4 shadow-sm sticky top-0 z-30">
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
 <div className="flex items-center gap-4">
 <Link to="/" className="text-slate-900">
 {settings.logoUrl ? (
 <img src={settings.logoUrl} alt="Logo" className="h-6 object-contain" />
 ) : (
 <span className="font-black text-xl tracking-tighter text-slate-900 ">
 {settings.siteTitle || 'RoseDash'}
 </span>
 )}
 </Link>
 <span className="font-bold text-slate-500 uppercase tracking-widest text-xs hidden sm:block">10-Min Delivery Checkout</span>
 </div>
 <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 ">
 <ShieldAlert className="w-5 h-5 text-emerald-500" />
 100% Safe & Secure Payments
 </div>
 </div>
 </header>

 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 
 {/* Left Column (Address & Payment) */}
 <div className="lg:col-span-8 space-y-6">
 
 {/* Account / Logged in (Mock for Zomato feel) */}
 <div className="bg-white rounded-lg p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-pink-200 ">
 <div className="flex items-start gap-4">
 <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center font-bold text-slate-500">
 {user?.name?.[0]?.toUpperCase() || 'U'}
 </div>
 <div>
 <h3 className="font-bold text-slate-900 flex items-center gap-2">
 Logged in <Check className="w-4 h-4 text-emerald-500" />
 </h3>
 <p className="text-sm text-slate-500">{user?.name} | {user?.email}</p>
 </div>
 </div>
 </div>
 
 {/* Address Form Card */}
 <div className="bg-white rounded-lg p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-pink-200 ">
 <h3 className="text-xl font-bold mb-6 text-slate-900 ">Delivery Address</h3>

 <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
 <div>
 <label className="block text-sm font-semibold text-slate-600 mb-2">Street Address</label>
 <input 
 type="text" 
 required
 placeholder="Flat No, House/Building Number, Area, Landmark"
 value={address.street}
 onChange={(e) => setAddress({ ...address, street: e.target.value })}
 className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all"
 />
 </div>
 
 <div className="mb-4">
 <div className="flex justify-between items-center mb-2">
 <label className="block text-sm font-semibold text-slate-600 ">Pin Location on Map</label>
 <button type="button" onClick={handleGetCurrentLocation} className="text-xs font-bold text-brand-500 hover:text-brand-600 flex items-center gap-1 border border-brand-500 px-3 py-1.5 rounded-lg transition-colors">
 <Navigation className="w-3 h-3" /> Locate Me
 </button>
 </div>
 <div className="h-[250px] w-full rounded-lg overflow-hidden border border-slate-300 z-0">
 <MapContainer center={[position.lat, position.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
 <TileLayer
 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
 />
 <LocationMarker />
 </MapContainer>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div>
 <label className="block text-sm font-semibold text-slate-600 mb-2">City</label>
 <input 
 type="text" 
 required
 value={address.city}
 onChange={(e) => setAddress({ ...address, city: e.target.value })}
 className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all"
 />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-600 mb-2">State</label>
 <input 
 type="text" 
 required
 value={address.state}
 onChange={(e) => setAddress({ ...address, state: e.target.value })}
 className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all"
 />
 </div>
 <div>
 <label className="block text-sm font-semibold text-slate-600 mb-2">Pincode</label>
 <input 
 type="text" 
 required
 value={address.zipCode}
 onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
 className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all"
 />
 </div>
 </div>
 </form>
 </div>

 {/* Payment Method Select Card */}
 <div className="bg-white rounded-lg p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-pink-200 ">
 <h3 className="text-xl font-bold mb-6 text-slate-900 ">Choose Payment Method</h3>

 <div className="space-y-4">
 <button 
 type="button"
 onClick={() => { setPaymentMethod('cod'); setIsPaymentDone(false); }}
 className={`w-full p-4 rounded-xl flex items-center gap-4 border transition-all ${paymentMethod === 'cod' ? 'border-brand-500 bg-brand-50/50 ' : 'border-pink-200 hover:bg-pink-50 :bg-slate-800'}`}
 >
 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-brand-500' : 'border-slate-300'}`}>
 {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-brand-500 rounded-full"></div>}
 </div>
 <Truck className="w-6 h-6 text-slate-500" />
 <div className="text-left flex-1">
 <div className="font-semibold text-slate-900 ">Cash on Delivery (COD)</div>
 <div className="text-xs text-slate-500 mt-0.5">Pay at your doorstep (+₹{codCharge})</div>
 </div>
 </button>

 <button 
 type="button"
 onClick={() => { setPaymentMethod('card'); setIsPaymentDone(false); }}
 className={`w-full p-4 rounded-xl flex items-center gap-4 border transition-all ${paymentMethod === 'card' ? 'border-brand-500 bg-brand-50/50 ' : 'border-pink-200 hover:bg-pink-50 :bg-slate-800'}`}
 >
 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-brand-500' : 'border-slate-300'}`}>
 {paymentMethod === 'card' && <div className="w-2.5 h-2.5 bg-brand-500 rounded-full"></div>}
 </div>
 <CreditCard className="w-6 h-6 text-slate-500" />
 <div className="text-left flex-1">
 <div className="font-semibold text-slate-900 ">Credit/Debit Card</div>
 </div>
 </button>

 <button 
 type="button"
 onClick={() => { setPaymentMethod('upi'); setIsPaymentDone(false); }}
 className={`w-full p-4 rounded-xl flex items-center gap-4 border transition-all ${paymentMethod === 'upi' ? 'border-brand-500 bg-brand-50/50 ' : 'border-pink-200 hover:bg-pink-50 :bg-slate-800'}`}
 >
 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-brand-500' : 'border-slate-300'}`}>
 {paymentMethod === 'upi' && <div className="w-2.5 h-2.5 bg-brand-500 rounded-full"></div>}
 </div>
 <Landmark className="w-6 h-6 text-slate-500" />
 <div className="text-left flex-1">
 <div className="font-semibold text-slate-900 ">UPI / GPay / PhonePe</div>
 </div>
 </button>
 </div>
 </div>

 </div>

 {/* Right Summary */}
 <div className="space-y-6 lg:col-span-4">
 
 {/* Order Summary list */}
 <div className="bg-white rounded-lg p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-pink-200 flex flex-col gap-4">
 <h3 className="text-xl font-bold text-slate-900 border-b border-pink-200 pb-4 mb-2">Order Summary</h3>
 <div className="text-sm font-semibold text-slate-500">Fulfilled by: {store?.name}</div>

 <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-2">
 {cartItems.map((item) => (
 <div key={item.id} className="py-4 flex justify-between items-start text-sm">
 <div className="flex gap-3">
 <span className="mt-0.5">{item.isVeg ? '🟢' : '🔴'}</span>
 <div>
 <div className="font-semibold text-slate-800 ">{item.name}</div>
 <div className="text-xs text-slate-500 mt-1">₹{item.price} x {item.quantity}</div>
 </div>
 </div>
 <span className="font-bold text-slate-900 ">₹{item.price * item.quantity}</span>
 </div>
 ))}
 </div>

 {/* Coupons apply form */}
 <div className="border border-pink-200 rounded-lg p-4 mt-2">
 <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700 ">
 <Ticket className="w-5 h-5 text-brand-500" /> Offers & Benefits
 </div>
 <form onSubmit={handleApplyCoupon} className="flex items-center bg-pink-50 rounded-lg border border-transparent focus-within:border-brand-500 overflow-hidden transition-colors">
 <input 
 type="text" 
 placeholder="Enter Code (e.g. ZOMATO60)"
 value={promoCode}
 onChange={(e) => setPromoCode(e.target.value)}
 className="flex-1 min-w-0 bg-transparent px-4 py-3 text-sm outline-none uppercase font-bold text-slate-900 "
 />
 <button type="submit" className="px-5 py-3 text-brand-500 hover:text-brand-600 hover:bg-brand-50 :bg-brand-500/10 text-sm font-bold shrink-0 transition-colors">
 APPLY
 </button>
 </form>
 {couponError && <p className="text-xs font-bold text-rose-500 flex items-center gap-1 mt-3"><ShieldAlert className="w-4 h-4" /> {couponError}</p>}
 {couponSuccess && <p className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-3"><Check className="w-4 h-4" /> {couponSuccess}</p>}
 </div>

 {/* Cost rows */}
 <h4 className="font-bold text-base text-slate-900 mt-4">Bill Details</h4>
 <div className="space-y-3 text-sm font-medium text-slate-600 border-b border-pink-200 pb-4">
 <div className="flex justify-between">
 <span>Item Total</span>
 <span>₹{subtotal}</span>
 </div>
 <div className="flex justify-between">
 <span>Delivery Fee</span>
 <span>{subtotal >= 500 ? 'FREE' : '₹40'}</span>
 </div>
 <div className="flex justify-between">
 <span>GST and Platform Charges</span>
 <span>₹{Math.round(subtotal * 0.05)}</span>
 </div>
 {paymentMethod === 'cod' && (
 <div className="flex justify-between text-brand-500 font-semibold">
 <span>COD Charge</span>
 <span>+₹{codCharge}</span>
 </div>
 )}
 {coupon && (
 <div className="flex justify-between text-emerald-500 font-semibold">
 <span>Coupon Discount</span>
 <span>-₹{coupon.discountAmount}</span>
 </div>
 )}
 </div>

 <div className="flex justify-between items-center text-lg font-black text-slate-900 pt-2">
 <span>To Pay</span>
 <span>₹{grandTotal}</span>
 </div>

 {paymentMethod !== 'cod' && !isPaymentDone ? (
 <button
 type="button"
 disabled={placingOrder}
 onClick={handleProceedToPayment}
 className="w-full bg-brand-500 text-white font-bold text-lg py-4 rounded-lg hover:bg-brand-600 transition-colors shadow-md disabled:opacity-70 mt-4"
 >
 {placingOrder ? 'Processing...' : `Proceed to Pay`}
 </button>
 ) : (
 <button
 type="submit"
 form="checkout-form"
 disabled={placingOrder}
 className="w-full bg-brand-500 text-white font-bold text-lg py-4 rounded-lg hover:bg-brand-600 transition-colors shadow-md disabled:opacity-70 flex items-center justify-center mt-4"
 >
 {placingOrder ? 'Completing Order...' : isPaymentDone ? `Place Order` : `Place Order (₹${grandTotal})`}
 </button>
 )}
 </div>
 </div>
 </div>
 </div>

 {/* MOCK PAYMENT OVERLAY */}
 {showPaymentModal && (
 <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
 <div className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 border border-pink-200 ">
 <div className="bg-pink-50 p-6 border-b border-pink-200 text-center relative">
 <button 
 onClick={() => setShowPaymentModal(false)}
 className="absolute top-6 left-6 text-slate-400 hover:text-slate-900 :text-white"
 >
 <ArrowLeft className="w-5 h-5" />
 </button>
 <div className="w-16 h-16 bg-brand-500 rounded-full mx-auto flex items-center justify-center mb-4">
 <ShieldAlert className="w-8 h-8 text-white" />
 </div>
 <h3 className="text-2xl font-black text-slate-900 ">Test Payment</h3>
 <p className="text-sm text-slate-500 mt-1">TEST ENVIRONMENT (Sandbox)</p>
 </div>
 
 <div className="p-8 text-center">
 <p className="text-sm text-slate-500 mb-8">This is a simulated payment gateway. In a real environment, you would enter Card or UPI details here.</p>
 <div className="flex justify-between items-center mb-8 p-4 border border-pink-200 rounded-lg bg-pink-50 ">
 <span className="font-semibold text-slate-500">Amount Payable</span>
 <span className="text-xl font-black text-slate-900 ">₹{grandTotal}</span>
 </div>
 <button
 onClick={() => {
 setRazorpayDetails({ razorpay_payment_id: mockPaymentId });
 setIsPaymentDone(true);
 setShowPaymentModal(false);
 }}
 className="w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-lg hover:bg-slate-800 :bg-pink-100 transition-colors shadow-md"
 >
 Simulate Success
 </button>
 </div>
 </div>
 </div>
 )}

 </div>
 );
};

export default Checkout;
