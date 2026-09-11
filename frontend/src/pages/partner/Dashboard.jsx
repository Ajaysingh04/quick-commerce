import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  TrendingUp,
  ShoppingBag,
  Users,
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
  { name: 'Fresh Produce', value: 38, color: '#10B981' },
  { name: 'Dairy', value: 25, color: '#3B82F6' },
  { name: 'Snacks', value: 22, color: '#F59E0B' },
  { name: 'Household', value: 15, color: '#6366F1' },
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
  { time: '2 min ago', action: 'New order received', detail: 'Order #A1842 — 3 items', color: 'emerald' },
  { time: '13 min ago', action: 'Inventory updated', detail: 'Milk stock refreshed to 42 units', color: 'blue' },
  { time: '28 min ago', action: 'Delivery completed', detail: 'Rider delivered to Sector 18', color: 'amber' },
  { time: '49 min ago', action: 'Offer launched', detail: 'Weekend combo discount activated', color: 'violet' },
];

const StatCard = ({ title, value, trend, icon: Icon, accent, detail, sparkline }) => (
  <motion.div whileHover={{ y: -4 }} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
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
      console.error(err);
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

  if (loading) {
    return <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading operations dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Overview</div>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.06em] text-slate-900">Store performance dashboard</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          {['7D', '30D', '90D'].map((option) => (
            <button
              key={option}
              onClick={() => setRange(option)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] transition ${range === option ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Revenue"
          value={`₹${(stats?.totalRevenue || 148200).toLocaleString('en-IN')}`}
          trend={14.8}
          detail="Vs last week"
          accent="bg-emerald-100 text-emerald-700"
          icon={CircleDollarSign}
          sparkline={sparklineBars.map((height, index) => (
            <span key={index} className="w-full rounded-t-full bg-emerald-200" style={{ height: `${height}%` }} />
          ))}
        />
        <StatCard
          title="Orders"
          value={stats?.totalOrders || 342}
          trend={11.2}
          detail="Across all channels"
          accent="bg-blue-100 text-blue-700"
          icon={ShoppingBag}
          sparkline={sparklineBars.map((height, index) => (
            <span key={index} className="w-full rounded-t-full bg-blue-200" style={{ height: `${height}%` }} />
          ))}
        />
        <StatCard
          title="Inventory"
          value={stats?.outOfStock || 7}
          trend={-2.4}
          detail="Low stock alerts"
          accent="bg-amber-100 text-amber-700"
          icon={Boxes}
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
          sparkline={sparklineBars.map((height, index) => (
            <span key={index} className="w-full rounded-t-full bg-rose-200" style={{ height: `${height}%` }} />
          ))}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <motion.section whileHover={{ y: -2 }} className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_35px_rgba(15,23,42,0.04)]">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Analytics</div>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-slate-900">Revenue analytics</h2>
            </div>
            <div className="flex gap-2">
              {['Revenue', 'Volume', 'Orders'].map((tab) => (
                <button key={tab} className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] ${tab === 'Revenue' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section whileHover={{ y: -2 }} className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_35px_rgba(15,23,42,0.04)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Category mix</div>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-slate-900">Sales split</h2>
            </div>
            <Sparkles className="h-5 w-5 text-emerald-500" />
          </div>

          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={52} outerRadius={80} paddingAngle={3} stroke="transparent">
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-semibold text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.section whileHover={{ y: -2 }} className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_35px_rgba(15,23,42,0.04)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Stock</div>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-slate-900">Inventory movement</h2>
            </div>
            <button className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
              Replenish
            </button>
          </div>

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryData} barSize={18} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #E2E8F0' }} />
                <Bar dataKey="sold" radius={[8, 8, 0, 0]} fill="#0F172A" />
                <Bar dataKey="stock" radius={[8, 8, 0, 0]} fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section whileHover={{ y: -2 }} className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_35px_rgba(15,23,42,0.04)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Top sellers</div>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-slate-900">Fast movers</h2>
            </div>
            <Package className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-4">
            {topProducts.map((product) => (
              <div key={product.name} className="flex items-center gap-3 rounded-[22px] border border-slate-100 bg-slate-50 p-3 transition hover:border-slate-200 hover:bg-white">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700">
                  <Package className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-black text-slate-900">{product.name}</div>
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

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <motion.section whileHover={{ y: -2 }} className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_35px_rgba(15,23,42,0.04)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Operations</div>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-slate-900">Quick actions</h2>
            </div>
            <button className="rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
              + New
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Add Product', icon: Package, color: 'bg-emerald-100 text-emerald-700' },
              { label: 'Create Offer', icon: Tag, color: 'bg-blue-100 text-blue-700' },
              { label: 'Manage Inventory', icon: Boxes, color: 'bg-amber-100 text-amber-700' },
              { label: 'Assign Delivery', icon: Truck, color: 'bg-violet-100 text-violet-700' },
            ].map(({ label, icon: Icon, color }) => (
              <button key={label} className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-slate-300 hover:bg-white">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-sm font-black text-slate-900">{label}</div>
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
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>

          <div className="space-y-3">
            {alerts.map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-[20px] border border-slate-100 bg-slate-50 p-3">
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
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live
          </div>
        </div>

        <div className="space-y-4">
          {activityFeed.map((activity) => (
            <div key={activity.time} className="flex items-start gap-4 rounded-[22px] border border-slate-100 bg-slate-50 p-3">
              <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-xl ${activity.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : activity.color === 'blue' ? 'bg-blue-100 text-blue-700' : activity.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-violet-100 text-violet-700'}`}>
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-black text-slate-900">{activity.action}</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{activity.time}</div>
                </div>
                <div className="mt-1 text-sm text-slate-600">{activity.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default Dashboard;
