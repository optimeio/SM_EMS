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
    // 1. First check if it's an admin
    let user = await Admin.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { email: cleanIdentifier }
      ]
    });
    
    if (user && (await user.matchPassword(cleanPassword))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }

    // 2. Then check if it's an employee (by email or employeeId, case-insensitive & trimmed)
    const escapedId = cleanIdentifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    user = await Employee.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { employeeId: cleanIdentifier.toUpperCase() },
        { email: cleanIdentifier },
        { employeeId: cleanIdentifier },
        { employeeId: { $regex: new RegExp(`^${escapedId}$`, 'i') } },
        { email: { $regex: new RegExp(`^${escapedId}$`, 'i') } }
      ]
    });
    
    if (user && (await user.matchPassword(cleanPassword))) {
      // Check status
      if (user.status === 'Inactive') {
        return res.status(401).json({ message: 'Account is inactive. Please contact admin.' });
      }

      return res.json({
        _id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        totalPoints: user.totalPoints,
        plainTextPassword: user.plainTextPassword,
        token: generateToken(user._id),
      });
    }

    res.status(401).json({ message: 'Invalid Employee ID/Email or Password' });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login: ' + error.message });
  }
};
