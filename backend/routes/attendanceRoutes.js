import express from 'express';
import multer from 'multer';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyAttendanceHistory,
  getAdminAttendance,
  getAttendancePhoto
} from '../controllers/attendanceController.js';

const router = express.Router();

// Multer memory storage configuration for file upload (Max 5MB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB Max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, JPEG, and PNG images are allowed.'), false);
    }
  }
});

// Employee Routes
router.post('/check-in', protect, upload.single('photo'), checkIn);
router.post('/check-out', protect, checkOut);
router.get('/today', protect, getTodayAttendance);
router.get('/my-history', protect, getMyAttendanceHistory);

// Secure Photo Stream
router.get('/photo/:attendanceId', protect, getAttendancePhoto);

// Admin Routes
router.get('/admin', protect, adminOnly, getAdminAttendance);

export default router;
