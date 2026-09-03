import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    index: true
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  department: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true,
    index: true
  }, // Format: YYYY-MM-DD
  checkIn: {
    type: Date,
    required: true
  },
  checkInPhoto: {
    fileId: { type: String },
    fileName: { type: String, required: true },
    driveUrl: { type: String },
    localPath: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  },
  checkOut: {
    type: Date
  },
  workingHours: {
    type: String // e.g. "8h 53m"
  },
  status: {
    type: String,
    enum: ['Present', 'Checked Out', 'Absent'],
    default: 'Present'
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  },
  checkOutLocation: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  }
}, {
  timestamps: true
});

// Enforce strictly ONE check-in per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
