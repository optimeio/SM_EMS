import express from 'express';
import { getActivityLogs } from '../controllers/activityLogController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, adminOnly, getActivityLogs);

export default router;
