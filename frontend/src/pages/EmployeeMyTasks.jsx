import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { 
  CheckSquare, 
  Award, 
  Calendar,
  ChevronDown,
  Clock,
  Sparkles,
  CheckCircle2,
  Ban
} from 'lucide-react';

const EmployeeMyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeDropdownTaskId, setActiveDropdownTaskId] = useState(null);

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Completed': 
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/90 hover:bg-emerald-100/80';
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
      case 'In Progress': return 'bg-sky-500';
      case 'Cancelled': return 'bg-slate-400';
      default: return 'bg-amber-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
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

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
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
    try {
      await API.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchMyTasks();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const filteredTasks = tasks.filter(t => statusFilter === 'All' || t.status === statusFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Assigned Objectives</h1>
          <p className="text-sm text-slate-500 mt-1">Track deliverables, update status to Completed, and earn performance points.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card-saas p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200/80">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter Tasks:</span>

        <div className="flex flex-wrap gap-2">
          {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold'
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
        <div className="card-saas text-center py-16 space-y-3 border border-slate-200/80">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No tasks found</h3>
          <p className="text-xs text-slate-500">Your assigned tasks will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTasks.map((task) => (
            <div 
              key={task._id} 
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs border ${getPriorityBadgeStyle(task.priority)}`}>
                    {task.priority} Priority
                  </span>
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/70 inline-flex items-center gap-1.5 shadow-2xs">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    +{task.points} Pts
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">{task.description}</p>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 font-medium shrink-0 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB') : 'N/A'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Status:</span>
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdownTaskId(activeDropdownTaskId === task._id ? null : task._id)}
                      className={`text-xs font-bold py-1.5 px-3 rounded-full border transition-all flex items-center gap-1.5 shadow-2xs ${getStatusBadgeStyle(task.status)}`}
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
                        <div className="absolute right-0 bottom-full mb-2 z-40 w-44 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-2xl p-1.5 space-y-1 animate-fade-in ring-1 ring-slate-900/5">
                          <div className="px-2 py-1 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Update Status
                          </div>
                          {['Pending', 'In Progress', 'Completed'].map((status) => (
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeMyTasks;
