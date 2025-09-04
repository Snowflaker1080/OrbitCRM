import { createContext, useMemo, useState, useEffect } from 'react';
export const authContext = createContext(null); // non-component export

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser]   = useState(null);

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  const value = useMemo(() => ({ token, setToken, user, setUser }), [token, user]);
  return <authContext.Provider value={value}>{children}</authContext.Provider>;
};

export default AuthProvider;