import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://my-tasker-production.up.railway.app/api',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login    = (data) => api.post('/auth/login', data);

// Todos
export const getTodos      = (params) => api.get('/todos', { params });
export const createTodo    = (data)   => api.post('/todos', data);
export const updateTodo    = (id, data) => api.put(`/todos/${id}`, data);
export const deleteTodo    = (id)     => api.delete(`/todos/${id}`);
export const toggleComplete = (id, is_completed) => api.patch(`/todos/${id}/complete`, { is_completed });

// User corners
export const getUserCorners  = ()           => api.get('/corners');
export const createUserCorner = (data)      => api.post('/corners', data);
export const deleteUserCorner = (id)        => api.delete(`/corners/${id}`);

// Expenses
export const getExpenses      = (month) => api.get('/expenses', { params: { month } });
export const getExpenseSummary = (month) => api.get('/expenses/summary', { params: { month } });
export const createExpense    = (data)   => api.post('/expenses', data);
export const deleteExpense    = (id)     => api.delete(`/expenses/${id}`);

export default api;
