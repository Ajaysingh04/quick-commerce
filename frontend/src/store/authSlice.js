import { createSlice } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
const storedToken = localStorage.getItem('token') || null;

const initialState = {
 user: storedUser,
 token: storedToken,
 isAuthenticated: !!storedToken,
 loading: false,
 error: null
};

const authSlice = createSlice({
 name: 'auth',
 initialState,
 reducers: {
 setCredentials: (state, action) => {
 const { user, token } = action.payload;
 state.user = user;
 state.token = token;
 state.isAuthenticated = true;
 localStorage.setItem('user', JSON.stringify(user));
 localStorage.setItem('token', token);
 },
 updateUserProfile: (state, action) => {
 state.user = { ...state.user, ...action.payload };
 localStorage.setItem('user', JSON.stringify(state.user));
 },
 logout: (state) => {
 state.user = null;
 state.token = null;
 state.isAuthenticated = false;
 localStorage.removeItem('user');
 localStorage.removeItem('token');
 }
 }
});

export const { setCredentials, updateUserProfile, logout } = authSlice.actions;
export default authSlice.reducer;
