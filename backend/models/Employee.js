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
  password: { // Employee will need password to login to their dashboard
    type: String,
    required: true
  },
  plainTextPassword: { // Stored for Admin credential management display
    type: String,
    default: 'Password@123'
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

employeeSchema.index({ status: 1 });
employeeSchema.index({ department: 1 });

// Hash password before saving
employeeSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  // Check if password is already a bcrypt hash
  if (/^\$2[aby]\$/.test(this.password)) {
    return;
  }
  // Set plainTextPassword if not already set or updated
  if (!this.plainTextPassword || this.isModified('password')) {
    this.plainTextPassword = this.password;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
employeeSchema.methods.matchPassword = async function (enteredPassword) {
  if (!enteredPassword || !this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('Employee', employeeSchema);
