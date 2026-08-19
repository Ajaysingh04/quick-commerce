import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyToken } from '@clerk/clerk-sdk-node';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No access token provided' });
  }

  try {
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    
    // Try Clerk verification first if key is present
    if (clerkSecretKey) {
      try {
        const decodedClerk = await verifyToken(token, { secretKey: clerkSecretKey });
        const user = await User.findOne({ clerkId: decodedClerk.sub });
        if (user) {
          req.user = user;
          return next();
        }
      } catch (clerkErr) {
        // Fall back to custom JWT if Clerk verification fails
      }
    }

    // Local custom JWT verification
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'super_access_secret_12345_67890_abc');
    
    // Attach decoded info to request
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists.' });
    }
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Access token expired', code: 'TOKEN_EXPIRED' });
    }
    console.error('Auth protect middleware error:', error);
    res.status(401).json({ message: 'Token verification failed: ' + error.message });
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: Access restricted to roles [${roles.join(', ')}]` 
      });
    }
    next();
  };
};
