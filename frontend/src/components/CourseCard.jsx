import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

// Komponen untuk ikon hati (Heart) SVG
function HeartIcon({ isFavorited }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isFavorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
    </svg>
  );
}

export function CourseCard({ course }) {
  const { user } = useAuth();
  const { favoriteIds, addFavorite, removeFavorite } = useFavorites();
  
  const isFavorited = favoriteIds.has(course.id);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Silakan login untuk menambahkan ke favorit.');
      return;
    }
    if (isFavorited) {
      removeFavorite(course.id);
    } else {
      addFavorite(course.id);
    }
  };

  // Definisikan URL placeholder di satu tempat agar mudah diubah
  const placeholderImage = 'https://placehold.co/400x225/e0e0e0/757575?text=Kursus';

  return (
    <div className="card w-full bg-base-100 shadow-xl transition-transform duration-300 hover:scale-105">
      <figure className="relative">
        {/* === PERBAIKAN UTAMA ADA DI SINI === */}
        <img
          // 1. Gunakan URL asli jika ada, jika tidak, gunakan placeholder.
          src={course.thumbnail_url || placeholderImage}
          alt={course.title}
          className="h-48 w-full object-cover"
          // 2. Fallback: Jika URL asli error (misal, link rusak),
          //    ganti secara otomatis ke gambar placeholder.
          onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }}
        />
        {/* ==================================== */}
        
        {/* Tombol Favorit */}
        {user && (
          <button onClick={handleFavoriteClick} className={`btn btn-circle btn-sm absolute top-2 right-2 transition-colors duration-300 ${isFavorited ? 'text-red-500 bg-white/80' : 'bg-black/50 text-white hover:bg-black/70'}`}>
            <HeartIcon isFavorited={isFavorited} />
          </button>
        )}
      </figure>
      <div className="card-body p-4">
        <div className="badge badge-secondary">{course.category.name}</div>
        <h2 className="card-title mt-2 h-14 overflow-hidden text-base">{course.title}</h2>
        <p className="text-sm">oleh {course.instruktur_username}</p>
        <div className="card-actions justify-between items-center mt-4">
          <span className="text-xs">{course.enrollment_count} siswa</span>
          <Link to={`/courses/${course.id}`} className="btn btn-primary btn-sm">
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
}