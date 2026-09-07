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
      {/* Modern, Clean & Non-Truncated Welcome Box */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {user?.profilePhoto ? (
              <img 
                src={user.profilePhoto} 
                alt={user?.name} 
                className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow-xs shrink-0" 
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-black flex items-center justify-center text-sm border-2 border-slate-100 shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-slate-950 tracking-tight leading-snug truncate">
                Welcome back, {user?.name}
              </h1>
              <p className="text-xs font-bold text-slate-700 leading-tight">
                {user?.designation || 'Staff Member'}
              </p>
              <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                {user?.department} • <span className="font-mono font-bold text-slate-700">ID: {user?.employeeId}</span>
              </p>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border shrink-0 inline-flex items-center gap-1.5 ${
            todayData && !todayData.checkOut 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : todayData?.checkOut
              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              todayData && !todayData.checkOut ? 'bg-emerald-600 animate-pulse' : todayData?.checkOut ? 'bg-indigo-600' : 'bg-amber-600'
            }`} />
            {todayData && !todayData.checkOut ? 'On Duty' : todayData?.checkOut ? 'Shift Done' : 'Not Checked In'}
          </span>
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          {!todayData ? (
            <Link 
              to="/employee/attendance" 
              className="btn-brand text-xs font-bold py-2 px-3.5 rounded-xl flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Check In</span>
            </Link>
          ) : !todayData.checkOut ? (
            <Link 
              to="/employee/attendance" 
              className="btn-danger text-xs font-bold py-2 px-3.5 rounded-xl flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Check Out</span>
            </Link>
          ) : (
            <Link 
              to="/employee/attendance" 
              className="btn-secondary text-xs font-bold py-2 px-3.5 rounded-xl flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Shift Done</span>
            </Link>
          )}

          <Link 
            to="/employee/tasks" 
            className="btn-secondary text-xs font-extrabold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
          >
            <CheckSquare className="w-3.5 h-3.5 text-slate-600" />
            <span>Tasks</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-900 text-[10px] font-mono font-bold">
                {pendingCount}
              </span>
            )}
          </Link>

          <Link 
            to={`/verify/${user?.employeeId}`} 
            target="_blank" 
            className="btn-secondary text-xs font-extrabold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-600" />
            <span>ID Badge</span>
          </Link>
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

