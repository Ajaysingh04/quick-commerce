import { createSlice } from '@reduxjs/toolkit';

const initialState = {
 items: [], // { id, name, price, quantity, image, isVeg }
 store: null, // { id, name }
 coupon: null, // { code, discountPercent, discountAmount }
};

const cartSlice = createSlice({
 name: 'cart',
 initialState,
 reducers: {
 addToCart: (state, action) => {
 const { item, store } = action.payload;

 // 1. Check multi-store conflict
 if (state.items.length > 0 && state.store && state.store.id !== store.id) {
 // Handled in UI via confirmation, but state safety checks:
 state.items = [];
 state.coupon = null;
 }

 state.store = store;

 const existingIndex = state.items.findIndex(i => i.id === item.id);
 if (existingIndex > -1) {
 state.items[existingIndex].quantity += 1;
 } else {
 state.items.push({ ...item, quantity: 1 });
 }
 },
 updateQuantity: (state, action) => {
 const { itemId, amount } = action.payload;
 const index = state.items.findIndex(i => i.id === itemId);
 if (index > -1) {
 state.items[index].quantity += amount;
 if (state.items[index].quantity <= 0) {
 state.items.splice(index, 1);
 }
 }

 if (state.items.length === 0) {
 state.store = null;
 state.coupon = null;
 }
 },
 clearCart: (state) => {
 state.items = [];
 state.store = null;
 state.coupon = null;
 },
 applyCoupon: (state, action) => {
 state.coupon = action.payload; // { code, discountPercent, discountAmount }
 },
 removeCoupon: (state) => {
 state.coupon = null;
 }
 }
});

export const { addToCart, updateQuantity, clearCart, applyCoupon, removeCoupon } = cartSlice.actions;

// Selectors for convenience
export const selectSubtotal = (state) => 
 state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

export const selectCartTotal = (state) => {
 const subtotal = selectSubtotal(state);
 const deliveryFee = subtotal >= 500 || subtotal === 0 ? 0 : 40;
 const tax = Math.round(subtotal * 0.05);
 const discount = state.cart.coupon ? state.cart.coupon.discountAmount : 0;
 return subtotal + deliveryFee + tax - discount;
};

export default cartSlice.reducer;
