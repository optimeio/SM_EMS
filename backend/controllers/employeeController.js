import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import Attendance from '../models/Attendance.js';
import ActivityLog from '../models/ActivityLog.js';
import QRCode from 'qrcode';
import { uploadIDCardToDrive } from '../services/googleDriveService.js';

const safeParseDate = (dateVal) => {
  if (!dateVal) return null;
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) return dateVal;
  
  const str = String(dateVal).trim();
  if (!str) return null;

  // Check DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10);
    const month = parseInt(ddmmyyyyMatch[2], 10) - 1;
    const year = parseInt(ddmmyyyyMatch[3], 10);
    const parsed = new Date(year, month, day);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  const parsedDirect = new Date(str);
  if (!isNaN(parsedDirect.getTime())) return parsedDirect;

  return null;
};

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private/Admin
// @desc    Get all employees (with pagination, projection & filters)
// @route   GET /api/employees
// @access  Private/Admin
export const getEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const search = req.query.search ? req.query.search.trim() : '';
    const department = req.query.department || 'All';
    const status = req.query.status || 'All';
    const includeCards = req.query.includeCards === 'true';

    const selectFields = includeCards 
      ? '-password' 
      : '-password -idCardImage -qrCodeImage';

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (department && department !== 'All') {
      if (department === 'COI (Center Of Information)') {
        query.department = { $in: ['COI (Center Of Information)', 'Telecalling'] };
      } else if (department === 'Sales And Marketing') {
        query.department = { $in: ['Sales And Marketing', 'Marketing'] };
      } else if (department === 'Software Development') {
        query.department = { $in: ['Software Development', 'IT', 'Engineering'] };
      } else {
        query.department = department;
      }
    }

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { name: regex },
        { employeeId: regex },
        { email: regex },
        { designation: regex }
      ];
    }

    if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
      const skip = (page - 1) * limit;
      const [total, employees] = await Promise.all([
        Employee.countDocuments(query),
        Employee.find(query)
          .select(selectFields)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
      ]);

      return res.json({
        employees,
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      });
    }

    // Default response for unpaginated callers (with proper projection & lean)
    const employees = await Employee.find(query)
      .select(selectFields)
      .sort({ createdAt: -1 })
      .lean();

    res.json(employees);
  } catch (error) {
    console.error('Get Employees Error:', error);
    res.status(500).json({ message: 'Server error fetching employees: ' + error.message });
  }
};

