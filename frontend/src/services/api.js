const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:5000/api').replace(/\/$/, '');

const resolvePath = (path = '/') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};

const buildUrl = (path, query) => {
  const url = new URL(resolvePath(path));
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value);
      }
    });
  }
  return url;
};

async function request(path, { method = 'GET', token, body, query } = {}) {
  const url = buildUrl(path, query);

  const headers = { Accept: 'application/json' };
  let payload = undefined;

  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      payload = body;
    } else {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: payload
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || 'Request failed';
    const error = new Error(message);
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}

// Auth -----------------------------------------------------------------------
export const loginUser = (credentials) =>
  request('/auth/login', { method: 'POST', body: credentials });

export const registerUser = (payload) =>
  request('/auth/register', { method: 'POST', body: payload });

export const fetchProfile = (token) =>
  request('/auth/me', { token });

// Menu -----------------------------------------------------------------------
export const fetchMenu = () => request('/menu');

export const createMenuItem = (payload, token) =>
  request('/admin/menu', { method: 'POST', token, body: payload });

export const editMenuItem = (id, payload, token) =>
  request(`/admin/menu/${id}`, { method: 'PUT', token, body: payload });

export const removeMenuItem = (id, token) =>
  request(`/admin/menu/${id}`, { method: 'DELETE', token });

// Reservations ---------------------------------------------------------------
export const getAvailableTables = (query) =>
  request('/reservations/available-tables', { query });

export const createReservation = (payload, token) =>
  request('/reservations', { method: 'POST', token, body: payload });

export const getUserReservations = (query, token) =>
  request('/reservations', { token, query }).then((res) => res?.reservations || []);

export const getReservation = (id, token) =>
  request(`/reservations/${id}`, { token }).then((res) => res?.reservation);

export const updateReservation = (id, payload, token) =>
  request(`/reservations/${id}`, { method: 'PUT', token, body: payload });

export const cancelReservation = (id, token) =>
  request(`/reservations/${id}`, { method: 'DELETE', token });

export const getAdminReservations = (query, token) =>
  request('/admin/reservations', { token, query }).then((res) => res?.reservations || []);

export const updateAdminReservationStatus = (id, status, token) =>
  request(`/admin/reservations/${id}/status`, {
    method: 'PUT',
    token,
    body: { status }
  });

// Orders ---------------------------------------------------------------------
export const createOrder = (payload, token) =>
  request('/orders', { method: 'POST', token, body: payload });

export const getUserOrders = (query, token) =>
  request('/orders', { token, query }).then((res) => res?.orders || []);

export const getOrder = (id, token) =>
  request(`/orders/${id}`, { token }).then((res) => res?.order);

export const getTableOrders = (tableNumber, token) =>
  request(`/admin/orders/table/${tableNumber}`, { token }).then((res) => res?.orders || []);

export const getAdminOrders = (query, token) =>
  request('/admin/orders', { token, query }).then((res) => res?.orders || []);

export const updateOrderStatus = (id, status, token) =>
  request(`/admin/orders/${id}/status`, {
    method: 'PUT',
    token,
    body: { status }
  });

export const updateOrderPayment = (id, payload, token) =>
  request(`/admin/orders/${id}/payment`, {
    method: 'PUT',
    token,
    body: payload
  });

export const cancelOrder = (id, token) =>
  request(`/admin/orders/${id}/cancel`, { method: 'PUT', token });

// Feedback -------------------------------------------------------------------
export const submitFeedback = (payload, token) =>
  request('/feedback', { method: 'POST', token, body: payload });

export const getUserFeedback = (query, token) =>
  request('/feedback/my-feedback', { token, query }).then((res) => res?.feedback || []);

export const getFeedback = (id, token) =>
  request(`/feedback/${id}`, { token }).then((res) => res?.feedback);

export const getAdminFeedback = (query, token) =>
  request('/admin/feedback', { token, query }).then((res) => res?.feedback || []);

export const deleteFeedback = (id, token) =>
  request(`/admin/feedback/${id}`, { method: 'DELETE', token });
