import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { CourseCard } from '../components/CourseCard';

export function MyFavoritesPage() {
  const [favoriteCourses, setFavoriteCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await api.get('/favorites');
        setFavoriteCourses(response.data);
      } catch (error) {
        console.error("Gagal memuat favorit:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900 text-white">
        <p className="text-xl animate-pulse">Memuat kursus favorit...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900 px-6 py-10 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold mb-8">Kursus Favorit Saya</h1>

        {favoriteCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center bg-white/10 backdrop-blur-md border border-white/20 p-10 rounded-xl">
            <h2 className="text-2xl font-semibold">Anda belum memiliki kursus favorit.</h2>
            <p className="mt-2 mb-4 text-slate-300">
              Tekan ikon hati pada kursus yang Anda sukai untuk menyimpannya di sini.
            </p>
            <Link
              to="/courses"
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-xl transition"
            >
              Jelajahi Kursus
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
