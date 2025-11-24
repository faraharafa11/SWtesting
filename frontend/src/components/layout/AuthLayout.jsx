import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <section 
        className="auth-hero"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(2, 6, 23, 0.6), rgba(2, 6, 23, 0.6)), url('/attached_assets/stock_images/gourmet_restaurant_f_e4712632.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
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

