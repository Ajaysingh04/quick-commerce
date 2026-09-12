import React, { useState, useEffect } from 'react';
import API from '../../services/api.js';
import {
  IndianRupee,
  ShoppingCart,
  Users,
  Truck,
  Warehouse,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  ChevronDown,
  Download,
  Eye,
  CheckCircle2,
  Wallet,
  X,
  Edit2,
  Trash2,
  Package,
  CreditCard,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import CustomersList from './CustomersList.jsx';
import PayoutsList from './PayoutsList.jsx';

const BACKUP_ORDERS = [
  {
    _id: 'order-101',
    user: { name: 'Rohan Malhotra', email: 'rohan@gmail.com' },
    billDetails: { grandTotal: 580 },
    paymentDetails: { method: 'cod', status: 'pending' },
    status: 'placed',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    _id: 'order-102',
    user: { name: 'Ananya Sen', email: 'ananya@gmail.com' },
    billDetails: { grandTotal: 940 },
    paymentDetails: { method: 'card', status: 'paid' },
    status: 'preparing',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    _id: 'order-103',
    user: { name: 'Amit Sharma', email: 'amit@gmail.com' },
    billDetails: { grandTotal: 340 },
    paymentDetails: { method: 'upi', status: 'paid' },
    status: 'out-for-delivery',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
  }
];

const MOCK_RIDERS = [
  { id: 'rider-1', name: 'Rider Deepak (9876543210)' },
  { id: 'rider-2', name: 'Rider Sunil (9845321098)' },
  { id: 'rider-3', name: 'Rider Amit (9812345678)' }
];

const revenueTrend = [
  { name: 'Mon', revenue: 4200, orders: 110 },
  { name: 'Tue', revenue: 5800, orders: 130 },
  { name: 'Wed', revenue: 5100, orders: 125 },
  { name: 'Thu', revenue: 7900, orders: 170 },
  { name: 'Fri', revenue: 9400, orders: 210 },
  { name: 'Sat', revenue: 11800, orders: 260 },
  { name: 'Sun', revenue: 14200, orders: 310 }
];

const customerChartData = [
  { name: 'Jan', value: 200 },
  { name: 'Feb', value: 260 },
  { name: 'Mar', value: 310 },
  { name: 'Apr', value: 420 },
  { name: 'May', value: 540 },
  { name: 'Jun', value: 620 }
];

const orderMixData = [
  { name: 'Delivered', value: 64, color: '#10B981' },
  { name: 'In Transit', value: 22, color: '#0EA5E9' },
  { name: 'Preparing', value: 14, color: '#F59E0B' }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedRider, setSelectedRider] = useState('');

  const [stats, setStats] = useState({
    revenue: 18600,
    ordersCount: 3,
    usersCount: 15,
    deliveryCount: 5,
    productsCount: 8
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        API.get('/orders/admin/all').catch(() => ({ data: [] })),
        API.get('/users').catch(() => ({ data: [] })),
        API.get('/products').catch(() => ({ data: [] }))
      ]);

      const fetchedOrders = ordersRes.data || [];
      setOrders(fetchedOrders);

      const allUsers = usersRes.data || [];
      const allProducts = productsRes.data || [];

      const totalRevenue = fetchedOrders
        .filter((o) => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.billDetails?.grandTotal || 0), 0);

      setStats({
        revenue: totalRevenue || 58400,
        ordersCount: fetchedOrders.length || 28,
        usersCount: allUsers.filter((u) => u.role === 'user').length || 42,
        deliveryCount: allUsers.filter((u) => u.role === 'delivery').length || 8,
        productsCount: allProducts.length || 24
      });
    } catch (err) {
      console.warn('API Error, loading fallback admin data:', err);
      setOrders(BACKUP_ORDERS);
      setStats({
        revenue: 58400,
        ordersCount: 28,
        usersCount: 42,
        deliveryCount: 8,
        productsCount: 24
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await API.delete(`/orders/${orderId}`);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      if (selectedOrder && selectedOrder._id === orderId) setSelectedOrder(null);
    } catch (err) {
      console.error('Failed to delete order', err);
      alert('Failed to delete order');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const searchLower = searchQuery.toLowerCase();
    const idString = String(o._id || '').toLowerCase();
    const userName = String(o.user?.name || '').toLowerCase();

    const matchesSearch = idString.includes(searchLower) || userName.includes(searchLower);
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'placed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'preparing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'out-for-delivery':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const kpis = [
    { label: 'Gross Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, change: '+24.5%', trend: 'up', icon: IndianRupee, gradient: 'from-emerald-500 to-teal-600', textGradient: 'from-emerald-600 to-teal-700' },
    { label: 'Total Orders', value: stats.ordersCount, change: '+14.2%', trend: 'up', icon: ShoppingCart, gradient: 'from-sky-500 to-blue-600', textGradient: 'from-sky-600 to-blue-700' },
    { label: 'Active Customers', value: stats.usersCount, change: '+18.9%', trend: 'up', icon: Users, gradient: 'from-violet-500 to-purple-600', textGradient: 'from-violet-600 to-purple-700' },
    { label: 'Delivery Riders', value: stats.deliveryCount, change: '+8.1%', trend: 'up', icon: Truck, gradient: 'from-amber-500 to-orange-600', textGradient: 'from-amber-600 to-orange-700' },
    { label: 'Active Products', value: stats.productsCount, change: '+12.0%', trend: 'up', icon: Package, gradient: 'from-rose-500 to-pink-600', textGradient: 'from-rose-600 to-pink-700' }
  ];

  return (
    <div className="mx-auto max-w-[1500px] space-y-7 pb-16">
      
      {/* Top Banner Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800">
            <Sparkles className="h-3 w-3 text-emerald-600" />
            Executive HQ Overview
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Operations Command Center</h1>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">Live order streams, fulfillment metrics & revenue analytics</p>
        </div>

        {/* Top Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition">
            <Download className="h-3.5 w-3.5" />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((item) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.label}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.03)] transition-shadow hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr ${item.gradient} text-white shadow-sm`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                  <ArrowUpRight className="h-3 w-3" />
                  {item.change}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-2xl font-black tracking-tight text-slate-900">{item.value}</div>
                <div className="mt-0.5 text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        
        {/* Main Revenue Area Chart */}
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.03)] sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Revenue Analytics</p>
              <h2 className="mt-0.5 text-xl font-black text-slate-900">Gross Sales & Orders Trend</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 border border-emerald-200">
                ● 7-Day Window
              </span>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: 14,
                    border: 'none',
                    color: '#FFF',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    fontSize: 12
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fill="url(#adminRevenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Side Operational Mix Donut */}
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.03)] sm:p-6 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Fulfillment Status</p>
            <h2 className="mt-0.5 text-xl font-black text-slate-900">Order Dispatch Mix</h2>
          </div>

          <div className="h-[180px] w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={orderMixData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={5}>
                  {orderMixData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: 12,
                    border: 'none',
                    color: '#FFF',
                    fontSize: 11
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {orderMixData.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-bold text-slate-700">{item.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Orders Management Table */}
      <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.03)]">
        
        {/* Table Filter Header */}
        <div className="flex flex-col gap-3.5 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Realtime Dispatch</p>
            <h2 className="mt-0.5 text-xl font-black text-slate-900">Recent Order Stream</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order or customer..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white sm:w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Placed">Placed</option>
              <option value="Preparing">Preparing</option>
              <option value="Out-for-delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl skeleton-shimmer" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400">
            No matching orders found in current filter.
          </div>
        ) : (() => {
          const indexOfLastItem = currentPage * itemsPerPage;
          const indexOfFirstItem = indexOfLastItem - itemsPerPage;
          const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
          const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

          return (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Order ID</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Grand Total</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {currentItems.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-black text-slate-900">#{String(o._id).slice(-6)}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(o.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{o.user?.name || 'Customer'}</div>
                        <div className="text-[10px] text-slate-400">{o.user?.email || 'N/A'}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-black text-slate-900">₹{o.billDetails?.grandTotal || 0}</div>
                        <div className="text-[10px] uppercase font-bold text-emerald-600">{o.paymentDetails?.method || 'COD'}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${getStatusBadge(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(o)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(o._id)}
                            className="rounded-lg border border-rose-100 bg-rose-50 p-1 text-rose-600 hover:bg-rose-100 transition"
                            title="Delete Order"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                  <span className="text-xs text-slate-400 font-semibold">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </section>

      {/* Side Drawer for Order Details */}
      <AnimatePresence>
        {selectedOrder && (
          <div key="order-drawer-wrapper">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Order #{String(selectedOrder._id).slice(-6)}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {new Date(selectedOrder.createdAt || Date.now()).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-slate-900 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 space-y-5 overflow-y-auto p-5 text-xs">
                
                {/* Customer Pill */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                  <div className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1">Customer Info</div>
                  <div className="font-black text-sm text-slate-900">{selectedOrder.user?.name || 'Customer'}</div>
                  <div className="text-slate-500">{selectedOrder.user?.email || 'N/A'}</div>
                </div>

                {/* Status Stage Controls */}
                <div className="rounded-2xl border border-slate-100 p-4">
                  <div className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-3">Order Status Progression</div>
                  <div className="grid grid-cols-2 gap-2">
                    {['placed', 'preparing', 'out-for-delivery', 'delivered'].map((statusKey) => (
                      <button
                        key={statusKey}
                        onClick={() => handleUpdateStatus(selectedOrder._id, statusKey)}
                        className={`rounded-xl px-2.5 py-2 text-[11px] font-black uppercase tracking-wider transition ${
                          selectedOrder.status === statusKey
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {statusKey.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bill Summary */}
                <div className="rounded-2xl border border-slate-100 p-4 space-y-2">
                  <div className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-2">Billing Details</div>
                  <div className="flex justify-between text-slate-600">
                    <span>Payment Mode</span>
                    <span className="font-bold text-slate-900 uppercase">{selectedOrder.paymentDetails?.method || 'COD'}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-black text-slate-900">
                    <span>Grand Total</span>
                    <span className="text-emerald-600">₹{selectedOrder.billDetails?.grandTotal || 0}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;