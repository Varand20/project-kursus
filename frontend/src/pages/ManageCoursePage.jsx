import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LessonForm } from '../components/LessonForm';
import { CourseForm } from '../components/CourseForm';

export function ManageCoursePage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [activeTab, setActiveTab] = useState('lessons');
  const [editingLesson, setEditingLesson] = useState(null);
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);

  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);
  const [courseError, setCourseError] = useState(null);

  useEffect(() => {
    if (user !== undefined) {
      setAuthChecked(true);
    }
  }, [user]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${courseId}`);
      const courseData = response.data;

      if (user && user.id !== courseData.instruktur_id) {
        setError("Akses ditolak. Anda bukan pemilik kursus ini.");
        return;
      }

      setCourse(courseData);
      setLessons((courseData.lessons || []).sort((a, b) => a.order - b.order));
    } catch (err) {
      setError("Gagal memuat data kursus atau kursus tidak ditemukan.");
      console.error("Gagal memuat data kursus:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchCourseData();
  }, [courseId, user]);

  const handleOpenModalForEdit = async (lesson) => {
    try {
      const response = await api.get(`/lessons/${lesson.id}`);
      setEditingLesson(response.data);
      document.getElementById('lesson_modal').showModal();
    } catch (error) {
      alert("Gagal memuat detail pelajaran.");
    }
  };

  const handleSubmitLesson = async (formData) => {
    setIsSubmittingLesson(true);
    const dataToSend = { ...formData, order: parseInt(formData.order) };
    try {
      if (editingLesson && editingLesson.id) {
        await api.patch(`/lessons/${editingLesson.id}`, dataToSend);
      } else {
        await api.post(`/courses/${courseId}/lessons`, dataToSend);
      }
      document.getElementById('lesson_modal').close();
      fetchCourseData();
    } catch (error) {
      alert('Gagal menyimpan pelajaran.');
    } finally {
      setIsSubmittingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm('Yakin ingin menghapus pelajaran ini?')) {
      try {
        await api.delete(`/lessons/${lessonId}`);
        fetchCourseData();
      } catch (error) {
        alert('Gagal menghapus pelajaran.');
      }
    }
  };

  const handleUpdateCourse = async (formData) => {
    setIsSubmittingCourse(true);
    setCourseError(null);
    try {
      await api.patch(`/courses/${courseId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Detail kursus berhasil diperbarui!');
      fetchCourseData();
    } catch (err) {
      setCourseError(err.response?.data?.detail || 'Gagal memperbarui kursus.');
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  if (!authChecked) return <div className="text-center p-10 text-white">Memeriksa autentikasi...</div>;
  if (loading) return <div className="text-center p-10 text-white"><span className="loading loading-lg loading-spinner"></span></div>;
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900 text-white flex flex-col items-center justify-center p-8">
      <div role="alert" className="alert alert-error shadow-lg">{error}</div>
      <Link to="/instructor/dashboard" className="btn btn-primary mt-6">Kembali ke Dasbor</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900 text-white px-4 py-10">
      <div className="max-w-5xl mx-auto backdrop-blur-md bg-white/10 border border-white/20 p-8 rounded-2xl shadow-xl">
        <Link to="/instructor/dashboard" className="btn btn-ghost mb-4">&larr; Kembali ke Dasbor</Link>
        <h1 className="text-3xl font-bold mb-6 truncate">Kelola: {course.title}</h1>

        <div role="tablist" className="tabs tabs-lifted mb-6">
          <button role="tab" className={`tab ${activeTab === 'lessons' ? 'tab-active' : ''}`} onClick={() => setActiveTab('lessons')}>Kelola Pelajaran</button>
          <button role="tab" className={`tab ${activeTab === 'settings' ? 'tab-active' : ''}`} onClick={() => setActiveTab('settings')}>Pengaturan Kursus</button>
        </div>

        <div className="bg-white/5 p-6 rounded-xl shadow-inner">
          {activeTab === 'lessons' && (
            <>
              <div className="flex justify-end mb-4">
                <button className="btn btn-primary" onClick={() => { setEditingLesson({}); document.getElementById('lesson_modal').showModal(); }}>
                  + Tambah Pelajaran
                </button>
              </div>
              <table className="table w-full text-white">
                <thead>
                  <tr><th>Urutan</th><th>Judul</th><th className="text-right">Aksi</th></tr>
                </thead>
                <tbody>
                  {lessons.map(lesson => (
                    <tr key={lesson.id} className="hover:bg-white/10">
                      <td>{lesson.order}</td>
                      <td>{lesson.title}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/learn/course/${courseId}/lesson/${lesson.id}`} className="btn btn-info btn-xs text-white" target="_blank" rel="noopener noreferrer">Preview</Link>
                          <button onClick={() => handleOpenModalForEdit(lesson)} className="btn btn-ghost btn-xs">Edit</button>
                          <button onClick={() => handleDeleteLesson(lesson.id)} className="btn btn-error btn-xs text-white">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {lessons.length === 0 && (
                    <tr><td colSpan="3" className="text-center p-4">Belum ada pelajaran.</td></tr>
                  )}
                </tbody>
              </table>
            </>
          )}

          {activeTab === 'settings' && (
            <>
              <h2 className="text-2xl font-bold mb-4">Edit Detail Kursus</h2>
              {courseError && <div className="alert alert-error mb-4">{courseError}</div>}
              <CourseForm
                onSubmit={handleUpdateCourse}
                initialData={{
                  title: course.title,
                  description: course.description,
                  category_id: course.category.id,
                  thumbnail_url: course.thumbnail_url,
                }}
                isEditing={true}
                isLoading={isSubmittingCourse}
              />
            </>
          )}
        </div>
      </div>

      <dialog id="lesson_modal" className="modal">
        <div className="modal-box w-11/12 max-w-2xl text-left text-black">
          <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button></form>
          <h3 className="font-bold text-lg mb-4">{editingLesson?.id ? 'Edit Pelajaran' : 'Tambah Pelajaran Baru'}</h3>
          <LessonForm
            key={editingLesson?.id || 'new'}
            onSubmit={handleSubmitLesson}
            initialData={editingLesson}
            onCancel={() => document.getElementById('lesson_modal').close()}
            isLoading={isSubmittingLesson}
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
