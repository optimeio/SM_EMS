import Employee from '../models/Employee.js';
import Task from '../models/Task.js';

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      completedTaskData
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'Active' }),
      Employee.countDocuments({ status: 'Inactive' }),
      Task.countDocuments(),
      Task.countDocuments({ status: 'Pending' }),
      Task.countDocuments({ status: 'In Progress' }),
      Task.countDocuments({ status: 'Completed' }),
      Task.aggregate([
        { $match: { status: 'Completed' } },
        { $group: { _id: null, totalPoints: { $sum: '$points' } } }
      ])
    ]);

    const totalPoints = completedTaskData.length > 0 ? completedTaskData[0].totalPoints : 0;

    res.json({
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      totalPoints
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get leaderboard
// @route   GET /api/performance/leaderboard
// @access  Private/Admin
export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Employee.find({ status: 'Active' })
      .select('name employeeId department designation totalPoints profilePhoto')
      .sort({ totalPoints: -1 }) // Sort descending
      .limit(10)
      .lean();

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
};

// @desc    Get employee performance details
// @route   GET /api/performance/:id
// @access  Private/Admin
export const getEmployeePerformance = async (req, res) => {
  try {
    const employeeId = req.params.id;

    const [employee, tasks, totalTasks, completedTasks, pendingTasks] = await Promise.all([
      Employee.findById(employeeId).select('-password -idCardImage -qrCodeImage').lean(),
      Task.find({ assignedTo: employeeId }).sort({ createdAt: -1 }).lean(),
      Task.countDocuments({ assignedTo: employeeId }),
      Task.countDocuments({ assignedTo: employeeId, status: 'Completed' }),
      Task.countDocuments({ assignedTo: employeeId, status: 'Pending' })
    ]);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      employee,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate
      },
      tasks
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching performance' });
  }
};
