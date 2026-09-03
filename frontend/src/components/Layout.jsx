import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Users, 
  CheckSquare, 
  Trophy, 
  History, 
  QrCode, 
  LogOut, 
  User as UserIcon, 
  Menu, 
  X,
  LayoutDashboard,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Calendar
} from 'lucide-react';
import logoImg from '../assets/sm_groups_logo.png';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Employees', path: '/admin/employees', icon: Users },
    { name: 'Attendance', path: '/admin/attendance', icon: Calendar },
    { name: 'Tasks', path: '/admin/tasks', icon: CheckSquare },
    { name: 'Leaderboard', path: '/admin/performance', icon: Trophy },
    { name: 'ID Cards', path: '/admin/id-cards', icon: CreditCard },
    { name: 'Activity Logs', path: '/admin/logs', icon: History },
  ];

  const employeeLinks = [
    { name: 'Dashboard', path: '/employee', icon: LayoutDashboard },
    { name: 'Attendance', path: '/employee/attendance', icon: Calendar },
    { name: 'My ID Card', path: '/employee/id-card', icon: CreditCard },
    { name: 'My Tasks', path: '/employee/tasks', icon: CheckSquare },
    { name: 'My Profile', path: '/employee/profile', icon: UserIcon },
  ];

  const publicLinks = [
    { name: 'QR Scanner', path: '/scan', icon: QrCode },
  ];

  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col md:flex-row font-sans overflow-x-hidden md:h-screen md:overflow-hidden">
      
      {/* Collapsible Sidebar for Desktop */}
      <aside className={`hidden md:flex flex-col ${isCollapsed ? 'w-18 p-2.5' : 'w-64 p-4'} bg-white border-r border-slate-200/80 h-screen justify-between z-30 shrink-0 transition-all duration-200 ease-in-out select-none`}>
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto pr-0.5">
          {/* Header Branding */}
          <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2 justify-center' : 'justify-between'} pb-4 mb-4 border-b border-slate-100`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-300 p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
                <img src={logoImg} alt="THE SM GROUPS" className="w-full h-full object-contain" />
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <h1 className="font-bold text-slate-900 text-sm tracking-tight leading-none truncate">THE SM GROUPS</h1>
                  <span className="text-[10px] text-slate-400 font-medium">Enterprise Suite</span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-md transition-colors border border-slate-200/60"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {isAdmin ? 'Management' : 'Workspace'}
              </div>
            )}
            
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center ${isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title={isCollapsed ? link.name : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    {!isCollapsed && <span className="truncate">{link.name}</span>}
                  </div>
                  {!isCollapsed && isActive && <ChevronRight className="w-4 h-4 text-slate-400" />}
                </Link>
              );
            })}

            {!isCollapsed && (
              <div className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-5 mb-2">
                Utilities
              </div>
            )}
            
            {isCollapsed && <div className="h-px bg-slate-100 my-3" />}

            {publicLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center ${isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title={isCollapsed ? link.name : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {!isCollapsed && <span className="truncate">{link.name}</span>}
                  </div>
                  {!isCollapsed && <ExternalLink className="w-3.5 h-3.5 text-slate-400" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Card */}
        <div className="pt-3 mt-2 border-t border-slate-100">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Link to={isAdmin ? '#' : '/employee/profile'} className="shrink-0">
                <div 
                  className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold text-xs shadow-2xs hover:ring-2 hover:ring-slate-400/50 cursor-pointer transition-all"
                  title={`${user?.name} (${user?.role})`}
                >
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70">
              <Link to={isAdmin ? '#' : '/employee/profile'} className="flex items-center gap-2.5 overflow-hidden hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-2xs">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-900 truncate leading-tight">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <header className="md:hidden bg-white border-b border-slate-200/80 px-4 py-3 sticky top-0 z-40 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-white border border-slate-300 rounded-xl p-1.5 shadow-2xs flex items-center justify-center shrink-0">
            <img src={logoImg} alt="THE SM GROUPS" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-extrabold text-base text-slate-900 tracking-tight block leading-none">THE SM GROUPS</span>
            <span className="text-[11px] text-slate-500 font-bold block mt-0.5">Enterprise Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={isAdmin ? '#' : '/employee/profile'} onClick={() => setMobileMenuOpen(false)} className="block shrink-0">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt={user?.name} className="w-7 h-7 rounded-full object-cover border border-slate-200 hover:ring-2 hover:ring-slate-300 transition-all cursor-pointer" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center hover:ring-2 hover:ring-slate-300 transition-all cursor-pointer">
                {user?.name?.[0]}
              </div>
            )}
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-slate-900 focus:outline-none border border-slate-200/90 rounded-xl bg-slate-50"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex flex-col">
          {/* Top Bar inside Drawer for explicit close */}
          <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center shrink-0">
                <img src={logoImg} alt="THE SM GROUPS" className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-base text-slate-900">THE SM GROUPS</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-xl bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white flex-1 p-4 overflow-y-auto space-y-4 shadow-xl">
            <nav className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                {isAdmin ? 'Admin Console' : 'Workspace Navigation'}
              </p>
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-800 border border-slate-200/70 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{link.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-5 h-5 text-slate-400" />}
                  </Link>
                );
              })}

              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-6 mb-2.5">
                Utilities
              </p>
              {publicLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-800 border border-slate-200/70 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                      <span>{link.name}</span>
                    </div>
                    <ExternalLink className={`w-5 h-5 ${isActive ? 'text-white/70' : 'text-slate-400'}`} />
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{user?.role} Account</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-200/60 text-rose-600 rounded-xl text-xs font-bold"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-3.5 sm:p-5 md:p-6 overflow-y-auto overflow-x-hidden min-w-0 max-w-7xl mx-auto w-full md:h-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;
