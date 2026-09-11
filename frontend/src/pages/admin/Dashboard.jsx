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
  CreditCard
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
  { name: 'Mon', revenue: 2400, orders: 110 },
  { name: 'Tue', revenue: 2800, orders: 130 },
  { name: 'Wed', revenue: 2600, orders: 125 },
  { name: 'Thu', revenue: 3900, orders: 170 },
  { name: 'Fri', revenue: 5200, orders: 210 },
  { name: 'Sat', revenue: 4800, orders: 190 },
  { name: 'Sun', revenue: 6100, orders: 240 }
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
  { name: 'Delivered', value: 58, color: '#22C55E' },
  { name: 'Pending', value: 24, color: '#F59E0B' },
  { name: 'Cancelled', value: 18, color: '#EF4444' }
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
        revenue: totalRevenue || 18600,
        ordersCount: fetchedOrders.length || 3,
        usersCount: allUsers.filter((u) => u.role === 'user').length || 15,
        deliveryCount: allUsers.filter((u) => u.role === 'delivery').length || 5,
        productsCount: allProducts.length || 8
      });
    } catch (err) {
      console.warn('API Error, loading fallback admin data:', err);
      setOrders(BACKUP_ORDERS);
      setStats({
        revenue: 18600,
        ordersCount: 3,
        usersCount: 15,
        deliveryCount: 5,
        productsCount: 8
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await API.delete(`/orders/${orderId}`);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (err) {
      console.error('Failed to delete order', err);
      alert('Failed to delete order');
    }
  };

  const handleAssignRider = async () => {
    if (!selectedRider || !selectedOrder) return;
    const rider = MOCK_RIDERS.find((r) => r.id === selectedRider);

    try {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === selectedOrder._id ? { ...o, status: 'out-for-delivery', riderName: rider.name } : o
        )
      );
      setSelectedOrder(null);
    } catch (err) {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === selectedOrder._id ? { ...o, status: 'out-for-delivery', riderName: rider.name } : o
        )
      );
      setSelectedOrder(null);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'placed':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'preparing':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'out-for-delivery':
        return 'bg-violet-500/10 text-violet-600 border-violet-500/20';
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  const kpis = [
    { label: 'Gross Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, change: '+18.2%', trend: 'up', icon: IndianRupee, tone: 'emerald' },
    { label: 'Total Orders', value: stats.ordersCount, change: '+12.4%', trend: 'up', icon: ShoppingCart, tone: 'sky' },
    { label: 'Active Customers', value: stats.usersCount, change: '+9.1%', trend: 'up', icon: Users, tone: 'violet' },
    { label: 'Delivery Partners', value: stats.deliveryCount, change: '+3.8%', trend: 'up', icon: Truck, tone: 'amber' },
    { label: 'Warehouse Slots', value: '94%', change: '+6.2%', trend: 'up', icon: Warehouse, tone: 'rose' }
  ];

  const statCards = [
    { label: 'Today Revenue', value: '₹18,420', change: '+12.5%', icon: Wallet, color: 'emerald' },
    { label: 'Pending Deliveries', value: '246', change: '-3.2%', icon: Package, color: 'amber' },
    { label: 'COD Collection', value: '₹9,640', change: '+5.8%', icon: CreditCard, color: 'violet' },
    { label: 'Inventory Alerts', value: '18', change: '-2.1%', icon: CheckCircle2, color: 'rose' }
  ];

  return (
    <div className="mx-auto max-w-[1500px] space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Performance Overview
          </div>
          <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-900 md:text-4xl">Quick Commerce Admin</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300">
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {kpis.map((item) => {
          const Icon = item.icon;
          const toneMap = {
            emerald: 'bg-emerald-100 text-emerald-600',
            sky: 'bg-sky-100 text-sky-600',
            violet: 'bg-violet-100 text-violet-600',
            amber: 'bg-amber-100 text-amber-600',
            rose: 'bg-rose-100 text-rose-600'
          };

          return (
            <motion.div
              key={item.label}
              whileHover={{ y: -3 }}
              className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneMap[item.tone]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
                  {item.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {item.change}
                </div>
              </div>

              <div className="mt-6 space-y-1">
                <div className="text-3xl font-black tracking-[-0.04em] text-slate-900">{item.value}</div>
                <div className="text-sm font-medium text-slate-500">{item.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.7fr_0.9fr]">
        <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Revenue Trend</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">Marketplace performance</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
              This Week
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)'
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#16A34A" strokeWidth={3} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Orders</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">District flow</h2>
              </div>
            </div>

            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrend} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="orders" radius={[8, 8, 0, 0]} fill="#0F172A" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Customers</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">Growth</h2>
            </div>

            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={customerChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="customerFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#334155" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#334155" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #E2E8F0' }} />
                  <Area type="monotone" dataKey="value" stroke="#334155" strokeWidth={3} fill="url(#customerFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon;
          const toneMap = {
            emerald: 'bg-emerald-100 text-emerald-600',
            amber: 'bg-amber-100 text-amber-600',
            violet: 'bg-violet-100 text-violet-600',
            rose: 'bg-rose-100 text-rose-600'
          };

          return (
            <div key={item.label} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneMap[item.color]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
                  {item.change}
                </div>
              </div>

              <div className="mt-6 text-3xl font-black tracking-[-0.04em] text-slate-900">{item.value}</div>
              <div className="mt-2 text-sm font-medium text-slate-500">{item.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.3fr_0.7fr]">
        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Orders</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">Recent activity</h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-400 md:w-52"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-400"
                >
                  <option value="All">All Statuses</option>
                  <option value="Placed">Placed</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Out-for-delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">Loading order activity...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-10 text-center text-slate-500">No orders found matching your filters.</div>
          ) : (() => {
            const indexOfLastItem = currentPage * itemsPerPage;
            const indexOfFirstItem = indexOfLastItem - itemsPerPage;
            const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
            const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

            return (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Order</th>
                      <th className="px-5 py-4">Customer</th>
                      <th className="px-5 py-4">Amount</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                    {currentItems.map((o) => (
                      <tr key={o._id} className="transition hover:bg-slate-50/80">
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900">#{String(o._id).slice(-6)}</div>
                          <div className="mt-1 text-[11px] text-slate-500">
                            {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900">{o.user?.name || 'Customer'}</div>
                          <div className="mt-1 text-[11px] text-slate-500">{o.user?.email || 'Unknown'}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-black text-slate-900">₹{o.billDetails?.grandTotal || 0}</div>
                          <div className="mt-1 text-[11px] text-slate-500 uppercase">{o.paymentDetails?.method || 'COD'}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${getStatusColor(o.status)}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(o)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:border-slate-300"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(o._id)}
                              className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {totalPages > 0 && (
                  <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
                    <div className="text-xs font-semibold text-slate-500">
                      Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-40"
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

        <aside className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Dispatch</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">Operational mix</h2>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={orderMixData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={4}>
                  {orderMixData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #E2E8F0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {orderMixData.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <div key="order-drawer-wrapper">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">
                <div>
                  <h3 className="text-xl font-black tracking-[-0.03em] text-slate-900">Order Details</h3>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">#{String(selectedOrder._id).slice(-6)}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-900">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto p-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-black text-emerald-700">
                      {selectedOrder.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{selectedOrder.user?.name}</div>
                      <div className="text-xs text-slate-500">{selectedOrder.user?.email}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Status</div>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {['placed', 'preparing', 'out-for-delivery', 'delivered'].map((stage, index) => {
                      const isVisible = ['placed', 'preparing', 'out-for-delivery', 'delivered'].indexOf(selectedOrder.status) >= index;
                      const stageLabel = {
                        placed: 'Order placed',
                        preparing: 'Preparing',
                        'out-for-delivery': 'Out for delivery',
                        delivered: 'Delivered'
                      }[stage];

                      return (
                        <div key={stage} className="flex items-start gap-3">
                          <div className={`mt-0.5 h-3 w-3 rounded-full ${isVisible ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-200'}`} />
                          <div>
                            <div className="text-sm font-bold text-slate-800">{stageLabel}</div>
                            {stage === 'preparing' && selectedOrder.status === 'placed' && (
                              <button
                                onClick={() => handleUpdateStatus(selectedOrder._id, 'preparing')}
                                className="mt-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white"
                              >
                                Start prep
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Payment summary</div>
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Payment method</span>
                      <span className="font-bold text-slate-900 uppercase">{selectedOrder.paymentDetails?.method || 'COD'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Transaction</span>
                      <span className="font-mono text-xs text-slate-800">{selectedOrder.paymentDetails?.paymentId || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                      <span className="font-bold text-slate-800">Total</span>
                      <span className="text-lg font-black text-emerald-600">₹{selectedOrder.billDetails?.grandTotal || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {activeTab === 'Customers' && (
        <div className="mt-8">
          <CustomersList />
        </div>
      )}

      {activeTab === 'Payouts' && (
        <div className="mt-8">
          <PayoutsList />
        </div>
      )}
    </div>
  );
};

export default Dashboard;