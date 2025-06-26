import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Gunakan hook kita

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth(); // Ambil fungsi login dari context
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Panggil fungsi login dari context
      await login(username, password);
      // Jika berhasil, arahkan ke halaman utama
      navigate('/');
    } catch (err) {
      setError('Username/email atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <form className="card-body" onSubmit={handleSubmit}>
          <h1 className="text-3xl font-bold text-center">Login</h1>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Username atau Email</span>
            </label>
            <input
              type="text"
              placeholder="Username atau email"
              className="input input-bordered"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="Password"
              className="input input-bordered"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-control mt-6">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner"></span> : 'Login'}
            </button>
          </div>
          <label className="label text-center">
            <Link to="/register" className="label-text-alt link link-hover">
              Belum punya akun? Daftar di sini
            </Link>
          </label>
        </form>
      </div>
    </div>
  );
}