import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import LogoSpinner from '../components/LogoSpinner';
import { 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  Award, 
  QrCode,
  ArrowRight,
  ClipboardList,
  LogOut,
  Building2,
  Calendar,
  Sparkles,
  MapPin,
  Check
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { user, refreshUser } = useContext(AuthContext);
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
    if (refreshUser) refreshUser();
    fetchDashboardData();
  }, [refreshUser]);

  const assignedCount = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'In Progress' || t.status === 'Pending Review' || t.status === 'Pending').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* High-End Enterprise Welcome Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {user?.profilePhoto ? (
              <img 
                src={user.profilePhoto} 
                alt={user?.name} 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-400/30 shadow-lg shrink-0" 
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-extrabold flex items-center justify-center text-2xl sm:text-3xl shadow-lg shrink-0 border border-indigo-400/30">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md uppercase tracking-wider inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> Employee Workspace
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome back, {user?.name}!
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-300 font-medium flex items-center gap-2 flex-wrap">
                <span>{user?.designation || 'Staff Member'}</span>
                <span className="text-slate-600">•</span>
                <span className="text-indigo-300 font-semibold">{user?.department || 'Operations'} Department</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  ID: {user?.employeeId}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end border-t md:border-t-0 border-slate-800/80 pt-4 md:pt-0">
            {!todayData ? (
              <Link to="/employee/attendance" className="inline-flex items-center gap-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 px-4 rounded-xl shadow-md border border-emerald-400/40 transition-all hover:scale-[1.02] active:scale-95">
                <CheckSquare className="w-4 h-4" />
                Check In Today
              </Link>
            ) : !todayData.checkOut ? (
              <Link to="/employee/attendance" className="inline-flex items-center gap-2 text-xs bg-rose-600 hover:bg-rose-500 text-white font-black py-2.5 px-4 rounded-xl shadow-md border border-rose-400/40 transition-all hover:scale-[1.02] active:scale-95">
                <LogOut className="w-4 h-4" />
                Check Out Shift
              </Link>
            ) : (
              <Link to="/employee/attendance" className="inline-flex items-center gap-2 text-xs bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 hover:text-emerald-100 border border-emerald-500/50 py-2.5 px-4 rounded-xl font-extrabold shadow-sm transition-all active:scale-95">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Shift Completed
              </Link>
            )}

            <Link to="/employee/tasks" className="inline-flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-white hover:text-white border border-slate-700 hover:border-slate-500 py-2.5 px-4 rounded-xl font-extrabold shadow-sm transition-all active:scale-95">
              <CheckSquare className="w-4 h-4 text-indigo-400" />
              My Tasks
            </Link>

            <Link to={`/verify/${user?.employeeId}`} target="_blank" className="inline-flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-white hover:text-white border border-slate-700 hover:border-slate-500 py-2.5 px-4 rounded-xl font-extrabold shadow-sm transition-all active:scale-95">
              <QrCode className="w-4 h-4 text-rose-400" />
              Badge
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Grid with High-End Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Assigned */}
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-300 shadow-sm hover:shadow-md hover:border-slate-900 transition-all duration-200 group flex flex-col justify-between cursor-pointer">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-black text-slate-950 uppercase tracking-wider">Assigned</span>
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <ClipboardList className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-950 tabular-nums tracking-tight">{assignedCount}</div>
            <p className="text-xs font-bold text-slate-800 mt-1 truncate">Total objectives</p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-300 shadow-sm hover:shadow-md hover:border-slate-900 transition-all duration-200 group flex flex-col justify-between cursor-pointer">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-black text-slate-950 uppercase tracking-wider">Pending</span>
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-950 tabular-nums tracking-tight">{pendingCount}</div>
            <p className="text-xs font-bold text-slate-800 mt-1 truncate">Awaiting action</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-300 shadow-sm hover:shadow-md hover:border-slate-900 transition-all duration-200 group flex flex-col justify-between cursor-pointer">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-black text-slate-950 uppercase tracking-wider">Completed</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-950 tabular-nums tracking-tight">{completedCount}</div>
            <p className="text-xs font-bold text-slate-800 mt-1 truncate">Tasks delivered</p>
          </div>
        </div>

        {/* My Points */}
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-300 shadow-sm hover:shadow-md hover:border-slate-900 transition-all duration-200 group flex flex-col justify-between cursor-pointer">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-black text-slate-950 uppercase tracking-wider">My Points</span>
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-950 tabular-nums tracking-tight">
              {user?.totalPoints || 0} <span className="text-xs font-black text-purple-700 uppercase">pts</span>
            </div>
            <p className="text-xs font-bold text-slate-800 mt-1 truncate">Performance score</p>
          </div>
        </div>
      </div>

      {/* Recent Assigned Tasks Section Card */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-950 text-white rounded-xl shadow-xs">
              <ClipboardList className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-950 tracking-tight">Recent Tasks Assigned to You</h3>
              <p className="text-xs text-slate-800 font-bold">Complete assigned work & request Admin approval</p>
            </div>
          </div>

          <Link to="/employee/tasks" className="text-xs font-black text-slate-950 hover:text-indigo-600 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors">
            See All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LogoSpinner label="Syncing your portal..." />
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 space-y-2 bg-slate-100/70 rounded-2xl border-2 border-dashed border-slate-300">
            <CheckSquare className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-black text-slate-950">No active tasks assigned</h4>
            <p className="text-xs font-bold text-slate-800">Your manager will assign new objectives here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 4).map((task) => (
              <div 
                key={task._id} 
                className="p-4 rounded-2xl bg-white border border-slate-300 hover:border-slate-900 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-sm text-slate-950 leading-snug">{task.title}</h4>
                    <span className="font-mono text-xs font-black text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-400 inline-flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-700" />
                      +{task.points} Pts
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 line-clamp-1 font-bold">{task.description}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-600" />
                      Due: {new Date(task.dueDate).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  <span className={
                    task.status === 'Completed' ? 'badge-success' :
                    task.status === 'In Progress' ? 'badge-info' :
                    task.status === 'Pending Review' ? 'badge-purple' :
                    'badge-warning'
                  }>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;

