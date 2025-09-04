// src/pages/auth/SignIn.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.jsx';

const SignIn = () => {
  const { setToken, setUser } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const decodeUserFromToken = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1])).payload;
    } catch {
      return null;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const username = form.username.trim();
    const password = form.password;

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      setSaving(true);
      const { data } = await api.post('/auth/sign-in', { username, password });

      if (!data?.token) throw new Error('Invalid response from server');

      setToken(data.token);
      const user = data.user ?? decodeUserFromToken(data.token);
      if (user) setUser(user);

      navigate('/dashboard', { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      let msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Sign in failed';

      if (status === 401) msg = 'Invalid username or password';
      if (status === 404)
        msg =
          'Endpoint not found (404). Check your API base URL and route path: expected /api/auth/sign-in.';

      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      className="container"
      style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}
      aria-labelledby="signin-title"
    >
      <div className="card" style={{ padding: '2rem', maxWidth: '400px', width: '100%' }}>
        <h1 id="signin-title" style={{ textAlign: 'center' }}>Sign In</h1>

        <form onSubmit={onSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            autoComplete="username"
            required
            minLength={3}
          />

          <label htmlFor="password">Password</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
              required
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="btn btn-secondary"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {error && (
            <p role="alert" style={{ marginTop: '0.5rem', color: 'red' }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '1rem', width: '100%' }}>
            {saving ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default SignIn;