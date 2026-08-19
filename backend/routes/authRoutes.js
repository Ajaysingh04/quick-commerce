import express from 'express';
import passport from 'passport';
import {
  signup,
  verifyOtp,
  resendOtp,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  googleSuccess,
  clerkSync
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Registration and credentials flows
router.post('/signup', signup);
router.post('/otp/verify', verifyOtp);
router.post('/otp/resend', resendOtp);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.post('/clerk-sync', clerkSync);

// Password recovery
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Google OAuth Routing
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login-failed' }),
  (req, res) => {
    res.redirect('/api/auth/google/success');
  }
);
router.get('/google/success', googleSuccess);

router.get('/login-failed', (req, res) => {
  res.status(401).json({ message: 'Google authentication failed. Please try again.' });
});

export default router;
