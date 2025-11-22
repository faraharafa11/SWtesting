import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const dashboardLink = user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';

  return (
    <div className="home-hero">
      <section>
        <h1>Nova Bistro</h1>
        <p className="muted">Reserve a table, place orders, and share your experience</p>
        <div className="cta-group">
          <Link className="btn-primary" to={isAuthenticated ? dashboardLink : '/auth/login'}>
            {isAuthenticated ? 'Dashboard' : 'Sign In'}
          </Link>
          <Link className="btn-ghost" to="/menu">
            View Menu
          </Link>
        </div>
      </section>
      <section className="home-grid">
        <article>
          <h3>Reservations</h3>
          <p>Make and manage table reservations</p>
        </article>
        <article>
          <h3>Orders</h3>
          <p>Place and track food orders</p>
        </article>
        <article>
          <h3>Feedback</h3>
          <p>Submit and view customer feedback</p>
        </article>
      </section>
    </div>
  );
}

