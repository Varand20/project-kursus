// Ganti seluruh isi file: src/pages/HomePage.jsx
// dengan kode yang lebih fokus dan rapi di bawah ini.

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { CourseCard } from '../components/CourseCard';

export function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ambil data 4 kursus unggulan dari backend
    api.get('/courses/featured')
      .then(response => {
        setFeaturedCourses(response.data);
      })
      .catch(error => {
        console.error("Gagal memuat kursus unggulan:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {/* 1. Hero Section: Spanduk utama yang menarik */}
      <div className="hero min-h-[60vh]" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop)'}}>
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">Tingkatkan Keahlian, Raih Masa Depan</h1>
            <p className="mb-5">Platform kursus online terbaik dengan instruktur ahli di bidangnya. Mulai perjalanan belajar Anda hari ini.</p>
            <Link to="/courses" className="btn btn-primary">Jelajahi Semua Kursus</Link>
          </div>
        </div>
      </div>

      {/* 2. Featured Courses Section: Menampilkan kartu kursus */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Kursus Populer</h2>
        
        {loading ? (
          <div className="text-center"><span className="loading loading-lg loading-spinner"></span></div>
        ) : (
          featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <p className="text-center">Belum ada kursus yang bisa ditampilkan.</p>
          )
        )}
        
        <div className="text-center mt-12">
          <Link to="/courses" className="btn btn-outline btn-primary">
            Lihat Semua Kursus
          </Link>
        </div>
      </div>
    </div>
  );
}
