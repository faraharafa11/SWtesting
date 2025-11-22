import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PublicLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleCta = () => {
    if (isAuthenticated) {
      navigate(user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    } else {
      navigate('/auth/login');
    }
  };

  return (
    <div className="layout-shell">
      <header className="public-header">
        <div className="brand" onClick={() => navigate('/')}>
          <span>✨</span>
          <strong>Nova Bistro</strong>
        </div>
        <nav>
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/menu">Menu</NavLink>
        </nav>
        <button className="btn-primary" onClick={handleCta}>
          {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
        </button>
      </header>
      <main className="public-main">
        <Outlet />
      </main>
    </div>
  );
}

