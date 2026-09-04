import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  Clock, 
  Upload, 
  CheckCircle2, 
  Image as ImageIcon, 
  AlertCircle, 
  RefreshCw, 
  LogOut as LogOutIcon, 
  Eye, 
  X, 
  History,
  FileImage,
  Building2,
  Check,
  Camera,
  MapPin
} from 'lucide-react';

const EmployeeAttendance = () => {
  const { user } = useContext(AuthContext);

  const [todayData, setTodayData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Location state
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Photo viewer modal state
  const [viewPhotoUrl, setViewPhotoUrl] = useState(null);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [todayRes, historyRes] = await Promise.all([
        API.get('/attendance/today'),
        API.get('/attendance/my-history')
      ]);

      setTodayData(todayRes.data.attendance);
      setHistory(historyRes.data || []);
    } catch (err) {
      console.error('Failed to fetch attendance data', err);
      setError('Unable to load attendance records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const handleGetLocation = () => {
    setLocationLoading(true);
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        let addressStr = '';
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3000);
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
            signal: controller.signal,
            headers: { 'Accept-Language': 'en' }
          });
          clearTimeout(timer);
          const data = await res.json();
          if (data && data.display_name) {
            addressStr = data.display_name;
          }
        } catch (err) {
          console.warn("Geocoding fast-fallback:", err.message);
          addressStr = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        }

        setLocation({
          lat,
          lng,
          address: addressStr
        });
        setLocationLoading(false);
      },
      (error) => {
        setLocationError('Unable to retrieve location. Please grant permission in your browser settings.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError(null);

    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file format. Only JPG, JPEG, and PNG images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo file size exceeds 5 MB. Please select a smaller photo.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleClearPhoto = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select your Geo Tag photo to check in.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      const formData = new FormData();
      formData.append('photo', selectedFile);
      if (location) {
        formData.append('location', JSON.stringify(location));
      }

      const { data } = await API.post('/attendance/check-in', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessMsg('Attendance marked successfully!');
      setTodayData(data.attendance);
      handleClearPhoto();
      fetchAttendanceData();
    } catch (err) {
      console.error('Check-in error:', err);
      setError(err.response?.data?.message || 'Unable to upload attendance photo. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOutSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);
      const { data } = await API.post('/attendance/check-out', {
        location: location ? JSON.stringify(location) : null
      });
      setSuccessMsg('Checked out successfully!');
      setTodayData(data.attendance);
      fetchAttendanceData();
    } catch (err) {
      console.error('Check-out error:', err);
      setError(err.response?.data?.message || 'Failed to check out. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openPhotoModal = (attendanceId) => {
    let token = '';
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      token = userInfo.token || '';
    } catch (e) {}
    setViewPhotoUrl(`${API.defaults.baseURL || 'http://localhost:5000/api'}/attendance/photo/${attendanceId}?token=${token}`);
  };

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const formatTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daily Attendance Check-In</h1>
          <p className="text-sm text-slate-500 mt-1">
            Submit Jio Tag verification photos and register daily attendance.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-white border border-slate-200/90 shadow-2xs px-4 py-2 rounded-xl text-xs font-semibold text-slate-700">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Today: <strong className="text-slate-900 font-bold">{todayFormatted}</strong></span>
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="badge-danger w-full p-4 rounded-xl text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-800 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="badge-success w-full p-4 rounded-xl text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-800 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Check-In / Status Card */}
      <div className="card-saas p-6 space-y-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
        
        {/* Card Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Current Status
            </span>
            <div className="flex items-center gap-2">
              <span className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                todayData?.status === 'Present'
                  ? 'badge-success'
                  : todayData?.status === 'Checked Out'
                  ? 'badge-neutral'
                  : 'badge-warning'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  todayData?.status === 'Present'
                    ? 'bg-emerald-500 animate-pulse'
                    : todayData?.status === 'Checked Out'
                    ? 'bg-slate-400'
                    : 'bg-amber-500'
                }`}></span>
                {todayData ? todayData.status.toUpperCase() : 'NOT CHECKED IN'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Department
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/60">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              {user?.department || 'General'}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-700" />
          </div>
        ) : !todayData ? (
          /* Check In Form */
          <form onSubmit={handleCheckInSubmit} className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Upload Geo Tag Attendance Photo</h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload your Geo Tag photo from your device to complete check-in verification.
              </p>
            </div>

            {/* Hidden File Inputs - Always rendered so labels can trigger them from anywhere */}
            <input
              type="file"
              id="geo-tag-camera-input"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              type="file"
              id="geo-tag-photo-input"
              accept=".jpg,.jpeg,.png,image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {!location ? (
              <div className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-2xl p-6 sm:p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-4">
                <div className="w-16 h-16 bg-white rounded-2xl border border-slate-300 flex items-center justify-center mx-auto text-sky-600 shadow-sm">
                  <MapPin className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">Location Required</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">
                    Please grant location access to continue with attendance check-in.
                  </p>
                </div>
                {locationError && (
                  <div className="text-xs text-rose-600 font-bold bg-rose-50 p-2 rounded-lg">
                    {locationError}
                  </div>
                )}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locationLoading}
                    className="btn-primary py-3.5 px-6 text-base sm:text-sm w-full sm:w-auto font-bold shadow-sm active:scale-[0.98] inline-flex items-center justify-center gap-2"
                  >
                    {locationLoading ? (
                      <RefreshCw className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <MapPin className="w-5 h-5 text-white" />
                    )}
                    {locationLoading ? 'Acquiring Location...' : 'Get My Location'}
                  </button>
                </div>
              </div>
            ) : !previewUrl ? (
              <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-2xl p-6 sm:p-8 text-center transition-colors space-y-4">
                <div className="w-16 h-16 bg-white rounded-2xl border border-emerald-300 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                  <Camera className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-slate-900">Location Acquired &bull; Take Photo</h4>
                  {location?.address ? (
                    <div className="mt-2.5 p-2 bg-emerald-100/50 rounded-lg border border-emerald-200/60 inline-block max-w-sm">
                      <p className="text-xs text-emerald-800 font-semibold leading-relaxed">
                        📍 {location.address}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">
                      Tap below to open your camera app directly to take a live photo or select a saved photo file.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-md mx-auto">
                  <label
                    htmlFor="geo-tag-camera-input"
                    className="btn-primary py-3.5 text-base sm:text-sm cursor-pointer w-full flex items-center justify-center gap-2 font-bold shadow-sm active:scale-[0.98]"
                  >
                    <Camera className="w-5 h-5 text-white" />
                    Open Camera App
                  </label>

                  <label
                    htmlFor="geo-tag-photo-input"
                    className="btn-secondary py-3.5 text-base sm:text-sm cursor-pointer w-full flex items-center justify-center gap-2 font-bold shadow-sm active:scale-[0.98]"
                  >
                    <Upload className="w-5 h-5 text-slate-600" />
                    Select Gallery Photo
                  </label>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4.5 h-4.5 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-200">Selected Photo Preview</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg truncate max-w-[200px]">
                    {selectedFile?.name}
                  </span>
                </div>

                <div className="flex justify-center bg-black/50 p-3 rounded-xl max-h-[320px]">
                  <img
                    src={previewUrl}
                    alt="Jio Tag Attendance Preview"
                    className="max-h-[300px] w-auto object-contain rounded-lg"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-slate-400">Original image untouched</span>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <label
                      htmlFor="geo-tag-photo-input"
                      className="btn-secondary text-xs bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 flex-1 sm:flex-none justify-center cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Pick Another
                    </label>
                    <label
                      htmlFor="geo-tag-camera-input"
                      className="btn-primary text-xs flex-1 sm:flex-none justify-center cursor-pointer flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5 text-white" />
                      Retake Photo
                    </label>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !selectedFile}
              className="btn-primary text-sm w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.99]"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Uploading & Checking In...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-emerald-300" />
                  Upload & Check In
                </>
              )}
            </button>
          </form>
        ) : (
          /* Checked In State */
          <div className="space-y-6">
            
            {/* Attendance Verified Banner */}
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-2xs">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-emerald-950">Attendance Marked Successfully</h4>
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">Check-in registered and verified on Google Drive cloud storage.</p>
                  {todayData?.location?.address && (
                    <div className="flex items-start gap-1.5 mt-2 text-emerald-800 bg-emerald-100/60 py-1.5 px-2.5 rounded-lg border border-emerald-200/60 inline-flex max-w-sm">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-px" />
                      <span className="text-[11px] font-bold leading-tight whitespace-normal break-words">{todayData.location.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => openPhotoModal(todayData._id)}
                className="btn-secondary text-xs bg-white hover:bg-emerald-50/50 text-slate-800 border-emerald-200/80 shrink-0 font-semibold shadow-2xs"
              >
                <Eye className="w-4 h-4 text-slate-600" />
                View Photo
              </button>
            </div>

            {/* Time Metrics Grid - 3 Column Side-by-Side Grid on Mobile */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              
              {/* Check In Time */}
              <div className="p-3 sm:p-5 bg-white border border-slate-300/90 rounded-xl sm:rounded-2xl space-y-1 shadow-2xs min-w-0">
                <span className="text-xs sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">Check In Time</span>
                <p className="text-sm sm:text-xl font-black text-slate-900 tabular-nums truncate">
                  {formatTime(todayData.checkIn)}
                </p>
              </div>

              {/* Check Out Time */}
              <div className="p-3 sm:p-5 bg-white border border-slate-300/90 rounded-xl sm:rounded-2xl space-y-1 shadow-2xs min-w-0">
                <span className="text-xs sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">Check Out Time</span>
                <p className="text-sm sm:text-xl font-bold text-slate-700 tabular-nums truncate">
                  {todayData.checkOut ? formatTime(todayData.checkOut) : '-- : --'}
                </p>
              </div>

              {/* Total Working Hours */}
              <div className="p-3 sm:p-5 bg-white border border-slate-300/90 rounded-xl sm:rounded-2xl space-y-1 shadow-2xs min-w-0">
                <span className="text-xs sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">Working Hours</span>
                {todayData.workingHours ? (
                  <p className="text-sm sm:text-xl font-black text-slate-900 tabular-nums truncate">
                    {todayData.workingHours}
                  </p>
                ) : (
                  <div className="inline-flex items-center gap-1 text-xs sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg border border-emerald-200/60 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <span className="truncate">In Progress</span>
                  </div>
                )}
              </div>

            </div>

            {/* Check Out Action Button */}
            {!todayData.checkOut && (
              <div className="pt-2">
                <button
                  onClick={handleCheckOutSubmit}
                  disabled={submitting}
                  className="btn-primary text-sm font-semibold w-full py-3.5 rounded-xl flex items-center justify-center gap-2.5 shadow-xs hover:shadow-md transition-all active:scale-[0.99]"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Checking Out...
                    </>
                  ) : (
                    <>
                      <LogOutIcon className="w-4 h-4 text-rose-300" />
                      Check Out Now
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Attendance History Section */}
      <div className="card-saas p-6 space-y-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">Attendance History</h3>
          </div>
          <span className="text-xs font-medium text-slate-500">Your Recent Records</span>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No historical attendance records found.</p>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    <th className="p-4 pl-5">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Check In</th>
                    <th className="p-4">Check Out</th>
                    <th className="p-4">Hours</th>
                    <th className="p-4">Location</th>
                    <th className="p-4 pr-5 text-right">Photo Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                  {history.map((record) => (
                    <tr key={record._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-5 font-bold text-slate-900 font-mono text-xs">{record.date}</td>
                      <td className="p-4">
                        <span className={record.status === 'Present' ? 'badge-success' : 'badge-neutral'}>
                          {record.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs font-semibold text-slate-900">{formatTime(record.checkIn)}</td>
                      <td className="p-4 font-mono text-xs text-slate-500">{formatTime(record.checkOut)}</td>
                      <td className="p-4 font-mono text-emerald-700 font-bold text-xs">{record.workingHours || '-'}</td>
                      <td className="p-4">
                        {record.location?.lat ? (
                          <a
                            href={`https://www.google.com/maps?q=${record.location.lat},${record.location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-start gap-1 text-sky-700 hover:text-sky-900 transition-colors"
                          >
                            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span className="text-[11px] font-bold whitespace-normal break-words leading-tight" title={record.location.address || 'Map'}>
                              {record.location.address || 'Map'}
                            </span>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="p-4 pr-5 text-right">
                        <button
                          onClick={() => openPhotoModal(record._id)}
                          className="btn-secondary text-xs py-1.5 px-3"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Stacked Card View (Zero Horizontal Scroll!) */}
            <div className="block md:hidden space-y-3">
              {history.map((record) => (
                <div key={record._id} className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 font-mono">{record.date}</span>
                    <span className={record.status === 'Present' ? 'badge-success text-[11px]' : 'badge-neutral text-[11px]'}>
                      {record.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs bg-white p-2.5 rounded-lg border border-slate-200/60">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Check In</span>
                      <span className="font-bold text-slate-900 font-mono text-[11px]">{formatTime(record.checkIn)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Check Out</span>
                      <span className="font-mono text-slate-600 text-[11px]">{formatTime(record.checkOut)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Hours</span>
                      <span className="font-bold text-emerald-700 font-mono text-[11px]">{record.workingHours || '-'}</span>
                    </div>
                  </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => openPhotoModal(record._id)}
                        className="btn-secondary text-xs w-full py-2 flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        View Photo Evidence
                      </button>
                      {record.location?.lat && (
                        <a
                          href={`https://www.google.com/maps?q=${record.location.lat},${record.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-xs w-full py-2 flex items-center justify-center gap-1.5 text-sky-700 bg-sky-50 border-sky-200/60 hover:bg-sky-100 h-auto whitespace-normal break-words px-2 text-center leading-tight"
                          title={record.location.address || 'View GPS Location'}
                        >
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{record.location.address || 'View GPS Location'}</span>
                        </a>
                      )}
                    </div>
                  </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Photo Viewer Modal */}
      {viewPhotoUrl && createPortal(
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full relative space-y-4 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileImage className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-base">Check-In Photo Evidence</h4>
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
                alt="Attendance Evidence"
                className="max-h-[440px] w-auto object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x300?text=Photo+Unavailable';
                }}
              />
            </div>

            <div className="flex justify-end pt-2">
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

export default EmployeeAttendance;
