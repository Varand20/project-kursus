import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { CourseCard } from '../components/CourseCard'; // Kita akan gunakan ulang komponen kartu kita!

export function MyLearningPage() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyLearningData = async () => {
      try {
        setLoading(true);
        // Panggil endpoint yang sudah kita siapkan di backend
        const response = await api.get('/my-enrollments');
        
        // Responsnya berisi objek enrollment, kita hanya butuh data kursusnya
        const courses = response.data.map(enrollment => enrollment.course);
        setEnrolledCourses(courses);

      } catch (err) {
        setError('Gagal memuat kursus Anda.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyLearningData();
  }, []); // Array dependensi kosong agar hanya berjalan sekali saat halaman dibuka

  if (loading) {
    return <div className="text-center p-10"><span className="loading loading-lg loading-spinner"></span></div>;
  }

  if (error) {
    return <div className="text-center p-10 text-error">{error}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Kursus yang Saya Ikuti</h1>

      {enrolledCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Tampilkan setiap kursus sebagai kartu */}
          {enrolledCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        // Tampilan jika pengguna belum mendaftar kursus apapun
        <div className="text-center p-16 bg-base-200 rounded-lg">
          <h2 className="text-2xl font-semibold">Anda belum mendaftar di kursus manapun.</h2>
          <p className="mt-2 mb-4">Ayo jelajahi katalog kami dan temukan kursus yang tepat untuk Anda!</p>
          <Link to="/courses" className="btn btn-primary">
            Jelajahi Kursus
          </Link>
        </div>
      )}
    </div>
  );
}