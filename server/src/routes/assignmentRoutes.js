import express from 'express';
import {
  getAllAssignments,
  getMyAssignment,
  getEmployeeAssignmentStatus,
  createAssignment,
  completeAssignment,
  deleteAssignment
} from '../controllers/assignmentController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/my', getMyAssignment);
router.get('/employee-status', isAdmin, getEmployeeAssignmentStatus);

router.route('/')
  .get(isAdmin, getAllAssignments)
  .post(isAdmin, createAssignment);

router.put('/:id/complete', isAdmin, completeAssignment);
router.delete('/:id', isAdmin, deleteAssignment);

export default router;
