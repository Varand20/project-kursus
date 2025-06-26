import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function InstructorToggleButton() {
  const { user } = useAuth(); // Kita tidak lagi butuh fungsi login di sini
  const location = useLocation();

  const isInstructorPage = location.pathname.startsWith('/instructor');

  const handleBecomeInstructor = async () => {
    try {
      // 1. Panggil API backend untuk upgrade role
      const response = await api.post('/users/become-instructor');
      const { access_token } = response.data;
      
      // 2. Simpan token BARU yang berisi role 'instruktur' ke localStorage
      localStorage.setItem('token', access_token);
      
      alert('Selamat! Anda sekarang adalah seorang Instruktur. Halaman akan dimuat ulang dengan akses baru Anda.');
      
      // 3. (INI KUNCINYA) Daripada mencoba refresh state, kita paksa
      //    seluruh halaman untuk navigasi dan reload ke dasbor.
      //    Ini akan membuat AuthContext membaca token baru dari awal.
      window.location.href = '/instructor/dashboard';
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Terjadi kesalahan. Coba lagi nanti.';
      alert(errorMessage);
    }
  };

  if (!user) return null;

  if (user.role === 'instruktur') {
    return isInstructorPage ? (
      <Link to="/" className="btn btn-ghost">Tampilan Siswa</Link>
    ) : (
      <Link to="/instructor/dashboard" className="btn btn-ghost">Dasbor Instruktur</Link>
    );
  }
  
  if (user.role === 'siswa') {
    return (
      <button onClick={handleBecomeInstructor} className="btn btn-outline btn-primary">
        Jadi Instruktur
      </button>
    );
  }

  return null;
}