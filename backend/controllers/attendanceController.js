import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import { uploadCheckInPhoto, getPhotoStream } from '../services/googleDriveService.js';
import path from 'path';

/**
 * Format server time to HH:mm AM/PM
 */
const formatTimeAMPM = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Calculate working hours string (e.g., "8h 53m")
 */
const calculateWorkingHours = (checkIn, checkOut) => {
  const diffMs = new Date(checkOut) - new Date(checkIn);
  if (diffMs <= 0) return '0h 0m';
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

/**
 * Helper: Find employee record from req.user
 */
const findEmployeeFromUser = async (user) => {
  if (user.role === 'employee' && user.employeeId) {
    return user;
  }
  // Fallback search by email
  const emp = await Employee.findOne({ email: user.email });
  return emp;
};

/**
 * @desc    Check In Employee (Upload Jio Tag Photo & Mark Attendance)
 * @route   POST /api/attendance/check-in
 * @access  Private (Employee)
 */
export const checkIn = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'Please select your Jio Tag photo to check in.' });
    }

    // Identify authenticated employee from DB
    const emp = await findEmployeeFromUser(req.user);
    if (!emp) {
      return res.status(404).json({ message: 'Employee profile not found in database.' });
    }

    // Determine official server date (YYYY-MM-DD)
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    // Check if employee has already checked in today
    const existingRecord = await Attendance.findOne({ employeeId: emp.employeeId, date: dateStr });
    if (existingRecord) {
      return res.status(400).json({ message: 'You have already checked in today.' });
    }

    // Generate filename: EMPLOYEE_ID_check-in_HH-mm-ss.ext
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${hours}-${minutes}-${seconds}`;

    let ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      ext = '.jpg';
    }
    const fileName = `${emp.employeeId}_check-in_${timeStr}${ext}`;

    // Upload photo to Google Drive (with local storage backup)
    const uploadResult = await uploadCheckInPhoto({
      fileBuffer: file.buffer,
      fileName: fileName,
      mimeType: file.mimetype,
      department: emp.department || 'General',
      employeeId: emp.employeeId,
      employeeName: emp.name,
      dateStr: dateStr
    });

    if (!uploadResult) {
      return res.status(500).json({ message: 'Unable to upload attendance photo. Please try again.' });
    }

    // Parse location data if provided
    let locationData = null;
    if (req.body.location) {
      try {
        locationData = JSON.parse(req.body.location);
      } catch (err) {
        console.error('Failed to parse location data:', err);
      }
    }

    // Create attendance record in MongoDB
    const newAttendance = await Attendance.create({
      employeeId: emp.employeeId,
      employee: emp._id,
      department: emp.department || 'General',
      date: dateStr,
      checkIn: now,
      checkInPhoto: {
        fileId: uploadResult.fileId,
        fileName: uploadResult.fileName,
        driveUrl: uploadResult.driveUrl,
        localPath: uploadResult.localPath,
        uploadedAt: now
      },
      location: locationData,
      status: 'Present'
    });

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      attendance: newAttendance
    });

  } catch (error) {
    console.error('Check In Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already checked in today.' });
    }
    res.status(500).json({ message: 'Server error during check-in: ' + error.message });
  }
};

/**
 * @desc    Check Out Employee (No Photo Required)
 * @route   POST /api/attendance/check-out
 * @access  Private (Employee)
 */
export const checkOut = async (req, res) => {
  try {
    const emp = await findEmployeeFromUser(req.user);
    if (!emp) {
      return res.status(404).json({ message: 'Employee profile not found.' });
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    const attendance = await Attendance.findOne({ 
      employeeId: { $regex: new RegExp(`^${emp.employeeId}$`, 'i') },
      $or: [
        { date: dateStr },
        { checkOut: null, status: 'Present' }
      ]
    }).sort({ createdAt: -1 });
    if (!attendance) {
      return res.status(400).json({ message: 'You have not checked in today.' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'You have already checked out today.' });
    }

    // Parse location data if provided
    let locationData = null;
    if (req.body.location) {
      try {
        locationData = JSON.parse(req.body.location);
      } catch (err) {
        console.error('Failed to parse location data:', err);
      }
    }

    attendance.checkOut = now;
    attendance.workingHours = calculateWorkingHours(attendance.checkIn, now);
    attendance.status = 'Checked Out';
    if (locationData) {
      attendance.checkOutLocation = locationData;
    }

    await attendance.save();

    res.json({
      success: true,
      message: 'Checked out successfully',
      attendance
    });
  } catch (error) {
    console.error('Check Out Error:', error);
    res.status(500).json({ message: 'Server error during check-out: ' + error.message });
  }
};

/**
 * @desc    Get Today's Attendance for Logged In Employee
 * @route   GET /api/attendance/today
 * @access  Private (Employee)
 */
export const getTodayAttendance = async (req, res) => {
  try {
    const emp = await findEmployeeFromUser(req.user);
    if (!emp) {
      return res.status(404).json({ message: 'Employee profile not found.' });
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ 
      employeeId: { $regex: new RegExp(`^${emp.employeeId}$`, 'i') },
      $or: [
        { date: dateStr },
        { checkOut: null, status: 'Present' }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      employee: {
        name: emp.name,
        employeeId: emp.employeeId,
        department: emp.department
      },
      attendance: attendance || null
    });
  } catch (error) {
    console.error('Get Today Attendance Error:', error);
    res.status(500).json({ message: 'Server error fetching today attendance.' });
  }
};

/**
 * @desc    Get Attendance History for Logged In Employee
 * @route   GET /api/attendance/my-history
 * @access  Private (Employee)
 */
export const getMyAttendanceHistory = async (req, res) => {
  try {
    const emp = await findEmployeeFromUser(req.user);
    if (!emp) {
      return res.status(404).json({ message: 'Employee profile not found.' });
    }

    const history = await Attendance.find({ employeeId: emp.employeeId }).sort({ date: -1 });

    res.json(history);
  } catch (error) {
    console.error('Get My Attendance History Error:', error);
    res.status(500).json({ message: 'Server error fetching attendance history.' });
  }
};

/**
 * @desc    Get Admin Attendance Dashboard Records with Filters
 * @route   GET /api/attendance/admin
 * @access  Private (Admin Only)
 */
export const getAdminAttendance = async (req, res) => {
  try {
    const { date, department, search, status } = req.query;

    const filterDate = date || new Date().toISOString().split('T')[0];

    // Build Mongoose query
    const query = { date: filterDate };

    if (department && department !== 'All') {
      query.department = department;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const [recordsRaw, totalEmployees, todayAllRecords] = await Promise.all([
      Attendance.find(query)
        .populate('employee', 'name employeeId designation profilePhoto department')
        .sort({ checkIn: -1 })
        .lean(),
      Employee.countDocuments({ status: 'Active' }),
      Attendance.find({ date: filterDate }).select('status').lean()
    ]);

    let records = recordsRaw;

    // Optional Search Filter by Employee Name or ID
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      records = records.filter(r => 
        (r.employeeId && r.employeeId.toLowerCase().includes(q)) ||
        (r.employee?.name && r.employee.name.toLowerCase().includes(q))
      );
    }

    const presentCount = todayAllRecords.length;
    const absentCount = Math.max(0, totalEmployees - presentCount);
    const workingCount = todayAllRecords.filter(r => r.status === 'Present').length;
    const checkedOutCount = todayAllRecords.filter(r => r.status === 'Checked Out').length;

    res.json({
      summary: {
        totalEmployees,
        presentCount,
        absentCount,
        workingCount,
        checkedOutCount,
        filterDate
      },
      records
    });
  } catch (error) {
    console.error('Admin Attendance Fetch Error:', error);
    res.status(500).json({ message: 'Server error fetching admin attendance data.' });
  }
};

/**
 * @desc    Stream Attendance Check-In Photo (Secure Access)
 * @route   GET /api/attendance/photo/:attendanceId
 * @access  Private (Owner Employee or Admin)
 */
export const getAttendancePhoto = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found.' });
    }

    const { stream, contentType } = await getPhotoStream(attendance);
    res.setHeader('Content-Type', contentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'private, max-age=86400');
    stream.pipe(res);
  } catch (error) {
    console.error('Photo Stream Error:', error.message);
    res.status(404).json({ message: 'Attendance photo not found.' });
  }
};
