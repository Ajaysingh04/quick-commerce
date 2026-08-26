import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, History, TrendingUp, TrendingDown, Calendar, Wallet, X, Building2, Target, CheckCircle2 } from 'lucide-react';
import API from '../../services/api';

const EarningsChart = () => {
 const data = [
 { day: 'Mon', amount: 320, date: 'Jul 22' },
 { day: 'Tue', amount: 480, date: 'Jul 23' },
 { day: 'Wed', amount: 210, date: 'Jul 24' },
 { day: 'Thu', amount: 640, date: 'Jul 25' },
 { day: 'Fri', amount: 550, date: 'Jul 26' },
 { day: 'Sat', amount: 820, date: 'Jul 27' },
 { day: 'Sun', amount: 980, date: 'Jul 28' }
 ];

 const maxAmt = 1000;

 return (
 <div className="p-8 bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-[2.5rem] space-y-6">
 <div className="flex justify-between items-center">
 <div>
 <h3 className="text-lg font-bold text-slate-900">Weekly Performance</h3>
 <p className="text-sm text-slate-600">Your earnings over the last 7 days</p>
 </div>
 <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 text-sm font-bold">
 <TrendingUp size={16} />
 <span>+14.5% vs Last Week</span>
 </div>
 </div>

 <div className="h-64 flex items-end justify-between gap-4 pt-6 mt-4 border-t border-gray-200/50">
 {data.map((d, index) => {
 const heightPercent = (d.amount / maxAmt) * 100;
 const isToday = index === 6;

 return (
 <div key={d.day} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
 <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -translate-y-12 bg-slate-50 border border-gray-200 text-sm font-bold px-3 py-1.5 rounded-lg text-slate-900 z-10 shadow-xl">
 ₹{d.amount}
 </div>
 <div
 style={{ height: `${Math.max(heightPercent, 5)}%` }}
 className={`w-full max-w-[40px] rounded-t-xl transition-all duration-700 relative ${isToday
 ? 'bg-gradient-to-t from-[#c8102e] to-[#e31837] shadow-[0_0_15px_rgba(249,115,22,0.3)]'
 : 'bg-gradient-to-t from-slate-700 to-slate-600 group-hover:from-[#e31837] group-hover:to-orange-400'
 }`}
 >
 {isToday && <div className="absolute top-0 inset-x-0 h-1 bg-white/30 rounded-t-xl" />}
 </div>
 <div className="text-center">
 <div className={`text-sm font-bold ${isToday ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-200'}`}>
 {d.day}
 </div>
 <div className="text-[10px] text-slate-500 hidden sm:block">{d.date}</div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
};

const Earnings = () => {
 const { user } = useSelector(state => state.auth);

 const [loading, setLoading] = useState(true);
 const [withdrawing, setWithdrawing] = useState(false);
 const [showWithdrawModal, setShowWithdrawModal] = useState(false);
 
 const [balance, setBalance] = useState(0);
 const [totalEarnings, setTotalEarnings] = useState(0);
 const [totalDeliveries, setTotalDeliveries] = useState(0);
 const [transactions, setTransactions] = useState([]);
 
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 5;
 
 // Daily Goal State
 const [dailyGoal, setDailyGoal] = useState(1000);
 const [showGoalModal, setShowGoalModal] = useState(false);
 const [tempGoal, setTempGoal] = useState(1000);
 
 // Mock today's earnings (could be fetched)
 const todayEarnings = 480; 
 const goalProgress = Math.min((todayEarnings / dailyGoal) * 100, 100);
 
 const fetchEarnings = async () => {
 try {
 const res = await API.get('/withdrawals/my-earnings');
 setBalance(res.data.availableBalance);
 setTotalEarnings(res.data.totalEarnings);
 setTotalDeliveries(res.data.totalDeliveries);
 setTransactions(res.data.transactions);
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchEarnings();
 }, []);

 const [bankDetails, setBankDetails] = useState({
 bankName: user?.bankDetails?.bankName || '',
 accountHolderName: user?.bankDetails?.accountHolderName || '',
 accountNumber: user?.bankDetails?.accountNumber || '',
 ifscCode: user?.bankDetails?.ifscCode || '',
 amount: ''
 });

 const handleWithdraw = async (e) => {
 e.preventDefault();
 setWithdrawing(true);
 try {
 await API.post('/withdrawals', bankDetails);
 // setBalance(prev => prev - Number(bankDetails.amount)); // Will be handled by re-fetching
 fetchEarnings();
 setShowWithdrawModal(false);
 setBankDetails({ bankName: '', accountHolderName: '', accountNumber: '', ifscCode: '', amount: '' });
 alert('Withdrawal request initiated successfully!');
 } catch (err) {
 console.error(err);
 alert('Failed to request withdrawal. Please try again.');
 } finally {
 setWithdrawing(false);
 }
 };

 return (
 <>
 <div className="max-w-5xl mx-auto space-y-6 pb-12">
 <div className="mb-8">
 <h1 className="text-2xl font-bold text-slate-900 mb-2">Earnings & Wallet</h1>
 <p className="text-slate-600">Track your payouts, view history, and manage your balance.</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {/* Wallet Balance Card */}
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="col-span-1 md:col-span-1 p-8 bg-gradient-to-br from-[#c8102e] to-[#e31837] rounded-[2.5rem] text-white shadow-[0_10px_40px_rgba(227,24,55,0.3)] relative overflow-hidden flex flex-col justify-between min-h-[250px]"
 >
 <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
 <div className="absolute left-0 bottom-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

 <div>
 <div className="flex items-center gap-2 text-white/80 mb-2 font-bold">
 <Wallet size={20} />
 <h3 className="text-sm uppercase tracking-wider">Available Balance</h3>
 </div>
 <div className="text-5xl font-black mb-1">₹{balance}</div>
 <p className="text-white/60 text-sm font-medium">Last payout: ₹2,450 on Jul 20</p>
 </div>

 <button
 onClick={() => setShowWithdrawModal(true)}
 disabled={balance === 0}
 className="w-full py-4 bg-white text-[#c8102e] font-black rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 active:scale-95"
 >
 Withdraw to Bank
 </button>
 </motion.div>

 {/* Detailed Breakdown */}
 <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-6">
 <div className="bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-[2rem] p-6 flex flex-col justify-center hover:-translate-y-1 transition-transform">
 <h4 className="text-slate-500 text-sm mb-2 font-bold uppercase tracking-wider">Total Deliveries</h4>
 <div className="text-4xl font-black text-slate-900 mb-1">{totalDeliveries}</div>
 <div className="flex items-center text-emerald-500 text-sm font-bold gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 w-fit">
 Lifetime
 </div>
 </div>

 <div className="bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-[2rem] p-6 flex flex-col justify-center hover:-translate-y-1 transition-transform">
 <h4 className="text-slate-500 text-sm mb-2 font-bold uppercase tracking-wider">Total Earnings</h4>
 <div className="text-4xl font-black text-slate-900 mb-1">₹{totalEarnings}</div>
 <div className="text-slate-500 text-sm font-bold bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 w-fit">Lifetime</div>
 </div>

 <div className="bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-[2rem] p-6 flex flex-col justify-center hover:-translate-y-1 transition-transform">
 <h4 className="text-slate-500 text-sm mb-2 font-bold uppercase tracking-wider">Total Tips</h4>
 <div className="text-4xl font-black text-slate-900 mb-1">₹450</div>
 <div className="flex items-center text-emerald-500 text-sm font-bold gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 w-fit">
 <TrendingUp size={16} /> +12% from last week
 </div>
 </div>

 <div className="bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-[2rem] p-6 flex flex-col justify-center hover:-translate-y-1 transition-transform">
 <h4 className="text-slate-500 text-sm mb-2 font-bold uppercase tracking-wider">Success Rate</h4>
 <div className="text-4xl font-black text-slate-900 mb-1">99.2%</div>
 <div className="flex items-center text-rose-500 text-sm font-bold gap-1 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100 w-fit">
 <TrendingDown size={16} /> -0.1% from last week
 </div>
 </div>
 </div>
 </div>

 {/* Daily Goal Tracker */}
 <div className="bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-8 overflow-hidden relative group">
 <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-[#c8102e]/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
 <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
 <div className="flex items-center gap-6 w-full md:w-auto">
 <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100 shrink-0">
 <Target size={32} className="text-[#c8102e]" />
 </div>
 <div>
 <h3 className="text-xl font-black text-slate-900 mb-1">Daily Earnings Goal</h3>
 <p className="text-sm font-medium text-slate-500">
 You've earned <span className="font-bold text-slate-900">₹{todayEarnings}</span> so far today.
 </p>
 </div>
 </div>
 
 <div className="w-full md:w-1/3 flex flex-col gap-2">
 <div className="flex justify-between items-end text-sm font-bold">
 <span className="text-slate-900">₹{todayEarnings}</span>
 <button onClick={() => { setTempGoal(dailyGoal); setShowGoalModal(true); }} className="text-[#c8102e] text-xs hover:underline bg-[#e31837]/10 px-2 py-1 rounded-md">
 Goal: ₹{dailyGoal}
 </button>
 </div>
 <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
 <motion.div 
 initial={{ width: 0 }}
 animate={{ width: `${goalProgress}%` }}
 transition={{ duration: 1, type: 'spring' }}
 className={`h-full rounded-full relative ${goalProgress >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#c8102e] to-[#e31837]'}`}
 >
 <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
 </motion.div>
 </div>
 {goalProgress >= 100 && (
 <p className="text-xs text-emerald-500 font-bold flex items-center gap-1 mt-1">
 <CheckCircle2 size={14} /> Goal Achieved!
 </p>
 )}
 </div>
 </div>
 </div>

 <EarningsChart />

 {/* Transaction History */}
 <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6">
 <div className="flex justify-between items-center mb-6">
 <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
 <History size={20} className="text-[#e31837]" /> Recent Transactions
 </h3>
 {transactions.length > 0 && (
 <div className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
 Page {currentPage} of {Math.max(1, Math.ceil(transactions.length / itemsPerPage))}
 </div>
 )}
 </div>

 <div className="space-y-4">
 {transactions.length === 0 ? (
 <div className="text-center py-8 text-slate-500">No transactions yet</div>
 ) : transactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(h => (
 <div key={h.id} className="flex justify-between items-center p-4 bg-slate-50 hover:bg-white border border-gray-200/80 rounded-xl transition-colors border border-gray-200/50">
 <div className="flex items-center gap-4">
 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${h.isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
 {h.isCredit ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
 </div>
 <div>
 <p className="font-bold text-slate-900">{h.type}</p>
 <p className="text-sm text-slate-600">{h.res} • {new Date(h.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
 </div>
 </div>
 <div className="text-right">
 <div className={`font-bold text-lg ${h.isCredit ? 'text-emerald-400' : 'text-slate-900'}`}>
 {h.isCredit ? '+' : ''}{h.amt < 0 ? `-₹${Math.abs(h.amt)}` : `₹${h.amt}`}
 </div>
 <div className="text-xs text-slate-500 font-mono">ID: {h.id.slice(-6).toUpperCase()}</div>
 </div>
 </div>
 ))}
 </div>

 {/* Pagination Controls */}
 {transactions.length > itemsPerPage && (
 <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-gray-100">
 <button 
 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
 disabled={currentPage === 1}
 className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-100 disabled:opacity-50 transition-colors"
 >
 Previous
 </button>
 <button 
 onClick={() => setCurrentPage(p => Math.min(Math.ceil(transactions.length / itemsPerPage), p + 1))}
 disabled={currentPage === Math.ceil(transactions.length / itemsPerPage)}
 className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-100 disabled:opacity-50 transition-colors"
 >
 Next Page
 </button>
 </div>
 )}
 </div>
 </div>

 {/* Withdraw Modal */}
 <AnimatePresence>
 {showWithdrawModal && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <motion.div
 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
 onClick={() => setShowWithdrawModal(false)}
 />
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col max-h-[85vh] z-10"
 >
 <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0 rounded-t-3xl">
 <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
 <Building2 className="text-[#e31837] w-5 h-5" /> Bank Withdrawal
 </h2>
 <button onClick={() => setShowWithdrawModal(false)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors shrink-0">
 <X className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleWithdraw} className="flex flex-col flex-1 min-h-0">
 <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
 <div className="mb-1 bg-[#e31837]/10 border border-[#e31837]/20 p-3 rounded-xl text-center">
 <p className="text-slate-600 text-xs mb-0.5">Available Balance</p>
 <p className="text-2xl font-black text-slate-900">₹{balance}</p>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-600 mb-1">Withdrawal Amount (₹)</label>
 <input type="number" required max={balance} value={bankDetails.amount} onChange={e => setBankDetails({ ...bankDetails, amount: e.target.value })} className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-[#e31837]/20 focus:border-[#e31837] outline-none transition-all" placeholder="Enter amount" />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-600 mb-1">Bank Name</label>
 <input type="text" required readOnly={!!user?.bankDetails?.bankName} value={bankDetails.bankName} onChange={e => setBankDetails({ ...bankDetails, bankName: e.target.value })} className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-[#e31837]/20 focus:border-[#e31837] outline-none transition-all read-only:opacity-60" placeholder="e.g. HDFC Bank" />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-600 mb-1">Account Holder Name</label>
 <input type="text" required readOnly={!!user?.bankDetails?.accountHolderName} value={bankDetails.accountHolderName} onChange={e => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })} className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-[#e31837]/20 focus:border-[#e31837] outline-none transition-all read-only:opacity-60" placeholder="As per bank records" />
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-600 mb-1">Account Number</label>
 <input type="text" required readOnly={!!user?.bankDetails?.accountNumber} value={bankDetails.accountNumber} onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })} className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-[#e31837]/20 focus:border-[#e31837] outline-none transition-all read-only:opacity-60" placeholder="Account No." />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-600 mb-1">IFSC Code</label>
 <input type="text" required readOnly={!!user?.bankDetails?.ifscCode} value={bankDetails.ifscCode} onChange={e => setBankDetails({ ...bankDetails, ifscCode: e.target.value })} className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-[#e31837]/20 focus:border-[#e31837] outline-none transition-all uppercase read-only:opacity-60" placeholder="IFSC" />
 </div>
 </div>
 </div>

 <div className="p-4 bg-white border-t border-gray-100 shrink-0 rounded-b-3xl">
 <button type="submit" disabled={withdrawing} className="w-full py-3 bg-[#e31837] hover:bg-[#c8102e] text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_5px_15px_rgba(227,24,55,0.3)]">
 {withdrawing ? 'Processing...' : 'Submit Request'}
 </button>
 </div>
 </form>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* Set Goal Modal */}
 <AnimatePresence>
 {showGoalModal && (
 <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowGoalModal(false)} />
 <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden z-10 p-6 text-center">
 <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
 <Target size={32} className="text-[#c8102e]" />
 </div>
 <h2 className="text-xl font-black text-slate-900 mb-2">Set Daily Goal</h2>
 <p className="text-sm text-slate-500 mb-6 font-medium">Set a realistic target for your daily earnings.</p>
 
 <div className="flex items-center justify-center gap-4 mb-8">
 <button onClick={() => setTempGoal(Math.max(500, tempGoal - 100))} className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-black text-xl transition-colors">-</button>
 <div className="text-4xl font-black text-slate-900 tracking-tight w-32">₹{tempGoal}</div>
 <button onClick={() => setTempGoal(tempGoal + 100)} className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-black text-xl transition-colors">+</button>
 </div>

 <div className="flex gap-3">
 <button onClick={() => setShowGoalModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
 <button onClick={() => { setDailyGoal(tempGoal); setShowGoalModal(false); }} className="flex-1 py-3 bg-[#e31837] text-white font-bold rounded-xl hover:bg-[#c8102e] transition-colors shadow-lg shadow-[#e31837]/30">Set Goal</button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </>
 );
};

export default Earnings;
