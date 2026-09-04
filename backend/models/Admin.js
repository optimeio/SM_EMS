import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin'
  }
}, { timestamps: true });

// Hash password before saving
adminSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  if (/^\$2[aby]\$/.test(this.password)) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
adminSchema.methods.matchPassword = async function (enteredPassword) {
  if (!enteredPassword || !this.password) return false;
  const cleanEntered = enteredPassword.trim();
  if (this.password === cleanEntered || this.password.trim().toLowerCase() === cleanEntered.toLowerCase()) {
    return true;
  }
  try {
    return await bcrypt.compare(cleanEntered, this.password);
  } catch (e) {
    return false;
  }
};

export default mongoose.model('Admin', adminSchema);
