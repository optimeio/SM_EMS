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
  PhoneCall,
  Calendar, 
  Briefcase, 
  QrCode, 
  Lock, 
  Heart, 
  UserCheck, 
  Building2, 
  BadgeCheck, 
  Sparkles,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  CreditCard,
  Cake,
  X
} from 'lucide-react';
import logoImg from '../assets/sm_groups_logo.png';

const PublicVerification = () => {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [showIDCardModal, setShowIDCardModal] = useState(false);

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/employees/verify/${employeeId}`);
        setEmployee(data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Employee record not found or verification link is invalid.');
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchVerification();
    }
  }, [employeeId]);

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/80 text-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-9 w-9 border-3 border-slate-900 border-t-[#DC2C2B] mx-auto"></div>
          <p className="text-slate-700 text-xs font-bold tracking-wide">Verifying Corporate Identity via THE SM GROUPS Security Server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-950 flex flex-col items-center justify-center p-3 sm:p-6 relative selection:bg-[#DC2C2B] selection:text-white">
      <div className="w-full max-w-lg space-y-4 sm:space-y-5 animate-fade-in relative z-10 py-4 sm:py-6">
        
        {/* Header Branding */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shadow-xs">
              <img src={logoImg} alt="THE SM GROUPS" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base text-slate-950 tracking-tight block leading-none">THE SM GROUPS</span>
              <span className="text-[10px] text-slate-500 font-bold block mt-0.5 uppercase tracking-wider">Identity Verification Portal</span>
            </div>
          </div>

          <Link
            to="/scan"
            className="btn-secondary text-xs font-extrabold shadow-xs"
          >
            <QrCode className="w-3.5 h-3.5 text-[#DC2C2B]" />
            Scan QR
          </Link>
        </div>

        {error ? (
          <div className="card-saas p-7 text-center space-y-4 border-rose-200/90 bg-white rounded-3xl shadow-xl shadow-rose-500/5 relative overflow-hidden">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200/60 shadow-2xs">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900">Identity Verification Failed</h2>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">{error}</p>
            </div>
            <div className="text-xs font-mono font-bold text-rose-700 bg-rose-50/80 p-3 rounded-xl border border-rose-200/60">
              Scanned Reference: {employeeId}
            </div>
            <div className="pt-2">
              <Link to="/scan" className="btn-brand text-xs px-4 py-2">
                Try Scanning Again
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-slate-300 rounded-3xl shadow-xl p-5 sm:p-7 space-y-6 relative overflow-hidden backdrop-blur-xl">
            
            {/* Top Brand Accent Stripe */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#DC2C2B] via-[#F87171] to-[#DC2C2B] absolute top-0 left-0" />

            {/* Official Security Verification Badge Banner */}
            <div className={`p-4 rounded-2xl flex items-center justify-between border-2 shadow-xs ${
              employee?.status === 'Active'
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                : 'bg-rose-50/90 border-rose-300 text-rose-950'
            }`}>
              <div className="flex items-center gap-3">
                {employee?.status === 'Active' ? (
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <UserCheck className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <XCircle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">
                    Identity Verification
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {employee?.status === 'Active' ? (
                      <>
                        <span className="text-xs sm:text-sm font-black text-emerald-950 tracking-tight">VERIFIED & ACTIVE</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      </>
                    ) : (
                      <span className="text-xs sm:text-sm font-black text-rose-950 tracking-tight">STATUS INACTIVE / REVOKED</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="hidden sm:inline-flex items-center gap-1.5 bg-white/95 border-2 border-emerald-300 px-3 py-1.5 rounded-xl text-[11px] font-mono font-black text-emerald-900 shadow-xs">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                LIVE AUTH
              </div>
            </div>

            {employee?.status !== 'Active' && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs text-center font-bold">
                Notice: This corporate badge is currently marked as Inactive in the company registry.
              </div>
            )}

            {/* Profile Photo & Primary Identity Header */}
            <div className="flex flex-col items-center text-center space-y-3 pt-1">
              <div className="relative">
                {employee?.profilePhoto ? (
                  <img 
                    src={employee.profilePhoto} 
                    alt={employee.name} 
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-slate-300" 
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-950 text-white flex items-center justify-center text-3xl sm:text-4xl font-black border-4 border-white shadow-lg ring-2 ring-slate-300">
                    {employee?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                
                <div className="absolute bottom-1 right-1 bg-emerald-600 text-white p-1.5 rounded-full ring-4 ring-white shadow-sm" title="Verified Employee">
                  <CheckCircle2 className="w-4.5 h-4.5 stroke-[3]" />
                </div>
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight">
                  {employee?.name}
                </h1>
                <p className="text-xs sm:text-sm font-black text-[#DC2C2B] uppercase tracking-wider">
                  {employee?.designation || 'Staff Member'}
                </p>
                <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 text-white text-xs font-mono font-black rounded-xl shadow-xs">
                    <Building2 className="w-3.5 h-3.5 text-[#DC2C2B]" />
                    ID: {employee?.employeeId}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                    {employee?.department}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Interactive Contact Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {employee?.phone && (
                <a
                  href={`tel:${employee.phone}`}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 rounded-xl flex flex-col items-center justify-center text-center gap-1 transition-all active:scale-95"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px] font-black text-slate-800">Call Mobile</span>
                </a>
              )}

              {employee?.emergencyContact && (
                <a
                  href={`tel:${employee.emergencyContact}`}
                  className="p-2.5 bg-rose-50/80 hover:bg-rose-100 border-2 border-rose-200 rounded-xl flex flex-col items-center justify-center text-center gap-1 transition-all active:scale-95"
                >
                  <PhoneCall className="w-4 h-4 text-rose-600" />
                  <span className="text-[11px] font-black text-rose-900">Emergency</span>
                </a>
              )}

              {employee?.email && (
                <a
                  href={`mailto:${employee.email}`}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 rounded-xl flex flex-col items-center justify-center text-center gap-1 transition-all active:scale-95"
                >
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span className="text-[11px] font-black text-slate-800">Send Email</span>
                </a>
              )}

              {employee?.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(employee.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 rounded-xl flex flex-col items-center justify-center text-center gap-1 transition-all active:scale-95"
                >
                  <MapPin className="w-4 h-4 text-[#DC2C2B]" />
                  <span className="text-[11px] font-black text-slate-800">View Map</span>
                </a>
              )}
            </div>

            {/* HIGH-VISIBILITY HIGHLIGHT: Residential Address Card */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 via-white to-slate-50 border-2 border-slate-300 rounded-2xl shadow-sm space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#DC2C2B]" />
                  </div>
                  <div>
                    <span className="font-black uppercase tracking-wider text-[11px] text-slate-900 block leading-tight">
                      Permanent / Residential Address
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 block">Official Verified Address</span>
                  </div>
                </div>

                {employee?.address && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => copyToClipboard(employee.address, 'address')}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                      title="Copy Address"
                    >
                      {copiedField === 'address' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(employee.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-950 text-white hover:bg-black rounded-lg text-[10px] font-black shadow-xs transition-transform active:scale-95"
                    >
                      Maps <ExternalLink className="w-3 h-3 text-[#DC2C2B]" />
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-1">
                {employee?.address ? (
                  <p className="text-xs sm:text-sm font-extrabold text-slate-950 leading-relaxed tracking-tight select-all">
                    {employee.address}
                  </p>
                ) : (
                  <p className="text-xs font-bold text-slate-400 italic">
                    Residential address has not been provided in personnel record.
                  </p>
                )}
              </div>
            </div>

            {/* HIGH-VISIBILITY HIGHLIGHT: Emergency Contact Card */}
            {employee?.emergencyContact && (
              <div className="p-4 bg-rose-50/80 border-2 border-rose-300 rounded-2xl shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-rose-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                    <PhoneCall className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-900 block leading-tight">
                      Emergency Contact Number
                    </span>
                    <span className="text-sm sm:text-base font-black font-mono text-slate-950 block mt-0.5 tracking-tight">
                      {employee.emergencyContact}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => copyToClipboard(employee.emergencyContact, 'emergency')}
                    className="p-1.5 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors"
                    title="Copy Emergency Number"
                  >
                    {copiedField === 'emergency' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={`tel:${employee.emergencyContact}`}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" /> Dial
                  </a>
                </div>
              </div>
            )}

            {/* Comprehensive Particulars Grid */}
            <div className="space-y-2.5 pt-1 text-xs">
              <div className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center justify-between px-1">
                <span>Employee Identification Credentials</span>
                <span className="text-slate-400 font-mono text-[10px]">Verified Registry</span>
              </div>

              {/* Department */}
              <div className="p-3.5 bg-slate-50/90 border-2 border-slate-200/90 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Briefcase className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="font-bold uppercase tracking-wider text-[10px]">Department</span>
                </div>
                <span className="font-black text-slate-950 text-right">{employee?.department}</span>
              </div>

              {/* Designation */}
              <div className="p-3.5 bg-slate-50/90 border-2 border-slate-200/90 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="font-bold uppercase tracking-wider text-[10px]">Designation</span>
                </div>
                <span className="font-black text-slate-950 text-right">{employee?.designation}</span>
              </div>

              {/* Blood Group */}
              <div className="p-3.5 bg-slate-50/90 border-2 border-slate-200/90 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Heart className="w-4 h-4 text-[#DC2C2B] shrink-0" />
                  <span className="font-bold uppercase tracking-wider text-[10px]">Blood Group</span>
                </div>
                <span className="font-black text-white bg-[#DC2C2B] px-3 py-0.5 rounded-md font-mono text-xs shadow-xs">
                  {employee?.bloodGroup || 'O+'}
                </span>
              </div>

              {/* Date of Birth */}
              {employee?.dateOfBirth && (
                <div className="p-3.5 bg-slate-50/90 border-2 border-slate-200/90 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Cake className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="font-bold uppercase tracking-wider text-[10px]">Date of Birth</span>
                  </div>
                  <span className="font-black text-slate-950 font-mono">
                    {formatDate(employee.dateOfBirth)}
                  </span>
                </div>
              )}

              {/* Contact Phone */}
              <div className="p-3.5 bg-slate-50/90 border-2 border-slate-200/90 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold uppercase tracking-wider text-[10px]">Contact Mobile</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-950 font-mono text-xs">{employee?.phone}</span>
                  <button
                    onClick={() => copyToClipboard(employee.phone, 'phone')}
                    className="text-slate-400 hover:text-slate-800"
                    title="Copy Phone"
                  >
                    {copiedField === 'phone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Corporate Email */}
              <div className="p-3.5 bg-slate-50/90 border-2 border-slate-200/90 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="font-bold uppercase tracking-wider text-[10px]">Email Address</span>
                </div>
                <div className="flex items-center gap-2 max-w-[220px]">
                  <span className="font-bold text-slate-950 truncate text-xs">{employee?.email}</span>
                  <button
                    onClick={() => copyToClipboard(employee.email, 'email')}
                    className="text-slate-400 hover:text-slate-800 shrink-0"
                    title="Copy Email"
                  >
                    {copiedField === 'email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Date of Joining */}
              <div className="p-3.5 bg-slate-50/90 border-2 border-slate-200/90 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-bold uppercase tracking-wider text-[10px]">Joining Date</span>
                </div>
                <span className="font-black text-slate-950 font-mono">
                  {formatDate(employee?.joiningDate)}
                </span>
              </div>
            </div>

            {/* Official Digital ID Card Preview Button (if uploaded) */}
            {employee?.idCardImage && (
              <div className="pt-2">
                <button
                  onClick={() => setShowIDCardModal(true)}
                  className="w-full py-3 px-4 bg-slate-950 hover:bg-black text-white text-xs font-black rounded-xl border border-slate-900 shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <CreditCard className="w-4 h-4 text-[#DC2C2B]" />
                  <span>View Official Digital ID Badge Card</span>
                </button>
              </div>
            )}

            {/* Security Seal Footer */}
            <div className="pt-4 border-t-2 border-slate-200 bg-slate-50/90 -mx-5 -mb-5 sm:-mx-7 sm:-mb-7 p-4 text-center space-y-1.5 rounded-b-3xl">
              <p className="text-xs font-black text-slate-950 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Personnel • THE SM GROUPS Enterprise Registry</span>
              </p>
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono font-bold">
                <Lock className="w-3 h-3 text-[#DC2C2B]" />
                <span>SSL Encrypted Live Server Verification</span>
                <span>•</span>
                <span>ID: {employee?.employeeId}</span>
              </div>
            </div>

          </div>
        )}

        {/* Modal for Viewing Full-Size ID Card */}
        {showIDCardModal && employee?.idCardImage && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-4 max-w-sm w-full space-y-3 relative animate-scale-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#DC2C2B]" />
                  <h3 className="text-xs font-black text-slate-950">Official ID Badge</h3>
                </div>
                <button
                  onClick={() => setShowIDCardModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                <img 
                  src={employee.idCardImage} 
                  alt={`${employee.name} ID Card`} 
                  className="w-full h-auto object-contain max-h-[70vh]" 
                />
              </div>
              <a
                href={employee.idCardImage}
                download={`ID_Card_${employee.employeeId}.png`}
                className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
              >
                Download ID Card Image
              </a>
            </div>
          </div>
        )}

        <p className="text-center text-[11px] text-slate-500 font-bold flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#DC2C2B]" />
          <span>THE SM GROUPS • Workforce Platform & Security Ecosystem</span>
        </p>

      </div>
    </div>
  );
};

export default PublicVerification;
