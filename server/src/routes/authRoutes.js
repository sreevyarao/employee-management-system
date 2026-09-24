import express from 'express';
import {
  login,
  logout,
  getProfile,
  changePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', protect, getProfile);
router.put('/change-password', protect, changePassword);

export default router;
