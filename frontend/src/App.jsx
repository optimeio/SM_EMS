import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Public Pages
import HomePage from './pages/HomePage';
import PublicVerification from './pages/PublicVerification';
import QRScannerPage from './pages/QRScannerPage';
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import EmployeeManagement from './pages/EmployeeManagement';
import TaskManagement from './pages/TaskManagement';
import PerformanceLeaderboard from './pages/PerformanceLeaderboard';
import ActivityLogsPage from './pages/ActivityLogsPage';
import AttendanceManagement from './pages/AttendanceManagement';

// Employee Pages
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeMyTasks from './pages/EmployeeMyTasks';
import EmployeeProfilePage from './pages/EmployeeProfilePage';
import EmployeeAttendance from './pages/EmployeeAttendance';

// Common / Shared Pages
import IDCardsPage from './pages/IDCardsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes (No Auth Needed) */}
          <Route path="/" element={<HomePage />} />
          <Route path="/verify/:employeeId" element={<PublicVerification />} />
          <Route path="/scan" element={<QRScannerPage />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
            <Route path="/admin/employees" element={<Layout><EmployeeManagement /></Layout>} />
            <Route path="/admin/id-cards" element={<Layout><IDCardsPage /></Layout>} />
            <Route path="/admin/attendance" element={<Layout><AttendanceManagement /></Layout>} />
            <Route path="/admin/tasks" element={<Layout><TaskManagement /></Layout>} />
            <Route path="/admin/performance" element={<Layout><PerformanceLeaderboard /></Layout>} />
            <Route path="/admin/logs" element={<Layout><ActivityLogsPage /></Layout>} />
          </Route>

          {/* Protected Employee Routes */}
          <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
            <Route path="/employee" element={<Layout><EmployeeDashboard /></Layout>} />
            <Route path="/employee/attendance" element={<Layout><EmployeeAttendance /></Layout>} />
            <Route path="/employee/id-card" element={<Layout><IDCardsPage /></Layout>} />
            <Route path="/employee/tasks" element={<Layout><EmployeeMyTasks /></Layout>} />
            <Route path="/employee/profile" element={<Layout><EmployeeProfilePage /></Layout>} />
          </Route>

          {/* Default Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
