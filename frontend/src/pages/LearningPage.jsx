import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player/youtube';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';

export function LearningPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLearningData = async () => {
      try {
        setLoading(true);
        setError(null);

        const courseResponse = await api.get(`/courses/${courseId}`);
        setCourse(courseResponse.data);
        setLessons(courseResponse.data.lessons.sort((a, b) => a.order - b.order));

        const lessonResponse = await api.get(`/lessons/${lessonId}`);
        setCurrentLesson(lessonResponse.data);
      } catch (err) {
        const errorMessage = err.response?.data?.detail || 'Gagal memuat materi. Pastikan Anda sudah terdaftar.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchLearningData();
  }, [courseId, lessonId]);

  // Logic untuk mencari pelajaran sebelum dan sesudahnya
  const { prevLesson, nextLesson } = useMemo(() => {
    if (!currentLesson || lessons.length === 0) {
      return { prevLesson: null, nextLesson: null };
    }
    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    const prev = currentIndex > 0 ? lessons[currentIndex - 1] : null;
    const next = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
    return { prevLesson: prev, nextLesson: next };
  }, [currentLesson, lessons]);

  // Kalkulasi progress bar
  const progressPercentage = useMemo(() => {
    if (!currentLesson || lessons.length === 0) return 0;
    return (currentLesson.order / lessons.length) * 100;
  }, [currentLesson, lessons]);


  if (loading) return <div className="flex justify-center items-center h-96"><span className="loading loading-lg loading-spinner"></span></div>;
  if (error) return <div className="text-center p-10 text-error">Error: {error}</div>;
  if (!course || !currentLesson) return <div className="text-center p-10">Data tidak ditemukan.</div>;

  const SidebarContent = () => (
    <div className="bg-base-100 min-h-full">
      <div className="p-4 sticky top-0 bg-base-100 z-10">
        <h2 className="text-lg font-bold mb-2 truncate">{course.title}</h2>
        <progress className="progress progress-primary w-full" value={progressPercentage} max="100"></progress>
        <p className="text-xs text-center mt-1">{Math.round(progressPercentage)}% Selesai</p>
      </div>
      <ul className="menu p-4 w-80 text-base-content">
        <li className="menu-title">Daftar Isi</li>
        {lessons.map(lesson => (
          <li key={lesson.id}>
            <Link to={`/learn/course/${course.id}/lesson/${lesson.id}`} className={lesson.id === currentLesson.id ? 'active' : ''}>
              {lesson.order}. {lesson.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      
      {/* Konten Halaman Utama */}
      <div className="drawer-content flex flex-col items-center p-4">
        {/* Tombol menu untuk mobile */}
        <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden mb-4">
          Buka Daftar Isi
        </label>
        
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{currentLesson.title}</h1>
          
          {currentLesson.video_url && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-8 shadow-2xl">
              <ReactPlayer url={currentLesson.video_url} width="100%" height="100%" controls={true} />
            </div>
          )}

          <div className="prose max-w-none bg-base-100 p-6 rounded-lg shadow-lg">
            <ReactMarkdown>{currentLesson.content || "Konten belum tersedia."}</ReactMarkdown>
          </div>
          
          {/* Navigasi Bawah */}
          <div className="flex justify-between mt-8">
            <Link to={prevLesson ? `/learn/course/${course.id}/lesson/${prevLesson.id}` : '#'} className="btn" disabled={!prevLesson}>
              &larr; Pelajaran Sebelumnya
            </Link>
            <Link to={nextLesson ? `/learn/course/${course.id}/lesson/${nextLesson.id}` : '#'} className="btn btn-primary" disabled={!nextLesson}>
              Pelajaran Selanjutnya &rarr;
            </Link>
          </div>
        </div>
      </div> 
      
      {/* Sidebar untuk Desktop & Drawer untuk Mobile */}
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label> 
        <SidebarContent />
      </div>
    </div>
  );
}