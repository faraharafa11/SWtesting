import { useEffect, useMemo, useState } from 'react';
import {
  getUserReservations,
  createReservation,
  updateReservation,
  cancelReservation,
  getAvailableTables
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import TableMap from '../../components/TableMap';

const statusFilters = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const toDateInput = (value) => {
  if (!value) return '';
  return String(value).slice(0, 10);
};

export default function Reservations() {
  const { token, user, logout } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: '',
    guestCount: 2,
    reservationDate: '',
    reservationTime: '',
    tableNumber: '',
    specialRequests: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await getUserReservations({}, token);
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
  }, [token, logout]);

  useEffect(() => {
    if (!form.reservationDate || !form.reservationTime) {
      setAvailableTables([]);
      return;
    }

    let active = true;
    async function fetchTables() {
      try {
        setAvailabilityLoading(true);
        const data = await getAvailableTables({
          date: form.reservationDate,
          time: form.reservationTime,
          guestCount: form.guestCount
        });
        if (active) setAvailableTables(data?.availableTables || []);
      } catch (err) {
        if (active) setFormError(err.message);
      } finally {
        if (active) setAvailabilityLoading(false);
      }
    }
    fetchTables();
    return () => {
      active = false;
    };
  }, [form.reservationDate, form.reservationTime, form.guestCount]);

  const filteredReservations = useMemo(() => {
    if (status === 'all') return reservations;
    return reservations.filter((reservation) => reservation.status === status);
  }, [reservations, status]);

  const resetForm = () => {
    setForm({
      customerName: user?.name || '',
      customerEmail: user?.email || '',
      customerPhone: '',
      guestCount: 2,
      reservationDate: '',
      reservationTime: '',
      tableNumber: '',
      specialRequests: ''
    });
    setEditingId(null);
    setFormError(null);
  };

  const handleEdit = (reservation) => {
    setEditingId(reservation.id);
    setForm({
      customerName: reservation.customerName,
      customerEmail: reservation.customerEmail,
      customerPhone: reservation.customerPhone,
      guestCount: reservation.guestCount,
      reservationDate: toDateInput(reservation.reservationDate),
      reservationTime: reservation.reservationTime,
      tableNumber: reservation.tableNumber,
      specialRequests: reservation.specialRequests || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormLoading(true);
    setFormError(null);
    const payload = {
      ...form,
      guestCount: Number(form.guestCount),
      tableNumber: Number(form.tableNumber)
    };
    try {
      if (editingId) {
        await updateReservation(editingId, payload, token);
      } else {
        await createReservation(payload, token);
      }
      resetForm();
      loadReservations();
    } catch (err) {
      if (err.status === 401) logout();
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = async (reservationId) => {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      await cancelReservation(reservationId, token);
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
          <p className="muted">Book a table or manage your reservations</p>
        </div>
      </header>

      <section className="card">
        <h3>{editingId ? 'Edit Reservation' : 'New Reservation'}</h3>
        {formError && <div className="alert error">{formError}</div>}
        <form className="grid-two" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              name="customerName"
              value={form.customerName}
              onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
              required
            />
          </label>
          <label>
            Email
            <input
              name="customerEmail"
              type="email"
              value={form.customerEmail}
              onChange={(e) => setForm((prev) => ({ ...prev, customerEmail: e.target.value }))}
              required
            />
          </label>
          <label>
            Phone
            <input
              name="customerPhone"
              value={form.customerPhone}
              onChange={(e) => setForm((prev) => ({ ...prev, customerPhone: e.target.value }))}
              required
            />
          </label>
          <label>
            Guests
            <input
              name="guestCount"
              type="number"
              min="1"
              max="12"
              value={form.guestCount}
              onChange={(e) => setForm((prev) => ({ ...prev, guestCount: e.target.value }))}
              required
            />
          </label>
          <label>
            Date
            <input
              type="date"
              value={form.reservationDate}
              onChange={(e) => setForm((prev) => ({ ...prev, reservationDate: e.target.value }))}
              required
            />
          </label>
          <label>
            Time
            <input
              type="time"
              value={form.reservationTime}
              onChange={(e) => setForm((prev) => ({ ...prev, reservationTime: e.target.value }))}
              required
            />
          </label>
          <label>
            Table
            {form.reservationDate && form.reservationTime ? (
              <div>
                {availabilityLoading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                    <p>Loading table availability...</p>
                  </div>
                ) : (
                  <>
                    <TableMap
                      availableTables={availableTables}
                      selectedTable={form.tableNumber ? Number(form.tableNumber) : null}
                      onTableSelect={(tableNumber) => 
                        setForm((prev) => ({ ...prev, tableNumber: String(tableNumber) }))
                      }
                      totalTables={20}
                    />
                    {!form.tableNumber && availableTables.length > 0 && (
                      <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
                        👆 Click on a green table to select it
                      </p>
                    )}
                    {availableTables.length === 0 && !availabilityLoading && (
                      <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.875rem', textAlign: 'center', color: '#ef4444' }}>
                        ⚠️ No tables available for this date and time. Please try a different time.
                      </p>
                    )}
                  </>
                )}
                <input
                  type="hidden"
                  value={form.tableNumber}
                  required
                />
              </div>
            ) : (
              <select
                value={form.tableNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, tableNumber: e.target.value }))}
                required
                disabled
              >
                <option value="">Select date and time first to see table map</option>
              </select>
            )}
          </label>
          <label>
            Special requests
            <textarea
              rows={3}
              value={form.specialRequests}
              onChange={(e) => setForm((prev) => ({ ...prev, specialRequests: e.target.value }))}
              placeholder="Allergies, celebrations, etc."
            />
          </label>
          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={formLoading}>
              {formLoading ? 'Saving…' : editingId ? 'Update' : 'Book Table'}
            </button>
            {editingId && (
              <button type="button" className="btn-ghost" onClick={resetForm}>
                Cancel
              </button>
            )}
            {availabilityLoading && <span className="muted">Checking availability…</span>}
          </div>
        </form>
      </section>

      <section className="card">
        <header className="card-header">
          <h3>Your Reservations</h3>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {statusFilters.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'All' : option}
              </option>
            ))}
          </select>
        </header>

        {loading && <p>Loading…</p>}
        {!loading && filteredReservations.length === 0 && <p className="muted">No reservations</p>}

        {!loading && filteredReservations.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Table</th>
                  <th>Date</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td>#{reservation.tableNumber}</td>
                    <td>
                      {reservation.reservationDate} · {reservation.reservationTime}
                    </td>
                    <td>{reservation.guestCount}</td>
                    <td>
                      <span className={`badge badge-${reservation.status}`}>{reservation.status}</span>
                    </td>
                    <td className="table-actions">
                      <button onClick={() => handleEdit(reservation)}>Edit</button>
                      {reservation.status !== 'cancelled' && (
                        <button className="btn-danger" onClick={() => handleCancel(reservation.id)}>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

