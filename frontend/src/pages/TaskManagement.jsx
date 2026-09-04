import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import LogoSpinner from '../components/LogoSpinner';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Award, 
  X, 
  UserCheck,
  Calendar,
  AlertTriangle,
  ChevronDown,
  Clock,
  Sparkles,
  CheckCircle2,
  Ban,
  Layers
} from 'lucide-react';

const TaskManagement = () => {
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTaskObj, setDeleteTaskObj] = useState(null);
  const [activeDropdownTaskId, setActiveDropdownTaskId] = useState(null);

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Completed': 
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/90 hover:bg-emerald-100/80';
      case 'Pending Review': 
        return 'bg-purple-50 text-purple-700 border-purple-200/90 hover:bg-purple-100/80';
      case 'In Progress': 
        return 'bg-sky-50 text-sky-700 border-sky-200/90 hover:bg-sky-100/80';
      case 'Cancelled': 
        return 'bg-slate-100 text-slate-600 border-slate-200/90 hover:bg-slate-200/80';
      default: 
        return 'bg-amber-50 text-amber-700 border-amber-200/90 hover:bg-amber-100/80';
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500';
      case 'Pending Review': return 'bg-purple-500 animate-pulse';
      case 'In Progress': return 'bg-sky-500';
      case 'Cancelled': return 'bg-slate-400';
      default: return 'bg-amber-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Pending Review': return <Clock className="w-3.5 h-3.5 text-purple-600" />;
      case 'In Progress': return <Sparkles className="w-3.5 h-3.5 text-sky-600" />;
      case 'Cancelled': return <Ban className="w-3.5 h-3.5 text-slate-400" />;
      default: return <Clock className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  const getPriorityBadgeStyle = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-rose-50 text-rose-700 border-rose-200/80 font-bold';
      case 'High': return 'bg-amber-50 text-amber-800 border-amber-200/80 font-bold';
      case 'Medium': return 'bg-indigo-50 text-indigo-700 border-indigo-200/80 font-semibold';
      default: return 'bg-slate-100 text-slate-600 border-slate-200/80 font-medium';
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    points: 20,
    priority: 'Medium',
    dueDate: '',
  });

  const [successBanner, setSuccessBanner] = useState(null);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const fetchInitialData = async (silent = false) => {
    try {
      if (!silent && tasks.length === 0) setLoading(true);
      const [tasksRes, empRes] = await Promise.all([
        API.get('/tasks'),
        API.get('/employees')
      ]);
      setTasks(tasksRes.data);
      const activeEmps = empRes.data.filter(e => e.status === 'Active');
      setEmployees(activeEmps);
      if (activeEmps.length > 0 && !formData.assignedTo) {
        setFormData(prev => ({ ...prev, assignedTo: activeEmps[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    if (searchParams.get('add') === 'true') {
      setShowAddModal(true);
    }
  }, [searchParams]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError(null);
    setSuccessBanner(null);
    setIsSubmitting(true);
    try {
      await API.post('/tasks', {
        ...formData,
        status: 'In Progress'
      });
      setShowAddModal(false);
      resetForm();
      setSuccessBanner('Task assigned successfully! It is now active under In Progress.');
      await fetchInitialData(true);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError(null);
    setSuccessBanner(null);
    setIsSubmitting(true);
    try {
      await API.put(`/tasks/${editTask._id}`, formData);
      setEditTask(null);
      resetForm();
      setSuccessBanner('Task updated successfully.');
      await fetchInitialData(true);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setUpdatingTaskId(taskId);
      setSuccessBanner(null);
      await API.patch(`/tasks/${taskId}/status`, { status: newStatus });
      if (newStatus === 'Completed') {
        setSuccessBanner('Task completion approved successfully! Performance points awarded to employee.');
      } else if (newStatus === 'In Progress') {
        setSuccessBanner('Task sent back to employee for revision.');
      } else if (newStatus === 'Pending Review') {
        setSuccessBanner('Task status changed to Pending Review.');
      }
      await fetchInitialData(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskObj) return;
    try {
      await API.delete(`/tasks/${deleteTaskObj._id}`);
      setDeleteTaskObj(null);
      fetchInitialData();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: employees[0]?._id || '',
      points: 20,
      priority: 'Medium',
      dueDate: '',
    });
    setFormError(null);
  };

  const openEditModal = (task) => {
    setEditTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo?._id || task.assignedTo,
      points: task.points,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.assignedTo?.name && t.assignedTo.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchesDept = deptFilter === 'All' || (t.assignedTo?.department ? t.assignedTo.department === deptFilter : false);

    return matchesSearch && matchesStatus && matchesPriority && matchesDept;
  });

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Task Management</h1>
          <p className="text-sm text-slate-500 mt-1">Assign objectives, set performance points, and track delivery progress.</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="btn-primary text-sm shadow-md py-2.5 px-4"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {successBanner && (
        <div className="badge-success p-4 rounded-2xl text-xs flex items-center justify-between shadow-2xs font-semibold animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-emerald-950 font-bold">{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-500 hover:text-emerald-800 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Summary Bar — Run Beyond Style with Hover Highlight */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Tasks */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 hover:border-indigo-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between cursor-pointer min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate group-hover:text-indigo-600 transition-colors">Total Tasks</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <span className="text-xl sm:text-3xl font-black text-slate-900 tabular-nums tracking-tight">{totalTasks}</span>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">Total assigned tasks</p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 hover:border-amber-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between cursor-pointer min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate group-hover:text-amber-600 transition-colors">Pending</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <span className="text-xl sm:text-3xl font-black text-slate-900 tabular-nums tracking-tight">{pendingTasks}</span>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">Awaiting action</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 hover:border-sky-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between cursor-pointer min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate group-hover:text-sky-600 transition-colors">In Progress</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <span className="text-xl sm:text-3xl font-black text-slate-900 tabular-nums tracking-tight">{inProgressTasks}</span>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">Currently active</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between cursor-pointer min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate group-hover:text-emerald-600 transition-colors">Completed</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <span className="text-xl sm:text-3xl font-black text-slate-900 tabular-nums tracking-tight">{completedTasks}</span>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">Successfully delivered</p>
          </div>
        </div>
      </div>

      {/* Filter Bar with Department Filter */}
      <div className="card-saas grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 border border-slate-200/80">
        <div className="sm:col-span-2 relative">
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search tasks by title or assignee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-saas w-full pl-10 text-sm py-2"
          />
        </div>

        <div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="input-saas w-full text-sm py-2 font-medium"
          >
            <option value="All">All Departments</option>
            <option value="COI (Center Of Information)">COI (Center Of Information)</option>
            <option value="Sales And Marketing">Sales And Marketing</option>
            <option value="Software Development">Software Development</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-saas w-full text-sm py-2 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input-saas w-full text-sm py-2 font-medium"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Task Cards Grid */}
      {loading ? (
        <LogoSpinner label="Syncing enterprise tasks..." />
      ) : filteredTasks.length === 0 ? (
        <div className="card-saas text-center py-16 space-y-3 border border-slate-200/80">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No tasks found</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or create a new task.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map((task) => (
            <div 
              key={task._id} 
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative"
            >
              <div className="space-y-3">
                {/* Card Top Header: Badges + Edit/Delete Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs border ${getPriorityBadgeStyle(task.priority)}`}>
                      {task.priority} Priority
                    </span>

                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/70 inline-flex items-center gap-1.5 shadow-2xs">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      +{task.points} Pts
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteTaskObj(task)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed font-normal">
                    {task.description}
                  </p>
                </div>
              </div>

              {/* Bottom Details Footer */}
              <div className="space-y-3 pt-3 mt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  {/* Assignee Pill */}
                  <div className="flex items-center gap-2 font-semibold text-slate-800 truncate">
                    <div className="w-6.5 h-6.5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-extrabold text-slate-700 shrink-0">
                      {task.assignedTo?.name ? task.assignedTo.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="truncate text-xs font-bold">{task.assignedTo?.name || 'Unassigned'}</span>
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 font-medium shrink-0 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{new Date(task.dueDate).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>

                {/* Status & Review Actions */}
                <div className="pt-1 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                    
                    {/* Status Dropdown Button */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveDropdownTaskId(activeDropdownTaskId === task._id ? null : task._id)}
                        className={`text-xs font-bold py-1 px-3 rounded-full border transition-all flex items-center gap-1.5 shadow-2xs ${getStatusBadgeStyle(task.status)}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${getStatusDotColor(task.status)}`}></span>
                        <span>{task.status}</span>
                        <ChevronDown className="w-3 h-3 text-slate-400 opacity-70 group-hover:opacity-100" />
                      </button>
                      
                      {activeDropdownTaskId === task._id && (
                        <>
                          <div 
                            className="fixed inset-0 z-30" 
                            onClick={() => setActiveDropdownTaskId(null)}
                          />
                          <div className="absolute right-0 bottom-full mb-1 z-40 w-44 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-2xl p-1.5 space-y-1 animate-fade-in ring-1 ring-slate-900/5">
                            <div className="px-2 py-1 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Change Task Status
                            </div>
                            {['In Progress', 'Pending Review', 'Completed', 'Cancelled'].map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => {
                                  handleStatusChange(task._id, status);
                                  setActiveDropdownTaskId(null);
                                }}
                                className={`w-full text-left px-2.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-between ${
                                  task.status === status 
                                    ? 'bg-slate-900 text-white font-bold shadow-2xs' 
                                    : 'hover:bg-slate-100 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(status)}
                                  <span>{status}</span>
                                </div>
                                {task.status === status && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                )}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Dedicated Approval Bar for Pending Review Tasks */}
                  {task.status === 'Pending Review' && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleStatusChange(task._id, 'Completed')}
                        disabled={updatingTaskId === task._id}
                        className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs font-bold transition-all"
                        title="Approve Task Completion"
                      >
                        {updatingTaskId === task._id ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>{updatingTaskId === task._id ? 'Approving...' : 'Approve'}</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(task._id, 'In Progress')}
                        disabled={updatingTaskId === task._id}
                        className="btn-secondary text-xs bg-amber-50 hover:bg-amber-100 disabled:bg-slate-100 text-amber-900 border-amber-200/80 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 font-bold transition-all"
                        title="Request Changes / Revise"
                      >
                        {updatingTaskId === task._id ? (
                          <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Ban className="w-4 h-4 text-amber-600" />
                        )}
                        <span>{updatingTaskId === task._id ? 'Revising...' : 'Revise'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTaskObj && createPortal(
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl my-auto">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Delete Task</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Are you sure you want to delete task <strong className="text-slate-900">"{deleteTaskObj.title}"</strong>?
            </p>
            {deleteTaskObj.status === 'Completed' && (
              <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200/60 font-medium">
                Note: Deleting a completed task will deduct {deleteTaskObj.points} points awarded to the employee.
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTaskObj(null)}
                className="btn-secondary text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                className="btn-danger text-xs rounded-xl"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add / Edit Task Modal */}
      {(showAddModal || editTask) && createPortal(
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-lg w-full relative space-y-4 shadow-2xl my-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditTask(null);
              }}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">
              {editTask ? `Edit Task: ${editTask.title}` : 'Create & Assign Task'}
            </h3>

            {formError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={editTask ? handleEditTask : handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-saas w-full text-sm"
                  placeholder="e.g. Develop Login API"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-saas w-full text-sm resize-none"
                  placeholder="Task guidelines and deliverables..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Employee</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="input-saas text-sm w-full truncate font-medium"
                    required
                  >
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Points</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                    className="input-saas text-sm w-full font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="input-saas text-sm w-full font-medium"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="input-saas text-sm w-full font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setShowAddModal(false);
                    setEditTask(null);
                  }}
                  className="btn-secondary text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-primary text-xs rounded-xl flex items-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Task...</span>
                    </>
                  ) : (
                    <span>{editTask ? 'Save Changes' : 'Create Task'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TaskManagement;
