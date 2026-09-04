import express from 'express';
import {
  getEmployees,
  getMyProfile,
  getEmployeeById,
  verifyEmployee,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
  generateEmployeeQR,
  generateAllEmployeeQRs
} from '../controllers/employeeController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public route for QR verification
router.get('/verify/:employeeId', verifyEmployee);

// Employee self-profile route (must be before /:id to avoid param conflict)
router.get('/me', protect, getMyProfile);

// Protected Admin routes
router.post('/generate-all-qrs', protect, adminOnly, generateAllEmployeeQRs);

router.route('/')
  .get(protect, adminOnly, getEmployees)
  .post(protect, adminOnly, createEmployee);

router.route('/:id')
  .get(protect, adminOnly, getEmployeeById)
  .put(protect, adminOnly, updateEmployee)
  .delete(protect, adminOnly, deleteEmployee);

router.patch('/:id/status', protect, adminOnly, updateEmployeeStatus);
router.post('/:id/generate-qr', protect, adminOnly, generateEmployeeQR);

export default router;
