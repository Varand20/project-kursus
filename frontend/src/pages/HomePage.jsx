import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import api from '../services/api';
import { CourseCard } from '../components/CourseCard';

export function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 1000 });
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900 text-white">
      {/* Hero Section */}
      <div
        className="hero min-h-[70vh] bg-cover bg-center relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop)',
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="hero-content text-center text-white relative z-10">
          <div className="max-w-2xl px-4" data-aos="fade-up">
            <h1 className="mb-6 text-5xl font-extrabold leading-tight drop-shadow-lg">
              Tingkatkan Keahlian, Raih Masa Depan
            </h1>
            <p className="mb-6 text-lg drop-shadow-md text-slate-200">
              Platform kursus online terbaik dengan instruktur ahli di bidangnya. Mulai perjalanan belajar Anda hari ini.
            </p>
            <button
              onClick={() => {
                const el = document.getElementById("featured");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              Jelajahi Semua Kursus
            </button>
          </div>
        </div>
      </div>

      {/* Featured Courses */}
      <div id="featured" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8" data-aos="fade-up">
          Kursus Populer
        </h2>
        {loading ? (
          <div className="text-center"><span className="loading loading-lg loading-spinner"></span></div>
        ) : (
          featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-aos="fade-up" data-aos-delay="200">
              {featuredCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center text-white/70 py-12" data-aos="fade-up">
              <img
                src="/assets/icons/empty-box.svg"
                alt="Kosong"
                className="mx-auto mb-6 w-24 opacity-60"
              />
              <h3 className="text-xl font-semibold mb-2">Kursus Belum Tersedia</h3>
              <p className="mb-6">Kami belum memiliki kursus unggulan untuk saat ini. Silakan cek kembali nanti.</p>
              <Link to="/courses" className="btn btn-outline btn-primary">
                Lihat Semua Kursus
              </Link>
            </div>
          )
        )}
        {!loading && featuredCourses.length > 0 && (
          <div className="text-center mt-12" data-aos="fade-up" data-aos-delay="300">
            <Link to="/courses" className="btn btn-outline btn-primary">
              Lihat Semua Kursus
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
