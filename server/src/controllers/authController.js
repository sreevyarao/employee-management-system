import Employee from '../models/Employee.js';
import { sendResponse } from '../utils/apiResponse.js';
import { sendTokenResponse } from '../utils/generateToken.js';

// @desc    Login employee & get token cookie
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, false, 'Please provide email and password');
    }

    // Find employee and explicitly include password field
    const user = await Employee.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    if (user.status === 'inactive') {
      return sendResponse(res, 401, false, 'Account is inactive. Please contact administrator');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Logout employee / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true
    });

    return sendResponse(res, 200, true, 'Logged out successfully', null);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await Employee.findById(req.user._id).select('-password');
    return sendResponse(res, 200, true, 'Profile retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendResponse(res, 400, false, 'Please provide both current and new passwords');
    }

    if (newPassword.length < 6) {
      return sendResponse(res, 400, false, 'New password must be at least 6 characters long');
    }

    // Find user with password
    const user = await Employee.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return sendResponse(res, 400, false, 'Incorrect current password');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return sendResponse(res, 200, true, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};
