import Task from '../models/Task.js';
import Employee from '../models/Employee.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc    Get all tasks (Admin)
// @route   GET /api/tasks
// @access  Private/Admin
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({}).populate('assignedTo', 'name employeeId department designation');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name employeeId');
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
      title,
      description,
      assignedTo,
      points,
      priority,
      dueDate,
      createdBy: req.user._id
    });

    const employee = await Employee.findById(assignedTo);

    await ActivityLog.create({
      action: 'Created Task',
      performedBy: `Admin: ${req.user.name}`,
      employeeId: assignedTo,
      taskId: task._id,
      description: `Assigned task "${title}" to ${employee.name}`
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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
      task.description = req.body.description || task.description;
      task.points = req.body.points || task.points;
      task.priority = req.body.priority || task.priority;
      task.dueDate = req.body.dueDate || task.dueDate;
      
      // If assignment changed
      if (req.body.assignedTo && req.body.assignedTo !== task.assignedTo.toString()) {
        task.assignedTo = req.body.assignedTo;
      }

      const updatedTask = await task.save();

      await ActivityLog.create({
        action: 'Updated Task',
        performedBy: `Admin: ${req.user.name}`,
        taskId: task._id,
        description: `Updated details for task "${task.title}"`
      });

      res.json(updatedTask);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update task status (Admin & Employee)
// @route   PATCH /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (task) {
      const oldStatus = task.status;
      task.status = status;

      // If marked as completed
      if (status === 'Completed' && oldStatus !== 'Completed') {
        task.completedAt = Date.now();
        
        // Award points to employee
        const employee = await Employee.findById(task.assignedTo);
        if (employee) {
          employee.totalPoints += task.points;
          await employee.save();
        }
      }
      
      // If status reverted from completed, subtract points
      if (status !== 'Completed' && oldStatus === 'Completed') {
        task.completedAt = undefined;
        const employee = await Employee.findById(task.assignedTo);
        if (employee) {
          employee.totalPoints -= task.points;
          await employee.save();
        }
      }

      const updatedTask = await task.save();

      let performer = (req.user && req.user.role === 'admin')
        ? `Admin: ${req.user.name}`
        : (req.user ? `Employee: ${req.user.name}` : 'System');
      
      await ActivityLog.create({
        action: 'Updated Task Status',
        performedBy: performer,
        taskId: task._id,
        employeeId: task.assignedTo,
        description: `Changed status of task "${task.title}" to ${status}`
      });

      res.json(updatedTask);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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

      await ActivityLog.create({
        action: 'Deleted Task',
        performedBy: `Admin: ${req.user.name}`,
        description: `Deleted task "${task.title}"`
      });

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
    const tasks = await Task.find({ assignedTo: req.user._id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
