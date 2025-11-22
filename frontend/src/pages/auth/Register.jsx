import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await registerUser(form);
      login(result);
      navigate(form.role === 'admin' ? '/admin/dashboard' : '/user/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Create account</h2>
      <p className="muted">Join us to make reservations and place orders</p>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={handleSubmit} className="form-stack">
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} required placeholder="Nova Manager" />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} />
        </label>
        <label>
          Role
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="user">Guest / User</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Register'}
        </button>
      </form>
      <p className="muted">
        Already registered? <Link to="/auth/login">Sign in here</Link>
      </p>
    </div>
  );
}

