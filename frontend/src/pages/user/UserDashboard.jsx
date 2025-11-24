import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="panel column">
      <header className="panel-header">
        <div>
          <h2>Dashboard</h2>
          <p className="muted">Welcome, {user?.name}</p>
        </div>
      </header>

      <section className="grid">
        <div className="card" onClick={() => navigate('/user/menu')} style={{ cursor: 'pointer' }}>
          <h3>Menu</h3>
          <p className="muted">Browse our delicious menu</p>
        </div>

        <div className="card" onClick={() => navigate('/user/reservations')} style={{ cursor: 'pointer' }}>
          <h3>Reservations</h3>
          <p className="muted">Make or view your reservations</p>
        </div>

        <div className="card" onClick={() => navigate('/user/orders')} style={{ cursor: 'pointer' }}>
          <h3>Orders</h3>
          <p className="muted">View your orders</p>
        </div>

        <div className="card" onClick={() => navigate('/user/feedback')} style={{ cursor: 'pointer' }}>
          <h3>Feedback</h3>
          <p className="muted">Submit or view your feedback</p>
        </div>
      </section>
    </div>
  );
}