// @desc    Get logged-in employee's own profile
// @route   GET /api/employees/me
// @access  Private (Employee)
export const getMyProfile = async (req, res) => {
  try {
    // req.user is set by protect middleware
    const employee = await Employee.findById(req.user._id).select('-password');
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get employee by ID (Admin view)
// @route   GET /api/employees/:id
// @access  Private/Admin
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify employee (Public QR scan view)
// @route   GET /api/employees/verify/:employeeId
// @access  Public
export const verifyEmployee = async (req, res) => {
  try {
    let rawId = (req.params.employeeId || '').trim();
    if (!rawId) {
      return res.status(400).json({ message: 'Employee ID is required for verification' });
    }

    // Clean up URL parts, query params, trailing slashes if passed into param
    if (rawId.includes('/verify/')) {
      rawId = rawId.split('/verify/')[1] || rawId;
    }
    rawId = rawId.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '').trim();

    const normalizedUpper = rawId.toUpperCase();
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(rawId);

    // 1. Prioritize DIRECT match by exact employeeId, email, or phone
    const exactRegex = new RegExp(`^${rawId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    let employee = await Employee.findOne({
      $or: [
        { employeeId: exactRegex },
        { email: rawId.toLowerCase() },
        { phone: rawId },
        ...(isObjectId ? [{ _id: rawId }] : [])
      ]
    }).select('-password').lean();

    if (employee) {
      return res.json(employee);
    }

    // 2. Fallback to historical aliases ONLY if no current employee holds this exact ID
    const LEGACY_ID_MAP = {
      'TSMGS011': 'TSMG005',
      'TSMGS012': 'TSMG009',
      'TSMGS013': 'TSMG010',
      'TSMGS014': 'TSMG011',
      'TSMGS015': 'TSMG012',
    };

    const targetId = LEGACY_ID_MAP[normalizedUpper];
    if (targetId) {
      employee = await Employee.findOne({
        employeeId: new RegExp(`^${targetId}$`, 'i')
      }).select('-password').lean();

      if (employee) {
        return res.json(employee);
      }
    }

    res.status(404).json({ message: 'Employee record not found or invalid QR code' });
  } catch (error) {
    console.error('Verify Employee Error:', error);
    res.status(500).json({ message: 'Server error during employee verification' });
  }
};

export const normalizeDepartment = (dept) => {
  if (!dept) return 'COI (Center Of Information)';
  const d = String(dept).trim().toLowerCase();
  if (d.includes('coi') || d.includes('center of information') || d.includes('hr') || d.includes('telecalling')) {
    return 'COI (Center Of Information)';
  }
  if (d.includes('sales') || d.includes('marketing')) {
    return 'Sales And Marketing';
  }
  if (d.includes('software') || d.includes('dev') || d.includes('engineering') || d.includes('it')) {
    return 'Software Development';
  }
  return dept;
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private/Admin
export const createEmployee = async (req, res) => {
  try {
    const { name, email, phone, department, designation, dateOfBirth, joiningDate, address, emergencyContact, bloodGroup, profilePhoto } = req.body;

    const cleanEmail = email.trim().toLowerCase();
    let customId = req.body.employeeId ? req.body.employeeId.trim().toUpperCase() : null;
    if (customId && customId.includes('@')) {
      customId = null;
    }

    const query = customId ? { $or: [{ email: cleanEmail }, { employeeId: customId }] } : { email: cleanEmail };
    const employeeExists = await Employee.findOne(query);
    if (employeeExists) {
      if (employeeExists.email === cleanEmail) {
        return res.status(400).json({ message: 'Employee with this email already exists' });
      }
      return res.status(400).json({ message: 'Employee with this Employee ID already exists' });
    }

    // Generate unique employee ID if not explicitly provided or invalid
    let employeeId = customId;
    if (!employeeId) {
      const count = await Employee.countDocuments();
      employeeId = `TSMG${(count + 1).toString().padStart(3, '0')}`;
    }
    
    // Default password for new employees (can be changed later)
    const password = (req.body.password && req.body.password.trim() !== '') ? req.body.password.trim() : 'Password@123';

    const empData = {
      employeeId,
      name: name.trim(),
      email: cleanEmail,
      password,
      plainTextPassword: password,
      phone: phone || '9876543210',
      department: normalizeDepartment(department),
      designation,
      joiningDate: safeParseDate(joiningDate) || new Date(),
      address,
      emergencyContact,
      bloodGroup,
      profilePhoto
    };

    if (dateOfBirth) {
      const parsedDOB = safeParseDate(dateOfBirth);
      if (parsedDOB) empData.dateOfBirth = parsedDOB;
    }

    const employee = await Employee.create(empData);

    // Non-blocking async QR code generation in background with canonical permanent URL
    const baseUrl = 'https://ems.thesmgroups.com';
    const verificationUrl = `${baseUrl}/verify/${employeeId}`;
    
    QRCode.toDataURL(verificationUrl, {
      width: 600,
      margin: 3,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'H'
    }).then(qrDataUrl => {
      Employee.findByIdAndUpdate(employee._id, { qrCodeImage: qrDataUrl }).catch(err => {
        console.error('Background QR update failed:', err.message);
      });
    }).catch(qrErr => console.error('Failed to generate background QR code:', qrErr.message));

    // Log activity asynchronously
    ActivityLog.create({
      action: 'Created Employee',
      performedBy: `Admin: ${req.user?.name || 'Admin'}`,
      employeeId: employee._id,
      description: `Created new employee ${name} (${employeeId})`
    }).catch(() => {});

    // Return safe employee record immediately
    const safeEmp = employee.toObject();
    delete safeEmp.password;
    res.status(201).json(safeEmp);
  } catch (error) {
    console.error('Create Employee Error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (employee) {
      if (req.body.name !== undefined) employee.name = req.body.name.trim();
      if (req.body.phone !== undefined) employee.phone = req.body.phone.trim();
      if (req.body.department !== undefined) employee.department = normalizeDepartment(req.body.department);
      if (req.body.designation !== undefined) employee.designation = req.body.designation.trim();
      if (req.body.address !== undefined) employee.address = req.body.address;
      if (req.body.emergencyContact !== undefined) employee.emergencyContact = req.body.emergencyContact;
      if (req.body.bloodGroup !== undefined) employee.bloodGroup = req.body.bloodGroup;
      if (req.body.profilePhoto !== undefined) employee.profilePhoto = req.body.profilePhoto;

      // Handle Email Update with uniqueness check
      if (req.body.email && req.body.email.trim().toLowerCase() !== employee.email) {
        const newEmail = req.body.email.trim().toLowerCase();
        const emailExists = await Employee.findOne({ email: newEmail, _id: { $ne: employee._id } });
        if (emailExists) {
          return res.status(400).json({ message: 'Another employee with this email already exists' });
        }
        employee.email = newEmail;
      }

      // Handle Employee ID Update with uniqueness check
      if (req.body.employeeId && req.body.employeeId.trim().toUpperCase() !== employee.employeeId) {
        const newEmpId = req.body.employeeId.trim().toUpperCase();
        const idExists = await Employee.findOne({ employeeId: newEmpId, _id: { $ne: employee._id } });
        if (idExists) {
          return res.status(400).json({ message: 'Another employee with this Employee ID already exists' });
        }
        employee.employeeId = newEmpId;

        // Auto-regenerate permanent QR for the new ID
        try {
          const baseUrl = 'https://ems.thesmgroups.com';
          employee.qrCodeImage = await QRCode.toDataURL(`${baseUrl}/verify/${newEmpId}`, {
            width: 600,
            margin: 3,
            color: { dark: '#000000', light: '#ffffff' },
            errorCorrectionLevel: 'H'
          });
        } catch (qrErr) {
          console.error('Failed to update QR on ID change:', qrErr);
        }
      }

      // If a new ID card image is being uploaded, save base64 to DB and upload to Drive
      if (req.body.idCardImage !== undefined) {
        employee.idCardImage = req.body.idCardImage; // keep Base64 so <img src> always works reliably

        // Upload to Google Drive in background (non-blocking backup)
        uploadIDCardToDrive({
          base64Data: req.body.idCardImage,
          employeeId: employee.employeeId,
          employeeName: employee.name,
          department: employee.department
        }).then(driveUrl => {
          if (driveUrl) {
            console.log(`✓ ID Card uploaded to Google Drive for ${employee.employeeId}: ${driveUrl}`);
          }
        }).catch(err => console.error('Drive upload failed silently:', err.message));
      }

      if (req.body.dateOfBirth !== undefined) {
        const parsedDOB = safeParseDate(req.body.dateOfBirth);
        if (parsedDOB) employee.dateOfBirth = parsedDOB;
      }
      if (req.body.joiningDate !== undefined && req.body.joiningDate !== '') {
        const parsedJoining = safeParseDate(req.body.joiningDate);
        if (parsedJoining) employee.joiningDate = parsedJoining;
      }
      if (req.body.password && req.body.password.trim() !== '') {
        employee.password = req.body.password.trim();
        employee.plainTextPassword = req.body.password.trim();
      }

      const updatedEmployee = await employee.save();

      // Log activity asynchronously
      ActivityLog.create({
        action: 'Updated Employee',
        performedBy: `Admin: ${req.user?.name || 'Admin'}`,
        employeeId: employee._id,
        description: `Updated details for ${employee.name} (${employee.employeeId})`
      }).catch(() => {});

      const safeEmp = updatedEmployee.toObject();
      delete safeEmp.password;
      res.json(safeEmp);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    console.error('Update Employee Error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update employee status
// @route   PATCH /api/employees/:id/status
// @access  Private/Admin
export const updateEmployeeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const employee = await Employee.findById(req.params.id);

    if (employee) {
      employee.status = status;
      const updatedEmployee = await employee.save();

      // Log activity
      await ActivityLog.create({
        action: `${status === 'Active' ? 'Activated' : 'Deactivated'} Employee`,
        performedBy: `Admin: ${req.user.name}`,
        employeeId: employee._id,
        description: `Changed status of ${employee.name} to ${status}`
      });

      res.json(updatedEmployee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete employee permanently
// @route   DELETE /api/employees/:id
// @access  Private/Admin
export const deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const employee = await Employee.findById(employeeId);

    const empName = employee ? employee.name : 'Employee';
    const empIdStr = employee ? employee.employeeId : employeeId;

    // Delete employee and clean up all associated tasks & attendance records
    await Promise.allSettled([
      Employee.findByIdAndDelete(employeeId),
      Task.deleteMany({ assignedTo: employeeId }),
      Attendance.deleteMany({ $or: [{ employee: employeeId }, { employeeId: empIdStr }] })
    ]);

    if (employee) {
      try {
        await ActivityLog.create({
          action: 'Deleted Employee',
          performedBy: `Admin: ${req.user?.name || 'Admin'}`,
          description: `Permanently deleted employee ${empName} (${empIdStr})`
        });
      } catch (logErr) {}
    }

    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete Employee Error:', error);
    res.status(500).json({ message: 'Server error deleting employee: ' + error.message });
  }
};

// @desc    Generate & save permanent QR code for employee (335x335px for Canva)
// @route   POST /api/employees/:id/generate-qr
// @access  Private/Admin
export const generateEmployeeQR = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Build the public verification URL
    const host = req.get('host') || '';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const baseUrl = process.env.FRONTEND_URL || (isLocal ? 'http://localhost:5173' : 'https://ems.thesmgroups.com');
    const verificationUrl = `${baseUrl}/verify/${employee.employeeId}`;

    // Generate QR at exact Canva size: 335x335px, no margin, pure black/white
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 335,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'H'
    });

    // Save permanently to employee record
    employee.qrCodeImage = qrDataUrl;
    await employee.save();

    await ActivityLog.create({
      action: 'Generated QR Code',
      performedBy: `Admin: ${req.user?.name || 'Admin'}`,
      description: `Generated permanent QR code for ${employee.name} (${employee.employeeId})`
    });

    res.json({ qrCodeImage: qrDataUrl, message: 'QR code generated and saved successfully' });
  } catch (error) {
    console.error('Generate QR Error:', error);
    res.status(500).json({ message: 'Failed to generate QR code: ' + error.message });
  }
};

// @desc    Generate & save permanent QR codes for ALL employees at once (335x335px for Canva)
// @route   POST /api/employees/generate-all-qrs
// @access  Private/Admin
export const generateAllEmployeeQRs = async (req, res) => {
  try {
    const employees = await Employee.find({});
    const host = req.get('host') || '';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const baseUrl = process.env.FRONTEND_URL || (isLocal ? 'http://localhost:5173' : 'https://ems.thesmgroups.com');

    let updatedCount = 0;
    for (let emp of employees) {
      const verificationUrl = `${baseUrl}/verify/${emp.employeeId}`;
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 335,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'H'
      });
      emp.qrCodeImage = qrDataUrl;
      await emp.save();
      updatedCount++;
    }

    await ActivityLog.create({
      action: 'Generated All QR Codes',
      performedBy: `Admin: ${req.user?.name || 'Admin'}`,
      description: `Batch generated permanent 335x335px QR codes for ${updatedCount} employees`
    });

    res.json({ success: true, count: updatedCount, message: `Successfully generated unique QR codes for ${updatedCount} employees.` });
  } catch (error) {
    console.error('Generate All QRs Error:', error);
    res.status(500).json({ message: 'Failed to batch generate QR codes: ' + error.message });
  }
};

