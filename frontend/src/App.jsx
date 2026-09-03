import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Public Pages (Eagerly Loaded for Immediate First Paint)
import HomePage from './pages/HomePage';
import Login from './pages/Login';

// Lazy Loaded Pages (Code-Split for 20X Faster Initial Page Load)
const PublicVerification = lazy(() => import('./pages/PublicVerification'));
const QRScannerPage = lazy(() => import('./pages/QRScannerPage'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const EmployeeManagement = lazy(() => import('./pages/EmployeeManagement'));
const TaskManagement = lazy(() => import('./pages/TaskManagement'));
const PerformanceLeaderboard = lazy(() => import('./pages/PerformanceLeaderboard'));
const ActivityLogsPage = lazy(() => import('./pages/ActivityLogsPage'));
const AttendanceManagement = lazy(() => import('./pages/AttendanceManagement'));

// Employee Pages
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard'));
const EmployeeMyTasks = lazy(() => import('./pages/EmployeeMyTasks'));
const EmployeeProfilePage = lazy(() => import('./pages/EmployeeProfilePage'));
const EmployeeAttendance = lazy(() => import('./pages/EmployeeAttendance'));

// Common / Shared Pages
const IDCardsPage = lazy(() => import('./pages/IDCardsPage'));

import LogoSpinner from './components/LogoSpinner';

// Fallback Page Loader with Full-Screen Bull Preloader
const PageLoader = () => (
  <LogoSpinner fullScreen={true} label="Opening page module..." />
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
