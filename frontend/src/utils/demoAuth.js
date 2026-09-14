import API from '../services/api.js';
import { setCredentials } from '../store/authSlice.js';

export const DEMO_PROFILES = {
  admin: {
    id: 'demo-admin-01',
    _id: 'demo-admin-01',
    name: 'Super Admin (Demo)',
    email: 'admin.demo@quickcommerce.com',
    role: 'admin',
    phone: '+91 9876543210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    isVerified: true,
    title: 'HQ Admin Console',
    desc: 'Full access to master control, live orders, revenue, inventory and partner management.',
    badge: 'HQ Master Access',
    color: 'from-emerald-500 to-teal-600',
    targetPath: '/admin'
  },
  partner: {
    id: 'demo-partner-01',
    _id: 'demo-partner-01',
    name: 'Green Grocers & Co. (Partner)',
    email: 'partner.demo@quickcommerce.com',
    role: 'partner',
    phone: '+91 9876543211',
    avatar: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80',
    storeName: 'Green Grocers Dark Store',
    isVerified: true,
    title: 'Store Partner / Vendor Hub',
    desc: 'Manage store orders, catalog inventory, promotions, and logistics dispatch.',
    badge: 'Dark Store Ops',
    color: 'from-sky-500 to-indigo-600',
    targetPath: '/partner/dashboard'
  },
  delivery: {
    id: 'demo-delivery-01',
    _id: 'demo-delivery-01',
    name: 'Rahul Sharma (Rider)',
    email: 'delivery.demo@quickcommerce.com',
    role: 'delivery',
    phone: '+91 9876543212',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    kyc: { status: 'approved' },
    isVerified: true,
    title: 'Delivery Partner Console',
    desc: 'Live trip assignments, interactive map routing, earnings ledger, and delivery history.',
    badge: 'Fleet Partner',
    color: 'from-amber-500 to-orange-600',
    targetPath: '/delivery/dashboard'
  },
  user: {
    id: 'demo-user-01',
    _id: 'demo-user-01',
    name: 'Priya Verma (Customer)',
    email: 'customer.demo@quickcommerce.com',
    role: 'user',
    phone: '+91 9876543213',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    isVerified: true,
    title: 'Customer Experience Hub',
    desc: 'Customer dashboard, order tracking, address book, coupons, rewards and wallet.',
    badge: 'VIP Customer',
    color: 'from-rose-500 to-pink-600',
    targetPath: '/profile'
  }
};

export const loginAsDemo = async (role, dispatch) => {
  const targetRole = ['admin', 'partner', 'delivery', 'user'].includes(role) ? role : 'admin';
  const fallbackProfile = DEMO_PROFILES[targetRole];

  try {
    const res = await API.post('/auth/demo-login', { role: targetRole });
    if (res.data?.user && res.data?.token) {
      dispatch(setCredentials({
        user: res.data.user,
        token: res.data.token
      }));
      return res.data.user;
    }
  } catch (err) {
    console.warn('Backend demo-login endpoint not available, applying client demo credentials:', err.message);
  }

  // Fallback demo credentials
  const mockToken = `demo_jwt_token_${targetRole}_${Date.now()}`;
  dispatch(setCredentials({
    user: fallbackProfile,
    token: mockToken
  }));

  return fallbackProfile;
};
