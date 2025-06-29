import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

function HeartIcon({ isFavorited }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isFavorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
    </svg>
  );
}

export function MyLearningPage() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const { favoriteIds, addFavorite, removeFavorite } = useFavorites();

  useEffect(() => {
    fetchMyLearningData();
  }, []);

  const fetchMyLearningData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/my-enrollments');
      const courses = response.data.map(enrollment => enrollment.course);
      setEnrolledCourses(courses);
    } catch (err) {
      setError('Gagal memuat kursus Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (courseId, courseTitle) => {
    if (window.confirm(`Anda yakin ingin membatalkan pendaftaran dari kursus "${courseTitle}"?`)) {
      try {
        await api.delete(`/enrollments/${courseId}`);
        setEnrolledCourses(prev => prev.filter(course => course.id !== courseId));
        alert('Pendaftaran berhasil dibatalkan.');
      } catch {
        alert('Gagal membatalkan pendaftaran.');
      }
    }
  };

  const handleFavoriteClick = (courseId, isFavorited) => {
    if (isFavorited) {
      removeFavorite(courseId);
    } else {
      addFavorite(courseId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900 text-white">
        <p className="text-xl animate-pulse">Memuat kursus...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900 text-red-300">
        <p className="text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900 px-6 py-10 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold mb-8">Kursus yang Saya Ikuti</h1>

        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {enrolledCourses.map(course => {
              const isFavorited = favoriteIds.has(course.id);
              return (
                <div key={course.id} className="rounded-xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 shadow-md transition hover:shadow-lg">
                  <div className="relative">
                    <img
                      src={course.thumbnail_url || 'https://placehold.co/400x225?text=Kursus'}
                      alt={course.title}
                      className="h-48 w-full object-cover"
                    />
                    <button
                      onClick={() => handleFavoriteClick(course.id, isFavorited)}
                      className={`absolute top-2 right-2 p-2 rounded-full transition ${
                        isFavorited ? 'bg-white text-red-500' : 'bg-black/60 text-white hover:bg-black/80'
                      }`}
                    >
                      <HeartIcon isFavorited={isFavorited} />
                    </button>
                  </div>
                  <div className="p-4 space-y-2">
                    <h2 className="text-lg font-medium line-clamp-2">{course.title}</h2>
                    <p className="text-sm text-slate-300">oleh {course.instruktur_username}</p>
                    <div className="flex justify-between items-center mt-4 gap-2">
                      <Link
                        to={`/courses/${course.id}`}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-4 py-1.5 rounded-xl transition"
                      >
                        Lihat Detail
                      </Link>
                      <button
                        onClick={() => handleUnenroll(course.id, course.title)}
                        className="text-sm text-red-400 hover:underline"
                      >
                        Batalkan
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center bg-white/10 backdrop-blur-md border border-white/20 p-10 rounded-xl">
            <h2 className="text-2xl font-semibold">Anda belum mendaftar di kursus manapun.</h2>
            <p className="mt-2 mb-4 text-slate-300">
              Ayo jelajahi katalog kami dan temukan kursus yang tepat untuk Anda!
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
