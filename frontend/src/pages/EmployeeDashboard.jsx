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
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 sm:p-8 md:p-9 text-white shadow-2xl border border-slate-800/80">
        {/* Multi-layered Ambient Glows & Grid Mesh */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 -mb-16 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 lg:gap-8">
          {/* Left Avatar & Identity Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            {/* Premium Halo Avatar with Live Status Indicator */}
            <div className="relative shrink-0 group">
              <div className="p-1 rounded-full bg-gradient-to-tr from-indigo-500 via-rose-500 to-amber-400 shadow-xl shadow-indigo-500/25 transition-transform duration-300 group-hover:scale-105">
                {user?.profilePhoto ? (
                  <img 
                    src={user.profilePhoto} 
                    alt={user?.name} 
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover bg-slate-900 border-2 border-slate-950 shadow-inner" 
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white font-black flex items-center justify-center text-3xl sm:text-4xl border-2 border-slate-950 shadow-inner">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Online Pulse Indicator */}
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center p-0.5" title="Active Employee Account">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
              </div>
            </div>

            {/* Typography & Metadata Badges */}
            <div className="space-y-2.5">
              {/* Top Tag Bar */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-white/10 text-white border border-white/15 backdrop-blur-md inline-flex items-center gap-1.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  EMPLOYEE WORKSPACE
                </span>

                <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wide bg-slate-900/90 text-slate-300 border border-slate-800 inline-flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-indigo-400" />
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>

                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1.5 ${
                  todayData && !todayData.checkOut 
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                    : todayData?.checkOut
                    ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    todayData && !todayData.checkOut ? 'bg-emerald-400 animate-pulse' : todayData?.checkOut ? 'bg-indigo-400' : 'bg-amber-400'
                  }`}></span>
                  {todayData && !todayData.checkOut ? 'On Duty (Active)' : todayData?.checkOut ? 'Shift Done' : 'Not Checked In'}
                </span>
              </div>
              
              {/* Main Heading */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Welcome back,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-rose-200">
                  {user?.name}!
                </span>
              </h1>
              
              {/* Profile Chips */}
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 text-slate-200 text-xs font-bold border border-slate-800 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  {user?.designation || 'Staff Member'}
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-950/70 text-indigo-200 text-xs font-bold border border-indigo-500/30 shadow-xs">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  {user?.department || 'Operations'} Department
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 text-amber-300 font-mono text-xs font-extrabold border border-amber-500/30 shadow-xs">
                  ID: {user?.employeeId}
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Control Suite */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full xl:w-auto justify-start xl:justify-end border-t xl:border-t-0 border-slate-800/80 pt-4 xl:pt-0 shrink-0">
            {!todayData ? (
              <Link 
                to="/employee/attendance" 
                className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-500/25 border border-emerald-400/40 transition-all hover:scale-[1.02] active:scale-95 group w-full sm:w-auto"
              >
                <CheckSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Check In Today</span>
              </Link>
            ) : !todayData.checkOut ? (
              <Link 
                to="/employee/attendance" 
                className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-lg shadow-rose-500/25 border border-rose-400/40 transition-all hover:scale-[1.02] active:scale-95 group w-full sm:w-auto"
              >
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Check Out Shift</span>
              </Link>
            ) : (
              <Link 
                to="/employee/attendance" 
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 font-extrabold text-xs shadow-sm transition-all w-full sm:w-auto"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Shift Completed</span>
              </Link>
            )}

            <Link 
              to="/employee/tasks" 
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/15 hover:border-white/25 backdrop-blur-md font-extrabold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-95 flex-1 sm:flex-none"
            >
              <CheckSquare className="w-4 h-4 text-indigo-300" />
              <span>My Tasks</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-mono font-bold border border-indigo-400/30">
                  {pendingCount}
                </span>
              )}
            </Link>

            <Link 
              to={`/verify/${user?.employeeId}`} 
              target="_blank" 
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/15 hover:border-white/25 backdrop-blur-md font-extrabold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-95 flex-1 sm:flex-none"
              title="View your verified Corporate Digital ID Card"
            >
              <QrCode className="w-4 h-4 text-rose-300" />
              <span>ID Badge</span>
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

