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
      await api.post('/courses/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Kursus berhasil dibuat!');
      navigate('/instructor/dashboard');
    } catch (err) {
      if (err.response && err.response.status === 422) {
        const errorDetails = err.response.data.detail;
        const formattedError = errorDetails.map(e => `${e.loc[1]}: ${e.msg}`).join('\n');
        setError(`Data tidak valid:\n${formattedError}`);
      } else {
        setError(err.response?.data?.detail || 'Gagal membuat kursus.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900 px-4">
      <div className="w-full max-w-2xl p-8 rounded-2xl shadow-xl bg-white/10 backdrop-blur-lg border border-white/20 text-white animate-fade-in">
        <h1 className="text-3xl font-bold mb-3 text-center">Buat Kursus Baru</h1>
        <p className="text-sm text-center mb-6 text-slate-300">
          Isi detail kursusmu di bawah ini dan mulai membagikan ilmu!
        </p>

        {error && (
          <div className="bg-red-500/90 text-white text-sm p-3 rounded text-center whitespace-pre-line mb-4">
            {error}
          </div>
        )}

        <CourseForm onSubmit={handleCreateCourse} isLoading={isLoading} />
      </div>
    </div>
  );
}
