import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getMyTasks
} from '../controllers/taskController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Routes for employee's own tasks
router.get('/employee', protect, getMyTasks);

// Common task status update (Admin or Employee)
router.patch('/:id/status', protect, updateTaskStatus);

// Admin-only routes
router.route('/')
  .get(protect, adminOnly, getTasks)
  .post(protect, adminOnly, createTask);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, adminOnly, updateTask)
  .delete(protect, adminOnly, deleteTask);

export default router;
