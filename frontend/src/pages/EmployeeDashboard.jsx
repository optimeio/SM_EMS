import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import LogoSpinner from '../components/LogoSpinner';
import { 
  CheckSquare, 
  Clock, 
  CheckCircle, 
  Award, 
  QrCode,
  ArrowRight,
  ClipboardList,
  LogOut
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tasksRes, attendanceRes] = await Promise.all([
        API.get('/tasks/employee'),
        API.get('/attendance/today').catch(() => ({ data: { attendance: null } }))
      ]);
      setTasks(tasksRes.data);
      setTodayData(attendanceRes.data?.attendance || null);
    } catch (err) {
      console.error('Failed to load employee dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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
          {!todayData ? (
            <Link to="/employee/attendance" className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600/20 shadow-emerald-600/10 shadow-sm border border-emerald-500/20 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4" />
              Check In
            </Link>
          ) : !todayData.checkOut ? (
            <Link to="/employee/attendance" className="btn-primary text-xs bg-rose-600 hover:bg-rose-700 focus:ring-rose-600/20 shadow-rose-600/10 shadow-sm border border-rose-500/20 flex items-center gap-1.5">
              <LogOut className="w-4 h-4" />
              Check Out
            </Link>
          ) : (
            <Link to="/employee/attendance" className="btn-secondary text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Checked Out
            </Link>
          )}
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

      {/* Run Beyond Style KPI Grid with Hover Highlight */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Assigned */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 hover:border-indigo-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between cursor-pointer min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate group-hover:text-indigo-600 transition-colors">Assigned</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-110 transition-transform">
              <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-xl sm:text-3xl font-black text-slate-900 tabular-nums tracking-tight">{assignedCount}</div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">Total objectives</p>
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
            <div className="text-xl sm:text-3xl font-black text-slate-900 tabular-nums tracking-tight">{pendingCount}</div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">Awaiting action</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between cursor-pointer min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate group-hover:text-emerald-600 transition-colors">Completed</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-xl sm:text-3xl font-black text-slate-900 tabular-nums tracking-tight">{completedCount}</div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">Tasks delivered</p>
          </div>
        </div>

        {/* My Points */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 hover:border-purple-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between cursor-pointer min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate group-hover:text-purple-600 transition-colors">My Points</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-xl sm:text-3xl font-black text-slate-900 tabular-nums tracking-tight">{user?.totalPoints || 0} <span className="text-xs font-semibold text-slate-400">pts</span></div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">Performance score</p>
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
          <LogoSpinner label="Syncing your portal..." />
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
