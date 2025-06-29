import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export function InstructorDashboardPage() {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/courses/my-courses');
      setMyCourses(response.data);
    } catch (err) {
      setError('Gagal memuat data kursus Anda.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kursus ini secara permanen? Semua pelajaran di dalamnya juga akan terhapus.')) {
      try {
        await api.delete(`/courses/${courseId}`);
        setMyCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
        alert('Kursus berhasil dihapus.');
      } catch (err) {
        alert('Gagal menghapus kursus. Coba lagi nanti.');
        console.error("Error deleting course:", err);
      }
    }
  };

  if (loading) return <div className="text-center p-10 text-white"><span className="loading loading-lg loading-spinner"></span></div>;
  if (error) return <div className="text-center p-10 text-red-300">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900 text-white px-4 py-10">
      <div className="max-w-5xl mx-auto backdrop-blur-md bg-white/10 border border-white/20 p-8 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Dasbor Instruktur</h1>
          <Link to="/instructor/courses/create" className="btn btn-primary">
            + Buat Kursus Baru
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg">
          <table className="table w-full text-white">
            <thead>
              <tr>
                <th>Judul Kursus</th>
                <th>Kategori</th>
                <th>Pendaftar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {myCourses.map(course => (
                <tr key={course.id} className="hover:bg-white/5">
                  <td><div className="font-bold">{course.title}</div></td>
                  <td>{course.category.name}</td>
                  <td>{course.enrollment_count}</td>
                  <td className="flex gap-2">
                    <Link to={`/instructor/courses/${course.id}/manage`} className="btn btn-ghost btn-xs">
                      Kelola
                    </Link>
                    <button 
                      onClick={() => handleDeleteCourse(course.id)} 
                      className="btn btn-error btn-xs text-white"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {myCourses.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center p-4">Anda belum membuat kursus apapun.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
