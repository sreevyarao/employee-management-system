import express from 'express';
import authRoutes from './authRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import projectRoutes from './projectRoutes.js';
import assignmentRoutes from './assignmentRoutes.js';
import { getAdminDashboardSummary } from '../controllers/projectController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import { sendResponse } from '../utils/apiResponse.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  return sendResponse(res, 200, true, 'EMS API Server is running smoothly', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Module Routes
router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/projects', projectRoutes);
router.use('/assignments', assignmentRoutes);
router.get('/admin/dashboard', protect, isAdmin, getAdminDashboardSummary);

export default router;
