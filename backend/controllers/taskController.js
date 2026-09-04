import Task from '../models/Task.js';
import Employee from '../models/Employee.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc    Get all tasks (Admin)
// @route   GET /api/tasks
// @access  Private/Admin
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({})
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name employeeId department designation')
      .lean();
    res.json(tasks);
  } catch (error) {
    console.error('Get Tasks Error:', error);
    res.status(500).json({ message: 'Server error fetching tasks.' });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name employeeId department designation');
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, points, priority, dueDate } = req.body;

    if (!title || !title.trim() || !assignedTo) {
      return res.status(400).json({ message: 'Task title and assigned employee are required.' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      assignedTo,
      points: points ? Number(points) : 20,
      priority: priority || 'Medium',
      dueDate: dueDate || new Date(),
      status: 'In Progress', // ALWAYS automatically set to 'In Progress' upon assignment
      createdBy: req.user._id
    });

    try {
      const employee = await Employee.findById(assignedTo);
      await ActivityLog.create({
        action: 'Created Task',
        performedBy: req.user ? `Admin: ${req.user.name}` : 'Admin',
        employeeId: assignedTo,
        taskId: task._id,
        description: `Assigned task "${title}" to ${employee ? employee.name : 'Employee'}`
      });
    } catch (logErr) {
      console.error('Failed to log activity for created task:', logErr);
    }

    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name employeeId department designation');

    res.status(201).json(populatedTask || task);
  } catch (error) {
    console.error('Create Task Error:', error);
    res.status(500).json({ message: 'Server error creating task: ' + error.message });
  }
};

// @desc    Update task details (Admin)
// @route   PUT /api/tasks/:id
// @access  Private/Admin
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      task.title = req.body.title || task.title;
      task.description = req.body.description !== undefined ? req.body.description : task.description;
      task.points = req.body.points || task.points;
      task.priority = req.body.priority || task.priority;
      task.dueDate = req.body.dueDate || task.dueDate;
      
      // If assignment changed
      if (req.body.assignedTo && req.body.assignedTo !== task.assignedTo.toString()) {
        task.assignedTo = req.body.assignedTo;
      }

      await task.save();

      const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name employeeId department designation');

      try {
        await ActivityLog.create({
          action: 'Updated Task',
          performedBy: req.user ? `Admin: ${req.user.name}` : 'Admin',
          taskId: task._id,
          description: `Updated details for task "${task.title}"`
        });
      } catch (logErr) {
        console.error('Failed to log activity for updated task:', logErr);
      }

      res.json(populatedTask || task);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error updating task: ' + error.message });
  }
};

// @desc    Update task status (Admin & Employee)
// @route   PATCH /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const oldStatus = task.status;
    task.status = status;

    if (status === 'Completed' && oldStatus !== 'Completed') {
      task.completedAt = Date.now();
    } else if (status !== 'Completed') {
      task.completedAt = undefined;
    }

    await task.save();

    // Safely update employee points without throwing schema errors
    const empId = task.assignedTo?._id || task.assignedTo;
    if (empId) {
      try {
        const employee = await Employee.findById(empId);
        if (employee) {
          if (status === 'Completed' && oldStatus !== 'Completed') {
            employee.totalPoints = (employee.totalPoints || 0) + (task.points || 20);
            await employee.save();
          } else if (status !== 'Completed' && oldStatus === 'Completed') {
            employee.totalPoints = Math.max(0, (employee.totalPoints || 0) - (task.points || 20));
            await employee.save();
          }
        }
      } catch (empErr) {
        console.error('Failed to update employee points:', empErr);
      }
    }

    // Safely log activity
    try {
      let performer = (req.user && req.user.role === 'admin')
        ? `Admin: ${req.user.name}`
        : (req.user ? `Employee: ${req.user.name}` : 'System');

      await ActivityLog.create({
        action: 'Updated Task Status',
        performedBy: performer,
        taskId: task._id,
        employeeId: empId,
        description: `Changed status of task "${task.title}" to ${status}`
      });
    } catch (logErr) {
      console.error('Failed to log activity for task status change:', logErr);
    }

    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name employeeId department designation');

    return res.json(populatedTask || task);
  } catch (error) {
    console.error('Update Task Status Error:', error);
    return res.status(500).json({ message: 'Server error updating task status: ' + error.message });
  }
};

// @desc    Delete a task (Admin)
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      await Task.deleteOne({ _id: task._id });

      // Deduct points if deleted while completed
      if (task.status === 'Completed') {
        const employee = await Employee.findById(task.assignedTo);
        if (employee) {
          employee.totalPoints -= task.points;
          await employee.save();
        }
      }

      try {
        await ActivityLog.create({
          action: 'Deleted Task',
          performedBy: `Admin: ${req.user.name}`,
          description: `Deleted task "${task.title}"`
        });
      } catch (logErr) {}

      res.json({ message: 'Task removed' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get employee's assigned tasks (Employee view)
// @route   GET /api/tasks/employee
// @access  Private/Employee
export const getMyTasks = async (req, res) => {
  try {
    let empId = req.user._id;
    if (!empId && req.user.email) {
      const emp = await Employee.findOne({ email: req.user.email });
      if (emp) empId = emp._id;
    }

    const tasks = await Task.find({ assignedTo: empId })
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name employeeId department designation');

    res.json(tasks);
  } catch (error) {
    console.error('Get My Tasks Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
