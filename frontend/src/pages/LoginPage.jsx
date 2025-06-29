import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError('Username/email atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900 px-4">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-xl backdrop-blur-lg bg-white/10 border border-white/20 animate-fade-in text-white">
        <h1 className="text-3xl font-bold text-center mb-3">Selamat Datang!</h1>
        <p className="text-sm text-center mb-6 text-slate-300">
          Silakan login untuk melanjutkan
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/90 text-white text-sm p-3 rounded text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm mb-1">Username atau Email</label>
            <input
              type="text"
              placeholder="Username/email"
              className="input input-bordered w-full bg-white/20 placeholder-white/60 text-white"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              placeholder="Password"
              className="input input-bordered w-full bg-white/20 placeholder-white/60 text-white"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Memuat...' : 'Login'}
          </button>

          <p className="mt-4 text-sm text-center">
            Belum punya akun?{' '}
            <Link to="/register" className="link link-hover text-indigo-300">
              Daftar di sini
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
