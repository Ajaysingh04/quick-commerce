import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/index.js';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';

import UserLayout from './layouts/UserLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import DeliveryLayout from './layouts/DeliveryLayout.jsx';

import Home from './pages/user/Home.jsx';
import Shop from './pages/user/Shop.jsx';
import AllProducts from './pages/user/AllProducts.jsx';
import AllStores from './pages/user/AllStores.jsx';
import CategoryProducts from './pages/user/CategoryProducts.jsx';
import Offers from './pages/user/Offers.jsx';
import About from './pages/user/About.jsx';
import Checkout from './pages/user/Checkout.jsx';
import OrderTracking from './pages/user/OrderTracking.jsx';
import RewardsDashboard from './pages/user/RewardsDashboard.jsx';
import GroupOrder from './pages/user/GroupOrder.jsx';
import SocialFeed from './pages/user/SocialFeed.jsx';
import UserProfile from './pages/user/UserProfile.jsx';

import AdminDashboard from './pages/admin/Dashboard.jsx';
import OrderManage from './pages/admin/OrderManage.jsx';
import StoreDashboard from './pages/admin/StoreDashboard.jsx';
import ProductManage from './pages/admin/ProductManage.jsx';
import CategoryManage from './pages/admin/CategoryManage.jsx';
import StoreManage from './pages/admin/StoreManage.jsx';
import CouponManage from './pages/admin/CouponManage.jsx';
import ReviewManage from './pages/admin/ReviewManage.jsx';
import UserManage from './pages/admin/UserManage.jsx';
import BannerManage from './pages/admin/BannerManage.jsx';
import PageManage from './pages/admin/PageManage.jsx';
import AdminProfile from './pages/admin/AdminProfile.jsx';
import SystemSettings from './pages/admin/SystemSettings.jsx';
import SupportTickets from './pages/admin/SupportTickets.jsx';

import DeliveryDashboard from './pages/delivery/Dashboard.jsx';
import ActiveDeliveries from './pages/delivery/ActiveDeliveries.jsx';
import Earnings from './pages/delivery/Earnings.jsx';
import History from './pages/delivery/History.jsx';
import Settings from './pages/delivery/Settings.jsx';
import DeliveryOnboarding from './pages/delivery/Onboarding.jsx';

import PartnerLayout from './pages/partner/PartnerLayout.jsx';
import PartnerDashboard from './pages/partner/Dashboard.jsx';
import PartnerOrders from './pages/partner/Orders.jsx';
import PartnerMenu from './pages/partner/Menu.jsx';
import PartnerProfile from './pages/partner/Profile.jsx';
import PartnerPromos from './pages/partner/Promos.jsx';
import PartnerAnalytics from './pages/partner/Analytics.jsx';
import PartnerReviews from './pages/partner/Reviews.jsx';
import PartnerDeliveries from './pages/partner/Deliveries.jsx';
import PartnerNotifications from './pages/partner/Notifications.jsx';
import PartnerStaff from './pages/partner/Staff.jsx';
import JoinStaff from './pages/partner/JoinStaff.jsx';

import AuthPage from './pages/shared/AuthPage.jsx';
import OTPVerify from './pages/shared/OTPVerify.jsx';
import Support from './pages/shared/Support.jsx';
import AuthSync from './pages/shared/AuthSync.jsx';
import StaticPage from './pages/shared/StaticPage.jsx';

import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

