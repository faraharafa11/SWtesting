import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PublicLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="layout-shell">
      <header className="public-header">
        <div className="brand" onClick={() => navigate('/')}>
          <span>✨</span>
          <strong>Gourmet Heaven</strong>
        </div>
        <nav className="header-nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/menu">Menu</NavLink>
        </nav>
        <div className="auth-buttons">
          {!isAuthenticated && (
            <>
              <button 
                className="btn-ghost" 
                onClick={() => navigate('/auth/login')}
              >
                Login
              </button>
              <button 
                className="btn-primary" 
                onClick={() => navigate('/auth/register')}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>
      <main className="public-main">
        <Outlet />
      </main>
    </div>
  );
}

