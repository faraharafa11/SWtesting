import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="panel column">
      <header className="panel-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="muted">Welcome, {user?.name}</p>
        </div>
      </header>

      <section className="grid">
        <div className="card" onClick={() => navigate('/admin/menu')} style={{ cursor: 'pointer' }}>
          <h3>Menu</h3>
          <p className="muted">Add, edit, or delete menu items</p>
        </div>

        <div className="card" onClick={() => navigate('/admin/reservations')} style={{ cursor: 'pointer' }}>
          <h3>Reservations</h3>
          <p className="muted">View and manage all reservations</p>
        </div>

        <div className="card" onClick={() => navigate('/admin/orders')} style={{ cursor: 'pointer' }}>
          <h3>Orders</h3>
          <p className="muted">Manage orders and payments</p>
        </div>

        <div className="card" onClick={() => navigate('/admin/feedback')} style={{ cursor: 'pointer' }}>
          <h3>Feedback</h3>
          <p className="muted">View and manage customer feedback</p>
        </div>
      </section>
    </div>
  );
}

