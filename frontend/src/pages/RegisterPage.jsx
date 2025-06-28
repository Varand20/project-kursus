// Ganti seluruh isi file: src/pages/RegisterPage.jsx
// dengan kode yang sudah dilengkapi penanganan error yang lebih baik.

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post('/users/register', formData);
      alert('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (err) {
      // --- LOGIKA ERROR HANDLING BARU ---
      if (err.response) {
        if (err.response.status === 422) {
          // Jika ini adalah error validasi (422)
          const errorDetails = err.response.data.detail;
          // Format pesan error agar mudah dibaca
          const formattedError = errorDetails.map(
            e => `${e.loc[1]}: ${e.msg}` // contoh: "password: String should have at least 8 characters"
          ).join('\n'); // Gabungkan beberapa error dengan baris baru
          setError(`${formattedError}`);
        } else {
          // Untuk error lain dari backend (seperti 400)
          setError(err.response.data.detail || 'Terjadi kesalahan yang tidak diketahui.');
        }
      } else {
        // Untuk error jaringan atau error lainnya
        setError('Tidak bisa terhubung ke server. Coba lagi nanti.');
      }
      // ------------------------------------
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Daftar Sekarang!</h1>
          <p className="py-6">
            Buat akun baru untuk mulai mendaftar ke kursus-kursus terbaik pilihan kami dan tingkatkan keahlian Anda ke level selanjutnya.
          </p>
        </div>
        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <form className="card-body" onSubmit={handleSubmit}>
            {/* Tampilkan pesan error jika ada */}
            {error && (
              <div role="alert" className="alert alert-error">
                <pre className="whitespace-pre-wrap">{error}</pre>
              </div>
            )}
            
            <div className="form-control">
              <label className="label"><span className="label-text">Nama Lengkap</span></label>
              <input type="text" name="name" placeholder="Nama Anda" className="input input-bordered" required onChange={handleChange} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Username</span></label>
              <input type="text" name="username" placeholder="Username unik Anda" className="input input-bordered" required onChange={handleChange} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Email</span></label>
              <input type="email" name="email" placeholder="email@anda.com" className="input input-bordered" required onChange={handleChange} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Password</span></label>
              <input type="password" name="password" placeholder="Minimal 8 karakter" className="input input-bordered" required onChange={handleChange} />
            </div>
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="loading loading-spinner"></span> : 'Daftar'}
              </button>
            </div>
            <div className="text-center mt-4">
              <Link to="/login" className="link link-hover">Sudah punya akun? Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
