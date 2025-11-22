import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navMap = {
  user: [
    { to: '/user/dashboard', label: 'Overview', icon: '🏠' },
    { to: '/user/reservations', label: 'Reservations', icon: '🪑' },
    { to: '/user/orders', label: 'Orders', icon: '🍽️' },
    { to: '/user/feedback', label: 'Feedback', icon: '⭐' }
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Overview', icon: '📊' },
    { to: '/admin/menu', label: 'Menu', icon: '📜' },
    { to: '/admin/reservations', label: 'Reservations', icon: '🗓️' },
    { to: '/admin/orders', label: 'Orders', icon: '🧾' },
    { to: '/admin/feedback', label: 'Feedback', icon: '💬' }
  ]
};

export default function DashboardLayout({ section = 'user' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = navMap[section] || navMap.user;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <span>🍷</span>
          <div>
            <p>Nova Bistro</p>
            <small>{section === 'admin' ? 'Admin Suite' : 'Guest Portal'}</small>
          </div>
        </div>
        <nav>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end>
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="btn-muted" onClick={handleLogout}>
          Log out
        </button>
      </aside>
      <div className="dashboard-stage">
        <header className="dashboard-topbar">
          <div>
            <h2>{user?.name || 'Welcome'}</h2>
            <p className="muted">{user?.email}</p>
          </div>
          <div className="user-chip">
            <span>{user?.name?.[0]?.toUpperCase() || '?'}</span>
            <div>
              <strong>{user?.name}</strong>
              <small>{user?.role}</small>
            </div>
          </div>
        </header>
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

