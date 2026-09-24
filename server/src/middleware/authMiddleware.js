import jwt from 'jsonwebtoken';
import Employee from '../models/Employee.js';
import { sendResponse } from '../utils/apiResponse.js';

// Protect routes - Verify JWT token from HTTP-only cookie or Authorization header
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendResponse(res, 401, false, 'Not authorized, no token provided');
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'ems_super_secret_jwt_key_2026_antigravity'
    );

    // Get user from database without password
    const user = await Employee.findById(decoded.id).select('-password');

    if (!user) {
      return sendResponse(res, 401, false, 'User not found or token invalid');
    }

    if (user.status === 'inactive') {
      return sendResponse(res, 401, false, 'Account is inactive. Please contact system administrator');
    }

    req.user = user;
    next();
  } catch (error) {
    return sendResponse(res, 401, false, 'Not authorized, token failed or expired');
  }
};

// Admin only middleware
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return sendResponse(res, 403, false, 'Access denied. Admin privileges required');
  }
};

export const adminOnly = isAdmin;
