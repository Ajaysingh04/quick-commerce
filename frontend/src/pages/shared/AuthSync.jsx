import React, { useCallback, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice.js';
import API from '../../services/api.js';

const AuthSync = () => {
 const { getToken, isLoaded: authLoaded, signOut, isSignedIn } = useAuth();
 const { user, isLoaded: userLoaded } = useUser();
 const navigate = useNavigate();
 const dispatch = useDispatch();

 const [errorMsg, setErrorMsg] = useState(null);
 const [isSyncing, setIsSyncing] = useState(false);

 const syncUser = useCallback(async () => {
   if (!authLoaded || !userLoaded) {
     console.log('Waiting for Clerk to load...', { authLoaded, userLoaded });
     return;
   }

   if (!isSignedIn) {
     console.log('Not signed in, redirecting to login');
     navigate('/login');
     return;
   }

   if (!user) {
     console.log('Waiting for user object to populate...');
     return;
   }

   setIsSyncing(true);
   setErrorMsg(null);

   try {
     const token = await getToken();

     const storedRole = localStorage.getItem('auth_role');
     let roleIntent = storedRole || user?.publicMetadata?.role || 'user';

     const userEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase();
     const defaultAdminEmails = ['admin@appsica.com', 'ajayworkon04@gmail.com', 'ajaysingh04@gmail.com'];
     const configuredAdminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
     const adminEmails = [...new Set([...defaultAdminEmails, ...configuredAdminEmails])];
     const isAdminEmail = !!userEmail && adminEmails.includes(userEmail);

     if (storedRole === 'admin' || user?.publicMetadata?.role === 'admin' || isAdminEmail) {
       roleIntent = 'admin';
     } else if (storedRole === 'delivery' || user?.publicMetadata?.role === 'delivery') {
       roleIntent = 'delivery';
     } else if (storedRole === 'partner' || user?.publicMetadata?.role === 'partner') {
       roleIntent = 'partner';
     } else {
       roleIntent = 'user';
     }

     const res = await API.post('/auth/clerk-sync', {
       clerkId: user.id,
       email: user.primaryEmailAddress?.emailAddress,
       name: user.fullName || user.firstName || 'User',
       avatar: user.imageUrl,
       role: roleIntent,
     }, {
       headers: { Authorization: `Bearer ${token}` },
     });

     dispatch(setCredentials({ user: res.data.user, token: res.data.token }));

     if (res.data.user.role === 'admin') navigate('/admin');
     else if (res.data.user.role === 'delivery') navigate('/delivery');
     else if (res.data.user.role === 'partner') navigate('/partner');
     else navigate('/');
   } catch (err) {
     console.error('Failed to sync user with backend:', err);
     setErrorMsg(err.response?.data?.message || err.message || 'Failed to connect to backend');
   } finally {
     setIsSyncing(false);
   }
 }, [authLoaded, userLoaded, isSignedIn, user, navigate, dispatch, getToken]);

 useEffect(() => {
   syncUser();
 }, [syncUser]);

 useEffect(() => {
   if (!authLoaded || !userLoaded || !isSignedIn || !user || errorMsg || isSyncing) {
     return undefined;
   }

   const timer = setTimeout(() => {
     setErrorMsg('Connection timeout. Please check your internet or try again.');
   }, 15000);

   return () => clearTimeout(timer);
 }, [authLoaded, userLoaded, isSignedIn, user, errorMsg, isSyncing]);

 if (errorMsg) {
   return (
     <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
       <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-emerald-100 ">
         <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
           <i className="fas fa-exclamation-triangle"></i>
         </div>
         <h2 className="text-xl font-bold text-slate-800 mb-2">Sync Error</h2>
         <p className="text-slate-600 mb-6">{errorMsg}</p>
         <div className="flex gap-3 justify-center">
           <button
             onClick={syncUser}
             className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/20"
           >
             Try Again
           </button>
           <button
             onClick={async () => {
               await signOut();
               localStorage.removeItem('token');
               navigate('/login');
             }}
             className="px-6 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
           >
             Back to Login
           </button>
         </div>
       </div>
     </div>
   );
 }

 return (
   <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6">
     <div className="relative flex items-center justify-center">
       <div className="absolute inset-0 w-20 h-20 bg-emerald-500 rounded-full opacity-20 animate-ping"></div>
       <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin z-10 shadow-lg"></div>
       <div className="absolute inset-0 flex items-center justify-center z-20">
         <div className="w-8 h-8 bg-emerald-500 rounded-full"></div>
       </div>
     </div>
     <h2 className="text-xl font-black text-slate-800 tracking-tight">Authenticating</h2>
     <p className="text-sm font-bold text-slate-400 animate-pulse bg-slate-100 px-4 py-1.5 rounded-full">Syncing securely with RoseDash...</p>
   </div>
 );
};

export default AuthSync;
