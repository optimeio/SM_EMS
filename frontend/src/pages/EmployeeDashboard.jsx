import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { 
  CheckSquare, 
  Clock, 
  CheckCircle, 
  Award, 
  QrCode,
  ArrowRight,
  ClipboardList
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const assignedCount = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Premium Light Welcome Card */}
      <div className="card-saas bg-white border border-slate-200/90 shadow-sm p-6 sm:p-7 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt={user?.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center text-xl shadow-xs shrink-0">
              {user?.name?.[0]}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Welcome back, {user?.name}!</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              {user?.designation} • <span className="text-slate-700 font-semibold">{user?.department} Department</span>
            </p>
            <span className="inline-flex items-center font-mono text-xs text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/80 font-semibold mt-2">
              ID: {user?.employeeId}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <Link to="/employee/attendance" className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600/20 shadow-emerald-600/10 shadow-sm border border-emerald-500/20">
            <CheckSquare className="w-4 h-4" />
            Check In
          </Link>
          <Link to="/employee/tasks" className="btn-secondary text-xs bg-white">
            <CheckSquare className="w-4 h-4 text-slate-500" />
            My Tasks
          </Link>
          <Link to={`/verify/${user?.employeeId}`} target="_blank" className="btn-secondary text-xs bg-white">
            <QrCode className="w-4 h-4 text-slate-500" />
            Badge
          </Link>
        </div>
      </div>

      {/* Modern Minimalist KPI Grid - 2 Column Mobile Side-by-Side Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Assigned */}
        <div className="card-saas p-3.5 sm:p-5 space-y-2 sm:space-y-3 hover:border-slate-300 transition-all min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">Assigned</span>
            <div className="p-1.5 sm:p-2 bg-slate-100 text-slate-700 rounded-lg shrink-0">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">{assignedCount}</div>
            <p className="text-xs sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">Total objectives</p>
          </div>
        </div>

        {/* Pending */}
        <div className="card-saas p-3.5 sm:p-5 space-y-2 sm:space-y-3 hover:border-slate-300 transition-all min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">Pending</span>
            <div className="p-1.5 sm:p-2 bg-amber-50 text-amber-700 rounded-lg shrink-0 border border-amber-200/50">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">{pendingCount}</div>
            <p className="text-xs sm:text-xs text-amber-700 font-bold mt-0.5 sm:mt-1 truncate">Awaiting action</p>
          </div>
        </div>

        {/* Completed */}
        <div className="card-saas p-3.5 sm:p-5 space-y-2 sm:space-y-3 hover:border-slate-300 transition-all min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">Completed</span>
            <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-700 rounded-lg shrink-0 border border-emerald-200/50">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">{completedCount}</div>
            <p className="text-xs sm:text-xs text-emerald-700 font-bold mt-0.5 sm:mt-1 truncate">Tasks delivered</p>
          </div>
        </div>

        {/* My Points */}
        <div className="card-saas p-3.5 sm:p-5 space-y-2 sm:space-y-3 hover:border-slate-300 transition-all min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">My Points</span>
            <div className="p-1.5 sm:p-2 bg-amber-50 text-amber-700 rounded-lg shrink-0 border border-amber-200/50">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">{user?.totalPoints || 0} <span className="text-xs sm:text-sm font-normal text-slate-400">pts</span></div>
            <p className="text-xs sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">Earned score</p>
          </div>
        </div>
      </div>

      {/* Recent Tasks List */}
      <div className="card-saas p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-900">Recent Tasks Assigned to You</h3>
          <Link to="/employee/tasks" className="text-xs text-slate-700 font-semibold hover:text-slate-900 flex items-center gap-1">
            See All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-900 border-t-transparent"></div>
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No tasks assigned to you yet.</p>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 4).map((task) => (
              <div key={task._id} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between gap-4 text-xs hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">{task.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{task.description}</p>
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">+{task.points} Pts</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-mono">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <span className={
                  task.status === 'Completed' ? 'badge-success' :
                  task.status === 'In Progress' ? 'badge-info' :
                  'badge-warning'
                }>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
