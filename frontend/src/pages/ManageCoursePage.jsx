// Ganti seluruh isi file: src/pages/ManageCoursePage.jsx
// dengan kode lengkap dan final di bawah ini.

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LessonForm } from '../components/LessonForm';
import { CourseForm } from '../components/CourseForm'; // <-- 1. Impor form untuk kursus

export function ManageCoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk mengelola modal pelajaran
  const [editingLesson, setEditingLesson] = useState(null);
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);

  // State untuk mengelola form kursus
  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);
  const [courseError, setCourseError] = useState(null);

  // State untuk Tab yang aktif
  const [activeTab, setActiveTab] = useState('lessons');

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${courseId}`);
      setCourse(response.data);
      setLessons(response.data.lessons.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Gagal memuat data kursus:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Fungsi untuk mengelola Pelajaran (Lesson) ---
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

  // --- Fungsi BARU untuk mengelola Kursus (Course) ---
  const handleUpdateCourse = async (formData) => {
    setIsSubmittingCourse(true);
    setCourseError(null);
    try {
      await api.patch(`/courses/${courseId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Detail kursus berhasil diperbarui!');
      // Refresh data untuk menampilkan perubahan
      fetchCourseData();
    } catch (err) {
      setCourseError(err.response?.data?.detail || 'Gagal memperbarui kursus.');
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  if (loading) return <div className="text-center p-10"><span className="loading loading-lg loading-spinner"></span></div>;
  if (!course) return <div className="text-center p-10">Kursus tidak ditemukan.</div>;

  return (
    <>
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <Link to="/instructor/dashboard" className="link link-hover mb-2">&larr; Kembali ke Dasbor</Link>
          <h1 className="text-4xl font-bold truncate">Kelola: {course.title}</h1>
        </div>

        {/* --- Sistem TAB --- */}
        <div role="tablist" className="tabs tabs-lifted">
          <a role="tab" className={`tab ${activeTab === 'lessons' ? 'tab-active' : ''}`} onClick={() => setActiveTab('lessons')}>
            Kelola Pelajaran
          </a>
          <a role="tab" className={`tab ${activeTab === 'settings' ? 'tab-active' : ''}`} onClick={() => setActiveTab('settings')}>
            Pengaturan Kursus
          </a>
        </div>

        {/* --- Konten TAB --- */}
        <div className="bg-base-100 p-6 rounded-b-box rounded-tr-box shadow">
          {activeTab === 'lessons' && (
            <div>
              <div className="flex justify-end mb-4">
                <button onClick={() => { setEditingLesson({}); document.getElementById('lesson_modal').showModal(); }} className="btn btn-primary">+ Tambah Pelajaran</button>
              </div>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead><tr><th>Urutan</th><th>Judul</th><th className="text-right">Aksi</th></tr></thead>
                  <tbody>
                    {lessons.map(lesson => (
                      <tr key={lesson.id} className="hover">
                        <th>{lesson.order}</th><td>{lesson.title}</td>
                        <td className="text-right"><div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenModalForEdit(lesson)} className="btn btn-ghost btn-xs">Edit</button>
                          <button onClick={() => handleDeleteLesson(lesson.id)} className="btn btn-error btn-xs text-white">Hapus</button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Edit Detail Kursus</h2>
              {courseError && <div className="alert alert-error mb-4">{courseError}</div>}
              {/* Kita gunakan ulang CourseForm di sini */}
              <CourseForm
                onSubmit={handleUpdateCourse}
                initialData={{ 
                  title: course.title, 
                  description: course.description, 
                  category_id: course.category.id,
                  thumbnail_url: course.thumbnail_url 
                }}
                isEditing={true}
                isLoading={isSubmittingCourse}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal untuk Form Pelajaran */}
      <dialog id="lesson_modal" className="modal">
        <div className="modal-box w-11/12 max-w-2xl">
          <h3 className="font-bold text-lg mb-4">{editingLesson && editingLesson.id ? 'Edit Pelajaran' : 'Tambah Pelajaran Baru'}</h3>
          <LessonForm key={editingLesson ? editingLesson.id : 'new-lesson'} onSubmit={handleSubmitLesson} initialData={editingLesson} onCancel={() => document.getElementById('lesson_modal').close()} isLoading={isSubmittingLesson} />
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>
    </>
  );
}
