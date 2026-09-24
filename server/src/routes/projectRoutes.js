import express from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addModule,
  updateModule,
  deleteModule,
  addTask,
  updateTask,
  deleteTask,
  completeTask
} from '../controllers/projectController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Project CRUD
router.route('/')
  .get(getAllProjects)
  .post(isAdmin, createProject);

router.route('/:id')
  .get(getProjectById)
  .put(isAdmin, updateProject)
  .delete(isAdmin, deleteProject);

// Module routes
router.post('/:id/modules', isAdmin, addModule);
router.put('/:id/modules/:moduleId', isAdmin, updateModule);
router.delete('/:id/modules/:moduleId', isAdmin, deleteModule);

// Task routes
router.post('/:id/modules/:moduleId/tasks', isAdmin, addTask);
router.put('/:id/modules/:moduleId/tasks/:taskId', isAdmin, updateTask);
router.delete('/:id/modules/:moduleId/tasks/:taskId', isAdmin, deleteTask);

// Complete task — accessible to any authenticated user (ownership checked in controller)
router.put('/:id/modules/:moduleId/tasks/:taskId/complete', completeTask);

export default router;
