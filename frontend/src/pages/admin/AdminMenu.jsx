import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchMenu, createMenuItem, editMenuItem, removeMenuItem } from '../../services/api';

export default function AdminMenu() {
  const { token, logout } = useAuth();
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    name: '',
    category: '',
    price: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const data = await fetchMenu();
      setMenu(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.status === 401) logout();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, [token, logout]);

  const filteredMenu = useMemo(() => {
    const query = search.toLowerCase();
    return menu.filter((item) => item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query));
  }, [menu, search]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormLoading(true);
    setFormError(null);
    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price)
    };
    try {
      if (editingId) {
        await editMenuItem(editingId, payload, token);
      } else {
        await createMenuItem(payload, token);
      }
      setForm({ name: '', category: '', price: '' });
      setEditingId(null);
      loadMenu();
    } catch (err) {
      if (err.status === 401) logout();
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await removeMenuItem(id, token);
      loadMenu();
    } catch (err) {
      if (err.status === 401) logout();
      setError(err.message);
    }
  };

  return (
    <div className="panel column">
      <header className="panel-header">
        <div>
          <h2>Menu</h2>
          <p className="muted">Add, edit, or delete menu items</p>
        </div>
      </header>

      <section className="card">
        <h3>{editingId ? 'Edit Item' : 'Add Item'}</h3>
        {formError && <div className="alert error">{formError}</div>}
        <form className="grid-three" onSubmit={handleSubmit}>
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
          </label>
          <label>
            Category
            <input
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              required
            />
          </label>
          <label>
            Price
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              required
            />
          </label>
          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={formLoading}>
              {formLoading ? 'Saving…' : editingId ? 'Update item' : 'Add item'}
            </button>
            {editingId && (
              <button
                className="btn-ghost"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: '', category: '', price: '' });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card">
        <header className="card-header">
          <h3>Menu items</h3>
          <input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </header>
        {loading && <p>Loading…</p>}
        {!loading && filteredMenu.length === 0 && <p className="muted">No menu items.</p>}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredMenu.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>${Number(item.price).toFixed(2)}</td>
                  <td className="table-actions">
                    <button onClick={() => handleEdit(item)}>Edit</button>
                    <button className="btn-danger" onClick={() => handleDelete(item._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

