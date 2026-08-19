import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  sendRefreshTokenCookie 
} from '../utils/generateTokens.js';
import jwt from 'jsonwebtoken';

// Helper to generate a 6-digit numeric OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otpCode = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      otp: { code: otpCode, expiresAt: otpExpires }
    });

    // Dispatch OTP email
    await sendEmail({
      email: user.email,
      subject: 'Verify your RoseDash Account',
      html: `<h3>Welcome to RoseDash, ${user.name}!</h3>
             <p>Use the following 6-digit OTP to verify your email address:</p>
             <h1 style="color: #f43f5e; font-size: 2.25rem; font-weight: 700; letter-spacing: 0.25rem;">${otpCode}</h1>
             <p>This code expires in 10 minutes.</p>`
    });

    res.status(201).json({
      message: 'Registration successful! Verification OTP sent to your email.',
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP code
// @route   POST /api/auth/otp/verify
// @access  Public
export const verifyOtp = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (!user.otp || user.otp.code !== code || new Date() > user.otp.expiresAt) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.isVerified = true;
    user.otp = undefined; // clear OTP details
    await user.save();

    // Sign tokens on success
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    sendRefreshTokenCookie(res, refreshToken);

    res.json({
      message: 'Account verified successfully!',
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend OTP code
// @route   POST /api/auth/otp/resend
// @access  Public
export const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    const otpCode = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.otp = { code: otpCode, expiresAt: otpExpires };
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'New verification OTP for RoseDash',
      html: `<h3>Account Verification</h3>
             <p>Use the following 6-digit OTP to verify your email address:</p>
             <h1 style="color: #f43f5e; font-size: 2.25rem; font-weight: 700; letter-spacing: 0.25rem;">${otpCode}</h1>
             <p>This code expires in 10 minutes.</p>`
    });

    res.json({ message: 'Verification OTP sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate User & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Account not verified. Please verify your OTP code.',
        requiresVerification: true,
        email: user.email
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    sendRefreshTokenCookie(res, refreshToken);

    res.json({
      message: 'Login successful!',
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'super_refresh_secret_12345_67890_abc');
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user);
    res.json({ token: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: 'Refresh token invalid or expired' });
  }
};

// @desc    Logout user & clear refresh cookies
// @route   POST /api/auth/logout
// @access  Private (JWT Access)
export const logout = async (req, res) => {
  const token = req.cookies.refreshToken;

  try {
    if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password request
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account associated with this email' });
    }

    const resetOtp = generateOtp();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.otp = { code: resetOtp, expiresAt: expires };
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Reset your RoseDash Account Password',
      html: `<h3>Password Reset Requested</h3>
             <p>Use the following 6-digit code to reset your account password:</p>
             <h1 style="color: #f43f5e; font-size: 2.25rem; font-weight: 700; letter-spacing: 0.25rem;">${resetOtp}</h1>
             <p>If you did not make this request, please secure your account immediately.</p>`
    });

    res.json({ message: 'Password reset code has been sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp || user.otp.code !== code || new Date() > user.otp.expiresAt) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    // Update password
    user.password = newPassword;
    user.otp = undefined; // clear otp
    await user.save();

    res.json({ message: 'Password has been reset successfully. Please log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Google login success callback helper (redirect details)
// @route   GET /api/auth/google/success
// @access  Private
export const googleSuccess = async (req, res) => {
  if (req.user) {
    const user = req.user;
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    sendRefreshTokenCookie(res, refreshToken);

    // Redirect to client home page with token query param
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth-callback?token=${accessToken}`);
  } else {
    res.status(401).json({ message: 'Google Authentication failed' });
  }
};

// @desc    Sync Clerk User to MongoDB
// @route   POST /api/auth/clerk-sync
// @access  Public
export const clerkSync = async (req, res) => {
  const { clerkId, email, name, avatar, role } = req.body;
  
  try {
    let user = await User.findOne({ clerkId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.clerkId = clerkId;
        user.avatar = avatar || user.avatar;
      } else {
        user = await User.create({
          clerkId,
          name: name || 'Clerk User',
          email,
          avatar,
          role: role || 'user',
          isVerified: true,
          password: Math.random().toString(36).slice(-8),
        });
      }
    }
    
    // DEV OVERRIDE: Allow role update to access admin/delivery dashboards
    if (role && role !== user.role) {
      user.role = role;
    }
    
    await user.save();
    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    sendRefreshTokenCookie(res, refreshToken);
    
    res.json({
      message: 'Clerk Sync successful!',
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
