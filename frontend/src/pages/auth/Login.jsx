import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname;

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await loginUser(form);
      login(result);
      const destination = redirectTo || (result?.user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Sign in</h2>
      <p className="muted">Welcome back</p>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={handleSubmit} className="form-stack">
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@email.com" />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="••••••••" />
        </label>
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="muted">
        New here? <Link to="/auth/register">Create an account</Link>
      </p>
    </div>
  );
}

