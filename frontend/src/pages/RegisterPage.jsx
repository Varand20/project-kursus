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
      if (err.response) {
        if (err.response.status === 422) {
          const errorDetails = err.response.data.detail;
          const formattedError = errorDetails.map(
            e => `${e.loc[1]}: ${e.msg}`
          ).join('\n');
          setError(formattedError);
        } else {
          setError(err.response.data.detail || 'Terjadi kesalahan yang tidak diketahui.');
        }
      } else {
        setError('Tidak bisa terhubung ke server. Coba lagi nanti.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900 px-4">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-white/10 backdrop-blur-lg border border-white/20 text-white animate-fade-in">
        <h1 className="text-3xl font-bold mb-3 text-center">Daftar Akun</h1>
        <p className="text-sm text-center mb-6 text-slate-300">
          Yuk mulai belajar dan berkembang bareng!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/90 text-white text-sm p-3 rounded text-center whitespace-pre-line">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm mb-1">Nama Lengkap</label>
            <input
              name="name"
              type="text"
              required
              placeholder="Nama kamu"
              className="input input-bordered w-full bg-white/20 placeholder-white/60 text-white"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              name="username"
              type="text"
              required
              placeholder="Username unik"
              className="input input-bordered w-full bg-white/20 placeholder-white/60 text-white"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="emailkamu@mail.com"
              className="input input-bordered w-full bg-white/20 placeholder-white/60 text-white"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              placeholder="Minimal 8 karakter"
              className="input input-bordered w-full bg-white/20 placeholder-white/60 text-white"
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full mt-2"
          >
            {loading ? 'Memuat...' : 'Daftar'}
          </button>

          <p className="mt-4 text-sm text-center">
            Sudah punya akun?{' '}
            <Link to="/login" className="link link-hover text-indigo-300">
              Login di sini
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
