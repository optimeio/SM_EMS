import Employee from '../models/Employee.js';
import Task from '../models/Task.js';

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const [empStats, taskStats] = await Promise.all([
      Employee.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalPoints: {
              $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, '$points', 0] }
            }
          }
        }
      ])
    ]);

    let activeEmployees = 0;
    let inactiveEmployees = 0;
    let totalEmployees = 0;

    for (const item of empStats) {
      totalEmployees += item.count;
      if (item._id === 'Active') activeEmployees = item.count;
      if (item._id === 'Inactive') inactiveEmployees = item.count;
    }

    let totalTasks = 0;
    let pendingTasks = 0;
    let inProgressTasks = 0;
    let completedTasks = 0;
    let totalPoints = 0;

    for (const item of taskStats) {
      totalTasks += item.count;
      if (item._id === 'Pending') pendingTasks = item.count;
      if (item._id === 'In Progress') inProgressTasks = item.count;
      if (item._id === 'Completed') {
        completedTasks = item.count;
        totalPoints = item.totalPoints || 0;
      }
    }

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
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
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
