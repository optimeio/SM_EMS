import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { 
  Mail, 
  Briefcase, 
  Award, 
  QrCode, 
  LogOut,
  Heart,
  MapPin,
  ShieldAlert,
  Key,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  User,
  Sparkles,
  Phone,
  Building2,
  Calendar
} from 'lucide-react';

const EmployeeProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');

  const fetchProfile = async () => {
    try {
      const { data } = await API.get('/employees/me');
      if (data) {
        setProfileData(data);
      }
    } catch (err) {
      console.error('Failed to load employee profile', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopySuccess(`${label} copied to clipboard!`);
    setTimeout(() => setCopySuccess(''), 2500);
  };

  if (!user) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Personnel Profile</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Complete corporate record, personal credentials, and official identity badge.</p>
        </div>
        
        <button
          onClick={handleLogout}
          className="btn-danger w-full sm:w-auto text-xs py-2.5 px-4 shadow-rose-600/20 font-extrabold"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          {user.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-indigo-500/20 shadow-md shrink-0"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-slate-900 to-indigo-950 text-white font-extrabold flex items-center justify-center text-3xl shadow-md shrink-0 border border-slate-800">
              {user.name?.[0]?.toUpperCase()}
            </div>
          )}

          <div className="text-center sm:text-left space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h2>
              <span className={user.status === 'Active' ? 'badge-success' : 'badge-danger'}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                {user.status || 'Active Employee'}
              </span>
            </div>
            
            <p className="text-xs sm:text-sm font-bold text-indigo-600">
              {user.designation} • <span className="text-slate-700 font-semibold">{user.department} Department</span>
            </p>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                onClick={() => copyToClipboard(user.employeeId, 'Employee ID')}
                className="font-mono text-xs text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-3 py-1 rounded-xl border border-slate-200/80 font-extrabold inline-flex items-center gap-1.5 transition-colors"
                title="Click to copy Employee ID"
              >
                <span>ID: {user.employeeId}</span>
                <Copy className="w-3 h-3 text-slate-400" />
              </button>

              <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-800 px-3 py-1 rounded-xl border border-purple-200/60 text-xs font-black">
                <Award className="w-3.5 h-3.5 text-purple-600" />
                {user.totalPoints || 0} Pts
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
            <button
              onClick={async () => {
                const QRCode = (await import('qrcode')).default;
                const verificationUrl = `${window.location.origin}/verify/${user.employeeId}`;
                const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
                  width: 335,
                  margin: 1,
                  color: { dark: '#000000', light: '#ffffff' }
                });
                const link = document.createElement('a');
                link.href = qrDataUrl;
                link.download = `QR_${user.employeeId}_335x335.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="btn-secondary text-xs py-2.5 px-4 rounded-xl font-bold"
            >
              <QrCode className="w-4 h-4 text-slate-600" />
              Download QR
            </button>
          </div>
        </div>

        {/* Details Grid Section */}
        <div className="space-y-6">
          
          {/* 1. Corporate Assignments */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-indigo-500" />
              Corporate Assignments
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Department</span>
                <span className="font-extrabold text-slate-900 text-sm block truncate">{user.department}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Designation</span>
                <span className="font-extrabold text-slate-900 text-sm block truncate">{user.designation}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Date of Joining</span>
                <span className="font-extrabold text-slate-900 text-sm block truncate">{formatDate(user.joiningDate)}</span>
              </div>
            </div>
          </div>

          {/* 2. Personal Information */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-500" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Full Name</span>
                <span className="font-extrabold text-slate-900 text-sm block truncate">{user.name}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Date of Birth</span>
                <span className="font-extrabold text-slate-900 text-sm block truncate">{formatDate(user.dateOfBirth)}</span>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/60 space-y-1">
                <span className="text-[10px] font-extrabold text-rose-500 uppercase tracking-wider flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> Blood Group
                </span>
                <span className="font-black text-rose-800 text-sm block truncate">{user.bloodGroup || 'O+'}</span>
              </div>
            </div>
          </div>

          {/* 3. Contact & Location Details */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-indigo-500" />
              Contact & Location Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Corporate Email</span>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm block truncate">{user.email}</span>
                  <button onClick={() => copyToClipboard(user.email, 'Email')} className="text-slate-400 hover:text-indigo-600 p-0.5">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Phone Number</span>
                <span className="font-extrabold text-slate-900 text-sm block truncate">{user.phone || 'N/A'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Emergency Contact
                </span>
                <span className="font-extrabold text-slate-900 text-sm block truncate">{user.emergencyContact || 'N/A'}</span>
              </div>
            </div>

            {/* Address */}
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> Residential Address
              </span>
              <p className="font-medium text-slate-800 text-xs sm:text-sm leading-relaxed">
                {user.address || 'Address details not updated yet.'}
              </p>
            </div>
          </div>

          {/* 4. Credentials & Security Access */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-4 h-4 text-indigo-500" />
              Credentials & Dashboard Access
            </h3>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-indigo-950 block">Current Workspace Password</span>
                <p className="text-[11px] text-indigo-700 font-medium">Use your Employee ID or Email and password to log in.</p>
              </div>

              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-indigo-200 shadow-2xs self-start sm:self-auto">
                <span className="font-mono text-xs font-bold text-slate-900 tracking-wider">
                  {showPassword ? (profileData?.plainTextPassword || user?.plainTextPassword || 'Password@123') : '••••••••'}
                </span>

                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => copyToClipboard(profileData?.plainTextPassword || user?.plainTextPassword || 'Password@123', 'Password')}
                  className="p-1 text-slate-400 hover:text-indigo-600 rounded-md transition-colors"
                  title="Copy Password"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Toast Notification */}
      {copySuccess && (
        <div className="fixed bottom-6 right-6 z-[60] bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in border border-emerald-500/50">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold text-sm">{copySuccess}</span>
        </div>
      )}
    </div>
  );
};

export default EmployeeProfilePage;

