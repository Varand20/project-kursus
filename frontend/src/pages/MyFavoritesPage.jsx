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
        setLoading(true);
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

  if (loading) return <div className="text-center p-10"><span className="loading loading-lg loading-spinner"></span></div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Kursus Favorit Saya</h1>
      {favoriteCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center p-16 bg-base-200 rounded-lg">
          <h2 className="text-2xl font-semibold">Anda belum memiliki kursus favorit.</h2>
          <p className="mt-2 mb-4">Tekan ikon hati pada kursus yang Anda sukai untuk menyimpannya di sini.</p>
          <Link to="/courses" className="btn btn-primary">
            Jelajahi Kursus
          </Link>
        </div>
      )}
    </div>
  );
}