//hooks/useAuth.jsx
import { useContext } from 'react';
import { authContext } from '../context/AuthContext.jsx';

const useAuth = () => {
  const ctx = useContext(authContext);
  if (ctx === null) {
    throw new Error('useAuth must be used within <AuthProvider>.');
  }
  return ctx;
};

export default useAuth;
export { useAuth };