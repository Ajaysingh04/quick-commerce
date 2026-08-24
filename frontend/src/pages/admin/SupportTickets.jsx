import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, Circle, Clock, MessageSquare, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../../services/api.js';

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await API.get('/support');
      setTickets(res.data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'open' ? 'resolved' : 'open';
      const res = await API.put(`/support/${id}/status`, { status: newStatus });
      setTickets(tickets.map(t => t._id === id ? res.data : t));
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Support Tickets</h1>
          <p className="text-sm font-bold text-slate-500">Manage customer inquiries and support requests.</p>
        </div>
        
        <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm min-w-[300px] focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <Search className="w-5 h-5 text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search by name, email, or subject..." 
            className="bg-transparent border-none outline-none text-sm w-full font-bold text-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
          <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-700">No Tickets Found</h3>
          <p className="text-slate-500 font-bold mt-2">There are no support tickets matching your search.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map((ticket, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={ticket._id} 
              className={`bg-white rounded-3xl p-6 border shadow-sm transition-all flex flex-col md:flex-row gap-6 ${ticket.status === 'resolved' ? 'border-slate-100 opacity-70' : 'border-l-4 border-l-emerald-500 border-slate-100 hover:shadow-md'}`}
            >
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 leading-tight">{ticket.subject}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(ticket.createdAt).toLocaleString()}</span>
                      <span className="flex items-center gap-1 text-slate-700"><Mail className="w-3.5 h-3.5 text-emerald-500" /> {ticket.email}</span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">From: {ticket.name}</span>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${ticket.status === 'resolved' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>
                    {ticket.status === 'resolved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5 fill-emerald-500" />}
                    {ticket.status}
                  </span>
                </div>
                
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-sm font-semibold text-slate-700 whitespace-pre-wrap">
                  {ticket.message}
                </div>
              </div>
              
              <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[150px]">
                <button
                  onClick={() => handleStatusUpdate(ticket._id, ticket.status)}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    ticket.status === 'resolved' 
                      ? 'bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95'
                  }`}
                >
                  {ticket.status === 'resolved' ? 'Reopen Ticket' : 'Mark Resolved'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportTickets;
