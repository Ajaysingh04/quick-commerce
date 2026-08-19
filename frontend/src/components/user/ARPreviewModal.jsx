import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RotateCw, ZoomIn, Eye } from 'lucide-react';

const ARPreviewModal = ({ productName, onClose }) => {
 const canvasRef = useRef(null);
 const [zoom, setZoom] = useState(1);
 const [activeCam, setActiveCam] = useState(false);
 const [angle, setAngle] = useState(0);

 useEffect(() => {
 const canvas = canvasRef.current;
 if (!canvas) return;
 const ctx = canvas.getContext('2d');
 let animationFrameId;

 // Render loop
 const render = () => {
 ctx.clearRect(0, 0, canvas.width, canvas.height);
 const cx = canvas.width / 2;
 const cy = canvas.height / 2;
 
 setAngle(prev => (prev + 0.015) % (Math.PI * 2));

 // Draw Grid Guideline
 ctx.strokeStyle = activeCam ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.15)';
 ctx.lineWidth = 1;
 
 // Draw circular guidance rings
 ctx.beginPath();
 ctx.arc(cx, cy, 120, 0, Math.PI * 2);
 ctx.stroke();
 
 ctx.beginPath();
 ctx.arc(cx, cy, 60, 0, Math.PI * 2);
 ctx.stroke();

 // Draw horizontal & vertical crosshairs
 ctx.beginPath();
 ctx.moveTo(cx - 150, cy);
 ctx.lineTo(cx + 150, cy);
 ctx.moveTo(cx, cy - 150);
 ctx.lineTo(cx, cy + 150);
 ctx.stroke();

 // Render 3D Stylized Object Mockup based on product name
 const name = productName.toLowerCase();
 ctx.save();
 ctx.translate(cx, cy);
 ctx.scale(zoom, zoom);
 ctx.rotate(angle);

 if (name.includes('pizza')) {
 // --- DRAW PIZZA MODEL ---
 // Base plate (crust)
 ctx.fillStyle = '#b45309'; // golden crust
 ctx.beginPath();
 ctx.arc(0, 0, 80, 0, Math.PI * 2);
 ctx.fill();

 // Cheese layer
 ctx.fillStyle = '#f59e0b'; // yellow cheese
 ctx.beginPath();
 ctx.arc(0, 0, 72, 0, Math.PI * 2);
 ctx.fill();

 // Pepperoni toppings (3D offset circles)
 ctx.fillStyle = '#dc2626'; // red pepperoni
 const toppings = [
 { x: -30, y: -20 }, { x: 30, y: 20 }, { x: -20, y: 30 },
 { x: 20, y: -30 }, { x: 0, y: 10 }, { x: -10, y: -40 }
 ];
 toppings.forEach(t => {
 ctx.beginPath();
 ctx.arc(t.x, t.y, 10, 0, Math.PI * 2);
 ctx.fill();
 // Topping shine
 ctx.fillStyle = 'rgba(255,255,255,0.4)';
 ctx.beginPath();
 ctx.arc(t.x - 3, t.y - 3, 3, 0, Math.PI * 2);
 ctx.fill();
 ctx.fillStyle = '#dc2626'; // reset
 });

 // Basil leaf toppings
 ctx.fillStyle = '#10b981'; // green basil
 const leaves = [{ x: -35, y: 15 }, { x: 35, y: -15 }, { x: -5, y: 40 }];
 leaves.forEach(l => {
 ctx.beginPath();
 ctx.ellipse(l.x, l.y, 8, 4, Math.PI / 4, 0, Math.PI * 2);
 ctx.fill();
 });

 } else if (name.includes('burger')) {
 // --- DRAW BURGER MODEL ---
 // Bottom bun
 ctx.fillStyle = '#ca8a04';
 ctx.beginPath();
 ctx.ellipse(0, 30, 70, 20, 0, 0, Math.PI * 2);
 ctx.fill();

 // Veggies (green lettuce layers)
 ctx.fillStyle = '#22c55e';
 ctx.beginPath();
 ctx.ellipse(0, 15, 75, 15, 0, 0, Math.PI * 2);
 ctx.fill();

 // Patty
 ctx.fillStyle = '#78350f';
 ctx.beginPath();
 ctx.ellipse(0, 0, 70, 18, 0, 0, Math.PI * 2);
 ctx.fill();

 // Cheese slice corner
 ctx.fillStyle = '#fbbf24';
 ctx.beginPath();
 ctx.moveTo(-60, 0);
 ctx.lineTo(60, 0);
 ctx.lineTo(40, 20);
 ctx.lineTo(-40, 10);
 ctx.closePath();
 ctx.fill();

 // Top Bun
 ctx.fillStyle = '#ca8a04';
 ctx.beginPath();
 ctx.ellipse(0, -20, 68, 25, 0, 0, Math.PI * 2);
 ctx.fill();

 // Top bun dome highlights
 ctx.fillStyle = '#eab308';
 ctx.beginPath();
 ctx.ellipse(0, -28, 55, 12, 0, 0, Math.PI * 2);
 ctx.fill();

 // Sesame seeds
 ctx.fillStyle = '#ffffff';
 const seeds = [
 { x: -20, y: -25 }, { x: 0, y: -30 }, { x: 20, y: -23 },
 { x: -10, y: -18 }, { x: 10, y: -20 }
 ];
 seeds.forEach(s => {
 ctx.beginPath();
 ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
 ctx.fill();
 });

 } else if (name.includes('salad') || name.includes('quinoa')) {
 // --- DRAW SALAD BOWL MODEL ---
 // Outer bowl
 ctx.fillStyle = '#cbd5e1';
 ctx.beginPath();
 ctx.arc(0, 0, 80, 0, Math.PI * 2);
 ctx.fill();
 
 ctx.fillStyle = '#94a3b8';
 ctx.beginPath();
 ctx.arc(0, 0, 76, 0, Math.PI * 2);
 ctx.fill();

 // Greens
 ctx.fillStyle = '#15803d';
 ctx.beginPath();
 ctx.arc(0, 0, 70, 0, Math.PI * 2);
 ctx.fill();

 // Avocado slices
 ctx.fillStyle = '#84cc16';
 const avos = [{ x: -30, y: -20 }, { x: -20, y: -35 }, { x: -10, y: -45 }];
 avos.forEach(a => {
 ctx.beginPath();
 ctx.ellipse(a.x, a.y, 18, 8, Math.PI / 3, 0, Math.PI * 2);
 ctx.fill();
 });

 // Tomatoes
 ctx.fillStyle = '#ef4444';
 const tomatoes = [{ x: 30, y: 20 }, { x: 10, y: 35 }, { x: 35, y: -15 }, { x: -20, y: 15 }];
 tomatoes.forEach(t => {
 ctx.beginPath();
 ctx.arc(t.x, t.y, 8, 0, Math.PI * 2);
 ctx.fill();
 });

 } else {
 // --- DEFAULT DISH PLATTER MODEL ---
 // Plate
 ctx.fillStyle = '#f1f5f9';
 ctx.beginPath();
 ctx.arc(0, 0, 80, 0, Math.PI * 2);
 ctx.fill();
 ctx.strokeStyle = '#cbd5e1';
 ctx.lineWidth = 3;
 ctx.stroke();

 // Product core
 ctx.fillStyle = '#f59e0b';
 ctx.beginPath();
 ctx.arc(0, 0, 50, 0, Math.PI * 2);
 ctx.fill();

 // Sauce lines
 ctx.strokeStyle = '#dc2626';
 ctx.lineWidth = 4;
 ctx.beginPath();
 ctx.arc(0, 0, 30, 0, Math.PI * 1.2);
 ctx.stroke();

 // Garnish herbs
 ctx.fillStyle = '#16a34a';
 ctx.beginPath();
 ctx.arc(10, 10, 5, 0, Math.PI * 2);
 ctx.arc(-15, -10, 4, 0, Math.PI * 2);
 ctx.fill();
 }

 ctx.restore();

 // Floating Hot Steam / Freshness Effect
 ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
 for (let i = 0; i < 3; i++) {
 const sx = cx - 20 + Math.sin(angle * 3 + i) * 15;
 const sy = cy - 40 - (i * 20) - ((angle * 10) % 20);
 ctx.beginPath();
 ctx.arc(sx, sy, 6 + i, 0, Math.PI * 2);
 ctx.fill();
 }

 animationFrameId = requestAnimationFrame(render);
 };

 render();

 return () => {
 cancelAnimationFrame(animationFrameId);
 };
 }, [productName, zoom, activeCam]);

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
 <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-pink-200/50 flex flex-col items-center p-6 gap-6 relative">
 
 {/* Absolute top close */}
 <button 
 onClick={onClose}
 className="absolute top-4 right-4 bg-pink-100 hover:bg-slate-200 :bg-slate-800 text-slate-500 p-2 rounded-full border border-pink-200/10 transition-colors focus:outline-none z-10"
 >
 <X className="w-4 h-4" />
 </button>

 {/* Title */}
 <div className="text-center">
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
 <Camera className="w-3 h-3" /> AR Product Preview
 </span>
 <h3 className="text-lg font-black mt-2 text-slate-800 leading-tight">3D Preview: {productName}</h3>
 <p className="text-[10px] text-slate-400 mt-0.5">Drag/Rotate the object to preview details before ordering.</p>
 </div>

 {/* Interactive 3D Canvas Box */}
 <div className="relative w-full aspect-square max-w-[320px] rounded-2xl bg-pink-100 overflow-hidden border border-pink-200 flex items-center justify-center shadow-inner">
 {activeCam && (
 <div className="absolute inset-0 z-0 bg-slate-200/40 flex items-center justify-center text-xs text-slate-500 font-bold uppercase tracking-widest text-center animate-pulse">
 📹 Camera Feed Active
 </div>
 )}
 <canvas 
 ref={canvasRef} 
 width="320" 
 height="320" 
 className="w-full h-full relative z-5 cursor-grab active:cursor-grabbing" 
 />
 </div>

 {/* Controls segment */}
 <div className="w-full grid grid-cols-3 gap-2 text-center text-xs">
 <button 
 onClick={() => setActiveCam(!activeCam)}
 className={`p-3 rounded-2xl border transition-all font-bold flex flex-col items-center gap-1.5 ${
 activeCam 
 ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
 : 'bg-pink-50 border-pink-200 text-slate-600 hover:border-slate-300'
 }`}
 >
 <Camera className="w-4 h-4" />
 <span>Camera Overlay</span>
 </button>
 
 <button 
 onClick={() => setZoom(z => Math.min(z + 0.1, 1.5))}
 className="p-3 bg-pink-50 border border-pink-200 hover:border-slate-300 text-slate-600 rounded-2xl font-bold flex flex-col items-center gap-1.5"
 >
 <ZoomIn className="w-4 h-4" />
 <span>Zoom In</span>
 </button>

 <button 
 onClick={() => setZoom(1)}
 className="p-3 bg-pink-50 border border-pink-200 hover:border-slate-300 text-slate-600 rounded-2xl font-bold flex flex-col items-center gap-1.5"
 >
 <Eye className="w-4 h-4" />
 <span>Reset View</span>
 </button>
 </div>
 </div>
 </div>
 );
};

export default ARPreviewModal;
