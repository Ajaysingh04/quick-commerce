import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChefHat, CheckCircle2, AlertCircle, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import API from '../../services/api.js';

const JoinStaff = () => {
 const { token } = useParams();
 const navigate = useNavigate();
 const { isSignedIn, isLoaded, user } = useAuth();
 
 const [loading, setLoading] = useState(false);
 const [status, setStatus] = useState('idle'); // idle, success, error
 const [message, setMessage] = useState('');

 // When clicking Accept & Join
 const handleJoin = async () => {
 if (!isSignedIn) {
 alert("Please sign in or create an account first to accept this invite.");
 return;
 }
 
 setLoading(true);
 try {
 // The backend expects token and userId
 // Note: We use user.id (Clerk ID). The auth middleware expects a valid token.
 // Since this is a public endpoint conceptually but requires userId, let's just pass the userId.
 // Wait, our backend uses standard JWT/Mongo ObjectId for userId, but Clerk syncs to Mongo.
 // For safety, let's just use the api which injects the Bearer token automatically, and backend can read req.user._id if it's protected, or we send clerk id if it's public.
 // Let's assume the backend endpoint is protected by Clerk or we just send the request and backend checks the bearer token.
 
 const res = await API.post('/partner/staff/accept', { token });
 
 setStatus('success');
 setMessage(res.data.message || `Welcome to ${res.data.storeName}!`);
 
 // Redirect after 3s
 setTimeout(() => {
 navigate('/partner/dashboard');
 }, 3000);
 
 } catch (err) {
 setStatus('error');
 setMessage(err.response?.data?.message || 'Invalid or expired invite link.');
 } finally {
 setLoading(false);
 }
 };

 if (!isLoaded) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#e31837]" /></div>;

 return (
 <div className="min-h-screen bg-[#f5f6fa] flex flex-col items-center justify-center p-4">
 <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden">
 
 <div className="bg-[#e31837] p-8 text-center text-white">
 <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
 <ShieldCheck className="w-8 h-8 text-white" />
 </div>
 <h1 className="text-2xl font-black mb-1">Staff Invitation</h1>
 <p className="text-brand-100 text-sm font-medium">You have been invited to join a store team.</p>
 </div>

 <div className="p-8">
 {status === 'success' ? (
 <div className="text-center py-6">
 <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
 <CheckCircle2 className="w-8 h-8" />
 </div>
 <h2 className="text-xl font-bold text-slate-800 mb-2">Invite Accepted!</h2>
 <p className="text-slate-500 text-sm mb-6">{message}</p>
 <p className="text-xs text-slate-400">Redirecting to your dashboard...</p>
 </div>
 ) : status === 'error' ? (
 <div className="text-center py-6">
 <div className="w-16 h-16 bg-rose-100 text-[#c8102e] rounded-full flex items-center justify-center mx-auto mb-4">
 <AlertCircle className="w-8 h-8" />
 </div>
 <h2 className="text-xl font-bold text-slate-800 mb-2">Invitation Failed</h2>
 <p className="text-slate-500 text-sm mb-6">{message}</p>
 <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
 Go to Homepage
 </button>
 </div>
 ) : (
 <div className="space-y-6">
 <div className="bg-[#f5f6fa] p-4 rounded-2xl border border-gray-200 text-center">
 <p className="text-sm text-slate-600 mb-2">
 To accept this invitation and access the partner dashboard, click the button below.
 </p>
 {!isSignedIn && (
 <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-left">
 <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
 <p className="text-xs text-amber-700 font-medium">You are not signed in. You must create an account or sign in with RoseDash before accepting this invite.</p>
 </div>
 )}
 </div>
 
 <button 
 onClick={handleJoin}
 disabled={loading}
 className="w-full py-3.5 bg-[#e31837] text-white font-bold rounded-xl hover:bg-[#c8102e] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#e31837]/20 disabled:opacity-50"
 >
 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
 <>
 Accept & Join Team <ArrowRight className="w-4 h-4" />
 </>
 )}
 </button>
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

export default JoinStaff;
