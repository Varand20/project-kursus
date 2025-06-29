import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function EditProfileForm({ user, onProfileUpdate }) {
  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await api.patch('/users/me', formData);
      onProfileUpdate(response.data);
      alert('Profil berhasil diperbarui!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal memperbarui profil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-500/90 text-white p-2 rounded text-sm text-center">{error}</div>}
      <div>
        <label className="block text-sm text-white mb-1">Nama Lengkap</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 rounded-xl bg-white/10 text-white border border-white/20 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
      <div>
        <label className="block text-sm text-white mb-1">Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full p-2 rounded-xl bg-white/10 text-white border border-white/20 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
      <div>
        <label className="block text-sm text-white mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 rounded-xl bg-white/10 text-white border border-white/20 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-xl transition font-medium"
      >
        {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </form>
  );
}

function ChangePasswordForm() {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      await api.put('/users/me/change-password', formData);
      setMessage('Password berhasil diubah!');
      setFormData({ current_password: '', new_password: '' });
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Gagal mengubah password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className={`p-2 rounded text-sm text-center ${message.includes('berhasil') ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
          {message}
        </div>
      )}
      <div>
        <label className="block text-sm text-white mb-1">Password Saat Ini</label>
        <input
          type="password"
          name="current_password"
          value={formData.current_password}
          onChange={handleChange}
          className="w-full p-2 rounded-xl bg-white/10 text-white border border-white/20 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
      <div>
        <label className="block text-sm text-white mb-1">Password Baru</label>
        <input
          type="password"
          name="new_password"
          value={formData.new_password}
          onChange={handleChange}
          className="w-full p-2 rounded-xl bg-white/10 text-white border border-white/20 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-xl transition font-medium"
      >
        {isLoading ? 'Mengubah...' : 'Ubah Password'}
      </button>
    </form>
  );
}

export function ProfilePage() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) {
    return <div className="text-white text-center p-10">Silakan login untuk melihat profil Anda.</div>;
  }

  const handleProfileUpdate = (updatedUser) => {
    login(null, null, true); // trigger refresh
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900 px-4 py-10">
      <div className="max-w-2xl mx-auto backdrop-blur-md bg-white/10 border border-white/20 p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl text-white font-bold mb-6 text-center">Profil Saya</h1>

        <div className="flex justify-center mb-6 space-x-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-full transition font-medium ${
              activeTab === 'profile'
                ? 'bg-white text-indigo-800'
                : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
            }`}
          >
            Edit Profil
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-full transition font-medium ${
              activeTab === 'security'
                ? 'bg-white text-indigo-800'
                : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
            }`}
          >
            Keamanan
          </button>
        </div>

        <div className="transition-all">
          {activeTab === 'profile' && <EditProfileForm user={user} onProfileUpdate={handleProfileUpdate} />}
          {activeTab === 'security' && <ChangePasswordForm />}
        </div>
      </div>
    </div>
  );
}
