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
  MapPin
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
    if (!dateStr) return '-';
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
          className="btn-secondary text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Records
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card-saas p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Active</span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{summary.totalEmployees || 0}</p>
          <span className="text-xs text-slate-500 font-medium">Active Staff</span>
        </div>

        <div className="card-saas p-4 space-y-2 border-emerald-200/60 bg-emerald-50/30">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Present</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-800 tabular-nums">{summary.presentCount || 0}</p>
          <span className="text-xs text-emerald-700 font-semibold">Checked In Today</span>
        </div>

        <div className="card-saas p-4 space-y-2 border-rose-200/60 bg-rose-50/30">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Absent</span>
            <UserX className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-800 tabular-nums">{summary.absentCount || 0}</p>
          <span className="text-xs text-rose-700 font-semibold">Not Checked In</span>
        </div>

        <div className="card-saas p-4 space-y-2 border-amber-200/60 bg-amber-50/30">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-semibold uppercase tracking-wider">On Shift</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-800 tabular-nums">{summary.workingCount || 0}</p>
          <span className="text-xs text-amber-700 font-semibold">Currently Working</span>
        </div>

        <div className="card-saas p-4 space-y-2 bg-slate-50">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Checked Out</span>
            <LogOut className="w-4 h-4 text-slate-700" />
          </div>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{summary.checkedOutCount || 0}</p>
          <span className="text-xs text-slate-500 font-medium">Shift Completed</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card-saas p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Filter Date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="input-saas text-sm w-full"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Department</label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="input-saas text-sm w-full"
          >
            <option value="All">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-saas text-sm w-full"
          >
            <option value="All">All Statuses</option>
            <option value="Present">Present (Working)</option>
            <option value="Checked Out">Checked Out</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Search</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-saas pl-10 text-sm w-full"
            />
          </div>
        </div>
      </div>

      {/* Main Attendance Table */}
      <div className="card-saas overflow-x-auto p-0">
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
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    <th className="p-4 pl-5">Employee</th>
                    <th className="p-4">ID</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Check In</th>
                    <th className="p-4">Check Out</th>
                    <th className="p-4">Hours</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-5 text-right">Photo Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {records.map((r) => {
                    const empName = r.employee?.name || r.employeeId;
                    const photo = r.employee?.profilePhoto;

                    return (
                      <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 pl-5">
                          <div className="flex items-center gap-3">
                            {photo ? (
                              <img src={photo} alt={empName} className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                                {empName[0]}
                              </div>
                            )}
                            <span className="font-bold text-slate-900 text-sm">{empName}</span>
                          </div>
                        </td>

                        <td className="p-4 font-mono text-slate-600 font-semibold text-xs">{r.employeeId}</td>

                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/60 text-xs font-semibold">
                            {r.department}
                          </span>
                        </td>

                        <td className="p-4 font-mono text-slate-600 text-xs">{r.date}</td>

                        <td className="p-4 font-mono font-semibold text-slate-900 text-sm">{formatTime(r.checkIn)}</td>

                        <td className="p-4 font-mono text-slate-600 text-sm">{formatTime(r.checkOut)}</td>

                        <td className="p-4 font-mono font-bold text-emerald-700 text-sm">{r.workingHours || '-'}</td>

                        <td className="p-4">
                          {r.location?.lat ? (
                            <a
                              href={`https://www.google.com/maps?q=${r.location.lat},${r.location.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-start gap-1 text-sky-700 hover:text-sky-900 transition-colors"
                            >
                              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span className="text-[11px] font-bold whitespace-normal break-words leading-tight" title={r.location.address || 'View Map'}>
                                {r.location.address || 'View Map'}
                              </span>
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>

                        <td className="p-4">
                          <span className={r.status === 'Present' ? 'badge-success' : 'badge-neutral'}>
                            {r.status}
                          </span>
                        </td>

                        <td className="p-4 pr-5 text-right">
                          <button
                            onClick={() => openPhotoModal(r)}
                            className="btn-secondary text-xs py-1.5 px-3"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            Photo Evidence
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Stacked Card View (Zero Horizontal Scroll!) */}
            <div className="block md:hidden p-3.5 space-y-3">
              {records.map((r) => {
                const empName = r.employee?.name || r.employeeId;
                const photo = r.employee?.profilePhoto;

                return (
                  <div key={r._id} className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {photo ? (
                          <img src={photo} alt={empName} className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {empName[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-xs text-slate-900">{empName}</div>
                          <div className="font-mono text-[10px] text-slate-500">{r.employeeId} • {r.department}</div>
                        </div>
                      </div>

                      <span className={r.status === 'Present' ? 'badge-success text-[11px]' : 'badge-neutral text-[11px]'}>
                        {r.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs bg-white p-2.5 rounded-lg border border-slate-200/60">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">Check In</span>
                        <span className="font-bold text-slate-900 font-mono text-[11px]">{formatTime(r.checkIn)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">Check Out</span>
                        <span className="font-mono text-slate-600 text-[11px]">{formatTime(r.checkOut)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">Hours</span>
                        <span className="font-bold text-emerald-700 font-mono text-[11px]">{r.workingHours || '-'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => openPhotoModal(r)}
                        className="btn-secondary text-xs w-full py-2 flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        View Photo Evidence
                      </button>
                      {r.location?.lat && (
                        <a
                          href={`https://www.google.com/maps?q=${r.location.lat},${r.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-xs w-full py-2 flex items-center justify-center gap-1.5 text-sky-700 bg-sky-50 border-sky-200/60 hover:bg-sky-100 h-auto whitespace-normal break-words px-2 text-center leading-tight"
                          title={r.location.address || 'View GPS Location'}
                        >
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{r.location.address || 'View GPS Location'}</span>
                        </a>
                      )}
                    </div>
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
