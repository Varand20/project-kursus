import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Buat Context-nya
const AuthContext = createContext();

// Buat Provider (pembungkus) yang akan menyediakan data dan fungsi
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // State loading untuk cek token awal
  const navigate = useNavigate();

  // useEffect ini akan berjalan sekali saat aplikasi pertama kali dimuat
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Jika ada token di localStorage, coba verifikasi ke backend
      api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        // Jika token valid, simpan data user dan token
        setUser(response.data);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      })
      .catch(() => {
        // Jika token tidak valid, hapus dari localStorage
        localStorage.removeItem('token');
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false); // Tidak ada token, langsung selesai loading
    }
  }, []);

  // Fungsi untuk login
  const login = async (username, password) => {
    // Buat data form untuk dikirim ke backend
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    // Panggil API login
    const response = await api.post('/login', formData);
    const { access_token } = response.data;
    
    // Simpan token ke localStorage dan set header default Axios
    localStorage.setItem('token', access_token);
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    
    // Ambil data user yang baru login dan update state
    const userResponse = await api.get('/users/me');
    setUser(userResponse.data);
  };

  // Fungsi untuk logout
  const logout = () => {
    // Hapus data dari state dan localStorage
    setUser(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login'); // Arahkan ke halaman login
  };

  // Sediakan data dan fungsi ke semua komponen "anak"
  const value = { user, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Buat custom hook agar lebih mudah digunakan di komponen lain
export function useAuth() {
  return useContext(AuthContext);
}