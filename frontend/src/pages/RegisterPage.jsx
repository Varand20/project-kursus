import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Impor instance Axios kita

export function RegisterPage() {
  // State untuk menyimpan data dari setiap input form
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });

  // State untuk menangani pesan error dan status loading
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Hook untuk navigasi/redirect setelah berhasil
  const navigate = useNavigate();

  // Fungsi untuk meng-update state saat user mengetik di form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Fungsi yang dijalankan saat form disubmit
  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah form me-refresh halaman
    setError(null); // Reset pesan error sebelumnya
    setLoading(true); // Tampilkan status loading

    try {
      // Kirim data form ke endpoint registrasi di backend
      await api.post('/users/register', formData);

      // Jika berhasil, tampilkan pesan dan arahkan ke halaman login
      alert('Registrasi berhasil! Silakan login.');
      navigate('/login');

    } catch (err) {
      // Jika terjadi error dari backend
      if (err.response && err.response.data && err.response.data.detail) {
        // Tampilkan pesan error spesifik dari FastAPI
        setError(err.response.data.detail);
      } else {
        // Tampilkan pesan error umum
        setError('Terjadi kesalahan. Coba lagi nanti.');
      }
    } finally {
      // Hentikan status loading, baik berhasil maupun gagal
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
            {error && <div className="alert alert-error">{error}</div>}
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nama Lengkap</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Nama Anda"
                className="input input-bordered"
                required
                onChange={handleChange}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                name="username"
                placeholder="Username unik Anda"
                className="input input-bordered"
                required
                onChange={handleChange}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="email@anda.com"
                className="input input-bordered"
                required
                onChange={handleChange}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="Minimal 8 karakter"
                className="input input-bordered"
                required
                onChange={handleChange}
              />
            </div>
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="loading loading-spinner"></span> : 'Daftar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}