import React, { useEffect, useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import LogoSpinner from '../components/LogoSpinner';
import { 
  CreditCard, 
  Search, 
  QrCode, 
  Users, 
  Copy, 
  Check, 
  X, 
  Upload, 
  ExternalLink,
  FileImage,
  Sparkles,
  RefreshCw,
  Mail,
  Building2,
  ArrowRight,
  ChevronLeft,
  Download,
  PenTool,
  Megaphone,
  Headphones,
  Code2,
  Target,
  Cpu
} from 'lucide-react';

const CANVA_EDIT_URL = 'https://canva.link/rmuleulxpdvg2nd';
const CANVA_ACCOUNT_EMAIL = 'mbktechnology8@gmail.com';

const IDCardsPage = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [generatingQR, setGeneratingQR] = useState(null);

  // Upload finished ID Card modal state
  const [uploadEmp, setUploadEmp] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        const { data } = await API.get('/employees');
        setEmployees(data);
      } else {
        const { data } = await API.get('/employees/me');
        setEmployees([data]);
      }
    } catch (err) {
      console.error('Failed to load employee ID cards', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [user]);

  const generateAndSaveQR = async (emp) => {
    try {
      setGeneratingQR(emp._id);
      const { data } = await API.post(`/employees/${emp._id}/generate-qr`);
      setEmployees(prev => prev.map(e =>
        e._id === emp._id ? { ...e, qrCodeImage: data.qrCodeImage } : e
      ));
    } catch (err) {
      console.error('Failed to generate QR', err);
      alert(err.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setGeneratingQR(null);
    }
  };

  const downloadEmployeeQR = (emp) => {
    if (emp.qrCodeImage) {
      const link = document.createElement('a');
      link.href = emp.qrCodeImage;
      link.download = `QR_${emp.employeeId}_335x335.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const departments = ['Marketing', 'Telecalling', 'IT'];

  const getDepartmentIcon = (dept) => {
    switch (dept) {
      case 'Marketing': return <Megaphone className="w-5.5 h-5.5 text-rose-600" />;
      case 'Telecalling': return <Headphones className="w-5.5 h-5.5 text-amber-600" />;
      case 'IT': return <Code2 className="w-5.5 h-5.5 text-indigo-600" />;
      case 'Sales': return <Target className="w-5.5 h-5.5 text-emerald-600" />;
      case 'HR': return <Users className="w-5.5 h-5.5 text-purple-600" />;
      case 'Engineering': return <Cpu className="w-5.5 h-5.5 text-sky-600" />;
      default: return <Building2 className="w-5.5 h-5.5 text-slate-700" />;
    }
  };

  const getDepartmentBadgeStyle = (dept) => {
    switch (dept) {
      case 'Marketing': return { topBar: 'bg-rose-500', iconBg: 'bg-rose-50 border-rose-200 text-rose-600', text: 'group-hover:text-rose-600', badge: 'bg-rose-50 text-rose-800 border-rose-200', bg: 'bg-white border-2 border-slate-300' };
      case 'Telecalling': return { topBar: 'bg-amber-500', iconBg: 'bg-amber-50 border-amber-200 text-amber-600', text: 'group-hover:text-amber-700', badge: 'bg-amber-50 text-amber-900 border-amber-200', bg: 'bg-white border-2 border-slate-300' };
      case 'IT': return { topBar: 'bg-indigo-500', iconBg: 'bg-indigo-50 border-indigo-200 text-indigo-600', text: 'group-hover:text-indigo-600', badge: 'bg-indigo-50 text-indigo-800 border-indigo-200', bg: 'bg-white border-2 border-slate-300' };
      case 'Sales': return { topBar: 'bg-emerald-500', iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-600', text: 'group-hover:text-emerald-600', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', bg: 'bg-white border-2 border-slate-300' };
      case 'HR': return { topBar: 'bg-purple-500', iconBg: 'bg-purple-50 border-purple-200 text-purple-600', text: 'group-hover:text-purple-600', badge: 'bg-purple-50 text-purple-800 border-purple-200', bg: 'bg-white border-2 border-slate-300' };
      case 'Engineering': return { topBar: 'bg-sky-500', iconBg: 'bg-sky-50 border-sky-200 text-sky-600', text: 'group-hover:text-sky-600', badge: 'bg-sky-50 text-sky-800 border-sky-200', bg: 'bg-white border-2 border-slate-300' };
      default: return { topBar: 'bg-slate-500', iconBg: 'bg-slate-50 border-slate-200 text-slate-600', text: 'group-hover:text-slate-900', badge: 'bg-slate-50 text-slate-700 border-slate-200', bg: 'bg-white border-2 border-slate-300' };
    }
  };

  const handleIDCardUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadEmp) return;

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setUploadError('Please select a valid JPG or PNG image file.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('File size exceeds 8 MB.');
      return;
    }

    try {
      setUploadingImage(true);
      setUploadError(null);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        await API.put(`/employees/${uploadEmp._id}`, {
          idCardImage: base64Data
        });
        setUploadSuccess(`Finished ID Card image saved for ${uploadEmp.name}!`);
        setTimeout(() => {
          setUploadSuccess(null);
          setUploadEmp(null);
          fetchEmployees();
        }, 1500);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to upload ID Card image', err);
      setUploadError('Failed to save ID Card image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !selectedDept || selectedDept === 'All' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Corporate Digital ID Cards</h1>
          <p className="text-sm text-slate-500 mt-1">Manage employee identity badges, Canva templates, and security QR code assets.</p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <a
              href={CANVA_EDIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm shadow-md"
            >
              <ExternalLink className="w-4 h-4" />
              Edit Canva Design
            </a>
            <span className="btn-secondary text-sm bg-white cursor-default">
              {employees.length} Badges
            </span>
          </div>
        )}
      </div>

      {/* Canva Notice Banner (Admin Only) */}
      {isAdmin && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-800 rounded-xl shrink-0 border border-slate-700">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Canva Editing Account</span>
              <p className="text-sm font-medium text-white flex items-center gap-2 mt-0.5">
                <Mail className="w-4 h-4 text-slate-400" />
                Authorized Account: <span className="font-mono text-slate-200">{CANVA_ACCOUNT_EMAIL}</span>
              </p>
            </div>
          </div>

          <a
            href={CANVA_EDIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs bg-white text-slate-900 hover:bg-slate-100 border-none shrink-0"
          >
            Open Canva Template
            <ExternalLink className="w-4 h-4 text-slate-600" />
          </a>
        </div>
      )}

      {/* Search Bar */}
      {isAdmin && (
        <div className="card-saas p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, ID (EMP001), designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-saas pl-10 text-sm w-full"
            />
          </div>

          {selectedDept && (
            <button
              onClick={() => setSelectedDept(null)}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Change Department
            </button>
          )}
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
        </div>
      ) : !isAdmin && employees.length > 0 ? (
        /* Employee Read-only ID Card View */
        <div className="space-y-5">
          {employees.map((emp) => (
            <div key={emp._id} className="card-saas p-6 space-y-5 max-w-xl mx-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
                  {emp.employeeId}
                </span>
                <span className={emp.status === 'Active' ? 'badge-success' : 'badge-danger'}>
                  {emp.status}
                </span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
                {emp.profilePhoto ? (
                  <img src={emp.profilePhoto} alt={emp.name} className="w-16 h-16 rounded-full object-cover border border-slate-200 shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-2xl shrink-0">
                    {emp.name[0]}
                  </div>
                )}
                <div>
                  <h2 className="font-bold text-base text-slate-900">{emp.name}</h2>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{emp.designation}</p>
                  <p className="text-xs text-slate-500">{emp.department} Department</p>
                </div>
              </div>

              {emp.idCardImage ? (
                <div className="space-y-3 p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-slate-500" />
                    Official SM Groups ID Card
                  </p>
                  <div className="rounded-lg overflow-hidden border border-slate-200 bg-white p-2 text-center">
                    <img
                      src={emp.idCardImage}
                      alt="Official ID Card"
                      className="w-full h-auto object-contain rounded max-h-72"
                    />
                  </div>
                  <a
                    href={emp.idCardImage}
                    download={`${emp.employeeId}_ID_Card.png`}
                    className="btn-primary text-xs w-full"
                  >
                    <Download className="w-4 h-4" />
                    Download Official ID Card
                  </a>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-2">
                  <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">ID Card Not Yet Issued</p>
                  <p className="text-xs text-slate-500">Your official ID card will appear here once published by admin.</p>
                </div>
              )}

              {emp.qrCodeImage && (
                <div className="space-y-3 p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-slate-500" />
                    Security QR Code
                  </p>
                  <div className="flex justify-center bg-white rounded-lg border border-slate-200 p-3">
                    <img src={emp.qrCodeImage} alt="QR Code" className="w-32 h-32 object-contain" style={{ imageRendering: 'pixelated' }} />
                  </div>
                  <button
                    onClick={() => downloadEmployeeQR(emp)}
                    className="btn-secondary text-xs w-full"
                  >
                    <Download className="w-4 h-4" />
                    Download QR Code
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : isAdmin && !selectedDept && !searchTerm ? (
        /* Admin Department Selection Cards */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Departments</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Select a department to view employee ID badges</p>
            </div>
            <button
              onClick={() => setSelectedDept('All')}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 underline"
            >
              View All ({employees.length})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {departments.map((dept) => {
              const count = employees.filter((e) => e.department === dept).length;
              const style = getDepartmentBadgeStyle(dept);
              return (
                <div
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`rounded-2xl p-6 border cursor-pointer group space-y-4 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${style.bg}`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-2xs transition-transform group-hover:scale-105 ${style.iconBg}`}>
                      {getDepartmentIcon(dept)}
                    </div>
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full border tabular-nums shadow-2xs ${style.badge}`}>
                      {count} Members
                    </span>
                  </div>

                  <div>
                    <h3 className={`text-lg font-bold text-slate-900 transition-colors ${style.text}`}>
                      {dept}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                      Explore identity badges for {dept}
                    </p>
                  </div>

                  <div className={`pt-2 flex items-center gap-1.5 text-xs font-bold text-slate-800 transition-colors ${style.text}`}>
                    <span>Explore Badges</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="card-saas text-center py-16 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No ID cards match your query</h3>
          <p className="text-xs text-slate-500">Try adjusting your search terms or filters.</p>
        </div>
      ) : (
        /* Admin Employee Badges Cards */
        <div className="space-y-4">
          {isAdmin && (
            <div className="flex items-center justify-between bg-white border border-slate-200/80 px-4 py-3 rounded-xl shadow-2xs">
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setSelectedDept(null)}
                  className="font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Departments
                </button>
                <span className="text-slate-300">/</span>
                <span className="font-bold text-slate-900 text-xs">
                  {selectedDept === 'All' ? 'All Departments' : `${selectedDept} Department`} ({filteredEmployees.length})
                </span>
              </div>

              {selectedDept && (
                <button
                  onClick={() => setSelectedDept(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                >
                  Show All Departments
                </button>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEmployees.map((emp) => (
            <div
              key={emp._id}
              className="card-saas p-5 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200/60">
                    {emp.employeeId}
                  </span>
                  <span className={emp.status === 'Active' ? 'badge-success' : 'badge-danger'}>
                    {emp.status}
                  </span>
                </div>

                <div className="flex items-center gap-3.5 p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
                  {emp.profilePhoto ? (
                    <img
                      src={emp.profilePhoto}
                      alt={emp.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {emp.name[0]}
                    </div>
                  )}
                  <div className="truncate text-left">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{emp.name}</h4>
                    <p className="text-xs font-medium text-slate-700 truncate mt-0.5">{emp.designation}</p>
                    <p className="text-xs text-slate-500 truncate">{emp.department}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Blood Group</span>
                    <span className="font-bold text-slate-800">{emp.bloodGroup || 'O+ve'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Contact</span>
                    <span className="font-semibold text-slate-800 truncate block">{emp.phone || 'N/A'}</span>
                  </div>
                </div>

                {emp.idCardImage ? (
                  <div className="space-y-2 p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <FileImage className="w-3.5 h-3.5 text-slate-500" />
                        Official ID Card
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => setUploadEmp(emp)}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                        >
                          Change
                        </button>
                      )}
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-1.5 text-center">
                      <img
                        src={emp.idCardImage}
                        alt={`${emp.name} ID Card`}
                        className="w-full h-auto max-h-48 object-contain mx-auto rounded"
                      />
                    </div>

                    <a
                      href={emp.idCardImage}
                      download={`${emp.employeeId}_Official_ID_Card.png`}
                      className="btn-primary text-xs w-full py-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Official ID Card
                    </a>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-center">
                    <span className="text-xs text-slate-500 font-medium">
                      Official Canva ID Card Pending Upload
                    </span>
                  </div>
                )}

                {/* Permanent QR Code Section */}
                <div>
                  {emp.qrCodeImage ? (
                    <div className="space-y-2 p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <QrCode className="w-3.5 h-3.5 text-slate-500" />
                          QR Code (335×335px)
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => generateAndSaveQR(emp)}
                            disabled={generatingQR === emp._id}
                            className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline disabled:opacity-50"
                          >
                            Regenerate
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-center bg-white rounded-lg border border-slate-200 p-2">
                        <img
                          src={emp.qrCodeImage}
                          alt={`QR Code for ${emp.name}`}
                          className="w-24 h-24 object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                      <button
                        onClick={() => downloadEmployeeQR(emp)}
                        className="btn-secondary text-xs w-full py-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download QR
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-2">
                      <p className="text-xs text-slate-500 font-medium">No QR code generated yet</p>
                      {isAdmin && (
                        <button
                          onClick={() => generateAndSaveQR(emp)}
                          disabled={generatingQR === emp._id}
                          className="btn-primary text-xs w-full py-2"
                        >
                          {generatingQR === emp._id ? (
                            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                          ) : (
                            <><QrCode className="w-3.5 h-3.5" /> Generate QR Code</>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                {isAdmin && (
                  <a
                    href={CANVA_EDIT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs w-full py-2.5"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    Create Card on Canva
                  </a>
                )}

                <button
                  onClick={() => setSelectedEmp(emp)}
                  className="btn-secondary text-xs w-full py-2.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Canva Details
                </button>

                {isAdmin && (
                  <button
                    onClick={() => setUploadEmp(emp)}
                    className="btn-secondary text-xs w-full py-2"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    {emp.idCardImage ? 'Replace Card' : 'Upload Card'}
                  </button>
                )}
              </div>

            </div>
          ))}
          </div>
        </div>
      )}

      {/* Copy Details Modal */}
      {selectedEmp && (
        <EmployeeDetailsModal
          employee={selectedEmp}
          onClose={() => setSelectedEmp(null)}
          onDownloadQR={downloadEmployeeQR}
        />
      )}

      {/* Upload ID Card Graphic Modal */}
      {uploadEmp && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full max-h-[85vh] flex flex-col shadow-xl space-y-4 animate-fade-in text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <FileImage className="w-5 h-5 text-slate-700" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upload Finished Canva ID Card</h3>
                  <p className="text-xs text-slate-500">{uploadEmp.name} • {uploadEmp.employeeId}</p>
                </div>
              </div>
              <button onClick={() => setUploadEmp(null)} className="p-1 text-slate-400 hover:text-slate-900 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto pr-1 flex-1 space-y-4">
              {uploadSuccess && (
                <div className="badge-success w-full p-3 text-xs">
                  {uploadSuccess}
                </div>
              )}

              {uploadError && (
                <div className="badge-danger w-full p-3 text-xs">
                  {uploadError}
                </div>
              )}

              {uploadEmp.idCardImage && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Current Card Preview</span>
                  <div className="bg-slate-900 p-3 rounded-xl flex justify-center max-h-[200px] overflow-hidden">
                    <img src={uploadEmp.idCardImage} alt="Current ID Card" className="max-h-[180px] w-auto object-contain rounded" />
                  </div>
                </div>
              )}

              <div className="border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl p-6 text-center bg-slate-50/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  id="id-card-upload-input"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleIDCardUpload}
                  className="hidden"
                />
                <label htmlFor="id-card-upload-input" className="cursor-pointer block space-y-2">
                  <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                  <span className="text-sm font-semibold text-slate-900 block">
                    {uploadingImage ? 'Uploading...' : 'Select Exported Image File'}
                  </span>
                  <span className="text-xs text-slate-400 block">Upload JPG or PNG exported from Canva</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end shrink-0 pt-3 border-t border-slate-100">
              <button onClick={() => setUploadEmp(null)} className="btn-secondary text-xs">
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

// Copy Details Modal Component
const EmployeeDetailsModal = ({ employee, onClose, onDownloadQR }) => {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!employee) return null;

  const formattedDOB = employee.dateOfBirth
    ? new Date(employee.dateOfBirth).toLocaleDateString('en-GB')
    : '02/04/2004';

  const fields = [
    { label: 'Employee Name', value: employee.name, key: 'name' },
    { label: 'Designation', value: (employee.designation || 'SALES EXECUTIVE').toUpperCase(), key: 'designation' },
    { label: 'Employee ID', value: employee.employeeId, key: 'employeeId' },
    { label: 'Date of Birth', value: formattedDOB, key: 'dob' },
    { label: 'Blood Group', value: employee.bloodGroup || 'O+ve', key: 'blood' },
    { label: 'Department', value: employee.department || 'N/A', key: 'department' },
    { label: 'Contact Number', value: employee.phone || 'N/A', key: 'phone' },
  ];

  const handleCopyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyAll = () => {
    const allText = fields.map(f => `${f.label}: ${f.value}`).join('\n');
    navigator.clipboard.writeText(allText);
    setCopiedKey('ALL');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full max-h-[85vh] flex flex-col shadow-xl space-y-4 animate-fade-in text-left">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Copy className="w-5 h-5 text-slate-700" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Copy Employee Particulars</h3>
              <p className="text-xs text-slate-500">{employee.name} • {employee.employeeId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto pr-1 flex-1 space-y-3">
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs text-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold block">Canva Editing Account</span>
              <span className="font-mono text-xs text-slate-600">{CANVA_ACCOUNT_EMAIL}</span>
            </div>
            <a
              href={CANVA_EDIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs py-1.5 px-3 shrink-0"
            >
              Open Canva
            </a>
          </div>

          <div className="space-y-2">
            {fields.map((field) => (
              <div key={field.key} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs">
                <div className="pr-2 truncate">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">{field.label}</span>
                  <span className="font-bold text-slate-900 text-sm select-all truncate block">{field.value}</span>
                </div>
                <button
                  onClick={() => handleCopyText(field.value, field.key)}
                  className="btn-secondary text-xs py-1 px-3 shrink-0"
                >
                  {copiedKey === field.key ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleCopyAll}
            className="btn-primary text-xs w-full sm:w-auto"
          >
            {copiedKey === 'ALL' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedKey === 'ALL' ? 'All Copied!' : 'Copy All Particulars'}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onDownloadQR(employee)}
              className="btn-secondary text-xs flex-1 sm:flex-none"
            >
              <QrCode className="w-4 h-4" />
              Download QR
            </button>

            <a
              href={CANVA_EDIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs flex-1 sm:flex-none"
            >
              <ExternalLink className="w-4 h-4" />
              Canva
            </a>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default IDCardsPage;
