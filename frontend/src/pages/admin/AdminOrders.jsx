import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminOrders,
  updateOrderStatus,
  updateOrderPayment,
  cancelOrder,
  getTableOrders,
  getOrder
} from '../../services/api';

const statusOptions = ['pending', 'confirmed', 'preparing', 'ready', 'cancelled'];
const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
const paymentMethods = ['cash', 'card', 'apple pay'];

export default function AdminOrders() {
  const { token, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [tableFilter, setTableFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tableQuery, setTableQuery] = useState('');
  const [tableOrders, setTableOrders] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getAdminOrders(
        {
          status: status === 'all' ? undefined : status,
          paymentStatus: paymentStatusFilter === 'all' ? undefined : paymentStatusFilter,
          tableNumber: tableFilter || undefined
        },
        token
      );
      setOrders(data);
    } catch (err) {
      if (err.status === 401) logout();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token, logout, status, paymentStatusFilter, tableFilter]);

  const handleStatusChange = async (orderId, nextStatus) => {
    try {
      await updateOrderStatus(orderId, nextStatus, token);
      loadOrders();
    } catch (err) {
      if (err.status === 401) logout();
      setError(err.message);
    }
  };

  const handlePaymentUpdate = async (orderId, paymentStatus, paymentMethod) => {
    try {
      await updateOrderPayment(
        orderId,
        { paymentStatus, paymentMethod },
        token
      );
      loadOrders();
    } catch (err) {
      if (err.status === 401) logout();
      setError(err.message);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await cancelOrder(orderId, token);
      loadOrders();
    } catch (err) {
      if (err.status === 401) logout();
      setError(err.message);
    }
  };

  const handleLookupTable = async () => {
    if (!tableQuery) return;
    try {
      setTableLoading(true);
      const data = await getTableOrders(tableQuery, token);
      setTableOrders(data);
    } catch (err) {
      if (err.status === 401) logout();
      setError(err.message);
    } finally {
      setTableLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    setDetailLoading(true);
    setSelectedOrder(null);
    try {
      const detail = await getOrder(orderId, token);
      setSelectedOrder(detail);
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
          <h2>Orders</h2>
          <p className="muted">View and manage all customer orders</p>
        </div>
        <div className="panel-actions orders-filter">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)}>
            <option value="all">All</option>
            {paymentStatuses.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Table"
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
          />
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      {loading && <p>Loading…</p>}
      {!loading && orders.length === 0 && <p className="muted">No orders found</p>}

      {!loading && orders.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Table</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.tableNumber}</td>
                  <td>
                    <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="payment-controls">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => handlePaymentUpdate(order.id, e.target.value, order.paymentMethod)}
                      >
                        {paymentStatuses.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <select
                        value={order.paymentMethod}
                        onChange={(e) => handlePaymentUpdate(order.id, order.paymentStatus, e.target.value)}
                      >
                        {paymentMethods.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td>${Number(order.total).toFixed(2)}</td>
                  <td className="table-actions">
                    <button onClick={() => handleViewOrder(order.id)}>View</button>
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

      <section className="card">
        <h3>Search by Table</h3>
        <div className="lookup-row">
          <input
            type="number"
            placeholder="Table number"
            value={tableQuery}
            onChange={(e) => setTableQuery(e.target.value)}
          />
          <button className="btn-primary" onClick={handleLookupTable} disabled={tableLoading}>
            {tableLoading ? 'Searching…' : 'Search'}
          </button>
        </div>
        {tableOrders.length > 0 && (
          <ul className="timeline">
            {tableOrders.map((order) => (
              <li key={order.id}>
                <div>
                  <strong>{order.orderNumber}</strong>
                  <p className="muted">{order.status}</p>
                </div>
                <span>${Number(order.total).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>


      {detailLoading && <p>Loading…</p>}
      {selectedOrder && (
        <section className="card">
          <header className="card-header">
            <div>
              <h3>Order {selectedOrder.orderNumber}</h3>
            </div>
            <button className="btn-ghost" onClick={() => setSelectedOrder(null)}>
              Close
            </button>
          </header>
          <p className="muted">
            Table {selectedOrder.tableNumber} • Status {selectedOrder.status} • Payment {selectedOrder.paymentStatus}
          </p>
          <ul className="order-items">
            {selectedOrder.items.map((item) => (
              <li key={item.menuItemId}>
                <div>
                  <strong>
                    {item.itemName} × {item.quantity}
                  </strong>
                  {item.specialInstructions && <p className="muted">{item.specialInstructions}</p>}
                </div>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

