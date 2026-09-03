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
  const [cardStyle, setCardStyle] = useState('varA');
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

  const presentPercent = attendanceSummary?.totalEmployees ? Math.round(((attendanceSummary.presentCount || 0) / attendanceSummary.totalEmployees) * 100) : 0;
  const workingPercent = attendanceSummary?.totalEmployees ? Math.round(((attendanceSummary.workingCount || 0) / attendanceSummary.totalEmployees) * 100) : 0;
  const checkedOutPercent = attendanceSummary?.totalEmployees ? Math.round(((attendanceSummary.checkedOutCount || 0) / attendanceSummary.totalEmployees) * 100) : 0;
  const taskPercent = stats?.totalTasks ? Math.round(((stats.completedTasks || 0) / stats.totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-200">
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

      {/* Card Design Selector Controls — 4 Solid Color Block Variations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-100/90 rounded-2xl border-2 border-slate-300 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-xs">
            🎨
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider block leading-tight">Solid Color Block Card Variations</span>
            <span className="text-[11px] text-slate-600 font-bold">Select a variation below to choose your favorite solid color block theme</span>
          </div>
        </div>

        <div className="flex flex-wrap bg-white p-1 rounded-xl border-2 border-slate-300 text-xs font-bold shadow-2xs">
          <button
            onClick={() => setCardStyle('var1')}
            className={`px-3 py-1.5 rounded-lg transition-all ${cardStyle === 'var1' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Var 1: Deep Jewel Solid Blocks (Screenshot Style)
          </button>
          <button
            onClick={() => setCardStyle('var2')}
            className={`px-3 py-1.5 rounded-lg transition-all ${cardStyle === 'var2' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Var 2: Vibrant Electric Gradient Fills
          </button>
          <button
            onClick={() => setCardStyle('var3')}
            className={`px-3 py-1.5 rounded-lg transition-all ${cardStyle === 'var3' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Var 3: Medium Vibrant Solid Blocks
          </button>
          <button
            onClick={() => setCardStyle('var4')}
            className={`px-3 py-1.5 rounded-lg transition-all ${cardStyle === 'var4' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Var 4: Executive Dark Charcoal Fills + Glowing Icons
          </button>
        </div>
      </div>

      {/* Top Row: Attendance & Workforce KPI Summary Cards */}
      {cardStyle === 'var1' && (
        /* VARIATION 1: Deep Jewel Solid Blocks (The exact style in screenshot!) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Present Today */}
          <div className="bg-[#064E3B] text-white rounded-2xl p-5 border-2 border-emerald-800 shadow-md space-y-3 hover:-translate-y-1 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-200 uppercase tracking-wider">Present Today</span>
              <div className="p-2.5 bg-emerald-800/80 text-emerald-300 rounded-xl border border-emerald-600/50 group-hover:scale-105 transition-transform">
                <UserCheck className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white tabular-nums">
                {attendanceSummary?.presentCount || 0}
                <span className="text-sm font-bold text-emerald-300 ml-1">/ {attendanceSummary?.totalEmployees || stats?.activeEmployees || 0}</span>
              </div>
              <p className="text-xs text-emerald-200 font-extrabold mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Checked In today
              </p>
            </div>
          </div>

          {/* Currently Working */}
          <div className="bg-[#0C4A6E] text-white rounded-2xl p-5 border-2 border-sky-800 shadow-md space-y-3 hover:-translate-y-1 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-sky-200 uppercase tracking-wider">Currently Working</span>
              <div className="p-2.5 bg-sky-800/80 text-sky-300 rounded-xl border border-sky-600/50 group-hover:scale-105 transition-transform">
                <Clock className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white tabular-nums">{attendanceSummary?.workingCount || 0}</div>
              <p className="text-xs text-sky-200 font-extrabold mt-2">Active on duty shift</p>
            </div>
          </div>

          {/* Checked Out */}
          <div className="bg-[#4C1D95] text-white rounded-2xl p-5 border-2 border-purple-800 shadow-md space-y-3 hover:-translate-y-1 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-200 uppercase tracking-wider">Checked Out</span>
              <div className="p-2.5 bg-purple-800/80 text-purple-300 rounded-xl border border-purple-600/50 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white tabular-nums">{attendanceSummary?.checkedOutCount || 0}</div>
              <p className="text-xs text-purple-200 font-extrabold mt-2">Shift completed</p>
            </div>
          </div>

          {/* Tasks Done */}
          <div className="bg-[#0F172A] text-white rounded-2xl p-5 border-2 border-slate-700 shadow-md space-y-3 hover:-translate-y-1 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-300 uppercase tracking-wider">Tasks Done</span>
              <div className="p-2.5 bg-slate-800 text-amber-400 rounded-xl border border-slate-600 group-hover:scale-105 transition-transform">
                <CheckSquare className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white tabular-nums">
                {stats?.completedTasks || 0}
                <span className="text-sm font-semibold text-slate-400 ml-1">/ {stats?.totalTasks || 0}</span>
              </div>
              <p className="text-xs text-amber-400 font-extrabold mt-2">Completed tasks</p>
            </div>
          </div>
        </div>
      )}

      {cardStyle === 'var2' && (
        /* VARIATION 2: Vibrant Electric Gradient Fills */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 text-white rounded-2xl p-5 border-2 border-emerald-400/60 shadow-lg space-y-3 hover:-translate-y-1 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-100 uppercase tracking-wider">Present Today</span>
              <div className="p-2.5 bg-white/20 text-white backdrop-blur-md rounded-xl border border-white/30 group-hover:scale-105 transition-transform">
                <UserCheck className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white tabular-nums">{attendanceSummary?.presentCount || 0} <span className="text-sm font-semibold text-emerald-200">/ {attendanceSummary?.totalEmployees || stats?.activeEmployees || 0}</span></div>
              <p className="text-xs text-emerald-100 font-black mt-2">⚡ {presentPercent}% Checked In</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-900 text-white rounded-2xl p-5 border-2 border-sky-400/60 shadow-lg space-y-3 hover:-translate-y-1 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-sky-100 uppercase tracking-wider">Currently Working</span>
              <div className="p-2.5 bg-white/20 text-white backdrop-blur-md rounded-xl border border-white/30 group-hover:scale-105 transition-transform">
                <Clock className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white tabular-nums">{attendanceSummary?.workingCount || 0}</div>
              <p className="text-xs text-sky-100 font-black mt-2">⚡ Active on Duty Shift</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-900 text-white rounded-2xl p-5 border-2 border-purple-400/60 shadow-lg space-y-3 hover:-translate-y-1 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-100 uppercase tracking-wider">Checked Out</span>
              <div className="p-2.5 bg-white/20 text-white backdrop-blur-md rounded-xl border border-white/30 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white tabular-nums">{attendanceSummary?.checkedOutCount || 0}</div>
              <p className="text-xs text-purple-100 font-black mt-2">⚡ Shift Completed</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-900 text-white rounded-2xl p-5 border-2 border-amber-400/60 shadow-lg space-y-3 hover:-translate-y-1 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-100 uppercase tracking-wider">Tasks Done</span>
              <div className="p-2.5 bg-white/20 text-white backdrop-blur-md rounded-xl border border-white/30 group-hover:scale-105 transition-transform">
                <CheckSquare className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white tabular-nums">{stats?.completedTasks || 0} <span className="text-sm font-semibold text-amber-200">/ {stats?.totalTasks || 0}</span></div>
              <p className="text-xs text-amber-100 font-black mt-2">⚡ Total Tasks Completed</p>
            </div>
          </div>
        </div>
      )}

      {cardStyle === 'var3' && (
        /* VARIATION 3: Medium Vibrant Solid Color Blocks */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#059669] text-white rounded-2xl p-5 border-2 border-emerald-700 shadow-md space-y-3 hover:-translate-y-1 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-100">Present Today</span>
              <div className="p-2.5 bg-emerald-800/90 text-white rounded-xl group-hover:scale-105 transition-transform">
                <UserCheck className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white tabular-nums">{attendanceSummary?.presentCount || 0} <span className="text-sm font-semibold text-emerald-200">/ {attendanceSummary?.totalEmployees || stats?.activeEmployees || 0}</span></div>
              <p className="text-xs text-emerald-100 font-extrabold mt-2">Checked in today</p>
            </div>
          </div>

          <div className="bg-[#0284C7] text-white rounded-2xl p-5 border-2 border-sky-700 shadow-md space-y-3 hover:-translate-y-1 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-sky-100">Currently Working</span>
              <div className="p-2.5 bg-sky-800/90 text-white rounded-xl group-hover:scale-105 transition-transform">
                <Clock className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white tabular-nums">{attendanceSummary?.workingCount || 0}</div>
              <p className="text-xs text-sky-100 font-extrabold mt-2">Active on duty shift</p>
            </div>
          </div>

          <div className="bg-[#7C3AED] text-white rounded-2xl p-5 border-2 border-purple-700 shadow-md space-y-3 hover:-translate-y-1 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-purple-100">Checked Out</span>
              <div className="p-2.5 bg-purple-800/90 text-white rounded-xl group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white tabular-nums">{attendanceSummary?.checkedOutCount || 0}</div>
              <p className="text-xs text-purple-100 font-extrabold mt-2">Shift completed</p>
            </div>
          </div>

          <div className="bg-[#D97706] text-white rounded-2xl p-5 border-2 border-amber-700 shadow-md space-y-3 hover:-translate-y-1 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-100">Tasks Done</span>
              <div className="p-2.5 bg-amber-800/90 text-white rounded-xl group-hover:scale-105 transition-transform">
                <CheckSquare className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white tabular-nums">{stats?.completedTasks || 0} <span className="text-sm font-semibold text-amber-200">/ {stats?.totalTasks || 0}</span></div>
              <p className="text-xs text-amber-100 font-extrabold mt-2">Completed tasks</p>
            </div>
          </div>
        </div>
      )}

      {cardStyle === 'var4' && (
        /* VARIATION 4: Dark Charcoal Fills + Neon Glowing Accent Rings */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 text-white rounded-2xl p-5 border-2 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.15)] space-y-3 hover:-translate-y-1 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">Present Today</span>
              <div className="p-2.5 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-500/50 group-hover:scale-105 transition-transform">
                <UserCheck className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white tabular-nums">{attendanceSummary?.presentCount || 0} <span className="text-sm font-semibold text-slate-400">/ {attendanceSummary?.totalEmployees || stats?.activeEmployees || 0}</span></div>
              <p className="text-xs text-emerald-400 font-extrabold mt-2">Live Checked In</p>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-5 border-2 border-sky-500/80 shadow-[0_0_15px_rgba(14,165,233,0.15)] space-y-3 hover:-translate-y-1 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-sky-400 uppercase tracking-wider">Currently Working</span>
              <div className="p-2.5 bg-sky-950 text-sky-400 rounded-xl border border-sky-500/50 group-hover:scale-105 transition-transform">
                <Clock className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white tabular-nums">{attendanceSummary?.workingCount || 0}</div>
              <p className="text-xs text-sky-400 font-extrabold mt-2">Active on Duty</p>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-5 border-2 border-purple-500/80 shadow-[0_0_15px_rgba(168,85,247,0.15)] space-y-3 hover:-translate-y-1 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-400 uppercase tracking-wider">Checked Out</span>
              <div className="p-2.5 bg-purple-950 text-purple-400 rounded-xl border border-purple-500/50 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white tabular-nums">{attendanceSummary?.checkedOutCount || 0}</div>
              <p className="text-xs text-purple-400 font-extrabold mt-2">Shift Completed</p>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-5 border-2 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.15)] space-y-3 hover:-translate-y-1 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">Tasks Done</span>
              <div className="p-2.5 bg-amber-950 text-amber-400 rounded-xl border border-amber-500/50 group-hover:scale-105 transition-transform">
                <CheckSquare className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white tabular-nums">{stats?.completedTasks || 0} <span className="text-sm font-semibold text-slate-400">/ {stats?.totalTasks || 0}</span></div>
              <p className="text-xs text-amber-400 font-extrabold mt-2">Completed Tasks</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Live Today's Attendance Table Card */}
      <div className="card-saas p-5 space-y-4 border-2 border-slate-300 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b-2 border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border-2 border-indigo-200">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Today's Attendance Status</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{todayFormatted} — Real-time employee check-ins</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold border border-slate-200">
              <button
                onClick={() => setAttendanceFilter('All')}
                className={`px-3 py-1.5 rounded-lg transition-all ${attendanceFilter === 'All' ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All ({attendanceRecords.length})
              </button>
              <button
                onClick={() => setAttendanceFilter('Present')}
                className={`px-3 py-1.5 rounded-lg transition-all ${attendanceFilter === 'Present' ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Working ({attendanceSummary?.workingCount || 0})
              </button>
              <button
                onClick={() => setAttendanceFilter('Checked Out')}
                className={`px-3 py-1.5 rounded-lg transition-all ${attendanceFilter === 'Checked Out' ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Checked Out ({attendanceSummary?.checkedOutCount || 0})
              </button>
            </div>

            <Link
              to="/admin/attendance"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pl-2 border-l-2 border-slate-300"
            >
              Full Log <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Live Attendance Table */}
        {filteredAttendance.length === 0 ? (
          <div className="text-center py-12 space-y-2 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-300">
            <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No attendance check-ins recorded for today yet</h3>
            <p className="text-xs text-slate-500">Employees will appear here automatically when they check in with Jio Tag photo verification.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border-2 border-slate-200">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-100/90 text-xs font-extrabold uppercase text-slate-600 tracking-wider">
                  <th className="p-3.5 pl-4 border-r border-slate-200">Employee</th>
                  <th className="p-3.5 border-r border-slate-200">Department</th>
                  <th className="p-3.5 border-r border-slate-200">Check In</th>
                  <th className="p-3.5 border-r border-slate-200">Location (Jio Tag Address)</th>
                  <th className="p-3.5 border-r border-slate-200">Check Out</th>
                  <th className="p-3.5 border-r border-slate-200">Working Hours</th>
                  <th className="p-3.5 pr-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200 bg-white">
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
