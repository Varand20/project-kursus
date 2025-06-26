import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const { user } = useAuth(); // Kita "dengarkan" status user

  // Fungsi untuk mengambil daftar favorit dari backend
  const fetchFavorites = useCallback(async () => {
    // JANGAN LAKUKAN APA-APA jika user belum login
    if (!user) {
      setFavoriteIds(new Set()); // Kosongkan daftar favorit jika logout
      return;
    }
    try {
      const response = await api.get('/favorites');
      const ids = response.data.map(favCourse => favCourse.id);
      setFavoriteIds(new Set(ids));
    } catch (error) {
      console.error("Gagal memuat data favorit:", error);
    }
  }, [user]); // Fungsi ini akan dibuat ulang HANYA jika 'user' berubah (login/logout)

  // Jalankan fetchFavorites setiap kali status 'user' berubah
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/favorite`);
      setFavoriteIds(prevIds => new Set(prevIds).add(courseId));
    } catch (error) {
      alert('Gagal menambah favorit.');
    }
  };

  const removeFavorite = async (courseId) => {
    try {
      await api.delete(`/courses/${courseId}/favorite`);
      setFavoriteIds(prevIds => {
        const newIds = new Set(prevIds);
        newIds.delete(courseId);
        return newIds;
      });
    } catch (error) {
      alert('Gagal menghapus favorit.');
    }
  };

  const value = { favoriteIds, addFavorite, removeFavorite };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}