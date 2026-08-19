import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/cartSlice.js';
import API from '../../services/api.js';

const AIChatbot = () => {
 const [isOpen, setIsOpen] = useState(false);
 const [messages, setMessages] = useState([
 {
 id: 'welcome',
 sender: 'bot',
 text: "Hi! I am **RoseDashBot**, your RoseDash AI Assistant. 🍔\n\nI can help you check your **order status**, recommend **popular dishes**, or find active **coupons**. How can I help you today?",
 time: new Date()
 }
 ]);
 const [input, setInput] = useState('');
 const [loading, setLoading] = useState(false);
 const [isListening, setIsListening] = useState(false);
 const messagesEndRef = useRef(null);

 const dispatch = useDispatch();
 const { items: cartItems, store: cartStore } = useSelector(state => state.cart);

 const handleVoiceInput = () => {
 const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
 if (!SpeechRecognition) {
 alert('Speech recognition is not supported in this browser.');
 return;
 }
 const recognition = new SpeechRecognition();
 recognition.lang = 'en-IN';
 setIsListening(true);
 recognition.start();

 recognition.onresult = (e) => {
 const transcript = e.results[0][0].transcript;
 setInput(transcript);
 setIsListening(false);
 };

 recognition.onerror = () => {
 setIsListening(false);
 };
 };

 const scrollToBottom = () => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 };

 useEffect(() => {
 if (isOpen) {
 scrollToBottom();
 }
 }, [messages, isOpen]);

 const handleSend = async (e) => {
 e.preventDefault();
 if (!input.trim()) return;

 const userMessage = {
 id: Math.random().toString(),
 sender: 'user',
 text: input,
 time: new Date()
 };

 setMessages((prev) => [...prev, userMessage]);
 setInput('');
 setLoading(true);

 try {
 const response = await API.post('/advanced/ai/chatbot', { message: userMessage.text });
 const botMessage = {
 id: Math.random().toString(),
 sender: 'bot',
 text: response.data.reply,
 time: new Date()
 };
 setMessages((prev) => [...prev, botMessage]);

 if (response.data.action === 'ADD_TO_CART' && response.data.payload) {
 const item = response.data.payload;
 const confirmClear = cartItems.length > 0 && cartStore && cartStore.id !== item.resId;
 
 let proceed = true;
 if (confirmClear) {
 proceed = window.confirm(`Your cart already contains items from another kitchen. Clear cart and add this item?`);
 }

 if (proceed) {
 dispatch(addToCart({
 item: {
 id: item.id,
 name: item.name,
 price: item.price,
 image: item.image,
 isVeg: item.isVeg,
 resName: item.resName
 },
 store: {
 id: item.resId,
 name: item.resName
 }
 }));
 }
 }
 } catch (err) {
 console.error('Chat error:', err);
 const errorMessage = {
 id: Math.random().toString(),
 sender: 'bot',
 text: "I am having trouble connecting to my brain right now. Please try again in a few moments! 🧠🔌",
 time: new Date()
 };
 setMessages((prev) => [...prev, errorMessage]);
 } finally {
 setLoading(false);
 }
 };

 const formatMessageText = (text) => {
 // Simple markdown support for **bold**
 const parts = text.split(/(\*\*.*?\*\*)/g);
 return parts.map((part, i) => {
 if (part.startsWith('**') && part.endsWith('**')) {
 return <strong key={i} className="font-extrabold text-brand-500">{part.slice(2, -2)}</strong>;
 }
 return part;
 });
 };

 return (
 <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, y: 30, scale: 0.9 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 30, scale: 0.9 }}
 className="w-80 sm:w-96 h-[500px] rounded-3xl bg-white border border-pink-200 shadow-2xl flex flex-col overflow-hidden mb-4"
 >
 {/* Header */}
 <div className="px-5 py-4 bg-gradient-to-r from-brand-500 to-rose-500 text-white flex items-center justify-between shadow-md">
 <div className="flex items-center gap-2">
 <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
 <Bot className="w-5 h-5 text-white" />
 </div>
 <div>
 <h4 className="font-bold text-sm leading-tight flex items-center gap-1">
 RoseDashBot AI <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
 </h4>
 <span className="text-[10px] text-white/80 font-medium">Online Helper</span>
 </div>
 </div>
 <button 
 onClick={() => setIsOpen(false)}
 className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Chat Messages */}
 <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-pink-50/50 ">
 {messages.map((msg) => (
 <div 
 key={msg.id}
 className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
 >
 {msg.sender === 'bot' && (
 <div className="w-7 h-7 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0 border border-brand-500/10">
 <Bot className="w-4 h-4 text-brand-500" />
 </div>
 )}

 <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
 msg.sender === 'user'
 ? 'bg-slate-900 text-white rounded-tr-none shadow-sm'
 : 'bg-white text-slate-800 rounded-tl-none border border-pink-200 shadow-xs'
 }`}>
 <p className="whitespace-pre-line">{formatMessageText(msg.text)}</p>
 <span className="block text-[8px] text-slate-400 mt-1 text-right">
 {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </span>
 </div>

 {msg.sender === 'user' && (
 <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 border border-slate-300/10">
 <User className="w-4 h-4 text-slate-500" />
 </div>
 )}
 </div>
 ))}

 {loading && (
 <div className="flex gap-2.5 justify-start items-center">
 <div className="w-7 h-7 rounded-full bg-brand-500/10 flex items-center justify-center">
 <Bot className="w-4 h-4 text-brand-500" />
 </div>
 <div className="bg-white border border-pink-200 rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-1.5 shadow-xs">
 <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
 <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
 <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
 </div>
 </div>
 )}
 <div ref={messagesEndRef} />
 </div>

 {/* Input Form */}
 <form onSubmit={handleSend} className="p-3 bg-white border-t border-pink-200 flex items-center gap-2">
 <div className="flex-1 flex items-center bg-pink-50 border border-pink-200 rounded-full px-2 py-1 focus-within:border-brand-500 transition-colors">
 <input
 type="text"
 placeholder="Ask or say 'Order a burger'..."
 value={input}
 onChange={(e) => setInput(e.target.value)}
 className="flex-1 bg-transparent px-2 py-1 text-xs outline-none text-slate-800 "
 />
 <button 
 type="button" 
 onClick={handleVoiceInput}
 className={`p-1.5 rounded-full transition-all shrink-0 hover:bg-slate-200 :bg-slate-800 ${
 isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400'
 }`}
 title="Voice Command"
 >
 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isListening ? "animate-bounce" : ""}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
 </button>
 </div>
 <button
 type="submit"
 disabled={!input.trim() || loading}
 className="p-2.5 rounded-full bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 transition-colors shrink-0 shadow-md hover:shadow-brand-500/10"
 >
 <Send className="w-4 h-4" />
 </button>
 </form>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Bubble button */}
 <motion.button
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 onClick={() => setIsOpen(!isOpen)}
 className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-500 to-rose-500 text-white flex items-center justify-center shadow-xl hover:shadow-brand-500/20 transition-all border border-white/10"
 >
 {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 animate-pulse" />}
 </motion.button>
 </div>
 );
};

export default AIChatbot;
