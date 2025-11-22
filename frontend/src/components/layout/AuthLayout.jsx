import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <div>
          <h1>Welcome</h1>
          <p>Manage your restaurant experience</p>
        </div>
      </section>
      <section className="auth-panel">
        <Outlet />
        <p className="auth-meta">
          <Link to="/">Back to home</Link>
        </p>
      </section>
    </div>
  );
}

