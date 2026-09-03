import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
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
  ArrowRight
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceFilter, setAttendanceFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, activityRes, attendanceRes] = await Promise.all([
          API.get('/dashboard/stats'),
          API.get('/activity-logs'),
          API.get('/attendance/admin')
        ]);

        setStats(statsRes.data);
        setActivities(activityRes.data.slice(0, 5));
        if (attendanceRes.data) {
          setAttendanceSummary(attendanceRes.data.summary);
          setAttendanceRecords(attendanceRes.data.records || []);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Live workforce attendance, task progress, and activity logs.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-end">
          <Link to="/admin/attendance" className="btn-primary text-sm bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10 focus:ring-indigo-600/20">
            <Calendar className="w-4 h-4" />
            Check Attendance
          </Link>
          <Link to="/admin/employees?add=true" className="btn-secondary text-sm bg-white">
            <Plus className="w-4 h-4 text-slate-500" />
            Add Employee
          </Link>
          <Link to="/admin/tasks?add=true" className="btn-secondary text-sm bg-white">
            <Plus className="w-4 h-4 text-slate-500" />
            New Task
          </Link>
        </div>
      </div>

      {/* Top Row: Attendance & Workforce KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1: Today's Present Attendance */}
        <div className="rounded-2xl p-5 border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/20 to-emerald-100/30 space-y-2 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider block truncate">Present Today</span>
            <div className="p-2.5 bg-emerald-100/80 text-emerald-700 rounded-xl border border-emerald-200/80 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <UserCheck className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums truncate">
              {attendanceSummary?.presentCount || 0}
              <span className="text-xs sm:text-sm font-semibold text-slate-400 ml-1">/ {attendanceSummary?.totalEmployees || stats?.activeEmployees || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-extrabold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>
                {attendanceSummary?.totalEmployees ? Math.round(((attendanceSummary.presentCount || 0) / attendanceSummary.totalEmployees) * 100) : 0}% Checked In
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Currently Active / Working */}
        <div className="rounded-2xl p-5 border border-sky-200/80 bg-gradient-to-br from-white via-sky-50/20 to-sky-100/30 space-y-2 hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300 group min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-sky-800 uppercase tracking-wider block truncate">Currently Working</span>
            <div className="p-2.5 bg-sky-100/80 text-sky-700 rounded-xl border border-sky-200/80 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums truncate">
              {attendanceSummary?.workingCount || 0}
            </div>
            <p className="text-xs text-sky-700 font-extrabold mt-2 truncate">Active on Duty</p>
          </div>
        </div>

        {/* Card 3: Checked Out */}
        <div className="rounded-2xl p-5 border border-purple-200/80 bg-gradient-to-br from-white via-purple-50/20 to-purple-100/30 space-y-2 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 group min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-purple-800 uppercase tracking-wider block truncate">Checked Out</span>
            <div className="p-2.5 bg-purple-100/80 text-purple-700 rounded-xl border border-purple-200/80 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums truncate">
              {attendanceSummary?.checkedOutCount || 0}
            </div>
            <p className="text-xs text-purple-700 font-extrabold mt-2 truncate">Shift completed</p>
          </div>
        </div>

        {/* Card 4: Tasks Done */}
        <div className="rounded-2xl p-5 border border-amber-200/80 bg-gradient-to-br from-white via-amber-50/20 to-amber-100/30 space-y-2 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 group min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider block truncate">Tasks Done</span>
            <div className="p-2.5 bg-amber-100/80 text-amber-700 rounded-xl border border-amber-200/80 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <CheckSquare className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums truncate">
              {stats?.completedTasks || 0}
              <span className="text-xs sm:text-sm font-semibold text-slate-400 ml-1">/ {stats?.totalTasks || 0}</span>
            </div>
            <p className="text-xs text-amber-700 font-extrabold mt-2 truncate">Completed tasks</p>
          </div>
        </div>
      </div>

      {/* Main Live Today's Attendance Table Card */}
      <div className="card-saas p-5 space-y-4 border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200/60">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Today's Attendance Status</h2>
              <p className="text-xs text-slate-500 mt-0.5">{todayFormatted} — Real-time employee check-ins</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setAttendanceFilter('All')}
                className={`px-3 py-1.5 rounded-lg transition-all ${attendanceFilter === 'All' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All ({attendanceRecords.length})
              </button>
              <button
                onClick={() => setAttendanceFilter('Present')}
                className={`px-3 py-1.5 rounded-lg transition-all ${attendanceFilter === 'Present' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Working ({attendanceSummary?.workingCount || 0})
              </button>
              <button
                onClick={() => setAttendanceFilter('Checked Out')}
                className={`px-3 py-1.5 rounded-lg transition-all ${attendanceFilter === 'Checked Out' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Checked Out ({attendanceSummary?.checkedOutCount || 0})
              </button>
            </div>

            <Link
              to="/admin/attendance"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pl-2 border-l border-slate-200"
            >
              Full Log <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Live Attendance Table */}
        {filteredAttendance.length === 0 ? (
          <div className="text-center py-12 space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No attendance check-ins recorded for today yet</h3>
            <p className="text-xs text-slate-500">Employees will appear here automatically when they check in with Jio Tag photo verification.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-xs font-bold uppercase text-slate-500 tracking-wider">
                  <th className="p-3.5 pl-4">Employee</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Check In</th>
                  <th className="p-3.5">Location (Jio Tag Address)</th>
                  <th className="p-3.5">Check Out</th>
                  <th className="p-3.5">Working Hours</th>
                  <th className="p-3.5 pr-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendance.map((record) => {
                  const empName = record.employee?.name || 'Employee';
                  const empId = record.employeeId || 'EMP';
                  const dept = record.department || record.employee?.department || 'Staff';
                  const checkInTime = record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--';
                  const checkOutTime = record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--';

                  return (
                    <tr key={record._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {empName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-snug">{empName}</span>
                            <span className="text-xs font-mono text-slate-400">{empId}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          {dept}
                        </span>
                      </td>

                      <td className="p-3.5 font-bold text-emerald-700 text-xs tabular-nums">
                        {checkInTime}
                      </td>

                      <td className="p-3.5">
                        {record.location?.address ? (
                          <div className="flex items-start gap-1.5 max-w-xs text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <span>{record.location.address}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-normal italic">Location not tagged</span>
                        )}
                      </td>

                      <td className="p-3.5 font-medium text-slate-700 text-xs tabular-nums">
                        {record.checkOut ? (
                          <span className="text-slate-700 font-bold">{checkOutTime}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                            Active Now
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-medium text-slate-700 text-xs tabular-nums">
                        {record.workingHours || '--'}
                      </td>

                      <td className="p-3.5 pr-4 text-right">
                        {record.status === 'Present' ? (
                          <span className="badge-success">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Present
                          </span>
                        ) : (
                          <span className="badge-neutral">
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
        )}
      </div>

      {/* Activity Logs Timeline */}
      <div className="card-saas p-5 space-y-4 border border-slate-200/80">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-slate-700" />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Recent Activity Logs</h3>
          </div>
          <Link to="/admin/logs" className="text-xs text-slate-600 font-semibold hover:text-slate-900 flex items-center gap-1">
            Full Audit <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activities.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No recent activity logs.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {activities.map((log) => (
              <div key={log._id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg shrink-0 mt-0.5">
                  <History className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 truncate">{log.action}</p>
                    <span className="text-xs text-slate-400 font-mono shrink-0">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{log.description}</p>
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
