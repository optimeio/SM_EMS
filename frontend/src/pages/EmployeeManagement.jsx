import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API, { clearApiCache } from '../services/api';
import LogoSpinner from '../components/LogoSpinner';
import IDCardModal from '../components/IDCardModal';
import { exportToExcel } from '../utils/excelExport';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Award, 
  X,
  UserCheck,
  UserX,
  Eye,
  CheckSquare,
  Mail,
  Download,
  Phone,
  Calendar,
  Trash2,
  Image as ImageIcon,
  User,
  Heart,
  ShieldAlert,
  ChevronLeft,
  ArrowRight,
  Key,
  EyeOff,
  ShieldCheck,
  Copy,
  Building2,
  Megaphone,
  Headphones,
  Code2,
  Target,
  Cpu,
  QrCode,
  Sparkles,
  Briefcase,
  ClipboardList,
  Clock,
  Check
} from 'lucide-react';

const EmployeeManagement = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [showDeptCards, setShowDeptCards] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedIDCardEmp, setSelectedIDCardEmp] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [editingPasswordId, setEditingPasswordId] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [editEmployee, setEditEmployee] = useState(null);
  const [confirmStatusEmp, setConfirmStatusEmp] = useState(null);
  const [deleteConfirmEmp, setDeleteConfirmEmp] = useState(null);

  // Persistent vault passwords store for admin visibility
  const [vaultPasswords, setVaultPasswords] = useState(() => {
    try {
      const saved = localStorage.getItem('ems_vault_passwords');
      const parsed = saved ? JSON.parse(saved) : {};
      if (!parsed['TSMG006'] && !parsed['dhanuzh.glitz@gmail.com']) {
        parsed['TSMG006'] = '1234';
        parsed['dhanuzh.glitz@gmail.com'] = '1234';
      }
      if (!parsed['TSMG008'] && !parsed['tharaneeshkp@gmail.com']) {
        parsed['TSMG008'] = '1234';
        parsed['tharaneeshkp@gmail.com'] = '1234';
      }
      return parsed;
    } catch (e) {
      return { 'TSMG006': '1234', 'dhanuzh.glitz@gmail.com': '1234', 'TSMG008': '1234', 'tharaneeshkp@gmail.com': '1234' };
    }
  });

  const getEmployeePassword = (emp) => {
    if (!emp) return 'Password@123';
    if (vaultPasswords[emp._id]) return vaultPasswords[emp._id];
    if (emp.employeeId && vaultPasswords[emp.employeeId]) return vaultPasswords[emp.employeeId];
    if (emp.email && vaultPasswords[emp.email.toLowerCase()]) return vaultPasswords[emp.email.toLowerCase()];
    if (emp.plainTextPassword) return emp.plainTextPassword;
    if (emp.employeeId === 'TSMG006' || emp.employeeId === 'TSMG008' || (emp.email && (emp.email.toLowerCase() === 'dhanuzh.glitz@gmail.com' || emp.email.toLowerCase() === 'tharaneeshkp@gmail.com'))) {
      return '1234';
    }
    return 'Password@123';
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text.trim());
    setSuccessMessage(`${label} copied to clipboard!`);
    setTimeout(() => setSuccessMessage(''), 2500);
  };

  const handleSaveVaultPassword = async (empId) => {
    const trimmedPass = newPasswordInput.trim();
    if (!trimmedPass) return;
    try {
      const targetEmp = employees.find(e => e._id === empId);
      await API.put(`/employees/${empId}`, { password: trimmedPass });

      // Save to persistent vault state and localStorage for admin visibility
      const updatedVault = {
        ...vaultPasswords,
        [empId]: trimmedPass,
        ...(targetEmp?.employeeId ? { [targetEmp.employeeId]: trimmedPass } : {}),
        ...(targetEmp?.email ? { [targetEmp.email.toLowerCase()]: trimmedPass } : {})
      };
      setVaultPasswords(updatedVault);
      try {
        localStorage.setItem('ems_vault_passwords', JSON.stringify(updatedVault));
      } catch (e) {}

      // Update in-memory employees state
      setEmployees(prev => prev.map(e => e._id === empId ? { ...e, plainTextPassword: trimmedPass } : e));

      setSuccessMessage('Password updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setEditingPasswordId(null);
      setNewPasswordInput('');
      fetchEmployees(page);
    } catch (err) {
      if (err.response?.status === 403) {
        alert('Unauthorized Action: Changing employee passwords requires Admin privileges. Please sign in as Admin (admin@company.com).');
        navigate('/login');
      } else {
        alert(err.response?.data?.message || 'Failed to update password');
      }
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deleteConfirmEmp) return;
    const deletedId = deleteConfirmEmp._id;
    setDeleteConfirmEmp(null);
    setEmployees(prev => prev.filter(e => e._id !== deletedId));
    setSuccessMessage('Employee deleted successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
    clearApiCache();

    try {
      await API.delete(`/employees/${deletedId}`);
      clearApiCache();
    } catch (err) {
      console.error('Delete employee warning:', err);
    } finally {
      fetchEmployees(page);
    }
  };
  
  // Profile Detail Modal State
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Form State for Add/Edit
  const [formData, setFormData] = useState({
    employeeId: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    department: 'Software Development',
    designation: '',
    dateOfBirth: '',
    joiningDate: '',
    address: '',
    emergencyContact: '',
    bloodGroup: 'O+',
    profilePhoto: ''
  });

  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchEmployees = async (pageNum = 1) => {
    try {
      setLoading(true);
      const activeDept = departmentFilter !== 'All' ? departmentFilter : (selectedDept || 'All');
      const { data } = await API.get('/employees', {
        params: {
          page: pageNum,
          limit,
          search: searchTerm,
          status: statusFilter,
          department: activeDept
        }
      });
      if (data && data.employees) {
        setEmployees(data.employees);
        setTotalEmployees(data.total);
        setTotalPages(data.pages || 1);
        setPage(data.page || 1);
      } else if (Array.isArray(data)) {
        setEmployees(data);
        setTotalEmployees(data.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to fetch employees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(1);
  }, [searchTerm, statusFilter, departmentFilter, selectedDept, limit]);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setShowAddModal(true);
    }
  }, [searchParams]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleStatus = async () => {
    if (!confirmStatusEmp) return;
    const newStatus = confirmStatusEmp.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await API.patch(`/employees/${confirmStatusEmp._id}/status`, { status: newStatus });
      setConfirmStatusEmp(null);
      setProfileData(null);
      fetchEmployees();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      clearApiCache();
      const res = await API.post('/employees', formData);
      clearApiCache();
      setShowAddModal(false);
      resetForm();
      setSuccessMessage('Employee successfully added!');
      setTimeout(() => setSuccessMessage(''), 3000);
      if (res.data && res.data._id) {
        setEmployees(prev => [res.data, ...prev.filter(emp => emp._id !== res.data._id)]);
        setSelectedDept('All');
      }
      fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      clearApiCache();
      const res = await API.put(`/employees/${editEmployee._id}`, formData);
      clearApiCache();
      setEditEmployee(null);
      resetForm();
      setSuccessMessage('Employee successfully updated!');
      setTimeout(() => setSuccessMessage(''), 3000);
      if (res.data && res.data._id) {
        setEmployees(prev => prev.map(emp => emp._id === res.data._id ? res.data : emp));
      }
      fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      password: '',
      name: '',
      email: '',
      phone: '',
      department: selectedDept && selectedDept !== 'All' ? selectedDept : 'COI (Center Of Information)',
      designation: '',
      dateOfBirth: '',
      joiningDate: '',
      address: '',
      emergencyContact: '',
      bloodGroup: 'O+',
      profilePhoto: ''
    });
    setFormError(null);
  };

  const formatDateForInput = (dateVal) => {
    if (!dateVal) return '';
    const str = String(dateVal).trim();
    const ddmmyyyyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (ddmmyyyyMatch) {
      const day = ddmmyyyyMatch[1].padStart(2, '0');
      const month = ddmmyyyyMatch[2].padStart(2, '0');
      const year = ddmmyyyyMatch[3];
      return `${year}-${month}-${day}`;
    }
    try {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    } catch (e) {}
    return '';
  };

  const openEditModal = (emp) => {
    setEditEmployee(emp);
    setFormData({
      employeeId: emp.employeeId || '',
      password: '',
      name: emp.name || '',
      email: emp.email || '',
      phone: emp.phone || '',
      department: emp.department || 'COI (Center Of Information)',
      designation: emp.designation || '',
      dateOfBirth: formatDateForInput(emp.dateOfBirth),
      joiningDate: formatDateForInput(emp.joiningDate),
      address: emp.address || '',
      emergencyContact: emp.emergencyContact || '',
      bloodGroup: emp.bloodGroup || 'O+',
      profilePhoto: emp.profilePhoto || ''
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size must be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePhoto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, profilePhoto: '' }));
  };

  const openProfileDetail = async (empId) => {
    try {
      setProfileLoading(true);
      const { data } = await API.get(`/performance/${empId}`);
      setProfileData(data);
    } catch (err) {
      alert('Failed to load employee profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const getNormalizedDept = (dept) => {
    if (!dept) return 'Software Development';
    const d = String(dept).trim().toLowerCase();
    if (d.includes('coi') || d.includes('center of information') || d.includes('telecalling')) return 'COI (Center Of Information)';
    if (d.includes('sales') || d.includes('marketing')) return 'Sales And Marketing';
    if (d.includes('software') || d.includes('dev') || d.includes('engineering') || d.includes('it')) return 'Software Development';
    return dept;
  };

  const filteredEmployees = employees.filter((emp) => {
    const normDept = getNormalizedDept(emp.department);
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    const matchesDeptFilter = departmentFilter === 'All' || normDept === departmentFilter || emp.department === departmentFilter;
    const matchesSelectedDept = !selectedDept || selectedDept === 'All' || normDept === selectedDept || emp.department === selectedDept;

    return matchesSearch && matchesStatus && matchesDeptFilter && matchesSelectedDept;
  });

  const departments = ['COI (Center Of Information)', 'Sales And Marketing', 'Software Development'];

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Urgent': return 'badge-danger';
      case 'High': return 'badge-warning';
      case 'Medium': return 'badge-info';
      default: return 'badge-neutral';
    }
  };

  const getDepartmentIcon = (dept) => {
    switch (dept) {
      case 'COI (Center Of Information)': return <Building2 className="w-5.5 h-5.5 text-indigo-600" />;
      case 'Sales And Marketing': return <Megaphone className="w-5.5 h-5.5 text-rose-600" />;
      case 'Software Development': return <Code2 className="w-5.5 h-5.5 text-sky-600" />;
      default: return <Building2 className="w-5.5 h-5.5 text-slate-700" />;
    }
  };

  const getDepartmentBadgeStyle = (dept) => {
    switch (dept) {
      case 'COI (Center Of Information)': return { topBar: 'bg-indigo-500', iconBg: 'bg-indigo-50 border-indigo-200 text-indigo-600', text: 'group-hover:text-indigo-600', badge: 'bg-indigo-50 text-indigo-800 border-indigo-200', arrowBg: 'bg-indigo-50 group-hover:bg-indigo-100' };
      case 'Sales And Marketing': return { topBar: 'bg-rose-500', iconBg: 'bg-rose-50 border-rose-200 text-rose-600', text: 'group-hover:text-rose-600', badge: 'bg-rose-50 text-rose-800 border-rose-200', arrowBg: 'bg-rose-50 group-hover:bg-rose-100' };
      case 'Software Development': return { topBar: 'bg-sky-500', iconBg: 'bg-sky-50 border-sky-200 text-sky-600', text: 'group-hover:text-sky-600', badge: 'bg-sky-50 text-sky-800 border-sky-200', arrowBg: 'bg-sky-50 group-hover:bg-sky-100' };
      default: return { topBar: 'bg-slate-500', iconBg: 'bg-slate-50 border-slate-200 text-slate-600', text: 'group-hover:text-slate-900', badge: 'bg-slate-50 text-slate-700 border-slate-200', arrowBg: 'bg-slate-50 group-hover:bg-slate-100' };
    }
  };

  const handleExportExcel = () => {
    const dataToExport = filteredEmployees.map((emp) => ({
      'Employee ID': emp.employeeId || '',
      'Name': emp.name || '',
      'Department': emp.department || '',
      'Designation': emp.designation || '',
      'Email': emp.email || '',
      'Phone': emp.phone || '',
      'Blood Group': emp.bloodGroup || '',
      'Date of Joining': emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : '',
      'Date of Birth': emp.dateOfBirth ? new Date(emp.dateOfBirth).toLocaleDateString() : '',
      'Status': emp.status || 'Active',
      'Total Points': emp.points || 0
    }));

    exportToExcel(dataToExport, `Employee_Directory_${selectedDept || 'All'}`, 'Employees');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header Container — 100% Ultra-Sharp High-Contrast Panel */}
      <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-black tracking-wider uppercase bg-slate-950 text-white shadow-xs">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              PERSONNEL DIRECTORY
            </span>
            <span className="text-slate-300 font-bold">•</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-black tracking-wider uppercase bg-indigo-100 text-indigo-950 border border-indigo-300 shadow-xs">
              {employees.length} Active Records
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-none">
            Employee Directory
          </h1>
          <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed max-w-2xl">
            Manage personnel records, issue corporate identity badges, and view performance.
          </p>
        </div>

        {/* Unified Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap justify-start md:justify-end shrink-0 z-10">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-950 text-xs font-extrabold rounded-xl border-2 border-slate-300 shadow-xs transition-all hover:scale-[1.02] active:scale-95"
            title="Download Employee Records as Excel"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => setShowCredentialsModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-950 text-xs font-extrabold rounded-xl border-2 border-slate-300 shadow-xs transition-all hover:scale-[1.02] active:scale-95"
          >
            <Key className="w-4 h-4 text-amber-500" />
            <span>Credentials Vault</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-black text-white text-xs font-black rounded-xl shadow-md border border-slate-900 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Controls Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by employee name, ID (EMP001), or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-saas w-full pl-10 text-xs py-2.5 font-medium"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-saas w-full text-xs py-2.5 font-extrabold"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>

        <div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="input-saas w-full text-xs py-2.5 font-extrabold"
          >
            <option value="All">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Department Cards or Table */}
      {loading ? (
        <LogoSpinner label="Loading employee directory..." />
      ) : showDeptCards ? (
        /* Department Selection Cards (When user explicitly chooses to view Department Overview) */
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4">
            <button
              onClick={() => {
                setShowDeptCards(false);
                setSelectedDept('All');
                setDepartmentFilter('All');
              }}
              className="btn-secondary text-xs bg-white shadow-2xs flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto hover:bg-slate-50 font-extrabold py-2.5 px-4 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" />
              Back to Employee List ({employees.length})
            </button>
            <div className="text-center sm:text-right">
              <h2 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Departments Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Select a department to explore employee records</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {departments.map((dept) => {
              const count = employees.filter((e) => getNormalizedDept(e.department) === dept).length;
              const style = getDepartmentBadgeStyle(dept);
              return (
                <div
                  key={dept}
                  onClick={() => {
                    setSelectedDept(dept);
                    setDepartmentFilter(dept);
                    setShowDeptCards(false);
                  }}
                  className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col justify-between"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${style.topBar}`}></div>

                  <div className="flex items-center justify-between pt-1">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-2xs transition-transform duration-300 group-hover:scale-105 ${style.iconBg}`}>
                      {getDepartmentIcon(dept)}
                    </div>
                    <span className={`text-xs font-black px-3 py-1 rounded-full border tabular-nums shadow-2xs ${style.badge}`}>
                      {count} Members
                    </span>
                  </div>

                  <div className="my-4">
                    <h3 className={`text-lg font-black text-slate-900 transition-colors ${style.text}`}>
                      {dept}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                      Personnel directory, identity badges & role permissions
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-slate-700 group-hover:text-slate-900">
                    <span>Explore Department</span>
                    <div className={`p-1.5 rounded-xl border border-slate-200 group-hover:border-slate-300 transition-colors ${style.arrowBg}`}>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Employee Table Direct Listing */
        <div className="space-y-4 animate-fade-in">
          {/* Department Quick Tabs & View Switcher Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white border border-slate-200/80 p-3 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              <button
                onClick={() => {
                  setSelectedDept('All');
                  setDepartmentFilter('All');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 ${
                  (selectedDept === 'All' || !selectedDept) && departmentFilter === 'All'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>All Employees</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                  (selectedDept === 'All' || !selectedDept) && departmentFilter === 'All' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-800'
                }`}>
                  {employees.length}
                </span>
              </button>

              {departments.map((dept) => {
                const count = employees.filter((e) => getNormalizedDept(e.department) === dept).length;
                const isSelected = (selectedDept === dept || departmentFilter === dept) && selectedDept !== 'All';
                return (
                  <button
                    key={dept}
                    onClick={() => {
                      setSelectedDept(dept);
                      setDepartmentFilter(dept);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{dept}</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                      isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-800'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowDeptCards(true)}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-black rounded-xl border border-slate-200 shrink-0 transition-colors"
              title="View Departments Overview Cards"
            >
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Department Cards Overview</span>
            </button>
          </div>

          {filteredEmployees.length === 0 ? (
            <div className="bg-white rounded-2xl text-center py-16 space-y-3 border border-slate-200/80 shadow-2xs">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">No employees match your search</h3>
              <p className="text-xs text-slate-500">Try clearing filters or adjusting your search query.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white border border-slate-200/80 px-4 py-3 rounded-2xl shadow-2xs">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-extrabold text-slate-900 text-xs">
                    {selectedDept === 'All' ? 'All Personnel Records' : `${selectedDept} Department`} ({filteredEmployees.length} Personnel)
                  </span>
                </div>

                {selectedDept && selectedDept !== 'All' && (
                  <button
                    onClick={() => {
                      setSelectedDept('All');
                      setDepartmentFilter('All');
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
                  >
                    Show All Employees
                  </button>
                )}
              </div>

          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block table-saas-container">
              <table className="table-saas">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department & Designation</th>
                    <th>Joined Date</th>
                    <th>Status</th>
                    <th className="text-center">Score</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          {emp.profilePhoto ? (
                            <img
                              src={emp.profilePhoto}
                              alt={emp.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                              {emp.name[0]}
                            </div>
                          )}
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                              {emp.name}
                              <span className="font-mono text-xs text-slate-500 font-semibold">
                                {emp.employeeId}
                              </span>
                            </div>
                            <div className="text-slate-500 text-xs mt-0.5 font-medium">{emp.email}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="font-bold text-slate-900 text-sm">{emp.designation}</div>
                        <div className="text-slate-500 text-xs mt-0.5 font-medium">{emp.department}</div>
                      </td>

                      <td className="text-slate-700 font-mono text-xs font-semibold">
                        {new Date(emp.joiningDate).toLocaleDateString('en-GB')}
                      </td>

                      <td>
                        <span className={emp.status === 'Active' ? 'badge-success' : 'badge-danger'}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {emp.status}
                        </span>
                      </td>

                      <td className="text-center font-bold text-slate-900 tabular-nums">
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200/80 text-xs font-bold">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          {emp.totalPoints || 0} Pts
                        </span>
                      </td>

                      <td className="p-4 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openProfileDetail(emp._id)}
                            title="View Profile"
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openEditModal(emp)}
                            title="Edit Profile"
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setConfirmStatusEmp(emp)}
                            title={emp.status === 'Active' ? 'Deactivate' : 'Activate'}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            {emp.status === 'Active' ? <UserX className="w-4 h-4 text-amber-600" /> : <UserCheck className="w-4 h-4 text-emerald-600" />}
                          </button>

                          <button
                            onClick={() => setDeleteConfirmEmp(emp)}
                            title="Delete Employee"
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Stacked Card View (Zero Horizontal Scroll!) */}
            <div className="block md:hidden p-3.5 space-y-3">
              {filteredEmployees.map((emp) => (
                <div key={emp._id} className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {emp.profilePhoto ? (
                        <img
                          src={emp.profilePhoto}
                          alt={emp.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {emp.name[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{emp.name}</div>
                        <div className="font-mono text-xs text-slate-500">{emp.employeeId}</div>
                      </div>
                    </div>

                    <span className={emp.status === 'Active' ? 'badge-success text-[11px]' : 'badge-danger text-[11px]'}>
                      {emp.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Designation</span>
                      <span className="font-semibold text-slate-900 truncate block">{emp.designation}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Department</span>
                      <span className="font-semibold text-slate-700 block">{emp.department}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200/60 text-xs font-bold">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      {emp.totalPoints || 0} Pts
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openProfileDetail(emp._id)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(emp)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmStatusEmp(emp)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      >
                        {emp.status === 'Active' ? <UserX className="w-4 h-4 text-amber-600" /> : <UserCheck className="w-4 h-4 text-emerald-600" />}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmEmp(emp)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200/80 bg-slate-50/50 rounded-b-2xl">
                <div className="text-xs text-slate-500 font-medium">
                  Page <span className="font-bold text-slate-900">{page}</span> of <span className="font-bold text-slate-900">{totalPages}</span> ({totalEmployees} total employees)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => fetchEmployees(page - 1)}
                    className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => fetchEmployees(page + 1)}
                    className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            </div>
            </div>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {profileLoading && (
        <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-xs flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
        </div>
      )}

      {/* Profile Detail Modal */}
      {profileData && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-slate-200/90 rounded-[2rem] max-w-3xl w-full relative shadow-[0_25px_70px_rgba(0,0,0,0.35)] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            
            {/* High-End Enterprise Header Banner */}
            <div className="relative overflow-hidden bg-slate-950 p-6 sm:p-7 text-white shrink-0 border-b border-slate-800">
              {/* Multi-layered Ambient Glows & Grid Texture */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-1/3 -mb-12 w-72 h-72 bg-rose-600/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

              {/* Top Bar with Badge and Close button */}
              <div className="relative z-20 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-white/10 text-white border border-white/15 backdrop-blur-md inline-flex items-center gap-1.5 shadow-xs">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    CORPORATE PROFILE DOSSIER
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border shadow-xs ${
                    profileData.employee.status === 'Active'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${profileData.employee.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                    {profileData.employee.status}
                  </span>
                </div>

                <button
                  onClick={() => setProfileData(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
                  title="Close Profile"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Employee Identity Layout */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                {/* Halo Ring Avatar with Online Pulse */}
                <div className="relative shrink-0 group">
                  <div className="p-1 rounded-full bg-gradient-to-tr from-indigo-500 via-rose-500 to-amber-400 shadow-xl shadow-indigo-500/25 transition-transform duration-300 group-hover:scale-105">
                    {profileData.employee.profilePhoto ? (
                      <img
                        src={profileData.employee.profilePhoto}
                        alt={profileData.employee.name}
                        className="w-20 h-20 sm:w-22 sm:h-22 rounded-full object-cover bg-slate-900 border-2 border-slate-950 shadow-inner"
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white font-black flex items-center justify-center text-3xl border-2 border-slate-950 shadow-inner">
                        {profileData.employee.name[0]}
                      </div>
                    )}
                  </div>

                  {/* Active Status Pulse Dot */}
                  <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center p-0.5" title={profileData.employee.status}>
                    <span className="relative flex h-3.5 w-3.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        profileData.employee.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                        profileData.employee.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}></span>
                    </span>
                  </div>
                </div>

                {/* Identity Text */}
                <div className="text-center sm:text-left space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      {profileData.employee.name}
                    </h2>
                    <span className="font-mono text-xs font-black tracking-wider text-amber-300 bg-amber-400/10 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/30 shadow-xs">
                      {profileData.employee.employeeId}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap text-xs">
                    <span className="px-3 py-1 rounded-xl bg-white/10 text-slate-200 border border-white/10 font-bold backdrop-blur-sm shadow-xs">
                      {profileData.employee.designation || 'Staff Member'}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 font-bold inline-flex items-center gap-1.5 shadow-xs">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      {profileData.employee.department} Department
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1">
              
              {/* Executive KPI Performance Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5">
                {/* Total Tasks */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/80 hover:border-indigo-300 transition-all shadow-2xs group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Total Tasks</span>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center">
                      <ClipboardList className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">{profileData.stats.totalTasks}</div>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Assigned overall</span>
                </div>

                {/* Completed */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-teal-50/40 border border-emerald-200/70 hover:border-emerald-300 transition-all shadow-2xs group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Completed</span>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-700 tabular-nums">{profileData.stats.completedTasks}</div>
                  <span className="text-[10px] text-emerald-600/90 font-semibold block mt-0.5">Delivered</span>
                </div>

                {/* Pending */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-50/60 to-orange-50/40 border border-amber-200/70 hover:border-amber-300 transition-all shadow-2xs group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Pending</span>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-700 tabular-nums">{profileData.stats.pendingTasks}</div>
                  <span className="text-[10px] text-amber-600/90 font-semibold block mt-0.5">Awaiting action</span>
                </div>

                {/* Completion Rate */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-purple-50/60 to-indigo-50/40 border border-purple-200/70 hover:border-purple-300 transition-all shadow-2xs group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black text-purple-800 uppercase tracking-wider">Completion</span>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Target className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-purple-800 tabular-nums">{profileData.stats.completionRate}%</div>
                  <div className="w-full bg-purple-200/60 rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, profileData.stats.completionRate || 0)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Employee Information Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Official Email */}
                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 hover:bg-slate-100/70 transition-colors shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-500" /> Official Email
                    </span>
                    <button 
                      onClick={() => handleCopyToClipboard(profileData.employee.email, 'Email')}
                      className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                      title="Copy email"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <a 
                    href={`mailto:${profileData.employee.email}`} 
                    className="text-xs font-bold text-slate-900 hover:text-indigo-600 transition-colors break-all block leading-relaxed"
                    title={profileData.employee.email}
                  >
                    {profileData.employee.email}
                  </a>
                </div>

                {/* Phone Number */}
                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 hover:bg-slate-100/70 transition-colors shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" /> Phone Number
                    </span>
                    <button 
                      onClick={() => handleCopyToClipboard(profileData.employee.phone, 'Phone')}
                      className="text-slate-400 hover:text-emerald-600 transition-colors p-1"
                      title="Copy phone number"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <a 
                    href={`tel:${profileData.employee.phone}`} 
                    className="text-xs font-bold text-slate-900 hover:text-emerald-600 transition-colors block leading-relaxed"
                  >
                    {profileData.employee.phone || 'N/A'}
                  </a>
                </div>

                {/* Date Joined */}
                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 hover:bg-slate-100/70 transition-colors shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 text-slate-500 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-sky-500" /> Date of Joining
                  </span>
                  <span className="text-xs font-bold text-slate-900 block leading-relaxed">
                    {profileData.employee.joiningDate 
                      ? new Date(profileData.employee.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                      : 'N/A'}
                  </span>
                </div>

                {/* Performance Reward Points */}
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 hover:bg-amber-50 transition-colors shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 text-amber-800 mb-1">
                    <Award className="w-3.5 h-3.5 text-amber-600" /> Performance Points
                  </span>
                  <span className="text-xs font-black text-amber-700 block leading-relaxed">
                    {profileData.employee.totalPoints || 0} Reward Pts
                  </span>
                </div>

                {/* Blood Group */}
                <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/70 hover:bg-rose-50 transition-colors shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 text-rose-800 mb-1">
                    <Heart className="w-3.5 h-3.5 text-rose-600" /> Blood Group
                  </span>
                  <span className="text-xs font-black text-rose-700 block leading-relaxed">
                    {profileData.employee.bloodGroup || 'O+'}
                  </span>
                </div>

                {/* Admin Vault Login Password */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/70 hover:bg-indigo-50 transition-colors shadow-2xs">
                  <div className="flex items-center justify-between text-indigo-800 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-indigo-600" /> Login Password
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => togglePasswordVisibility(`modal_${profileData.employee._id}`)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors p-0.5"
                        title={visiblePasswords[`modal_${profileData.employee._id}`] ? "Hide password" : "Show password"}
                      >
                        {visiblePasswords[`modal_${profileData.employee._id}`] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button 
                        onClick={() => handleCopyToClipboard(getEmployeePassword(profileData.employee), 'Password')}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors p-0.5"
                        title="Copy password"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-indigo-950 block leading-relaxed">
                    {visiblePasswords[`modal_${profileData.employee._id}`] 
                      ? getEmployeePassword(profileData.employee) 
                      : '••••••••••••'}
                  </span>
                </div>
              </div>

              {/* Task History Section */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                    Task History & Objectives
                  </h3>
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-full">
                    {profileData.tasks.length} Assigned
                  </span>
                </div>
                
                {profileData.tasks.length === 0 ? (
                  <div className="text-center py-6 px-4 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                    <ClipboardList className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-slate-700">No tasks assigned yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Manager will allocate new objectives here.</p>
                  </div>
                ) : (
                  <div className="max-h-[190px] overflow-y-auto space-y-2 pr-1">
                    {profileData.tasks.map((task) => (
                      <div key={task._id} className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-2xs hover:border-indigo-200 transition-colors">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-slate-900">{task.title}</h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                            <span className={getPriorityBadgeClass(task.priority)}>{task.priority}</span>
                            <span>•</span>
                            <span className="font-mono text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">+{task.points} Pts</span>
                            <span>•</span>
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <span className={
                          task.status === 'Completed' ? 'badge-success text-[11px]' :
                          task.status === 'In Progress' ? 'badge-info text-[11px]' :
                          'badge-warning text-[11px]'
                        }>
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Premium Action Footer Bar */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end gap-3 flex-wrap shrink-0">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    const emp = profileData.employee;
                    setProfileData(null);
                    openEditModal(emp);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 text-xs font-extrabold transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => setProfileData(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-black shadow-md transition-all hover:scale-[1.02] active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ID Card Modal */}
      {selectedIDCardEmp && (
        <IDCardModal
          employee={selectedIDCardEmp}
          onClose={() => setSelectedIDCardEmp(null)}
        />
      )}

      {/* Status Toggle Modal */}
      {confirmStatusEmp && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl my-auto animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Status Change</h3>
                <p className="text-xs text-slate-500">Employee Account Control</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to change <span className="font-bold text-slate-900">{confirmStatusEmp.name}</span>'s status to{' '}
              <span className="font-bold text-slate-900">{confirmStatusEmp.status === 'Active' ? 'Inactive' : 'Active'}</span>?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmStatusEmp(null)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                className={confirmStatusEmp.status === 'Active' ? 'btn-danger text-xs' : 'btn-primary text-xs'}
              >
                Confirm Status
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add / Edit Employee Modal */}
      {(showAddModal || editEmployee) && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] flex flex-col relative shadow-xl my-auto animate-fade-in">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-700" />
                  {editEmployee ? `Edit Employee: ${editEmployee.name}` : 'Register New Employee'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Fill in credentials for employee registration & ID card generation.</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditEmployee(null);
                  resetForm();
                }}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="overflow-y-auto pr-1 space-y-4 flex-1">
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <form id="employee-form" onSubmit={editEmployee ? handleEditSubmit : handleAddSubmit} className="space-y-4">
                
                {/* Photo & Basic Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  
                  {/* Photo Area */}
                  <div className="lg:col-span-1 space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Profile Photo</label>
                    
                    <div className="flex flex-col items-center justify-center p-4 h-[175px] bg-slate-50 border border-dashed border-slate-300 rounded-xl hover:bg-slate-100/50 transition-colors relative">
                      {formData.profilePhoto ? (
                        <div className="relative">
                          <img 
                            src={formData.profilePhoto} 
                            alt="Preview" 
                            className="w-24 h-24 rounded-full object-cover border border-slate-200 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={removePhoto}
                            className="absolute -top-1 -right-1 bg-rose-600 text-white p-1 rounded-full hover:bg-rose-700 transition-colors shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                          <label className="btn-secondary text-xs py-1.5 px-3 cursor-pointer">
                            Upload Photo
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleFileChange} 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="lg:col-span-2 space-y-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Personal Information</span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="input-saas w-full text-sm"
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Blood Group</label>
                        <select
                          value={formData.bloodGroup}
                          onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                          className="input-saas w-full text-sm"
                        >
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Date of Birth</label>
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          className="input-saas w-full text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Date of Joining</label>
                        <input
                          type="date"
                          required
                          value={formData.joiningDate}
                          onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                          className="input-saas w-full text-sm"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Corporate Info */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Corporate Assignments</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Custom Employee ID <span className="text-slate-400 font-normal">(e.g. EMP001 or custom string)</span></label>
                      <input
                        type="text"
                        value={formData.employeeId}
                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        className="input-saas w-full text-sm font-mono font-bold"
                        placeholder="Leave blank to auto-generate"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Login Password {editEmployee && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}</label>
                      <input
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input-saas w-full text-sm"
                        placeholder={editEmployee ? "Enter new password..." : "Password@123"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Corporate Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-saas w-full text-sm font-medium"
                        placeholder="john@company.com"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Phone</label>
                      <input
                        type="text"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input-saas w-full text-sm"
                        placeholder="9876543210"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Emergency Contact</label>
                      <input
                        type="text"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        className="input-saas w-full text-sm"
                        placeholder="Emergency contact info"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Department</label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="input-saas w-full text-sm"
                      >
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Designation</label>
                      <input
                        type="text"
                        required
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        className="input-saas w-full text-sm"
                        placeholder="Senior Engineer"
                      />
                    </div>
                  </div>
                </div>

                {/* Residential Address */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700">Residential Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input-saas w-full text-sm"
                    placeholder="Residential address details..."
                  />
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0 mt-4">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setShowAddModal(false);
                      setEditEmployee(null);
                      resetForm();
                    }}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-primary text-xs flex items-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{editEmployee ? 'Saving Profile...' : 'Creating Employee...'}</span>
                      </>
                    ) : (
                      <span>{editEmployee ? 'Update Profile' : 'Register Employee'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Employee Confirmation Modal */}
      {deleteConfirmEmp && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Delete Employee</h3>
                <p className="text-xs text-slate-500">Permanent Database Action</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Are you sure you want to permanently delete <strong className="text-slate-900">{deleteConfirmEmp.name}</strong> (<span className="font-mono text-slate-700 font-semibold">{deleteConfirmEmp.employeeId}</span>)? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmEmp(null)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEmployee}
                className="btn-danger text-xs"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Credentials Vault Modal (Admin View Username & Current Password) */}
      {showCredentialsModal && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col relative shadow-2xl animate-fade-in my-auto overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-slate-900 p-6 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-400">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Employee Credentials Vault
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Admin view for user login IDs and current access passwords.</p>
                </div>
              </div>

              <button
                onClick={() => setShowCredentialsModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-3 rounded-2xl text-amber-800 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Only authorized administrators can access these employee login credentials.</span>
                </div>
                <span className="bg-amber-200/80 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold">
                  {employees.length} Accounts
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                {employees.map((emp) => (
                  <div key={emp._id} className="p-4 bg-white hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {emp.profilePhoto ? (
                        <img src={emp.profilePhoto} alt={emp.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                          {emp.name[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          {emp.name}
                          <button
                            onClick={() => handleCopyToClipboard(emp.employeeId, 'Employee ID')}
                            title="Copy Employee ID"
                            className="font-mono text-xs text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2 py-0.5 rounded border border-slate-200 hover:border-indigo-300 font-semibold inline-flex items-center gap-1 transition-all group"
                          >
                            <span>{emp.employeeId}</span>
                            <Copy className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                          </button>
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2">
                          <span>{emp.email}</span>
                          <button
                            onClick={() => handleCopyToClipboard(emp.email, 'Email')}
                            title="Copy Email"
                            className="p-0.5 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <span>•</span>
                          <span className="text-slate-700 font-semibold">{emp.department}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100/90 border border-slate-200 p-2 rounded-xl self-start sm:self-auto">
                      {editingPasswordId === emp._id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={newPasswordInput}
                            onChange={(e) => setNewPasswordInput(e.target.value)}
                            placeholder="New password..."
                            className="input-saas text-xs py-1 px-2.5 w-36"
                          />
                          <button
                            onClick={() => handleSaveVaultPassword(emp._id)}
                            className="btn-primary text-xs py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingPasswordId(null)}
                            className="btn-secondary text-xs py-1 px-2"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-0.5 px-1 min-w-[100px]">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Password</span>
                            <div className="font-mono text-xs font-bold text-slate-800 tracking-wider">
                              {visiblePasswords[emp._id] ? getEmployeePassword(emp) : '••••••••'}
                            </div>
                          </div>

                          <button
                            onClick={() => togglePasswordVisibility(emp._id)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-colors shadow-2xs border border-slate-200/60"
                            title={visiblePasswords[emp._id] ? "Hide Password" : "Show Password"}
                          >
                            {visiblePasswords[emp._id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => handleCopyToClipboard(getEmployeePassword(emp), 'Password')}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors shadow-2xs border border-slate-200/60"
                            title="Copy Password"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingPasswordId(emp._id);
                              setNewPasswordInput(getEmployeePassword(emp));
                            }}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors shadow-2xs border border-slate-200/60"
                            title="Quick Change Password"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="btn-primary text-xs px-6 py-2"
              >
                Close Vault
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
      {/* Success Toast Notification */}
      {successMessage && createPortal(
        <div className="fixed bottom-6 right-6 z-[60] bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in border border-emerald-500/50">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold text-sm">{successMessage}</span>
        </div>,
        document.body
      )}
    </div>
  );
};

export default EmployeeManagement;
