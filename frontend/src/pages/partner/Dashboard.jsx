import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import {
  TrendingUp,
  ShoppingBag,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Clock3,
  AlertTriangle,
  CircleDollarSign,
  Boxes,
  Truck,
  Sparkles,
  Tag,
  Store,
  ExternalLink,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const revenueData = [
  { name: 'Mon', revenue: 2600, orders: 150 },
  { name: 'Tue', revenue: 3900, orders: 200 },
  { name: 'Wed', revenue: 5200, orders: 240 },
  { name: 'Thu', revenue: 4800, orders: 220 },
  { name: 'Fri', revenue: 7100, orders: 310 },
  { name: 'Sat', revenue: 8700, orders: 360 },
  { name: 'Sun', revenue: 9600, orders: 400 },
];

const inventoryData = [
  { name: 'Apples', stock: 32, sold: 180 },
  { name: 'Milk', stock: 24, sold: 210 },
  { name: 'Eggs', stock: 18, sold: 160 },
  { name: 'Bread', stock: 10, sold: 135 },
  { name: 'Rice', stock: 9, sold: 100 },
  { name: 'Biscuits', stock: 22, sold: 190 },
];

const pieData = [
  { name: 'Fresh Produce', value: 38, color: '#0EA5E9' },
  { name: 'Dairy', value: 25, color: '#2563EB' },
  { name: 'Snacks', value: 22, color: '#8B5CF6' },
  { name: 'Household', value: 15, color: '#F59E0B' },
];

const topProducts = [
  { name: 'Amul Taaza Milk', sold: 420, revenue: 23480, stock: 'In Stock', trend: '+18%' },
  { name: 'Royal Gala Apples', sold: 380, revenue: 17820, stock: 'Low', trend: '+12%' },
  { name: 'Lays Magic Masala', sold: 310, revenue: 11690, stock: 'In Stock', trend: '+9%' },
  { name: 'Farm Eggs', sold: 275, revenue: 14230, stock: 'Low', trend: '+15%' },
];

const alerts = [
  { title: 'Low stock', label: 'Apples', severity: 'warning', detail: 'Only 12 units left' },
  { title: 'Out of stock', label: 'Bananas', severity: 'danger', detail: 'Need replenishment today' },
  { title: 'Expiring soon', label: 'Fresh milk', severity: 'warning', detail: '2 batches by 6 PM' },
  { title: 'Fast moving', label: 'Rice & Basmati', severity: 'success', detail: '24% above baseline' },
];

const activityFeed = [
  { time: '2 min ago', action: 'New order received', detail: 'Order #A1842 — 3 items', color: 'sky' },
  { time: '13 min ago', action: 'Inventory updated', detail: 'Milk stock refreshed to 42 units', color: 'indigo' },
  { time: '28 min ago', action: 'Delivery completed', detail: 'Rider delivered to Sector 18', color: 'amber' },
  { time: '49 min ago', action: 'Offer launched', detail: 'Weekend combo discount activated', color: 'violet' },
];

const StatCard = ({ title, value, trend, icon: Icon, accent, detail, sparkline, onClick }) => (
  <motion.div 
    whileHover={{ y: -4 }} 
    onClick={onClick}
    className={`rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] ${onClick ? 'cursor-pointer transition hover:border-emerald-300' : ''}`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        {Math.abs(trend)}%
      </div>
    </div>

    <div className="mt-5 flex items-end justify-between gap-3">
      <div>
        <div className="text-3xl font-black tracking-[-0.06em] text-slate-900">{value}</div>
        <div className="mt-1 text-sm font-semibold text-slate-500">{title}</div>
      </div>
      <div className="flex h-10 w-20 items-end gap-1">{sparkline}</div>
    </div>

    <div className="mt-3 text-xs font-medium text-slate-400">{detail}</div>
  </motion.div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7D');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/partner/dashboard-stats');
      setStats(res.data);
    } catch (err) {
      console.warn('API Error loading partner stats, using structured fallback:', err);
      setStats({
        totalRevenue: 148200,
        totalOrders: 342,
        pendingOrders: 18,
        completedOrders: 315,
        cancelledOrders: 9,
        outOfStock: 7,
        storeRating: 4.8,
      });
    } finally {
      setLoading(false);
    }
  };

  const sparklineBars = [35, 55, 48, 65, 62, 72, 80];

  const quickActions = [
    { label: 'Add Product', desc: 'Create new catalog item', icon: Package, color: 'bg-sky-100 text-sky-700', path: '/partner/inventory?action=add' },
    { label: 'Create Offer', desc: 'Launch promo discount', icon: Tag, color: 'bg-indigo-100 text-indigo-700', path: '/partner/promos' },
    { label: 'Manage Stock', desc: 'Update inventory levels', icon: Boxes, color: 'bg-amber-100 text-amber-700', path: '/partner/inventory' },
    { label: 'Live Orders', desc: 'Dispatch & pack orders', icon: ShoppingBag, color: 'bg-emerald-100 text-emerald-700', path: '/partner/orders' },
    { label: 'Store Profile', desc: 'Hours, timings & details', icon: Store, color: 'bg-rose-100 text-rose-700', path: '/partner/profile' },
    { label: 'Logistics / Riders', desc: 'Live partner dispatch', icon: Truck, color: 'bg-violet-100 text-violet-700', path: '/partner/deliveries' },
  ];

  if (loading) {
    return <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading operations dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-sky-700">Overview</div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-[-0.06em] text-slate-900">Store operations dashboard</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 shadow-xs hover:bg-emerald-100 hover:border-emerald-400 transition cursor-pointer"
            title="Open customer live store"
          >
            <Store className="h-4 w-4 text-emerald-600" />
            <span>Customer Live Store</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            {['7D', '30D', '90D'].map((option) => (
              <button
                key={option}
                onClick={() => setRange(option)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] transition cursor-pointer ${range === option ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Revenue"
          value={`₹${(stats?.totalRevenue || 148200).toLocaleString('en-IN')}`}
          trend={14.8}
          detail="Vs last week"
          accent="bg-sky-100 text-sky-700"
          icon={CircleDollarSign}
          onClick={() => navigate('/partner/analytics')}
          sparkline={sparklineBars.map((height, index) => (
            <span key={index} className="w-full rounded-t-full bg-sky-200" style={{ height: `${height}%` }} />
          ))}
        />
        <StatCard
          title="Orders"
          value={stats?.totalOrders || 342}
          trend={11.2}
          detail="Across all channels"
          accent="bg-indigo-100 text-indigo-700"
          icon={ShoppingBag}
          onClick={() => navigate('/partner/orders')}
          sparkline={sparklineBars.map((height, index) => (
            <span key={index} className="w-full rounded-t-full bg-indigo-200" style={{ height: `${height}%` }} />
          ))}
        />
        <StatCard
          title="Inventory"
          value={stats?.outOfStock || 7}
          trend={-2.4}
          detail="Low stock alerts"
          accent="bg-amber-100 text-amber-700"
          icon={Boxes}
          onClick={() => navigate('/partner/inventory')}
          sparkline={sparklineBars.map((height, index) => (
            <span key={index} className="w-full rounded-t-full bg-amber-200" style={{ height: `${height}%` }} />
          ))}
        />
        <StatCard
          title="Delivery success"
          value={`${(97.4).toFixed(1)}%`}
          trend={2.1}
          detail="On-time performance"
          accent="bg-violet-100 text-violet-700"
          icon={Truck}
          onClick={() => navigate('/partner/deliveries')}
          sparkline={sparklineBars.map((height, index) => (
            <span key={index} className="w-full rounded-t-full bg-violet-200" style={{ height: `${height}%` }} />
          ))}
        />
        <StatCard
          title="Customer rating"
          value={stats?.storeRating || '4.8'}
          trend={3.7}
          detail="Based on recent orders"
          accent="bg-yellow-100 text-yellow-700"
          icon={Star}
          onClick={() => navigate('/partner/profile')}
          sparkline={sparklineBars.map((height, index) => (
            <span key={index} className="w-full rounded-t-full bg-yellow-200" style={{ height: `${height}%` }} />
          ))}
        />
        <StatCard
          title="Pending orders"
          value={stats?.pendingOrders || 18}
          trend={-4.1}
          detail="Need dispatch attention"
          accent="bg-rose-100 text-rose-700"
          icon={Clock3}
          onClick={() => navigate('/partner/orders')}
          sparkline={sparklineBars.map((height, index) => (
            <span key={index} className="w-full rounded-t-full bg-rose-200" style={{ height: `${height}%` }} />
          ))}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.section whileHover={{ y: -2 }} className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_35px_rgba(15,23,42,0.04)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Analytics</div>
              <h2 className="mt-1 text-xl sm:text-2xl font-black tracking-[-0.05em] text-slate-900">Revenue performance</h2>
            </div>
            <div className="text-right">
              <div className="text-lg sm:text-2xl font-black text-slate-900">₹{(stats?.totalRevenue || 148200).toLocaleString('en-IN')}</div>
              <div className="text-[11px] font-bold text-emerald-600">+14.8% growth</div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section whileHover={{ y: -2 }} className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_35px_rgba(15,23,42,0.04)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Leaderboard</div>
              <h2 className="mt-1 text-xl sm:text-2xl font-black tracking-[-0.05em] text-slate-900">Top selling items</h2>
            </div>
            <button onClick={() => navigate('/partner/inventory')} className="text-xs font-bold text-sky-600 hover:text-sky-800 transition">View All</button>
          </div>

          <div className="space-y-3">
            {topProducts.map((product) => (
              <div key={product.name} onClick={() => navigate('/partner/inventory')} className="flex items-center justify-between rounded-[20px] border border-slate-100 bg-slate-50 p-3 hover:bg-white hover:border-slate-300 transition cursor-pointer">
                <div>
                  <div className="text-sm font-black text-slate-900">{product.name}</div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{product.sold} sold</span>
                    <span>•</span>
                    <span>{product.stock}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-slate-900">₹{product.revenue.toLocaleString('en-IN')}</div>
                  <div className="mt-1 text-[10px] font-bold text-emerald-600">{product.trend}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* QUICK ACTIONS SECTION (Fully interactive & responsive) */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <motion.section whileHover={{ y: -2 }} className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_35px_rgba(15,23,42,0.04)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Operations</div>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-slate-900">Quick actions</h2>
            </div>
            <button 
              onClick={() => navigate('/partner/inventory?action=add')}
              className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-slate-800 active:scale-95 transition cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> New Product
            </button>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map(({ label, desc, icon: Icon, color, path }) => (
              <button 
                key={label} 
                onClick={() => navigate(path)}
                className="flex flex-col justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 text-left transition-all hover:border-emerald-500 hover:bg-emerald-50/30 hover:shadow-md active:scale-98 group cursor-pointer"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color} shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900 group-hover:text-emerald-800 transition-colors">{label}</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5 leading-tight">{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </motion.section>

        <motion.section whileHover={{ y: -2 }} className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_35px_rgba(15,23,42,0.04)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Alerts</div>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-slate-900">Inventory alerts</h2>
            </div>
            <button onClick={() => navigate('/partner/inventory')} className="text-xs font-bold text-amber-600 hover:underline">Manage All</button>
          </div>

          <div className="space-y-3">
            {alerts.map((item) => (
              <div 
                key={item.label} 
                onClick={() => navigate('/partner/inventory')}
                className="flex items-center gap-3 rounded-[20px] border border-slate-100 bg-slate-50 p-3 hover:bg-white hover:border-slate-300 transition cursor-pointer"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.severity === 'danger' ? 'bg-rose-100 text-rose-600' : item.severity === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900">{item.title}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">{item.label}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{item.detail}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      <motion.section whileHover={{ y: -2 }} className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_35px_rgba(15,23,42,0.04)]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Live activity</div>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-slate-900">Recent activity</h2>
          </div>
          <button 
            onClick={() => navigate('/partner/orders')}
            className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700 hover:bg-sky-100 transition cursor-pointer"
          >
            <span className="h-2 w-2 rounded-full bg-sky-500 animate-ping" /> Live Orders
          </button>
        </div>

        <div className="space-y-4">
          {activityFeed.map((activity) => (
            <div 
              key={activity.time} 
              onClick={() => navigate('/partner/orders')}
              className="flex items-start gap-4 rounded-[22px] border border-slate-100 bg-slate-50 p-3 hover:bg-white hover:border-slate-300 transition cursor-pointer"
            >
              <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-xl ${activity.color === 'sky' ? 'bg-sky-100 text-sky-700' : activity.color === 'indigo' ? 'bg-indigo-100 text-indigo-700' : activity.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-violet-100 text-violet-700'}`}>
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-black text-slate-900">{activity.action}</div>
                  <div className="text-[11px] font-bold text-slate-400">{activity.time}</div>
                </div>
                <div className="mt-1 text-xs text-slate-500">{activity.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default Dashboard;
