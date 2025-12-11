import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  fetchMenu,
  getUserOrders,
  getUserReservations,
  createOrder,
  cancelOrder,
  getOrder,
  updateOrderStatusAuto
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const paymentMethods = ['cash', 'card', 'apple pay'];
const statusFilters = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'cancelled'];

export default function Orders() {
  const { token, logout } = useAuth();
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    reservationId: '',
    paymentMethod: 'cash',
    specialRequests: ''
  });
  const [items, setItems] = useState([{ menuItemId: '', quantity: 1, specialInstructions: '' }]);
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const loadData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const [menuData, orderData, reservationData] = await Promise.all([
        fetchMenu(),
        getUserOrders({}, token),
        getUserReservations({}, token)
      ]);
      setMenu(Array.isArray(menuData) ? menuData : []);
      setOrders(orderData);
      setReservations(reservationData);
    } catch (err) {
      if (err.status === 401) logout();
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    loadData(true); // Show loading on initial load
  }, [loadData]);

  // Auto-transition order statuses using timers
  useEffect(() => {
    const timers = [];

    orders.forEach((order) => {
      if (order.status === 'pending' || order.status === 'confirmed') {
        const createdAt = new Date(order.createdAt);
        const now = new Date();
        const ageSeconds = Math.floor((now - createdAt) / 1000);

        if (order.status === 'pending') {
          if (ageSeconds >= 20) {
            // Already should be confirmed - update immediately
            updateOrderStatusAuto(order.id, token).then(() => {
              loadData(false);
            }).catch(err => console.error('Failed to update status:', err));
          } else {
            // Schedule transition to confirmed
            const remainingSeconds = (20 - ageSeconds) * 1000;
            const timer = setTimeout(() => {
              updateOrderStatusAuto(order.id, token).then(() => {
                loadData(false);
              }).catch(err => console.error('Failed to update status:', err));
            }, remainingSeconds);
            timers.push(timer);
          }
        } else if (order.status === 'confirmed') {
          if (ageSeconds >= 40) {
            // Already should be preparing - update immediately
            updateOrderStatusAuto(order.id, token).then(() => {
              loadData(false);
            }).catch(err => console.error('Failed to update status:', err));
          } else {
            // Schedule transition to preparing
            const remainingSeconds = (40 - ageSeconds) * 1000;
            const timer = setTimeout(() => {
              updateOrderStatusAuto(order.id, token).then(() => {
                loadData(false);
              }).catch(err => console.error('Failed to update status:', err));
            }, remainingSeconds);
            timers.push(timer);
          }
        }
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [orders, token, loadData]);

  const filteredOrders = useMemo(() => {
    if (status === 'all') return orders;
    return orders.filter((order) => order.status === status);
  }, [orders, status]);

  const addItemRow = () => {
    setItems((prev) => [...prev, { menuItemId: '', quantity: 1, specialInstructions: '' }]);
  };

  const updateItemRow = (index, field, value) => {
    setItems((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
  };

  const removeItemRow = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const preparedItems = useMemo(() => {
    return items
      .filter((item) => item.menuItemId)
      .map((item) => {
        const menuItem = menu.find((m) => m._id === item.menuItemId);
        const price = Number(menuItem?.price || 0);
        const quantity = Number(item.quantity || 1);
        return {
          menuItemId: item.menuItemId,
          itemName: menuItem?.name || 'Unknown item',
          price,
          quantity: Math.floor(quantity), // Ensure integer
          specialInstructions: item.specialInstructions || undefined, // Convert empty string to undefined
          lineTotal: price * quantity
        };
      });
  }, [items, menu]);

  const totals = useMemo(() => {
    const subtotal = preparedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const tax = Number((subtotal * 0.1).toFixed(2));
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [preparedItems]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!preparedItems.length) {
      setFormError('Add at least one menu item.');
      return;
    }
    setFormLoading(true);
    setFormError(null);
    const payload = {
      paymentMethod: form.paymentMethod,
      specialRequests: form.specialRequests || '',
      items: preparedItems.map(({ lineTotal, ...item }) => item),
      subtotal: totals.subtotal,
      total: totals.total,
      tax: totals.tax,
      discount: 0
    };
    
    // If a reservation is selected, get tableNumber from it and include both
    if (form.reservationId && form.reservationId.trim() !== '') {
      const selectedReservation = reservations.find(r => r.id === form.reservationId);
      if (selectedReservation && selectedReservation.tableNumber) {
        payload.reservationId = form.reservationId;
        payload.tableNumber = selectedReservation.tableNumber;
      }
    }
    try {
      await createOrder(payload, token);
      setForm({
        reservationId: '',
        paymentMethod: 'cash',
        specialRequests: ''
      });
      setItems([{ menuItemId: '', quantity: 1, specialInstructions: '' }]);
      loadData(false); // Refresh without showing loading state
    } catch (err) {
      console.error('Order creation error:', err);
      if (err.status === 401) logout();
      // Handle validation errors
      if (err.payload?.errors && Array.isArray(err.payload.errors)) {
        const errorMessages = err.payload.errors.map(e => e.msg || e.message).join(', ');
        setFormError(errorMessages || err.message || 'Request failed');
      } else if (err.payload?.message) {
        setFormError(err.payload.message);
      } else {
        setFormError(err.message || 'Request failed');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await cancelOrder(orderId, token);
      loadData(false); // Refresh without showing loading state
    } catch (err) {
      if (err.status === 401) logout();
      setError(err.message);
    }
  };

  const handleViewDetails = async (orderId) => {
    setDetailLoading(true);
    setSelectedOrder(null);
    setDetailError(null);
    try {
      const detail = await getOrder(orderId, token);
      if (detail) {
        setSelectedOrder(detail);
      } else {
        setDetailError('Order details not found');
      }
    } catch (err) {
      if (err.status === 401) {
        logout();
      } else {
        setDetailError(err.message || 'Failed to load order details');
      }
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="panel column">
      <header className="panel-header">
        <div>
          <h2>Orders</h2>
          <p className="muted">Place new orders or view your order history</p>
        </div>
      </header>

      <section className="card">
        <h3>New Order</h3>
        {formError && <div className="alert error">{formError}</div>}
        <form className="order-form" onSubmit={handleSubmit}>
          <div className="grid-three">
            <label>
              Reservation
              <select
                value={form.reservationId}
                onChange={(e) => setForm((prev) => ({ ...prev, reservationId: e.target.value }))}
              >
                <option value="">Optional</option>
                {reservations.map((reservation) => (
                  <option key={reservation.id} value={reservation.id}>
                    Table {reservation.tableNumber} • {reservation.reservationDate}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Payment method
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="items-list">
            {items.map((item, index) => (
              <div key={index} className="item-row">
                <select
                  value={item.menuItemId}
                  onChange={(e) => updateItemRow(index, 'menuItemId', e.target.value)}
                  required
                >
                  <option value="">Select menu item</option>
                  {menu.map((menuItem) => (
                    <option key={menuItem._id} value={menuItem._id}>
                      {menuItem.name} (${Number(menuItem.price).toFixed(2)})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItemRow(index, 'quantity', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Special instructions"
                  value={item.specialInstructions}
                  onChange={(e) => updateItemRow(index, 'specialInstructions', e.target.value)}
                />
                {items.length > 1 && (
                  <button type="button" className="btn-ghost" onClick={() => removeItemRow(index)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn-ghost" onClick={addItemRow}>
              Add menu item
            </button>
          </div>

          <label>
            Special requests
            <textarea
              rows={3}
              value={form.specialRequests}
              onChange={(e) => setForm((prev) => ({ ...prev, specialRequests: e.target.value }))}
              placeholder="Allergies, plating, etc."
            />
          </label>

          <div className="totals">
            <p>
              Subtotal <strong>${totals.subtotal.toFixed(2)}</strong>
            </p>
            <p>
              Tax (10%) <strong>${totals.tax.toFixed(2)}</strong>
            </p>
            <p>
              Total <strong>${totals.total.toFixed(2)}</strong>
            </p>
          </div>

          <button className="btn-primary" type="submit" disabled={formLoading}>
            {formLoading ? 'Processing…' : 'Place Order'}
          </button>
        </form>
      </section>

      <section className="card">
        <header className="card-header">
          <h3>Your Orders</h3>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {statusFilters.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'All' : option}
              </option>
            ))}
          </select>
        </header>
        {loading && <p>Loading…</p>}
        {!loading && filteredOrders.length === 0 && <p className="muted">No orders found.</p>}

        {!loading && filteredOrders.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Table</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.tableNumber ?? 'N/A'}</td>
                    <td>
                      <span className={`badge badge-${order.status}`}>{order.status}</span>
                    </td>
                    <td>${Number(order.total).toFixed(2)}</td>
                    <td className="table-actions">
                      <button onClick={() => handleViewDetails(order.id)}>View</button>
                      {order.status !== 'cancelled' && (
                        <button className="btn-danger" onClick={() => handleCancel(order.id)}>
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

      {detailLoading && <p>Loading…</p>}
      {detailError && (
        <section className="card">
          <div className="alert error">{detailError}</div>
          <button className="btn-ghost" onClick={() => { setDetailError(null); setSelectedOrder(null); }}>
            Close
          </button>
        </section>
      )}
      {selectedOrder && (
        <section className="card">
          <header className="card-header">
            <div>
              <h3>{selectedOrder.orderNumber || 'Order Details'}</h3>
            </div>
            <button className="btn-ghost" onClick={() => setSelectedOrder(null)}>
              Close
            </button>
          </header>
          <p className="muted">
            {selectedOrder.tableNumber ? `Table ${selectedOrder.tableNumber}` : 'No table'} • Status {selectedOrder.status} • Payment {selectedOrder.paymentStatus}
          </p>
          {selectedOrder.items && selectedOrder.items.length > 0 ? (
            <ul className="order-items">
              {selectedOrder.items.map((item, index) => (
                <li key={item.menuItemId || index}>
                  <div>
                    <strong>
                      {item.itemName} × {item.quantity}
                    </strong>
                    {item.specialInstructions && <p className="muted">{item.specialInstructions}</p>}
                  </div>
                  <span>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No items found in this order.</p>
          )}
          {selectedOrder.specialRequests && (
            <div className="muted" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #333' }}>
              <strong>Special Requests:</strong> {selectedOrder.specialRequests}
            </div>
          )}
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #333' }}>
            <p>
              <strong>Subtotal:</strong> ${(selectedOrder.subtotal || 0).toFixed(2)}
            </p>
            {selectedOrder.tax > 0 && (
              <p>
                <strong>Tax:</strong> ${(selectedOrder.tax || 0).toFixed(2)}
              </p>
            )}
            {selectedOrder.discount > 0 && (
              <p>
                <strong>Discount:</strong> ${(selectedOrder.discount || 0).toFixed(2)}
              </p>
            )}
            <p>
              <strong>Total:</strong> ${(selectedOrder.total || 0).toFixed(2)}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

