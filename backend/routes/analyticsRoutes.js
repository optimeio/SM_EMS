import express from 'express';
import { getDashboardStats, getLeaderboard, getEmployeePerformance } from '../controllers/analyticsController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Route for dashboard stats
router.get('/dashboard/stats', protect, adminOnly, getDashboardStats);

// Route for leaderboard
router.get('/performance/leaderboard', protect, adminOnly, getLeaderboard);

// Route for individual performance
router.get('/performance/:id', protect, adminOnly, getEmployeePerformance);

export default router;
