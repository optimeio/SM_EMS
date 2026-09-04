import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: { // Employee password for dashboard login
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date
  },
  joiningDate: {
    type: Date,
    required: true
  },
  address: {
    type: String
  },
  emergencyContact: {
    type: String
  },
  bloodGroup: {
    type: String
  },
  profilePhoto: {
    type: String // URL or base64
  },
  idCardImage: {
    type: String // URL or base64 of generated Canva ID card
  },
  qrCodeImage: {
    type: String // base64 PNG of generated QR code (335x335px for Canva)
  },
  role: {
    type: String,
    default: 'employee'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  totalPoints: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

employeeSchema.index({ status: 1, department: 1 });
employeeSchema.index({ name: 'text', employeeId: 'text', email: 'text' });

// Hash password before saving
employeeSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  // Check if password is already a bcrypt hash
  if (/^\$2[aby]\$/.test(this.password)) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password securely using bcrypt
employeeSchema.methods.matchPassword = async function (enteredPassword) {
  if (!enteredPassword) return false;
  const cleanEntered = enteredPassword.trim();

  // If password stored in DB is already hashed
  if (this.password && /^\$2[aby]\$/.test(this.password)) {
    try {
      return await bcrypt.compare(cleanEntered, this.password);
    } catch (e) {
      return false;
    }
  }

  // Fallback for raw legacy unhashed password before background migration runs
  if (this.password && (this.password === cleanEntered || this.password.trim().toLowerCase() === cleanEntered.toLowerCase())) {
    return true;
  }

  return false;
};

export default mongoose.model('Employee', employeeSchema);
