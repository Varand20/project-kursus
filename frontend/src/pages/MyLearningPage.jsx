// Ganti seluruh isi file: src/pages/MyLearningPage.jsx
// dengan kode yang sudah diperbaiki dan lebih logis di bawah ini.

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export function MyLearningPage() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyLearningData();
  }, []);

  const fetchMyLearningData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/my-enrollments');
      // Kita langsung ambil data kursusnya dari objek enrollment
      const courses = response.data.map(enrollment => enrollment.course);
      setEnrolledCourses(courses);
    } catch (err) {
      setError('Gagal memuat kursus Anda.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (courseId, courseTitle) => {
    if (window.confirm(`Anda yakin ingin membatalkan pendaftaran dari kursus "${courseTitle}"?`)) {
      try {
        await api.delete(`/enrollments/${courseId}`);
        // Perbarui tampilan dengan menghapus kursus dari state
        setEnrolledCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
        alert('Pendaftaran berhasil dibatalkan.');
      } catch (err) {
        alert('Gagal membatalkan pendaftaran.');
      }
    }
  };

  if (loading) return <div className="text-center p-10"><span className="loading loading-lg loading-spinner"></span></div>;
  if (error) return <div className="text-center p-10 text-error">{error}</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Kursus yang Saya Ikuti</h1>

      {enrolledCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {enrolledCourses.map(course => (
            <div key={course.id} className="card w-full bg-base-100 shadow-xl">
              <figure>
                <img
                  src={course.thumbnail_url || 'https://placehold.co/400x225?text=Kursus'}
                  alt={course.title}
                  className="h-48 w-full object-cover"
                />
              </figure>
              <div className="card-body p-4">
                <h2 className="card-title text-base h-14 overflow-hidden">{course.title}</h2>
                <p className="text-sm">oleh {course.instruktur_username}</p>
                <div className="card-actions justify-end mt-2">
                  
                  {/* === PERBAIKAN UTAMA ADA DI SINI === */}
                  {/* Tombol ini sekarang menjadi "Lihat Detail" dan selalu bisa diklik */}
                  <Link 
                    to={`/courses/${course.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    Lihat Detail
                  </Link>
                  {/* ==================================== */}

                  {/* Tombol Hapus Pendaftaran */}
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li>
                        <a onClick={() => handleUnenroll(course.id, course.title)} className="text-error">
                          Batalkan Pendaftaran
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
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
