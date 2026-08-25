import axios from 'axios';
import { store } from '../store/index.js';
import { setCredentials, logout } from '../store/authSlice.js';

const getApiUrl = () => {
  return (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
};

const API = axios.create({
 baseURL: getApiUrl(),
 withCredentials: true, // critical to send cookies (refreshToken)
});

// Request interceptor to inject Authorization header
API.interceptors.request.use((req) => {
 const state = store.getState();
 if (state.auth.token) {
 let token = state.auth.token;
 
 // Clean token string just in case it got double-stringified or is invalid literal
 if (typeof token === 'string') {
 token = token.replace(/^["']|["']$/g, ''); 
 }
 
 req.headers.Authorization = `Bearer ${token}`;
 }
 return req;
});

// Response interceptor to handle token expiry (401) and attempt silent token refresh
API.interceptors.response.use(
 (response) => response,
 async (error) => {
 const originalRequest = error.config;

 // Avoid infinite loops by checking if we already tried to refresh
 if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
 originalRequest._retry = true;

 try {
 // Run refresh request
 const res = await axios.post(
 `${getApiUrl()}/auth/refresh`,
 {},
 { withCredentials: true }
 );

 const newToken = res.data.token;
 const currentUser = store.getState().auth.user;

 // Save new credentials in Redux
 store.dispatch(setCredentials({ user: currentUser, token: newToken }));

 // Update Authorization header on original request and retry
 originalRequest.headers.Authorization = `Bearer ${newToken}`;
 return API(originalRequest);
 } catch (refreshError) {
 // If refresh fails, sign out user
 store.dispatch(logout());
 return Promise.reject(refreshError);
 }
 }

 return Promise.reject(error);
 }
);

export default API;
