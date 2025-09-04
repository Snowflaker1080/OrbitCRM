import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL        // e.g. "http://localhost:3000/api"
  || '/api';                          // fallback for proxy setups

// Dev-time guard: warn if baseURL is still pointing to Vite
if (import.meta.env.DEV && (!import.meta.env.VITE_API_URL || baseURL.includes('5173'))) {
  // eslint-disable-next-line no-console
  console.warn(
    '[api] VITE_API_URL is missing or incorrect. Falling back to "%s". ' +
    'If you see 404s to :5173 again, set VITE_API_URL in .env or add a Vite proxy.',
    baseURL
  );
}

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(err);
  }
);

export default api;