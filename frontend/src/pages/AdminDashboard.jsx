import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import LogoSpinner from '../components/LogoSpinner';
import { 
  Users, 
  CheckSquare, 
  Award, 
  History,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ClipboardList,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  UserCheck,
  Building2,
  MapPin,
  Camera,
  ArrowRight,
  LayoutDashboard
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceFilter, setAttendanceFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, activityRes, attendanceRes] = await Promise.allSettled([
          API.get('/dashboard/stats'),
          API.get('/activity-logs'),
          API.get('/attendance/admin')
        ]);

        if (!isMounted) return;

        if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
          setStats(statsRes.value.data);
        }
        if (activityRes.status === 'fulfilled' && Array.isArray(activityRes.value?.data)) {
          setActivities(activityRes.value.data.slice(0, 5));
        }
        if (attendanceRes.status === 'fulfilled' && attendanceRes.value?.data) {
          setAttendanceSummary(attendanceRes.value.data.summary);
          setAttendanceRecords(attendanceRes.value.data.records || []);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <LogoSpinner size="lg" label="Loading overview dashboard..." />
      </div>
    );
  }

  const filteredAttendance = attendanceRecords.filter(r => {
    if (attendanceFilter === 'Present') return r.status === 'Present';
    if (attendanceFilter === 'Checked Out') return r.status === 'Checked Out';
    return true;
  });

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const presentPercent = attendanceSummary?.totalEmployees ? Math.round(((attendanceSummary.presentCount || 0) / attendanceSummary.totalEmployees) * 100) : 0;
  const workingPercent = attendanceSummary?.totalEmployees ? Math.round(((attendanceSummary.workingCount || 0) / attendanceSummary.totalEmployees) * 100) : 0;
  const checkedOutPercent = attendanceSummary?.totalEmployees ? Math.round(((attendanceSummary.checkedOutCount || 0) / attendanceSummary.totalEmployees) * 100) : 0;
  const taskPercent = stats?.totalTasks ? Math.round(((stats.completedTasks || 0) / stats.totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Container — 100% Ultra-Sharp High-Contrast Executive SaaS Panel */}
      <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-black tracking-wider uppercase bg-slate-950 text-white shadow-xs">
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
              EXECUTIVE DASHBOARD
            </span>
            <span className="text-slate-300 font-bold">•</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-black tracking-wider uppercase bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Live Operations
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-none">
            Overview Dashboard
          </h1>
          <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed max-w-2xl">
            Real-time workforce attendance, task progress, and activity audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-start md:justify-end shrink-0 z-10">
          <Link 
            to="/admin/attendance" 
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-black text-white text-xs font-black rounded-xl shadow-md border border-slate-900 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Check Attendance</span>
          </Link>

          <Link 
            to="/admin/employees?add=true" 
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-950 text-xs font-extrabold rounded-xl border-2 border-slate-300 shadow-xs transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4 text-slate-900" />
            <span>Add Employee</span>
          </Link>

          <Link 
            to="/admin/tasks?add=true" 
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-950 text-xs font-extrabold rounded-xl border-2 border-slate-300 shadow-xs transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4 text-slate-900" />
            <span>New Task</span>
          </Link>
        </div>
      </div>

      {/* Top Row: Attendance & Workforce KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Present Today */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-300 hover:border-slate-900 hover:shadow-md transition-all duration-200 group flex flex-col justify-between cursor-pointer">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Present Today</span>
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              <UserCheck className="w-4.5 h-4.5 text-indigo-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-950 tabular-nums tracking-tight">
              {attendanceSummary?.presentCount || 0}
              <span className="text-xs font-bold text-slate-700 ml-1">/ {attendanceSummary?.totalEmployees || stats?.activeEmployees || 0}</span>
            </div>
            <p className="text-xs font-bold text-slate-800 mt-1 truncate">{presentPercent}% checked in today</p>
          </div>
        </div>

        {/* Currently Working */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-300 hover:border-slate-900 hover:shadow-md transition-all duration-200 group flex flex-col justify-between cursor-pointer">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Currently Working</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-950 tabular-nums tracking-tight">
              {attendanceSummary?.workingCount || 0}
            </div>
            <p className="text-xs font-bold text-slate-800 mt-1 truncate">Active on duty shift</p>
          </div>
        </div>

        {/* Checked Out */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-300 hover:border-slate-900 hover:shadow-md transition-all duration-200 group flex flex-col justify-between cursor-pointer">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Checked Out</span>
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-950 tabular-nums tracking-tight">
              {attendanceSummary?.checkedOutCount || 0}
            </div>
            <p className="text-xs font-bold text-slate-800 mt-1 truncate">Shift completed today</p>
          </div>
        </div>

        {/* Tasks Done */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-300 hover:border-slate-900 hover:shadow-md transition-all duration-200 group flex flex-col justify-between cursor-pointer">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Tasks Done</span>
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-4.5 h-4.5 text-amber-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-950 tabular-nums tracking-tight">
              {stats?.completedTasks || 0}
              <span className="text-xs font-bold text-slate-700 ml-1">/ {stats?.totalTasks || 0}</span>
            </div>
            <p className="text-xs font-bold text-slate-800 mt-1 truncate">{taskPercent}% completed tasks</p>
          </div>
        </div>
      </div>

      {/* Main Live Today's Attendance Table Card */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-950 text-white rounded-xl shadow-xs">
              <UserCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">Today's Live Attendance</h2>
              <p className="text-xs text-slate-800 font-bold mt-0.5">{todayFormatted} — Real-time workforce check-ins</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-300">
              <button
                onClick={() => setAttendanceFilter('All')}
                className={`px-3 py-1.5 rounded-lg transition-all ${attendanceFilter === 'All' ? 'bg-slate-950 text-white font-black shadow-xs' : 'text-slate-800 hover:text-slate-950'}`}
              >
                All ({attendanceRecords.length})
              </button>
              <button
                onClick={() => setAttendanceFilter('Present')}
                className={`px-3 py-1.5 rounded-lg transition-all ${attendanceFilter === 'Present' ? 'bg-slate-950 text-white font-black shadow-xs' : 'text-slate-800 hover:text-slate-950'}`}
              >
                Working ({attendanceSummary?.workingCount || 0})
              </button>
              <button
                onClick={() => setAttendanceFilter('Checked Out')}
                className={`px-3 py-1.5 rounded-lg transition-all ${attendanceFilter === 'Checked Out' ? 'bg-slate-950 text-white font-black shadow-xs' : 'text-slate-800 hover:text-slate-950'}`}
              >
                Checked Out ({attendanceSummary?.checkedOutCount || 0})
              </button>
            </div>

            <Link
              to="/admin/attendance"
              className="text-xs font-black text-slate-950 hover:text-indigo-600 flex items-center gap-1 pl-2 border-l-2 border-slate-300"
            >
              Full Log <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Live Attendance View */}
        {filteredAttendance.length === 0 ? (
          <div className="text-center py-12 space-y-2 bg-slate-100/70 rounded-2xl border-2 border-dashed border-slate-300">
            <UserCheck className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-black text-slate-950">No attendance check-ins recorded for today yet</h3>
            <p className="text-xs font-bold text-slate-800">Employees will appear here automatically when they check in with Jio Tag photo verification.</p>
          </div>
        ) : (
          <div>
            {/* Mobile Card List View for Today's Attendance */}
            <div className="block lg:hidden space-y-3">
              {filteredAttendance.map((record) => {
                const empName = record.employee?.name || 'Employee';
                const empId = record.employeeId || 'EMP';
                const dept = record.department || record.employee?.department || 'Staff';
                const checkInTime = record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--';
                const checkOutTime = record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--';

                return (
                  <div key={record._id} className="bg-white rounded-2xl p-4 border-2 border-slate-300 shadow-sm space-y-3">
                    {/* Header: Employee Info + Status Badge */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-950 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {empName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-black text-slate-950 text-sm block leading-snug">{empName}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs font-mono font-bold text-slate-800">{empId}</span>
                            <span className="text-slate-400">•</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-200 text-slate-950 border border-slate-300">
                              <Building2 className="w-3 h-3 text-slate-700" />
                              {dept}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {record.status === 'Present' ? (
                          <span className="badge-success text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            Present
                          </span>
                        ) : (
                          <span className="badge-neutral text-xs">
                            Checked Out
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle: Check In / Check Out Grid */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-3 rounded-xl border border-slate-300 text-xs">
                      <div>
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">Check In</span>
                        <span className="font-black text-emerald-800 tabular-nums text-sm">{checkInTime}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">Check Out</span>
                        <span className="font-black text-slate-950 tabular-nums text-sm">
                          {record.checkOut ? checkOutTime : <span className="text-emerald-700 font-black">Active Now</span>}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Jio Tag Address */}
                    {record.location?.address && (
                      <div className="flex items-start gap-2 text-xs text-slate-900 bg-slate-100 p-2.5 rounded-xl border border-slate-300 font-bold">
                        <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{record.location.address}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Premium Enterprise Desktop Table View — Clean Borderless SaaS Design */}
            <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black uppercase text-slate-700 tracking-wider">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Check In</th>
                    <th className="py-3 px-4">Location (Jio Tag Address)</th>
                    <th className="py-3 px-4">Check Out</th>
                    <th className="py-3 px-4">Working Hours</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredAttendance.map((record) => {
                    const empName = record.employee?.name || 'Employee';
                    const empId = record.employeeId || 'EMP';
                    const dept = record.department || record.employee?.department || 'Staff';
                    const checkInTime = record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--';
                    const checkOutTime = record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--';

                    return (
                      <tr key={record._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {empName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-900 text-sm block leading-tight">{empName}</span>
                              <span className="font-mono text-xs font-semibold text-slate-500 mt-0.5 block">{empId}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            {dept}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-bold text-emerald-700">
                            {checkInTime}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          {record.location?.address ? (
                            <div className="flex items-center gap-1.5 text-slate-800 text-xs font-medium truncate">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span className="truncate">{record.location.address}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Location not tagged</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-800">
                          {record.checkOut ? (
                            checkOutTime
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Active Now
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-800">
                          {record.workingHours || '--'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {record.status === 'Present' ? (
                            <span className="badge-success text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Present
                            </span>
                          ) : (
                            <span className="badge-neutral text-xs">
                              Checked Out
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Activity Logs Timeline */}
      <div className="card-saas p-5 space-y-4 border-2 border-slate-300">
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
          <div className="flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-slate-950" />
            <h3 className="font-black text-sm text-slate-950 uppercase tracking-wider">Recent Activity Logs</h3>
          </div>
          <Link to="/admin/logs" className="text-xs text-slate-950 font-black hover:text-indigo-600 flex items-center gap-1">
            Full Audit <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activities.length === 0 ? (
          <p className="text-sm font-bold text-slate-700 text-center py-6">No recent activity logs recorded.</p>
        ) : (
          <div className="divide-y divide-slate-200">
            {activities.map((log) => (
              <div key={log._id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3 hover:bg-slate-100/60 p-2 rounded-xl transition-colors">
                <div className="p-2 bg-slate-950 text-white rounded-lg shrink-0 mt-0.5 shadow-xs">
                  <History className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-black text-slate-950 truncate">{log.action}</p>
                    <span className="text-xs text-slate-800 font-mono font-bold shrink-0">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-bold mt-1 leading-relaxed">{log.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
