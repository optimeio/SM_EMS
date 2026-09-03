import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  performedBy: {
    type: String, // Can store "Admin: Name" or "Employee: Name"
    required: true
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  description: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('ActivityLog', activityLogSchema);
