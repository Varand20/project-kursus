import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function InstructorRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-10"><span className="loading loading-lg loading-spinner"></span></div>;
  }

  // Cek apakah ada user, DAN apakah perannya adalah 'instruktur'
  if (user && user.role === 'instruktur') {
    // Jika ya, izinkan akses
    return <Outlet />;
  }

  // Jika tidak, lempar ke halaman utama atau halaman "Akses Ditolak"
  // Mengarahkan ke halaman utama adalah pilihan yang aman.
  return <Navigate to="/" />;
}