import ActivityLog from '../models/ActivityLog.js';

// @desc    Get recent activity logs
// @route   GET /api/activity-logs
// @access  Private/Admin
export const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({})
      .populate('employeeId', 'name employeeId')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