function App() {
 return (
 <Provider store={store}>
 <ThemeProvider>
 <SettingsProvider>
 <Router>
 <Routes>
 
 {/* User Client Routes */}
 <Route path="/" element={<UserLayout />}>
 <Route index element={<Home />} />
 <Route path="shop" element={<Shop />} />
 <Route path="products" element={<AllProducts />} />
 <Route path="stores" element={<AllStores />} />
 <Route path="category/:id" element={<CategoryProducts />} />
 <Route path="offers" element={<Offers />} />
 <Route path="about" element={<About />} />
 <Route path="support" element={<Support />} />
 <Route path="who-are-we" element={<StaticPage />} />
 <Route path="careers" element={<StaticPage />} />
 <Route path="press" element={<StaticPage />} />
 <Route path="security" element={<StaticPage />} />
 <Route path="contact" element={<StaticPage />} />
 <Route path="faq" element={<StaticPage />} />
 <Route path="cancellation" element={<StaticPage />} />
 <Route path="shipping" element={<StaticPage />} />
 <Route path="corporate" element={<StaticPage />} />
 <Route path="app" element={<StaticPage />} />
 <Route path="tracking" element={<StaticPage />} />
 <Route path="partner/register" element={<StaticPage />} />
 <Route path="delivery/register" element={<StaticPage />} />
 <Route path="terms" element={<StaticPage />} />
 <Route path="privacy" element={<StaticPage />} />
 
 {/* Protected Customer Routes */}
 <Route path="checkout" element={
 <ProtectedRoute allowedRoles={['user']}>
 <Checkout />
 </ProtectedRoute>
 } />
 <Route path="order-success" element={
 <ProtectedRoute allowedRoles={['user']}>
 <OrderTracking />
 </ProtectedRoute>
 } />
 <Route path="rewards" element={
 <ProtectedRoute allowedRoles={['user']}>
 <RewardsDashboard />
 </ProtectedRoute>
 } />
 <Route path="group-order" element={
 <ProtectedRoute allowedRoles={['user']}>
 <GroupOrder />
 </ProtectedRoute>
 } />
 <Route path="social" element={
 <ProtectedRoute allowedRoles={['user']}>
 <SocialFeed />
 </ProtectedRoute>
 } />
 <Route path="profile" element={
 <ProtectedRoute allowedRoles={['user']}>
 <UserProfile />
 </ProtectedRoute>
 } />
 </Route>

 {/* Admin Dashboard Routes */}
 <Route path="/admin" element={
 <ProtectedRoute allowedRoles={['admin']}>
 <AdminLayout />
 </ProtectedRoute>
 }>
 <Route index element={<AdminDashboard />} />
 <Route path="orders" element={<OrderManage />} />
 <Route path="products" element={<ProductManage />} />
 <Route path="categories" element={<CategoryManage />} />
 <Route path="stores" element={<StoreManage />} />
 <Route path="coupons" element={<CouponManage />} />
 <Route path="reviews" element={<ReviewManage />} />
 <Route path="users" element={<UserManage />} />
 <Route path="banners" element={<BannerManage />} />
 <Route path="pages" element={<PageManage />} />
 <Route path="support" element={<SupportTickets />} />
 <Route path="profile" element={<AdminProfile />} />
 <Route path="analytics" element={<StoreDashboard />} />
 <Route path="settings" element={<SystemSettings />} />
 </Route>

 {/* Delivery Partner Routes */}
 <Route path="/delivery" element={
 <ProtectedRoute allowedRoles={['delivery']}>
 <DeliveryLayout />
 </ProtectedRoute>
 }>
 <Route index element={<Navigate to="dashboard" replace />} />
 <Route path="dashboard" element={<DeliveryDashboard />} />
 <Route path="active" element={<ActiveDeliveries />} />
 <Route path="earnings" element={<Earnings />} />
 <Route path="history" element={<History />} />
 <Route path="settings" element={<Settings />} />
 </Route>
 <Route path="/delivery/onboarding" element={
 <ProtectedRoute allowedRoles={['delivery']}>
 <DeliveryOnboarding />
 </ProtectedRoute>
 } />

 {/* Store Partner Routes */}
 <Route path="/partner" element={
 <ProtectedRoute allowedRoles={['partner']}>
 <PartnerLayout />
 </ProtectedRoute>
 }>
 <Route index element={<Navigate to="dashboard" replace />} />
 <Route path="dashboard" element={<PartnerDashboard />} />
 <Route path="orders" element={<PartnerOrders />} />
 <Route path="menu" element={<PartnerMenu />} />
 <Route path="profile" element={<PartnerProfile />} />
 <Route path="promos" element={<PartnerPromos />} />
 <Route path="analytics" element={<PartnerAnalytics />} />
 <Route path="reviews" element={<PartnerReviews />} />
 <Route path="deliveries" element={<PartnerDeliveries />} />
 <Route path="notifications" element={<PartnerNotifications />} />
 <Route path="staff" element={<PartnerStaff />} />
 </Route>

 {/* Shared Auth/Access Routes */}
 <Route path="/login/*" element={<AuthPage />} />
 <Route path="/signup/*" element={<AuthPage />} />
 <Route path="/verify-otp" element={<OTPVerify />} />
 <Route path="/auth-sync" element={<AuthSync />} />
 <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback signUpForceRedirectUrl="/auth-sync" signInForceRedirectUrl="/auth-sync" />} />
 
 <Route path="/staff/join/:token" element={<JoinStaff />} />

 <Route path="*" element={<Navigate to="/" replace />} />

 </Routes>
 </Router>
 </SettingsProvider>
 </ThemeProvider>
 </Provider>
 );
}

export default App;
