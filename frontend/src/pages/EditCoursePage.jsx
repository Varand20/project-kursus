import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CourseForm } from '../components/CourseForm';
import api from '../services/api';

export function EditCoursePage() {
  const { courseId } = useParams();
  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/courses/${courseId}`)
      .then(response => {
        setInitialData({
          title: response.data.title,
          description: response.data.description,
          category_id: response.data.category.id,
          thumbnail_url: response.data.thumbnail_url,
        });
      })
      .catch(() => setError("Gagal memuat data kursus untuk diedit."));
  }, [courseId]);

  const handleUpdateCourse = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.patch(`/courses/${courseId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Kursus berhasil diperbarui!');
      navigate('/instructor/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Gagal memperbarui kursus.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!initialData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900">
        <span className="loading loading-lg loading-spinner text-white"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900 px-4">
      <div className="w-full max-w-2xl p-8 rounded-2xl shadow-xl bg-white/10 backdrop-blur-lg border border-white/20 text-white animate-fade-in">
        <h1 className="text-3xl font-bold mb-3 text-center">Edit Kursus</h1>
        <p className="text-sm text-center mb-6 text-slate-300">
          Perbarui informasi kursus kamu dengan mudah di bawah ini.
        </p>

        {error && (
          <div className="bg-red-500/90 text-white text-sm p-3 rounded text-center whitespace-pre-line mb-4">
            {error}
          </div>
        )}

        <CourseForm
          onSubmit={handleUpdateCourse}
          initialData={initialData}
          isEditing={true}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
