import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CourseForm } from '../components/CourseForm';
import api from '../services/api';

export function CreateCoursePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleCreateCourse = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Panggil endpoint create course yang menerima multipart/form-data
      const response = await api.post('/courses/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Kursus berhasil dibuat!');
      // Arahkan ke dasbor setelah berhasil
      navigate('/instructor/dashboard');
    } catch (err) {
      // --- LOGIKA ERROR HANDLING BARU ---
      if (err.response && err.response.status === 422) {
        // Jika error validasi dari FastAPI
        const errorDetails = err.response.data.detail;
        const formattedError = errorDetails.map(e => `${e.loc[1]}: ${e.msg}`).join('\n');
        setError(`Data tidak valid:\n${formattedError}`);
      } else {
        // Error umum lainnya
        setError(err.response?.data?.detail || 'Gagal membuat kursus.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Buat Kursus Baru</h1>
      {/* Tampilkan pesan error di atas form */}
      {error && (
        <div className="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}
      <CourseForm onSubmit={handleCreateCourse} isLoading={isLoading} />
    </div>
  );
}