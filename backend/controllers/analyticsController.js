import Employee from '../models/Employee.js';
import Task from '../models/Task.js';

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'Active' });
    const inactiveEmployees = await Employee.countDocuments({ status: 'Inactive' });

    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({ status: 'Pending' });
    const inProgressTasks = await Task.countDocuments({ status: 'In Progress' });
    const completedTasks = await Task.countDocuments({ status: 'Completed' });

    // Sum of points of all completed tasks
    const completedTaskData = await Task.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, totalPoints: { $sum: '$points' } } }
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
      .limit(10); // Top 10

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get employee performance details
// @route   GET /api/performance/:id
// @access  Private/Admin
export const getEmployeePerformance = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const employee = await Employee.findById(employeeId).select('-password');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const tasks = await Task.find({ assignedTo: employeeId });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
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
    res.status(500).json({ message: 'Server error' });
  }
};
