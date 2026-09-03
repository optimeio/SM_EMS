import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import API from '../services/api';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  LogOut, 
  Search, 
  Calendar, 
  Eye, 
  X, 
  RefreshCw, 
  FileImage,
  MapPin,
  ExternalLink,
  Building2
} from 'lucide-react';

const AttendanceManagement = () => {
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    presentCount: 0,
    absentCount: 0,
    workingCount: 0,
    checkedOutCount: 0,
    filterDate: new Date().toISOString().split('T')[0]
  });

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);

  // Filters
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Secure Photo Viewer Modal
  const [viewPhotoUrl, setViewPhotoUrl] = useState(null);
  const [photoModalTitle, setPhotoModalTitle] = useState('');

  const departments = ['Marketing', 'Telecalling', 'IT'];

  const fetchAdminAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        date: filterDate,
        department: departmentFilter,
        status: statusFilter,
        search: searchTerm
      };

      const { data } = await API.get('/attendance/admin', { params });
      setSummary(data.summary || {});
      setRecords(data.records || []);
    } catch (err) {
      console.error('Failed to fetch admin attendance records', err);
      setError('Failed to load admin attendance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminAttendance();
  }, [filterDate, departmentFilter, statusFilter, searchTerm]);

  const openPhotoModal = (attendance) => {
    let token = '';
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      token = userInfo.token || '';
    } catch (e) {}
    const title = `${attendance.employee?.name || attendance.employeeId} (${attendance.employeeId}) • ${attendance.date}`;
    setPhotoModalTitle(title);
    setViewPhotoUrl(`${API.defaults.baseURL || 'http://localhost:5000/api'}/attendance/photo/${attendance._id}?token=${token}`);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Operations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor daily check-ins, working hours, and audit photo evidence on Google Drive.
          </p>
        </div>

        <button
          onClick={fetchAdminAttendance}
          className="btn-secondary text-sm shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Records
        </button>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="rounded-2xl p-4 sm:p-5 border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/50 space-y-1.5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Active</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl border border-slate-200/80 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">{summary.totalEmployees || 0}</p>
          <span className="text-xs text-slate-500 font-semibold">Active Staff</span>
        </div>

        <div className="rounded-2xl p-4 sm:p-5 border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/20 to-emerald-100/30 space-y-1.5 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">Present</span>
            <div className="p-2 bg-emerald-100/80 text-emerald-700 rounded-xl border border-emerald-200/80 group-hover:scale-105 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-800 tabular-nums">{summary.presentCount || 0}</p>
          <span className="text-xs text-emerald-700 font-extrabold">Checked In Today</span>
        </div>

        <div className="rounded-2xl p-4 sm:p-5 border border-rose-200/80 bg-gradient-to-br from-white via-rose-50/20 to-rose-100/30 space-y-1.5 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300 group">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-[11px] font-extrabold text-rose-800 uppercase tracking-wider">Absent</span>
            <div className="p-2 bg-rose-100/80 text-rose-700 rounded-xl border border-rose-200/80 group-hover:scale-105 transition-transform">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-800 tabular-nums">{summary.absentCount || 0}</p>
          <span className="text-xs text-rose-700 font-extrabold">Not Checked In</span>
        </div>

        <div className="rounded-2xl p-4 sm:p-5 border border-amber-200/80 bg-gradient-to-br from-white via-amber-50/20 to-amber-100/30 space-y-1.5 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 group">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider">On Shift</span>
            <div className="p-2 bg-amber-100/80 text-amber-700 rounded-xl border border-amber-200/80 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-800 tabular-nums">{summary.workingCount || 0}</p>
          <span className="text-xs text-amber-700 font-extrabold">Currently Working</span>
        </div>

        <div className="rounded-2xl p-4 sm:p-5 border border-purple-200/80 bg-gradient-to-br from-white via-purple-50/20 to-purple-100/30 space-y-1.5 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 group">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-[11px] font-extrabold text-purple-800 uppercase tracking-wider">Checked Out</span>
            <div className="p-2 bg-purple-100/80 text-purple-700 rounded-xl border border-purple-200/80 group-hover:scale-105 transition-transform">
              <LogOut className="w-4 h-4 text-purple-700" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-900 tabular-nums">{summary.checkedOutCount || 0}</p>
          <span className="text-xs text-purple-700 font-extrabold">Shift Completed</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card-saas p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-2 border-slate-300 shadow-sm">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Filter Date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="input-saas text-sm w-full py-2"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Department</label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="input-saas text-sm w-full py-2 font-medium"
          >
            <option value="All">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-saas text-sm w-full py-2 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Present">Present (Working)</option>
            <option value="Checked Out">Checked Out</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Search</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-saas pl-10 text-sm w-full py-2"
            />
          </div>
        </div>
      </div>

      {/* Main Attendance Table — Zero Horizontal Scroll Design */}
      <div className="card-saas p-0 overflow-hidden border-2 border-slate-300 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-16">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-700" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No attendance records found</h3>
            <p className="text-xs text-slate-500">Try adjusting your date or filter criteria.</p>
          </div>
        ) : (
          <div className="w-full">
            {/* Desktop & Laptop Table View — Fits 100% Screen Width without Horizontal Scrolling */}
            <div className="hidden lg:block w-full">
              <table className="w-full text-left border-collapse text-sm table-fixed">
                <thead>
                  <tr className="border-b-2 border-slate-300 bg-slate-100 text-xs font-extrabold uppercase text-slate-600 tracking-wider">
                    <th className="p-3.5 pl-5 w-[24%] border-r border-slate-200">Employee & Department</th>
                    <th className="p-3.5 w-[14%] border-r border-slate-200">Date</th>
                    <th className="p-3.5 w-[20%] border-r border-slate-200">Check In / Out</th>
                    <th className="p-3.5 w-[20%] border-r border-slate-200">Jio Tag Location</th>
                    <th className="p-3.5 w-[11%] border-r border-slate-200">Status</th>
                    <th className="p-3.5 pr-5 w-[11%] text-right">Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-200 bg-white font-normal">
                  {records.map((r) => {
                    const empName = typeof r.employee === 'object' && r.employee?.name ? r.employee.name : (r.employeeId || 'Employee');
                    const initialChar = typeof empName === 'string' && empName.length > 0 ? empName.charAt(0).toUpperCase() : 'E';
                    const photo = r.employee?.profilePhoto;
                    const dept = r.department || r.employee?.department || 'Staff';

                    return (
                      <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Employee & Department */}
                        <td className="p-3.5 pl-5">
                          <div className="flex items-center gap-3">
                            {photo ? (
                              <img src={photo} alt={empName} className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                                {initialChar}
                              </div>
                            )}
                            <div className="truncate">
                              <span className="font-bold text-slate-900 text-sm block truncate leading-tight">{empName}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-xs font-semibold text-slate-400">{r.employeeId}</span>
                                <span className="text-slate-300">•</span>
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                                  {dept}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="p-3.5 font-mono text-slate-600 text-xs font-semibold">
                          {r.date}
                        </td>

                        {/* Check In / Check Out & Hours */}
                        <td className="p-3.5 text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className="text-[11px] font-bold text-slate-400 w-7">IN:</span>
                              <span className="font-bold text-emerald-700 tabular-nums">{formatTime(r.checkIn)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className="text-[11px] font-bold text-slate-400 w-7">OUT:</span>
                              <span className="font-bold text-slate-700 tabular-nums">{formatTime(r.checkOut)}</span>
                              {r.workingHours && (
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200/60 ml-1">
                                  {r.workingHours}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Jio Tag Location */}
                        <td className="p-3.5">
                          {r.location?.address ? (
                            <a
                              href={r.location?.lat ? `https://www.google.com/maps?q=${r.location.lat},${r.location.lng}` : '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start gap-1.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium leading-relaxed border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs group cursor-pointer"
                              title="Click to open exact location in Google Maps"
                            >
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                              <span className="whitespace-normal break-words font-medium text-slate-700 group-hover:text-slate-900">{r.location.address}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700 shrink-0 ml-auto mt-0.5" />
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 font-normal italic">Location not tagged</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          {r.status === 'Present' ? (
                            <span className="badge-success text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Present
                            </span>
                          ) : (
                            <span className="badge-neutral text-xs">
                              Checked Out
                            </span>
                          )}
                        </td>

                        {/* Photo Evidence Action */}
                        <td className="p-3.5 pr-5 text-right">
                          <button
                            onClick={() => openPhotoModal(r)}
                            className="btn-secondary text-xs py-1.5 px-2.5 hover:border-slate-400"
                            title="View Jio Tag Photo Evidence"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            Audit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Responsive List Cards View (Zero Horizontal Scroll!) */}
            <div className="block lg:hidden p-3.5 space-y-3">
              {records.map((r) => {
                const empName = typeof r.employee === 'object' && r.employee?.name ? r.employee.name : (r.employeeId || 'Employee');
                const initialChar = typeof empName === 'string' && empName.length > 0 ? empName.charAt(0).toUpperCase() : 'E';
                const photo = r.employee?.profilePhoto;

                return (
                  <div key={r._id} className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-3 hover:border-slate-300 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {photo ? (
                          <img src={photo} alt={empName} className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                            {initialChar}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-sm text-slate-900 leading-tight">{empName}</div>
                          <div className="font-mono text-xs text-slate-500 mt-0.5">{r.employeeId} • {r.department}</div>
                        </div>
                      </div>

                      <span className={r.status === 'Present' ? 'badge-success text-xs' : 'badge-neutral text-xs'}>
                        {r.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs bg-white p-2.5 rounded-lg border border-slate-200/60">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Check In</span>
                        <span className="font-bold text-emerald-700 font-mono text-xs">{formatTime(r.checkIn)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Check Out</span>
                        <span className="font-bold text-slate-700 font-mono text-xs">{formatTime(r.checkOut)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Hours</span>
                        <span className="font-bold text-indigo-700 font-mono text-xs">{r.workingHours || '--'}</span>
                      </div>
                    </div>

                    {r.location?.address && (
                      <a
                        href={r.location?.lat ? `https://www.google.com/maps?q=${r.location.lat},${r.location.lng}` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 text-xs text-slate-700 font-medium leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all group"
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span className="group-hover:text-slate-900 leading-normal">{r.location.address}</span>
                      </a>
                    )}

                    <button
                      onClick={() => openPhotoModal(r)}
                      className="btn-secondary text-xs w-full py-2 flex items-center justify-center gap-1.5 bg-white"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      View Photo Evidence
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Secure Photo Viewer Modal */}
      {viewPhotoUrl && createPortal(
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full relative space-y-4 shadow-2xl my-auto">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <FileImage className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Check-In Photo Evidence</h4>
                  <p className="text-xs text-slate-500 font-medium">{photoModalTitle}</p>
                </div>
              </div>
              <button
                onClick={() => setViewPhotoUrl(null)}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl flex items-center justify-center min-h-[300px]">
              <img
                src={viewPhotoUrl}
                alt="Audit Check-In Photo Evidence"
                className="max-h-[440px] w-auto object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x300?text=Photo+Unavailable';
                }}
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-400 font-medium">Stored on Google Drive</span>
              <button
                onClick={() => setViewPhotoUrl(null)}
                className="btn-primary text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default AttendanceManagement;
