// src/services/api.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Universal fetch wrapper with credentials included for session management
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Ensures session cookie (connect.sid) is sent and accepted
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const networkError = new Error('Cannot connect to backend server. Ensure the server is running.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw err;
  }
}

export const api = {
  // --- Auth endpoints ---
  register: (username, email, password) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: { username, email, password },
    }),

  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),

  getMe: () =>
    apiRequest('/auth/me', {
      method: 'GET',
    }),

  // --- Product endpoints ---
  getProducts: (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.category && filters.category !== 'All') {
      params.append('category', filters.category);
    }
    if (filters.minPrice !== undefined && filters.minPrice !== '') {
      params.append('minPrice', filters.minPrice);
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
      params.append('maxPrice', filters.maxPrice);
    }
    if (filters.inStock === true || filters.inStock === 'true') {
      params.append('inStock', 'true');
    }
    if (filters.search && filters.search.trim()) {
      params.append('search', filters.search.trim());
    }
    if (filters.sort) {
      params.append('sort', filters.sort);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    return apiRequest(endpoint, { method: 'GET' });
  },

  getProductById: (id) =>
    apiRequest(`/products/${id}`, {
      method: 'GET',
    }),

  // --- Cart endpoints ---
  getCart: () =>
    apiRequest('/cart', {
      method: 'GET',
    }),

  addToCart: (productId, quantity = 1) =>
    apiRequest('/cart/items', {
      method: 'POST',
      body: { productId, quantity: Number(quantity) },
    }),

  removeFromCart: (productId) =>
    apiRequest(`/cart/items/${productId}`, {
      method: 'DELETE',
    }),

  checkout: () =>
    apiRequest('/cart/checkout', {
      method: 'POST',
    }),
};

export default api;
