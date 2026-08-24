import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../services/api';

// Fetch user's wishlist (array of fully populated product objects)
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/users/wishlist');
      return response.data; // array of populated products
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

// Toggle a product in wishlist
export const toggleWishlistThunk = createAsyncThunk(
  'wishlist/toggleWishlist',
  async (product, { rejectWithValue }) => {
    try {
      await API.post('/users/wishlist/toggle', { productId: product._id || product.id });
      return product;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to toggle wishlist');
    }
  }
);

const initialState = {
  items: [], // Array of FULL product objects
  loading: false,
  error: null
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // For unauthenticated users or local toggles before sync
    toggleWishlistItem: (state, action) => {
      const product = action.payload;
      const productId = product._id || product.id;
      const existingIndex = state.items.findIndex(item => (item._id || item.id) === productId);
      
      if (existingIndex > -1) {
        state.items.splice(existingIndex, 1);
      } else {
        state.items.push(product);
      }
    },
    clearWishlist: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleWishlistThunk.fulfilled, (state, action) => {
        const product = action.payload;
        const productId = product._id || product.id;
        const existingIndex = state.items.findIndex(item => (item._id || item.id) === productId);
        
        if (existingIndex > -1) {
          state.items.splice(existingIndex, 1);
        } else {
          state.items.push(product);
        }
      });
  }
});

export const { toggleWishlistItem, clearWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;
