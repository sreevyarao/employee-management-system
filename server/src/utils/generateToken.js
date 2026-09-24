import jwt from 'jsonwebtoken';
import { sendResponse } from './apiResponse.js';

export const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'ems_super_secret_jwt_key_2026_antigravity',
    { expiresIn: process.env.JWT_EXPIRE || '1d' }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;

  return res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      data: { user: userObj }
    });
};
