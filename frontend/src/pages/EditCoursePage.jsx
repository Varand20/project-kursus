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

  // Ambil data kursus yang ada untuk diisi ke form
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
      // Panggil endpoint PATCH yang menerima multipart/form-data
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
  
  if (!initialData) return <div className="text-center p-10"><span className="loading loading-lg loading-spinner"></span></div>;

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Edit Kursus</h1>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      <CourseForm
        onSubmit={handleUpdateCourse}
        initialData={initialData}
        isEditing={true}
        isLoading={isLoading}
      />
    </div>
  );
}