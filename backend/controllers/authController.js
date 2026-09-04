import Admin from '../models/Admin.js';
import Employee from '../models/Employee.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth user (admin or employee) & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  const cleanIdentifier = (email || '').trim();
  const cleanPassword = (password || '').trim();

  if (!cleanIdentifier || !cleanPassword) {
    return res.status(400).json({ message: 'Please enter both Employee ID/Email and Password' });
  }

  try {
    const escapedId = cleanIdentifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const idRegex = new RegExp(`^${escapedId}$`, 'i');

    // 1. First check Admin collection (by email, name, or regex match)
    let adminUser = await Admin.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { email: cleanIdentifier },
        { email: idRegex },
        { name: idRegex }
      ]
    });
    
    if (adminUser && (await adminUser.matchPassword(cleanPassword))) {
      return res.json({
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role || 'admin',
        token: generateToken(adminUser._id),
      });
    }

    // 2. Fallback: If cleanIdentifier is "admin" or starts with "admin", test primary Admin account
    if (cleanIdentifier.toLowerCase() === 'admin' || cleanIdentifier.toLowerCase() === 'admin@company.com') {
      const mainAdmin = await Admin.findOne({ email: 'admin@company.com' });
      if (mainAdmin && (await mainAdmin.matchPassword(cleanPassword))) {
        return res.json({
          _id: mainAdmin._id,
          name: mainAdmin.name,
          email: mainAdmin.email,
          role: 'admin',
          token: generateToken(mainAdmin._id),
        });
      }
    }

    // 3. Check Employee collection (by email or employeeId)
    let empUser = await Employee.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { employeeId: cleanIdentifier.toUpperCase() },
        { email: cleanIdentifier },
        { employeeId: cleanIdentifier },
        { employeeId: idRegex },
        { email: idRegex }
      ]
    });
    
    if (empUser && (await empUser.matchPassword(cleanPassword))) {
      // Check status
      if (empUser.status === 'Inactive') {
        return res.status(401).json({ message: 'Account is inactive. Please contact admin.' });
      }

      return res.json({
        _id: empUser._id,
        employeeId: empUser.employeeId,
        name: empUser.name,
        email: empUser.email,
        role: empUser.role || 'employee',
        department: empUser.department,
        designation: empUser.designation,
        totalPoints: empUser.totalPoints,
        plainTextPassword: empUser.plainTextPassword,
        token: generateToken(empUser._id),
      });
    }

    res.status(401).json({ message: 'Invalid Employee ID/Email or Password' });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login: ' + error.message });
  }
};
