// Ini adalah kode LENGKAP untuk file `src/pages/CourseDetailPage.jsx`.
// Silakan ganti seluruh isi file Anda dengan kode ini.

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export function CourseDetailPage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isOwner, setIsOwner] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const courseResponse = await api.get(`/courses/${courseId}`);
        const courseData = courseResponse.data;
        
        // --- PERBAIKAN KUNCI ADA DI SINI ---
        // Sebelum menyimpan ke state, kita urutkan dulu array 'lessons'
        // Ini adalah cara yang aman dan anti-gagal
        if (courseData && courseData.lessons) {
          courseData.lessons.sort((a, b) => a.order - b.order);
        }
        // ------------------------------------

        setCourse(courseData);

        if (user) {
          if (user.id === courseData.instruktur_id) {
            setIsOwner(true);
          } else {
            const enrollmentsResponse = await api.get('/my-enrollments');
            const isUserEnrolled = enrollmentsResponse.data.some(
              (enrollment) => enrollment.course.id === parseInt(courseId)
            );
            setIsEnrolled(isUserEnrolled);
          }
        }
      } catch (err) {
        setError('Gagal memuat detail kursus.');
        console.error("Error saat fetchAllData:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user) {
      alert('Anda harus login terlebih dahulu.');
      navigate('/login');
      return;
    }
    
    setIsProcessing(true);
    try {
      await api.post(`/courses/${courseId}/enroll`);
      alert('Pendaftaran berhasil!');
      setIsEnrolled(true);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Gagal mendaftar.';
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderActionButton = () => {
    // Tombol ini sekarang menggunakan link yang sudah diperbaiki
    if (isOwner) {
      return <Link to={`/instructor/courses/${course.id}/manage`} className="btn btn-secondary btn-block">Kelola Kursus</Link>;
    }
    if (isEnrolled) {
      const firstLessonId = course.lessons[0]?.id;
      return <Link to={firstLessonId ? `/learn/course/${course.id}/lesson/${firstLessonId}` : '#'} className="btn btn-success btn-block" disabled={!firstLessonId}>{firstLessonId ? 'Lanjutkan Belajar' : 'Materi Belum Tersedia'}</Link>;
    }
    return <button onClick={handleEnroll} className="btn btn-primary btn-block" disabled={isProcessing}>{isProcessing ? 'Mendaftar...' : 'Daftar Kursus Ini'}</button>;
  };

  if (loading) return <div className="text-center p-10"><span className="loading loading-lg loading-spinner"></span></div>;
  if (error) return <div className="text-center p-10 text-error">{error}</div>;
  if (!course) return <div className="text-center p-10">Kursus tidak ditemukan.</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="badge badge-primary">{course.category.name}</div>
          <h1 className="text-4xl md:text-5xl font-bold my-4">{course.title}</h1>
          <p className="text-lg text-base-content/70">{course.description}</p>
          <div className="mt-4">
            Dibuat oleh <span className="font-semibold">{course.instruktur_username}</span>
          </div>
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Apa yang akan Anda Pelajari</h2>
            <ul className="menu bg-base-200 w-full rounded-box">
              {/* Logika JSX ini sekarang aman karena kita sudah mengurutkan di atas */}
              {course.lessons && course.lessons.length > 0 ? (
                course.lessons.map((lesson, index) => (
                  <li key={lesson.id}>
                    <a>
                      <span className="badge badge-neutral">{index + 1}</span>
                      {lesson.title}
                    </a>
                  </li>
                ))
              ) : (
                <li><a>Materi pelajaran belum tersedia.</a></li>
              )}
            </ul>
          </div>
        </div>
        <div className="md:col-span-1">
          <div className="card w-full bg-base-100 shadow-xl sticky top-24">
            <figure><img src={course.thumbnail_url || 'https://placehold.co/400x225?text=Kursus'} alt={course.title} className="h-56 w-full object-cover" /></figure>
            <div className="card-body">
              <p>{course.enrollment_count} siswa telah terdaftar.</p>
              <div className="card-actions justify-center mt-4">
                {renderActionButton()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

