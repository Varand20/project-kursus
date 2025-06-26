import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-10"><span className="loading loading-lg loading-spinner"></span></div>;
  }
  
  if (!user) {
    // Jika tidak ada user login, lempar ke halaman login
    return <Navigate to="/login" />;
  }
  
  // Jika user ada, izinkan masuk
  return <Outlet />;
}