import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Komponen untuk Form Edit Profil
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
      onProfileUpdate(response.data); // Beri tahu parent bahwa user sudah diupdate
      alert('Profil berhasil diperbarui!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal memperbarui profil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-control">
        <label className="label"><span className="label-text">Nama Lengkap</span></label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} className="input input-bordered" />
      </div>
      <div className="form-control">
        <label className="label"><span className="label-text">Username</span></label>
        <input type="text" name="username" value={formData.username} onChange={handleChange} className="input input-bordered" />
      </div>
      <div className="form-control">
        <label className="label"><span className="label-text">Email</span></label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} className="input input-bordered" />
      </div>
      <div className="form-control mt-6">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
}

// Komponen untuk Form Ganti Password
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
      setFormData({ current_password: '', new_password: '' }); // Reset form
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Gagal mengubah password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && <div className={`alert ${message.includes('berhasil') ? 'alert-success' : 'alert-error'}`}>{message}</div>}
      <div className="form-control">
        <label className="label"><span className="label-text">Password Saat Ini</span></label>
        <input type="password" name="current_password" value={formData.current_password} onChange={handleChange} className="input input-bordered" />
      </div>
      <div className="form-control">
        <label className="label"><span className="label-text">Password Baru</span></label>
        <input type="password" name="new_password" value={formData.new_password} onChange={handleChange} className="input input-bordered" />
      </div>
      <div className="form-control mt-6">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Mengubah...' : 'Ubah Password'}
        </button>
      </div>
    </form>
  );
}


// Komponen Halaman Profil Utama
export function ProfilePage() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) {
    return <div>Silakan login untuk melihat profil Anda.</div>;
  }
  
  // Fungsi untuk me-refresh data user di context setelah diupdate
  const handleProfileUpdate = (updatedUser) => {
    login(null, null, true); // Panggil login dengan mode refresh
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Profil Saya</h1>
      <div role="tablist" className="tabs tabs-lifted">
        <a role="tab" className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`} onClick={() => setActiveTab('profile')}>Edit Profil</a>
        <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
           {activeTab === 'profile' && <EditProfileForm user={user} onProfileUpdate={handleProfileUpdate} />}
        </div>

        <a role="tab" className={`tab ${activeTab === 'security' ? 'tab-active' : ''}`} onClick={() => setActiveTab('security')}>Keamanan</a>
        <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
           {activeTab === 'security' && <ChangePasswordForm />}
        </div>
      </div>
    </div>
  );
}