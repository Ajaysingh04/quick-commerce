import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // Array of product IDs
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlistItem: (state, action) => {
      const productId = action.payload;
      const index = state.items.indexOf(productId);
      if (index > -1) {
        state.items.splice(index, 1);
      } else {
        state.items.push(productId);
      }
    },
    clearWishlist: (state) => {
      state.items = [];
    }
  }
});

export const { toggleWishlistItem, clearWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;
