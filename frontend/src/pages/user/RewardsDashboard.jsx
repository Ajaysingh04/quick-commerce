import React, { useState, useEffect } from 'react';
import { Coins, Award, Sparkles, AlertCircle, CheckCircle, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../../services/api.js';

const SECTIONS = [
 { label: '10% OFF', color: '#f43f5e' },
 { label: 'Free Delivery', color: '#10b981' },
 { label: '50 Coins', color: '#f59e0b' },
 { label: '100 Coins', color: '#3b82f6' },
 { label: '15% Cashback', color: '#8b5cf6' }
];

const RewardsDashboard = () => {
 const [loyalty, setLoyalty] = useState({
 coins: 0,
 level: 'Bronze',
 badges: [],
 lastSpin: null
 });
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [successMsg, setSuccessMsg] = useState('');
 
 // Wheel State
 const [isSpinning, setIsSpinning] = useState(false);
 const [spinAngle, setSpinAngle] = useState(0);
 const [wonPrize, setWonPrize] = useState(null);

 useEffect(() => {
 fetchRewards();
 }, []);

 const fetchRewards = async () => {
 setLoading(true);
 setError('');
 try {
 const res = await API.get('/advanced/rewards/info');
 setLoyalty(res.data.loyalty);
 } catch (err) {
 console.warn('Rewards API error, using mockup status:', err);
 // Mock status if backend fails
 setLoyalty({
 coins: 120,
 level: 'Bronze',
 badges: ['First Order', 'Lucky Spinner'],
 lastSpin: null
 });
 } finally {
 setLoading(false);
 }
 };

 const handleSpin = async () => {
 if (isSpinning) return;
 setIsSpinning(true);
 setSuccessMsg('');
 setError('');
 setWonPrize(null);

 try {
 const res = await API.post('/advanced/rewards/spin');
 const prizeLabel = res.data.prize.label;
 const targetIndex = SECTIONS.findIndex(s => s.label === prizeLabel);

 // Spin logic: We spin multiple full rotations plus target angle
 // There are 5 sections, each 72 degrees (360/5)
 // Angle increases clockwise, so to hit index I, we must align it at the top arrow (270 degrees)
 const degreesPerSection = 360 / SECTIONS.length;
 const sectionOffset = degreesPerSection * targetIndex;
 const extraSpin = 360 * 5; // 5 full rotations
 const targetAngle = extraSpin + (360 - sectionOffset);

 setSpinAngle(targetAngle);

 setTimeout(() => {
 setIsSpinning(false);
 setWonPrize(res.data.prize);
 setSuccessMsg(res.data.message);
 setLoyalty(res.data.loyalty);
 }, 5000); // 5s match CSS animation time

 } catch (err) {
 setIsSpinning(false);
 const errMsg = err.response?.data?.message || 'Failed to spin the wheel.';
 setError(errMsg);
 }
 };

 // Mock spin button click when DB call fails due to no auth / mock testing
 const handleMockSpin = () => {
 if (isSpinning) return;
 setIsSpinning(true);
 setSuccessMsg('');
 setError('');
 
 const randomPrizeIndex = Math.floor(Math.random() * SECTIONS.length);
 const prize = SECTIONS[randomPrizeIndex];

 const degreesPerSection = 360 / SECTIONS.length;
 const sectionOffset = degreesPerSection * randomPrizeIndex;
 const targetAngle = (360 * 5) + (360 - sectionOffset);

 setSpinAngle(targetAngle);

 setTimeout(() => {
 setIsSpinning(false);
 setWonPrize(prize);
 setSuccessMsg(`Congratulations! You won: ${prize.label}`);
 setLoyalty(prev => {
 const newCoins = prize.label.includes('Coins') ? prev.coins + parseInt(prize.label) : prev.coins;
 const newBadges = prev.badges.includes('Lucky Spinner') ? prev.badges : [...prev.badges, 'Lucky Spinner'];
 return {
 ...prev,
 coins: newCoins,
 badges: newBadges,
 lastSpin: new Date()
 };
 });
 }, 5000);
 };

 if (loading) {
 return (
 <div className="flex justify-center items-center py-20">
 <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-500"></div>
 </div>
 );
 }

 // Next level progress calculations
 const nextLevel = loyalty.level === 'Bronze' ? 'Silver' : loyalty.level === 'Silver' ? 'Gold' : loyalty.level === 'Gold' ? 'Platinum' : 'Max';
 const targetCoins = loyalty.level === 'Bronze' ? 200 : loyalty.level === 'Silver' ? 500 : loyalty.level === 'Gold' ? 1000 : 1000;
 const progressPercent = Math.min((loyalty.coins / targetCoins) * 100, 100);

 return (
 <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 items-start">
 {/* Rewards Ledger details */}
 <div className="flex-1 flex flex-col gap-6 w-full">
 <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-brand-950 to-slate-950 text-white shadow-xl border border-white/5 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl"></div>
 
 <div className="flex items-center gap-3">
 <Coins className="w-8 h-8 text-yellow-400 fill-yellow-400" />
 <h2 className="text-2xl font-extrabold">Loyalty Coins</h2>
 </div>
 
 <p className="text-4xl font-black mt-4 text-yellow-400 flex items-baseline gap-1.5">
 {loyalty.coins} <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">Coins Balance</span>
 </p>

 <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-xs">
 <div>
 <span className="text-slate-400 block mb-1">Your Club Status</span>
 <span className="font-extrabold uppercase px-2.5 py-1 bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-full tracking-wider">
 {loyalty.level} Member
 </span>
 </div>
 {nextLevel !== 'Max' && (
 <div className="text-right">
 <span className="text-slate-400 block mb-1">Next Club Level</span>
 <span className="font-bold text-slate-300">{nextLevel} (Needs {targetCoins} Coins)</span>
 </div>
 )}
 </div>

 {nextLevel !== 'Max' && (
 <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
 <div className="bg-yellow-400 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
 </div>
 )}
 </div>

 {/* Badges Collection */}
 <div className="p-6 bg-white rounded-3xl shadow-sm border border-pink-200 ">
 <h3 className="text-lg font-black mb-4 flex items-center gap-2">
 <Award className="w-5 h-5 text-brand-500" />
 Badges Collection ({loyalty.badges.length})
 </h3>

 {loyalty.badges.length === 0 ? (
 <p className="text-slate-400 text-xs py-4 text-center">No badges unlocked yet. Start ordering, spinning, or reviewing to win badges!</p>
 ) : (
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
 {loyalty.badges.map(badge => (
 <div key={badge} className="p-3.5 bg-pink-50 border border-pink-200 rounded-2xl flex flex-col items-center gap-2 text-center">
 <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-lg shadow-inner">
 🏅
 </div>
 <span className="text-xs font-bold text-slate-700 leading-tight">
 {badge}
 </span>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Daily Spin & Win Game Wheel */}
 <div className="flex-1 w-full flex flex-col items-center gap-6 p-6 bg-white border border-pink-200 rounded-3xl shadow-premium">
 <div className="text-center">
 <h3 className="text-xl font-extrabold flex items-center justify-center gap-2">
 Spin & Win Wheel <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-pulse" />
 </h3>
 <p className="text-xs text-slate-400 mt-1">Spin once daily for free delivery, discount coupons, or extra loyalty coins!</p>
 </div>

 {/* Wheel SVG Graphics Container */}
 <div className="relative w-72 h-72 my-4">
 {/* Top Arrow Pointer */}
 <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-900 clip-arrow z-10 shadow-md"></div>
 
 <div 
 className="w-full h-full rounded-full border-8 border-slate-800 shadow-xl overflow-hidden relative"
 style={{ 
 transform: `rotate(${spinAngle}deg)`,
 transition: isSpinning ? 'transform 5s cubic-bezier(0.1, 0.8, 0.1, 1)' : 'none',
 transformOrigin: 'center'
 }}
 >
 {/* Draw 5 Slices of the Wheel */}
 <svg viewBox="0 0 100 100" className="w-full h-full">
 {SECTIONS.map((sec, idx) => {
 const angle = 360 / SECTIONS.length;
 const startAngle = idx * angle;
 const endAngle = (idx + 1) * angle;

 // SVG Path calculations for arc slice
 const radStart = (Math.PI / 180) * (startAngle - 90);
 const radEnd = (Math.PI / 180) * (endAngle - 90);

 const x1 = 50 + 50 * Math.cos(radStart);
 const y1 = 50 + 50 * Math.sin(radStart);
 const x2 = 50 + 50 * Math.cos(radEnd);
 const y2 = 50 + 50 * Math.sin(radEnd);

 // Label Position
 const textAngle = startAngle + (angle / 2) - 90;
 const radText = (Math.PI / 180) * textAngle;
 const tx = 50 + 30 * Math.cos(radText);
 const ty = 50 + 30 * Math.sin(radText);

 return (
 <g key={idx}>
 <path 
 d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`} 
 fill={sec.color} 
 stroke="#1e293b" 
 strokeWidth="0.5" 
 />
 <text 
 x={tx} 
 y={ty} 
 fill="white" 
 fontSize="3.2" 
 fontWeight="black" 
 textAnchor="middle"
 transform={`rotate(${textAngle + 90}, ${tx}, ${ty})`}
 >
 {sec.label}
 </text>
 </g>
 );
 })}
 <circle cx="50" cy="50" r="10" fill="#1e293b" stroke="white" strokeWidth="1.5" />
 </svg>
 </div>
 </div>

 {/* Spin action buttons */}
 <div className="w-full space-y-4">
 <button 
 onClick={error.includes('already') ? handleMockSpin : handleSpin}
 disabled={isSpinning}
 className="w-full py-3.5 rounded-full bg-gradient-to-tr from-brand-500 to-rose-500 text-white font-extrabold text-center shadow-lg hover:shadow-brand-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
 >
 <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
 <span>{isSpinning ? 'Spinning...' : 'SPIN THE WHEEL'}</span>
 </button>

 {/* Feedback alerts */}
 {error && (
 <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-600 ">
 <AlertCircle className="w-4 h-4 shrink-0" />
 <span>{error}</span>
 </div>
 )}

 {successMsg && (
 <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-600 ">
 <CheckCircle className="w-4 h-4 shrink-0" />
 <span>{successMsg}</span>
 </div>
 )}
 </div>
 </div>

 <style>{`
 .clip-arrow {
 clip-path: polygon(50% 100%, 0 0, 100% 0);
 }
 `}</style>
 </div>
 );
};

export default RewardsDashboard;
