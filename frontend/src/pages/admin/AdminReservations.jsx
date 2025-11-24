import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAdminReservations, updateAdminReservationStatus } from '../../services/api';

const statusOptions = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function AdminReservations() {
  const { token, logout } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [status, setStatus] = useState('all');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await getAdminReservations(
        {
          status: status === 'all' ? undefined : status,
          date: date || undefined
        },
        token
      );
      setReservations(data);
    } catch (err) {
      if (err.status === 401) logout();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [token, logout, status, date]);

  const handleStatusChange = async (reservationId, nextStatus) => {
    try {
      await updateAdminReservationStatus(reservationId, nextStatus, token);
      loadReservations();
    } catch (err) {
      if (err.status === 401) logout();
      setError(err.message);
    }
  };


  return (
    <div className="panel column">
      <header className="panel-header">
        <div>
          <h2>Reservations</h2>
          <p className="muted">Manage all table reservations</p>
        </div>
        <div className="panel-actions">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      {loading && <p>Loading…</p>}
      {!loading && reservations.length === 0 && <p className="muted">No reservations</p>}

      {!loading && reservations.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Table</th>
                <th>Date</th>
                <th>Guest</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>#{reservation.tableNumber}</td>
                  <td>
                    {reservation.reservationDate} · {reservation.reservationTime}
                  </td>
                  <td>{reservation.customerName}</td>
                  <td>
                    <select value={reservation.status} onChange={(e) => handleStatusChange(reservation.id, e.target.value)}>
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="muted">{reservation.customerEmail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

