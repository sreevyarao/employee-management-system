import express from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from '../controllers/employeeController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection to all employee routes
router.use(protect);

router.route('/')
  .get(getAllEmployees)
  .post(isAdmin, createEmployee);

router.route('/:id')
  .get(getEmployeeById)
  .put(isAdmin, updateEmployee)
  .delete(isAdmin, deleteEmployee);

export default router;
