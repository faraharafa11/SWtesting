import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAdminFeedback, deleteFeedback, getFeedback } from '../../services/api';

const categoryOptions = ['all', 'service', 'food_quality', 'ambiance', 'value', 'cleanliness', 'overall'];

export default function AdminFeedback() {
  const { token, logout } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [category, setCategory] = useState('all');
  const [minRating, setMinRating] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const data = await getAdminFeedback(
        {
          category: category === 'all' ? undefined : category,
          minRating: minRating || undefined
        },
        token
      );
      setFeedback(data);
    } catch (err) {
      if (err.status === 401) logout();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [token, logout, category, minRating]);


  const handleDelete = async (feedbackId) => {
    if (!window.confirm('Delete this feedback entry?')) return;
    try {
      await deleteFeedback(feedbackId, token);
      loadFeedback();
    } catch (err) {
      if (err.status === 401) logout();
      setError(err.message);
    }
  };

  const handleView = async (feedbackId) => {
    setDetailLoading(true);
    setSelectedFeedback(null);
    try {
      const detail = await getFeedback(feedbackId, token);
      setSelectedFeedback(detail);
    } catch (err) {
      if (err.status === 401) logout();
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="panel column">
      <header className="panel-header">
        <div>
          <h2>Feedback</h2>
          <p className="muted">View and manage all customer feedback</p>
        </div>
        <div className="panel-actions">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            max="5"
            placeholder="Min rating"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
          />
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      {loading && <p>Loading…</p>}
      {!loading && feedback.length === 0 && <p className="muted">No feedback found</p>}

      {!loading && feedback.length > 0 && (
        <div className="table-wrapper">
          <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Guest</th>
                  <th>Category</th>
                  <th>Rating</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {feedback.map((entry) => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
                    <td>{entry.customerName}</td>
                    <td>{entry.category}</td>
                    <td>{entry.rating}</td>
                    <td className="table-actions">
                      <button onClick={() => handleView(entry.id)}>View</button>
                      <button className="btn-danger" onClick={() => handleDelete(entry.id)}>
                        Delete
                      </button>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailLoading && <p>Loading…</p>}
      {selectedFeedback && (
        <section className="card">
          <header className="card-header">
            <div>
              <h3>Feedback Details</h3>
              <p className="muted">
                {selectedFeedback.customerName} • {selectedFeedback.category} • Rating {selectedFeedback.rating}
              </p>
            </div>
            <button className="btn-ghost" onClick={() => setSelectedFeedback(null)}>
              Close
            </button>
          </header>
          <div style={{ marginTop: '16px' }}>
            <p style={{ marginBottom: '12px', fontWeight: 500 }}>Comment:</p>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{selectedFeedback.comment}</p>
          </div>
          {selectedFeedback.adminResponse && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <p style={{ marginBottom: '12px', fontWeight: 500 }}>Admin Response:</p>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{selectedFeedback.adminResponse}</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

