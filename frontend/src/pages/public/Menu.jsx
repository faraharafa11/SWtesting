import { useEffect, useMemo, useState } from 'react';
import { fetchMenu } from '../../services/api';

export default function Menu() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadMenu() {
      try {
        setLoading(true);
        const data = await fetchMenu();
        if (active) setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadMenu();
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = new Set(items.map((item) => item.category || 'Other'));
    return ['all', ...unique];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = category === 'all' || item.category === category;
      const query = search.toLowerCase();
      const matchesSearch = item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [items, search, category]);

  return (
    <div className="panel">
      <header className="panel-header">
        <div>
          <h2>Our Menu</h2>
          <p className="muted">Discover our delicious offerings</p>
        </div>
        <div className="panel-actions">
          <input placeholder="Search dishes" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All' : cat}
              </option>
            ))}
          </select>
        </div>
      </header>

      {loading && <p>Loading…</p>}
      {error && <div className="alert error">{error}</div>}

      {!loading && !error && (
        <div className="menu-grid">
          {filteredItems.length === 0 && <p className="muted">No items found</p>}
          {filteredItems.map((item) => (
            <article key={item._id} className="menu-card">
              <div>
                <p className="eyebrow">{item.category}</p>
                <h3>{item.name}</h3>
              </div>
              <p className="price">${Number(item.price).toFixed(2)}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

