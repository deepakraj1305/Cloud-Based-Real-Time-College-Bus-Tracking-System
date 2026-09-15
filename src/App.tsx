import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { useAuth } from './contexts/AuthContext';

import AdminDashboard from './pages/admin/AdminDashboard';
import BusManagement from './pages/admin/BusManagement';
import DriverManagement from './pages/admin/DriverManagement';
import StudentManagement from './pages/admin/StudentManagement';
import RouteManagement from './pages/admin/RouteManagement';
import TripManagement from './pages/admin/TripManagement';
import LiveTracking from './pages/admin/LiveTracking';
import Notifications from './pages/admin/Notifications';
import EmergencyAlerts from './pages/admin/EmergencyAlerts';
import Reports from './pages/admin/Reports';

import DriverDashboard from './pages/driver/DriverDashboard';
import DriverTracking from './pages/driver/DriverTracking';

import StudentDashboard from './pages/student/StudentDashboard';
import MyBus from './pages/student/MyBus';
import MyRoute from './pages/student/MyRoute';
import StudentTracking from './pages/student/StudentTracking';

function HomeRedirect() {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Landing />;
  if (!profile) return <Landing />;
  const to =
    profile.role === 'admin' ? '/admin' : profile.role === 'driver' ? '/driver' : '/student';
  return <Navigate to={to} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allow={['admin']}>
            <Layout><AdminDashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/admin/buses" element={<ProtectedRoute allow={['admin']}><Layout><BusManagement /></Layout></ProtectedRoute>} />
      <Route path="/admin/drivers" element={<ProtectedRoute allow={['admin']}><Layout><DriverManagement /></Layout></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute allow={['admin']}><Layout><StudentManagement /></Layout></ProtectedRoute>} />
      <Route path="/admin/routes" element={<ProtectedRoute allow={['admin']}><Layout><RouteManagement /></Layout></ProtectedRoute>} />
      <Route path="/admin/trips" element={<ProtectedRoute allow={['admin']}><Layout><TripManagement /></Layout></ProtectedRoute>} />
      <Route path="/admin/tracking" element={<ProtectedRoute allow={['admin']}><Layout><LiveTracking /></Layout></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute allow={['admin']}><Layout><Notifications /></Layout></ProtectedRoute>} />
      <Route path="/admin/alerts" element={<ProtectedRoute allow={['admin']}><Layout><EmergencyAlerts /></Layout></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allow={['admin']}><Layout><Reports /></Layout></ProtectedRoute>} />

      {/* Driver */}
      <Route path="/driver" element={<ProtectedRoute allow={['driver']}><Layout><DriverDashboard /></Layout></ProtectedRoute>} />
      <Route path="/driver/tracking" element={<ProtectedRoute allow={['driver']}><Layout><DriverTracking /></Layout></ProtectedRoute>} />

      {/* Student */}
      <Route path="/student" element={<ProtectedRoute allow={['student']}><Layout><StudentDashboard /></Layout></ProtectedRoute>} />
      <Route path="/student/bus" element={<ProtectedRoute allow={['student']}><Layout><MyBus /></Layout></ProtectedRoute>} />
      <Route path="/student/route" element={<ProtectedRoute allow={['student']}><Layout><MyRoute /></Layout></ProtectedRoute>} />
      <Route path="/student/tracking" element={<ProtectedRoute allow={['student']}><Layout><StudentTracking /></Layout></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
