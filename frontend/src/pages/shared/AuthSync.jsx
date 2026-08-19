import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice.js';
import API from '../../services/api.js';

const AuthSync = () => {
 const { getToken, isLoaded: authLoaded, signOut } = useAuth();
 const { user, isLoaded: userLoaded } = useUser();
 const navigate = useNavigate();
 const dispatch = useDispatch();
 const location = useLocation();

 const [errorMsg, setErrorMsg] = useState(null);

 useEffect(() => {
 // Timeout after 10 seconds to prevent infinite loading
 const timer = setTimeout(() => {
 if (!errorMsg) {
 setErrorMsg("Connection timeout. Please check your internet or try again.");
 }
 }, 10000);

 return () => clearTimeout(timer);
 }, [errorMsg]);

 useEffect(() => {
 const syncUser = async () => {
 if (!authLoaded || !userLoaded) {
 console.log("Waiting for Clerk to load...", { authLoaded, userLoaded });
 return;
 }
 
 if (!user) {
 console.log("No user authenticated, redirecting to login");
 navigate('/login');
 return;
 }
 
 try {
 const token = await getToken();
 
 // Sync with our backend to ensure MongoDB user exists and to fetch their roles
 let roleIntent = localStorage.getItem('auth_role') || 'customer';
 
 const userEmail = user.primaryEmailAddress?.emailAddress;
 const isAdminEmail = userEmail === 'admin@appsica.com' || userEmail === 'ajayworkon04@gmail.com' || userEmail === 'ajaysingh04@gmail.com';
 const isStrictCustomer = userEmail === 'ajaysinghbanafer1@gmail.com';
 const isStrictDelivery = userEmail === 'ajaysinghbanafer098@gmail.com';
 const isStrictPartner = userEmail === 'appsica086@gmail.com';
 
  // Auto-detect role based on strict emails regardless of where they logged in from
  if (isAdminEmail) roleIntent = 'admin';
  else if (isStrictDelivery) roleIntent = 'delivery';
  else if (isStrictPartner) roleIntent = 'partner';
  else if (isStrictCustomer) roleIntent = 'customer';
 
 const res = await API.post('/auth/clerk-sync', {
 clerkId: user.id,
 email: user.primaryEmailAddress?.emailAddress,
 name: user.fullName || user.firstName || 'User',
 avatar: user.imageUrl,
 role: roleIntent === 'admin' ? 'admin' : (roleIntent === 'delivery' ? 'delivery' : (roleIntent === 'partner' ? 'partner' : 'user'))
 }, {
 headers: { Authorization: `Bearer ${token}` }
 });
 
 // Save to Redux store
 dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
 
 // Navigate based on role
 if (res.data.user.role === 'admin') navigate('/admin');
 else if (res.data.user.role === 'delivery') navigate('/delivery');
 else if (res.data.user.role === 'partner') navigate('/partner');
 else navigate('/');
 
 } catch (err) {
 console.error("Failed to sync user with backend:", err);
 setErrorMsg(err.response?.data?.message || err.message || "Failed to connect to backend");
 }
 };
 
 syncUser();
 }, [authLoaded, userLoaded, user, navigate, dispatch, getToken]);

 if (errorMsg) {
 return (
 <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 p-6 text-center">
 <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-rose-100 ">
 <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
 <i className="fas fa-exclamation-triangle"></i>
 </div>
 <h2 className="text-xl font-bold text-slate-800 mb-2">Sync Error</h2>
 <p className="text-slate-600 mb-6">{errorMsg}</p>
 <div className="flex gap-3 justify-center">
 <button 
 onClick={() => window.location.reload()} 
 className="px-6 py-2 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 transition-colors"
 >
 Try Again
 </button>
 <button 
 onClick={() => {
 localStorage.removeItem('token');
 window.location.href = '/login';
 }} 
 className="px-6 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors"
 >
 Back to Login
 </button>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 gap-4">
 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
 <p className="text-slate-500 font-medium animate-pulse">Syncing your account securely...</p>
 </div>
 );
};

export default AuthSync;
