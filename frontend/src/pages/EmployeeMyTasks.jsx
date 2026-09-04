import React, { useEffect, useState } from 'react';
import API, { clearApiCache } from '../services/api';
import { 
  CheckSquare, 
  Award, 
  Calendar,
  ChevronDown,
  Clock,
  Sparkles,
  CheckCircle2,
  Ban,
  ClipboardList
} from 'lucide-react';

const EmployeeMyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Completed': 
        return 'badge-success';
      case 'Pending Review': 
        return 'badge-purple';
      case 'In Progress': 
        return 'badge-info';
      case 'Cancelled': 
        return 'badge-neutral';
      default: 
        return 'badge-warning';
    }
  };

  const getPriorityBadgeStyle = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-rose-50 text-rose-700 border-rose-200/80 font-extrabold';
      case 'High': return 'bg-amber-50 text-amber-800 border-amber-200/80 font-extrabold';
      case 'Medium': return 'bg-indigo-50 text-indigo-700 border-indigo-200/80 font-bold';
      default: return 'bg-slate-100 text-slate-600 border-slate-200/80 font-semibold';
    }
  };

  const fetchMyTasks = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data } = await API.get('/tasks/employee');
      setTasks(data);
    } catch (err) {
      console.error('Failed to load employee tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    setSuccessBanner('Completion approval sent to Admin successfully!');
    clearApiCache();

    try {
      await API.patch(`/tasks/${taskId}/status`, { status: newStatus });
      clearApiCache();
    } catch (err) {
      console.error('Failed to update task status:', err);
      fetchMyTasks(true);
    }
  };

  const filteredTasks = tasks.filter(t => statusFilter === 'All' || t.status === statusFilter);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Assigned Objectives</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Track deliverables, submit completed tasks for Admin approval, and earn performance points.</p>
        </div>
      </div>

      {successBanner && (
        <div className="bg-emerald-50 border border-emerald-300/80 text-emerald-900 p-4 rounded-2xl text-xs flex items-center justify-between shadow-2xs font-semibold animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-extrabold">{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-500 hover:text-emerald-800 p-1">
            <Ban className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Filter Objectives:</span>

        <div className="flex flex-wrap gap-2">
          {['All', 'In Progress', 'Pending Review', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl text-center py-16 space-y-3 border border-slate-200/80 shadow-2xs">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No matching tasks</h3>
          <p className="text-xs text-slate-500 font-medium">No objectives assigned matching this status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTasks.map((task) => (
            <div 
              key={task._id} 
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] border ${getPriorityBadgeStyle(task.priority)}`}>
                    {task.priority} Priority
                  </span>
                  <span className="text-xs font-black text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/70 inline-flex items-center gap-1.5 shadow-2xs">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    +{task.points} Pts
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-800 mt-1 leading-relaxed font-bold">{task.description}</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-1.5 font-mono text-xs text-slate-800 font-bold shrink-0 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-slate-600" />
                  <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB') : 'N/A'}</span>
                </div>

                <div className="flex items-center gap-2">
                  {task.status === 'In Progress' ? (
                    <button
                      onClick={() => handleStatusChange(task._id, 'Pending Review')}
                      className="btn-primary text-xs bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-1.5 px-3 rounded-xl flex items-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all"
                      title="Send Completion Approval to Admin"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Send Approval</span>
                    </button>
                  ) : task.status === 'Pending Review' ? (
                    <span className="badge-purple">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                      Approval Pending
                    </span>
                  ) : task.status === 'Completed' ? (
                    <span className="badge-success">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Completed (+{task.points} Pts)
                    </span>
                  ) : (
                    <span className={getStatusBadgeStyle(task.status)}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      <span>{task.status}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeMyTasks;

