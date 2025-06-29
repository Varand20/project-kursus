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

        if (courseData && courseData.lessons) {
          courseData.lessons.sort((a, b) => a.order - b.order);
        }

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
    if (isOwner) {
      return (
        <Link to={`/instructor/courses/${course.id}/manage`} className="btn btn-secondary btn-block">
          Kelola Kursus
        </Link>
      );
    }
    if (isEnrolled) {
      const firstLessonId = course.lessons[0]?.id;
      return (
        <Link
          to={firstLessonId ? `/learn/course/${course.id}/lesson/${firstLessonId}` : '#'}
          className="btn btn-success btn-block"
          disabled={!firstLessonId}
        >
          {firstLessonId ? 'Lanjutkan Belajar' : 'Materi Belum Tersedia'}
        </Link>
      );
    }
    return (
      <button onClick={handleEnroll} className="btn btn-primary btn-block" disabled={isProcessing}>
        {isProcessing ? 'Mendaftar...' : 'Daftar Kursus Ini'}
      </button>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900">
        <span className="loading loading-lg loading-spinner text-white"></span>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900 text-red-400 text-center px-6">
        {error}
      </div>
    );

  if (!course)
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        Kursus tidak ditemukan.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900 text-white px-4 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <span className="inline-block bg-white/10 px-3 py-1 rounded-full text-sm font-medium border border-white/20 mb-4">
            {course.category.name}
          </span>
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-white/80 mb-4">{course.description}</p>
          <p className="text-sm mb-8">
            Dibuat oleh <span className="font-semibold">{course.instruktur_username}</span>
          </p>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Apa yang akan Anda Pelajari</h2>
            <ul className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
              {course.lessons && course.lessons.length > 0 ? (
                course.lessons.map((lesson, index) => (
                  <li key={lesson.id} className="px-4 py-3 border-b border-white/10 last:border-b-0">
                    <span className="mr-3 badge badge-outline text-white/80">{index + 1}</span>
                    {lesson.title}
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-white/70">Materi pelajaran belum tersedia.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-lg sticky top-24">
            <img
              src={course.thumbnail_url || 'https://placehold.co/400x225?text=Kursus'}
              alt={course.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <p className="text-white/80 mb-4">{course.enrollment_count} siswa telah terdaftar.</p>
              {renderActionButton()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
