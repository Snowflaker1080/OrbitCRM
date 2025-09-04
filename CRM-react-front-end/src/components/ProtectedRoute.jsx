import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { authContext } from '../context/AuthContext.jsx';

const ProtectedRoute = () => {
  const { token } = useAuth();
  return token ? <Outlet /> : <Navigate to="/sign-in" replace />;
};

export default ProtectedRoute;