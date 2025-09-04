import axios from 'axios';

const RAW_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACK_END_SERVER_URL ||
  '';
const API_BASE = RAW_BASE.replace(/\/+$/, '');
const AUTH_BASE = `${API_BASE}/api/auth`; // ← align with backend mount

function decodeJwtPayload(token) {
  try {
    const base64url = token.split('.')[1];
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
      + '==='.slice((base64url.length + 3) % 4);
    return JSON.parse(atob(base64)); // return full payload object
  } catch {
    return null;
  }
}

function extractErrorMessage(err) {
  const api = err?.response?.data;
  return (
    api?.err ||
    api?.error ||
    api?.message ||
    (Array.isArray(api?.errors) && api.errors[0]?.message) ||
    err?.message ||
    'Request failed'
  );
}

const signUp = async (formData) => {
  try {
    const { data } = await axios.post(`${AUTH_BASE}/sign-up`, formData, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!data?.token) throw new Error('Invalid response from server');

    localStorage.setItem('token', data.token);
    const payload = decodeJwtPayload(data.token);
    if (!payload) throw new Error('Invalid JWT token');
    return payload;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

const signIn = async (formData) => {
  try {
    const { data } = await axios.post(`${AUTH_BASE}/sign-in`, formData, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!data?.token) throw new Error('Invalid response from server');

    localStorage.setItem('token', data.token);
    const payload = decodeJwtPayload(data.token);
    if (!payload) throw new Error('Invalid JWT token');
    return payload;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
};

const getToken = () => localStorage.getItem('token');
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });
const signOut = () => localStorage.removeItem('token');

export { signUp, signIn, getToken, authHeader, signOut };