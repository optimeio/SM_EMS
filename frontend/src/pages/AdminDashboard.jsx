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
  Calendar
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid 
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, activityRes] = await Promise.all([
          API.get('/dashboard/stats'),
          API.get('/activity-logs')
        ]);
        setStats(statsRes.data);
        setActivities(activityRes.data.slice(0, 6));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
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

  const employeeStatusData = [
    { name: 'Active', value: stats?.activeEmployees || 0, color: '#0f172a' },
    { name: 'Inactive', value: stats?.inactiveEmployees || 0, color: '#cbd5e1' },
  ];

  const taskStatusData = [
    { name: 'Pending', count: stats?.pendingTasks || 0, fill: '#f59e0b' },
    { name: 'In Progress', count: stats?.inProgressTasks || 0, fill: '#0284c7' },
    { name: 'Completed', count: stats?.completedTasks || 0, fill: '#10b981' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time workforce metrics, ID verification status, and task completion rates.</p>
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

      {/* KPI Cards Grid - 2 Column Mobile Side-by-Side Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Active Workforce */}
        <div className="card-saas p-3.5 sm:p-5 space-y-2 sm:space-y-3 hover:border-slate-300 transition-all min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">Active Workforce</span>
            <div className="p-1.5 sm:p-2 bg-slate-100 text-slate-700 rounded-lg shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums truncate">
              {stats?.activeEmployees || 0}
              <span className="text-xs sm:text-sm font-normal text-slate-400 ml-1">/ {stats?.totalEmployees || 0}</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs sm:text-xs text-emerald-700 font-bold truncate">
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span>Active ratio {stats?.totalEmployees ? Math.round(((stats.activeEmployees || 0) / stats.totalEmployees) * 100) : 0}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Tasks Completed */}
        <div className="card-saas p-3.5 sm:p-5 space-y-2 sm:space-y-3 hover:border-slate-300 transition-all min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">Tasks Done</span>
            <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-700 rounded-lg shrink-0 border border-emerald-200/50">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums truncate">
              {stats?.completedTasks || 0}
              <span className="text-xs sm:text-sm font-normal text-slate-400 ml-1">/ {stats?.totalTasks || 0}</span>
            </div>
            <p className="text-xs sm:text-xs text-slate-500 font-medium mt-1 truncate">Completed tasks</p>
          </div>
        </div>

        {/* Card 3: In Progress Operations */}
        <div className="card-saas p-3.5 sm:p-5 space-y-2 sm:space-y-3 hover:border-slate-300 transition-all min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">In Progress</span>
            <div className="p-1.5 sm:p-2 bg-sky-50 text-sky-700 rounded-lg shrink-0 border border-sky-200/50">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums truncate">
              {stats?.inProgressTasks || 0}
            </div>
            <p className="text-xs sm:text-xs text-sky-700 font-bold mt-1 truncate">Active assignments</p>
          </div>
        </div>

        {/* Card 4: Total Workforce Score */}
        <div className="card-saas p-3.5 sm:p-5 space-y-2 sm:space-y-3 hover:border-slate-300 transition-all min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">Total Score</span>
            <div className="p-1.5 sm:p-2 bg-amber-50 text-amber-700 rounded-lg shrink-0 border border-amber-200/50">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums truncate">
              {stats?.totalPointsAwarded || 0} <span className="text-xs sm:text-sm font-normal text-slate-400">pts</span>
            </div>
            <p className="text-xs sm:text-xs text-slate-500 font-medium mt-1 truncate">Total points awarded</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pie Chart Card */}
        <div className="card-saas p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              Workforce Status
            </h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={employeeStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {employeeStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart Card */}
        <div className="card-saas p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              Task Breakdown
            </h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskStatusData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Logs Timeline */}
      <div className="card-saas p-5 space-y-4">
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
