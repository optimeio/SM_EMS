import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  QrCode,
  Lock,
  Heart,
  UserCheck,
  Building2,
  BadgeCheck,
  Sparkles
} from 'lucide-react';

const PublicVerification = () => {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/employees/verify/${employeeId}`);
        setEmployee(data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Employee record not found or link is invalid.');
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchVerification();
    }
  }, [employeeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/80 text-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-9 w-9 border-3 border-slate-900 border-t-transparent mx-auto"></div>
          <p className="text-slate-600 text-xs font-semibold tracking-wide">Verifying Corporate Identity Security Server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 relative">
      <div className="w-full max-w-md space-y-5 animate-fade-in relative z-10">
        
        {/* Header Branding */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-2xs">
              <img src="/sm_groups_logo.png" alt="THE SM GROUPS" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900 tracking-tight block leading-none">THE SM GROUPS</span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Corporate Verification Portal</span>
            </div>
          </div>

          <Link
            to="/scan"
            className="btn-secondary text-xs font-semibold shadow-2xs"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-600" />
            Scan QR
          </Link>
        </div>

        {error ? (
          <div className="card-saas p-7 text-center space-y-4 border-rose-200/90 bg-white rounded-3xl shadow-xl shadow-rose-500/5 relative overflow-hidden">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200/60 shadow-2xs">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Identity Verification Failed</h2>
              <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
            </div>
            <div className="text-xs font-mono font-bold text-rose-700 bg-rose-50/80 p-3 rounded-xl border border-rose-200/60">
              Reference ID: {employeeId}
            </div>
          </div>
        ) : (
          <div className="card-saas p-6 sm:p-7 space-y-6 bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/50 relative overflow-hidden backdrop-blur-xl">
            
            {/* Top Accent Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 absolute top-0 left-0" />

            {/* Official Security Verification Badge Banner */}
            <div className={`p-4 rounded-2xl flex items-center justify-between border shadow-2xs ${
              employee?.status === 'Active'
                ? 'bg-emerald-50/90 border-emerald-200/90 text-emerald-950'
                : 'bg-rose-50/90 border-rose-200/90 text-rose-950'
            }`}>
              <div className="flex items-center gap-3">
                {employee?.status === 'Active' ? (
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-2xs">
                    <UserCheck className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-2xs">
                    <XCircle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">
                    Security Verification
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {employee?.status === 'Active' ? (
                      <>
                        <span className="text-xs font-extrabold text-emerald-900 tracking-tight">VERIFIED & ACTIVE</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      </>
                    ) : (
                      <span className="text-xs font-extrabold text-rose-900 tracking-tight">STATUS INACTIVE / REVOKED</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="hidden sm:inline-flex items-center gap-1 bg-white/90 border border-slate-200/80 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold text-slate-600 shadow-2xs">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                LIVE AUTH
              </div>
            </div>

            {employee?.status !== 'Active' && (
              <div className="badge-danger p-3 rounded-xl text-xs text-center font-medium">
                Notice: This identity card status is currently set to Inactive.
              </div>
            )}

            {/* Profile Photo & Primary Info Header */}
            <div className="flex flex-col items-center text-center space-y-3 pt-1">
              <div className="relative">
                {employee?.profilePhoto ? (
                  <img 
                    src={employee.profilePhoto} 
                    alt={employee.name} 
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md ring-1 ring-slate-200/80"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl font-extrabold border-4 border-white shadow-md ring-1 ring-slate-200/80">
                    {employee?.name?.[0]}
                  </div>
                )}
                
                <div className="absolute bottom-1 right-1 bg-emerald-600 text-white p-1.5 rounded-full ring-4 ring-white shadow-xs">
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                </div>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {employee?.name}
                </h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                  {employee?.designation}
                </p>
                <div className="mt-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 border border-slate-200/80 text-xs font-mono font-extrabold rounded-xl text-slate-800 shadow-2xs">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    ID: {employee?.employeeId}
                  </span>
                </div>
              </div>
            </div>

            {/* Particulars Card List */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs">
              
              {/* Department */}
              <div className="p-3 bg-slate-50/80 border border-slate-200/60 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Department</span>
                </div>
                <span className="font-bold text-slate-900">{employee?.department}</span>
              </div>

              {/* Email */}
              <div className="p-3 bg-slate-50/80 border border-slate-200/60 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Corporate Email</span>
                </div>
                <span className="font-semibold text-slate-800 truncate max-w-[200px]">{employee?.email}</span>
              </div>

              {/* Phone */}
              <div className="p-3 bg-slate-50/80 border border-slate-200/60 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Contact Phone</span>
                </div>
                <span className="font-semibold text-slate-800 font-mono">{employee?.phone}</span>
              </div>

              {/* Blood Group */}
              <div className="p-3 bg-slate-50/80 border border-slate-200/60 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Blood Group</span>
                </div>
                <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200/60 px-2.5 py-0.5 rounded-lg font-mono">
                  {employee?.bloodGroup || 'O+ve'}
                </span>
              </div>

              {/* Joining Date */}
              <div className="p-3 bg-slate-50/80 border border-slate-200/60 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Joining Date</span>
                </div>
                <span className="font-semibold text-slate-800 font-mono">
                  {employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-GB') : 'N/A'}
                </span>
              </div>
            </div>

            {/* Footer Security Stamp */}
            <div className="pt-4 border-t border-slate-100 bg-slate-50/70 -mx-6 -mb-6 sm:-mx-7 sm:-mb-7 p-4 text-center space-y-1 rounded-b-3xl">
              <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified Live via THE SM GROUPS Security Server
              </p>
              <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-mono">
                <Lock className="w-3 h-3 text-slate-400" />
                Official Corporate Verification Portal
              </p>
            </div>

          </div>
        )}

        <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-slate-400" />
          THE SM GROUPS Enterprise Security Verification
        </p>

      </div>
    </div>
  );
};

export default PublicVerification;
