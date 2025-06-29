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
        const sortedLessons = courseResponse.data.lessons.sort((a, b) => a.order - b.order);
        setCourse(courseResponse.data);
        setLessons(sortedLessons);

        const lessonResponse = await api.get(`/lessons/${lessonId}`);
        setCurrentLesson(lessonResponse.data);
      } catch (err) {
        const message = err.response?.data?.detail || 'Gagal memuat materi.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchLearningData();
  }, [courseId, lessonId]);

  const { prevLesson, nextLesson } = useMemo(() => {
    if (!currentLesson || lessons.length === 0) return { prevLesson: null, nextLesson: null };
    const index = lessons.findIndex(l => l.id === currentLesson.id);
    return {
      prevLesson: index > 0 ? lessons[index - 1] : null,
      nextLesson: index < lessons.length - 1 ? lessons[index + 1] : null,
    };
  }, [currentLesson, lessons]);

  const progressPercentage = useMemo(() => {
    if (!currentLesson || lessons.length === 0) return 0;
    return (currentLesson.order / lessons.length) * 100;
  }, [currentLesson, lessons]);

  if (loading) return <div className="flex justify-center items-center h-96 text-white"><span className="loading loading-lg loading-spinner"></span></div>;
  if (error) return <div className="text-center p-10 text-red-300">Error: {error}</div>;
  if (!course || !currentLesson) return <div className="text-center p-10 text-white">Data tidak ditemukan.</div>;

  const SidebarContent = () => (
    <div className="bg-white/10 border-r border-white/20 backdrop-blur-md w-80 h-full text-white">
      <div className="p-4 sticky top-0 bg-white/10 border-b border-white/20 z-10">
        <h2 className="text-lg font-bold mb-2 truncate">{course.title}</h2>
        <progress className="progress progress-primary w-full" value={progressPercentage} max="100" />
        <p className="text-xs text-center mt-1">{Math.round(progressPercentage)}% Selesai</p>
      </div>
      <ul className="menu p-4 gap-1">
        <li className="menu-title text-white"><span>Daftar Isi</span></li>
        {lessons.map(lesson => (
          <li key={lesson.id}>
            <Link
              to={`/learn/course/${course.id}/lesson/${lesson.id}`}
              className={lesson.id === currentLesson.id ? 'active font-semibold text-indigo-300' : 'text-white hover:text-indigo-300'}
            >
              {lesson.order}. {lesson.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900 text-white">
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

        {/* Konten utama */}
        <div className="drawer-content flex flex-col items-center p-4 lg:p-8">
          <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden mb-4">
            Buka Daftar Isi
          </label>

          <div className="w-full max-w-4xl backdrop-blur-md bg-white/10 border border-white/20 p-6 rounded-2xl shadow-xl">
            <h1 className="text-2xl md:text-4xl font-bold mb-6">{currentLesson.title}</h1>

            {currentLesson.video_url && (
              <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-xl mb-6">
                <ReactPlayer url={currentLesson.video_url} width="100%" height="100%" controls />
              </div>
            )}

            <div className="prose prose-slate dark:prose-invert max-w-none p-6 rounded-lg shadow border border-white/20 bg-white/10">
              <ReactMarkdown>{currentLesson.content}</ReactMarkdown>
            </div>

            <div className="flex justify-between mt-8">
              <Link to={prevLesson ? `/learn/course/${course.id}/lesson/${prevLesson.id}` : '#'} className="btn" disabled={!prevLesson}>
                &larr; Sebelumnya
              </Link>
              <Link to={nextLesson ? `/learn/course/${course.id}/lesson/${nextLesson.id}` : '#'} className="btn btn-primary" disabled={!nextLesson}>
                Selanjutnya &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="drawer-side">
          <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
          <SidebarContent />
        </div>
      </div>
    </div>
  );
}
