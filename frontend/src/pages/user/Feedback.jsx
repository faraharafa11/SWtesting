import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { submitFeedback, getUserFeedback, getFeedback } from '../../services/api';

const categories = ['service', 'food_quality', 'ambiance', 'value', 'cleanliness', 'overall'];

export default function Feedback() {
  const { token, user, logout } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    rating: 5,
    category: 'service',
    comment: ''
  });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const data = await getUserFeedback({}, token);
      setFeedbackList(data);
    } catch (err) {
      if (err.status === 401) logout();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [token, logout]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      await submitFeedback(
        {
          ...form,
          rating: Number(form.rating)
        },
        token
      );
      setForm((prev) => ({ ...prev, rating: 5, category: 'service', comment: '' }));
      loadFeedback();
    } catch (err) {
      if (err.status === 401) logout();
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleView = async (feedbackId) => {
    try {
      const detail = await getFeedback(feedbackId, token);
      setSelectedFeedback(detail);
    } catch (err) {
      if (err.status === 401) logout();
      setError(err.message);
    }
  };

  return (
    <div className="panel column">
      <header className="panel-header">
        <div>
          <h2>Feedback</h2>
          <p className="muted">Share your experience with us</p>
        </div>
      </header>

      <section className="card">
        <h3>New Feedback</h3>
        {formError && <div className="alert error">{formError}</div>}
        <form className="grid-two" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              value={form.customerName}
              onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.customerEmail}
              onChange={(e) => setForm((prev) => ({ ...prev, customerEmail: e.target.value }))}
              required
            />
          </label>
          <label>
            Rating
            <input
              type="number"
              min="1"
              max="5"
              value={form.rating}
              onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}
              required
            />
          </label>
          <label>
            Category
            <select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="full-width">
            Comment
            <textarea
              rows={4}
              value={form.comment}
              onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
              required
            />
          </label>
          <button className="btn-primary" type="submit" disabled={formLoading}>
            {formLoading ? 'Submitting…' : 'Submit'}
          </button>
        </form>
      </section>

      <section className="card">
        <header className="card-header">
          <h3>Your Feedback</h3>
        </header>

        {loading && <p>Loading…</p>}
        {!loading && feedbackList.length === 0 && <p className="muted">No feedback yet</p>}

        {!loading && feedbackList.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Rating</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {feedbackList.map((fb) => (
                  <tr key={fb.id}>
                    <td>{new Date(fb.createdAt).toLocaleDateString()}</td>
                    <td>{fb.category}</td>
                    <td>{fb.rating}</td>
                    <td>
                      <button onClick={() => handleView(fb.id)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedFeedback && (
        <section className="card">
          <header className="card-header">
            <div>
              <h3>{selectedFeedback.category}</h3>
            </div>
            <button className="btn-ghost" onClick={() => setSelectedFeedback(null)}>
              Close
            </button>
          </header>
          <p className="muted">
            Rating {selectedFeedback.rating}
          </p>
          <p>{selectedFeedback.comment}</p>
          {selectedFeedback.adminResponse && (
            <p className="muted">Admin response: {selectedFeedback.adminResponse}</p>
          )}
        </section>
      )}
    </div>
  );
}

