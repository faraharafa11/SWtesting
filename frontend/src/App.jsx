import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/public/Home';
import Menu from './pages/public/Menu';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User pages
import UserDashboard from './pages/user/UserDashboard';
import Reservations from './pages/user/Reservations';
import Orders from './pages/user/Orders';
import Feedback from './pages/user/Feedback';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenu from './pages/admin/AdminMenu';
import AdminReservations from './pages/admin/AdminReservations';
import AdminOrders from './pages/admin/AdminOrders';
import AdminFeedback from './pages/admin/AdminFeedback';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout section="user" />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/menu" element={<Menu />} />
          <Route path="/user/reservations" element={<Reservations />} />
          <Route path="/user/orders" element={<Orders />} />
          <Route path="/user/feedback" element={<Feedback />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route element={<DashboardLayout section="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/menu" element={<AdminMenu />} />
          <Route path="/admin/reservations" element={<AdminReservations />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/feedback" element={<AdminFeedback />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
