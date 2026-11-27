// Every call to the backend goes through this file.
// Components never use fetch() directly - they call functions like menuApi.getAll().

import type {
  Admin,
  CartItem,
  ContactMessage,
  MealAnalysis,
  MenuItem,
  NewOrder,
  Order,
  OrderStats,
  OrderStatus,
} from '../types';

// In development Vite forwards "/api" to the backend (see vite.config.ts).
// In production set VITE_API_URL, e.g. https://your-backend.onrender.com/api
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const TOKEN_KEY = 'adminToken';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// An error that also remembers the HTTP status code (e.g. 401 = not logged in)
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        // Only say "this is JSON" when we actually send a body.
        // Plain GET requests stay "simple", so the browser doesn't need an extra CORS check first.
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    // fetch only throws when the server can't be reached at all
    throw new ApiError('Cannot reach the server. Please check your connection and try again.', 0);
  }

  // Our backend always answers with JSON. If something else comes back (for example an
  // HTML page because the API address is wrong), show a clear error instead of crashing.
  const isJson = (response.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!data) {
    throw new ApiError('Could not get a proper answer from the server. Please try again later.', response.status);
  }

  if (!response.ok) {
    throw new ApiError(data.message || 'Something went wrong. Please try again.', response.status);
  }

  return data as T;
}

// Turns cart items into the small { menuItemId, quantity } list the backend expects
export function toOrderLines(items: CartItem[]) {
  return items.map((item) => ({ menuItemId: item.menuItemId, quantity: item.quantity }));
}

export const menuApi = {
  getAll: () => request<{ count: number; items: MenuItem[] }>('/menu'),
  // Admin screen skips the browser cache so it always sees the latest data
  getAllFresh: () => request<{ count: number; items: MenuItem[] }>('/menu', { cache: 'no-store' }),
  update: (id: string, changes: Partial<MenuItem>) =>
    request<{ item: MenuItem }>(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(changes) }),
};

export const orderApi = {
  create: (order: NewOrder) =>
    request<{ message: string; order: Order }>('/orders', { method: 'POST', body: JSON.stringify(order) }),

  track: (orderNumber: string, phone: string) =>
    request<{ order: Order }>(
      `/orders/track/${encodeURIComponent(orderNumber.trim())}?phone=${encodeURIComponent(phone)}`,
      { cache: 'no-store' }
    ),

  getAll: (status = 'all') =>
    request<{ orders: Order[]; total: number }>(`/orders?status=${status}&limit=100`, { cache: 'no-store' }),

  getStats: () => request<{ stats: OrderStats }>('/orders/stats', { cache: 'no-store' }),

  updateStatus: (id: string, status: OrderStatus) =>
    request<{ order: Order }>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; admin: Admin }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ admin: Admin }>('/auth/me', { cache: 'no-store' }),
};

export const messageApi = {
  send: (form: { name: string; email: string; phone: string; message: string }) =>
    request<{ message: string }>('/messages', { method: 'POST', body: JSON.stringify(form) }),
  getAll: () => request<{ messages: ContactMessage[] }>('/messages', { cache: 'no-store' }),
  markRead: (id: string) => request<{ item: ContactMessage }>(`/messages/${id}/read`, { method: 'PATCH' }),
  remove: (id: string) => request<{ message: string }>(`/messages/${id}`, { method: 'DELETE' }),
};

export const nutritionApi = {
  analyze: (items: CartItem[]) =>
    request<MealAnalysis>('/nutrition/analyze', {
      method: 'POST',
      body: JSON.stringify({ items: toOrderLines(items) }),
    }),
};
