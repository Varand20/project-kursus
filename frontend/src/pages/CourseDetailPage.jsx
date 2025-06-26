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
  
  // State untuk status user
  const [isOwner, setIsOwner] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Untuk tombol daftar

  useEffect(() => {
    // Fungsi utama untuk mengambil semua data dan memeriksa status
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Mulai mengambil detail kursus...");
        // 1. Ambil detail kursus utama
        const courseResponse = await api.get(`/courses/${courseId}`);
        const courseData = courseResponse.data;
        setCourse(courseData);
        console.log("Data Kursus:", courseData);

        // 2. Jika ada user yang login, periksa statusnya
        if (user) {
          console.log("User terdeteksi, memeriksa status kepemilikan dan pendaftaran...");
          // Cek apakah user adalah pemilik kursus
          if (user.id === courseData.instruktur_id) {
            console.log("Status: Pengguna adalah PEMILIK kursus.");
            setIsOwner(true);
          } else {
            // Jika bukan pemilik, cek apakah user sudah terdaftar
            console.log("Status: Pengguna BUKAN pemilik, memeriksa pendaftaran...");
            const enrollmentsResponse = await api.get('/my-enrollments');
            const isUserEnrolled = enrollmentsResponse.data.some(
              (enrollment) => enrollment.course.id === parseInt(courseId)
            );
            setIsEnrolled(isUserEnrolled);
            console.log("Status Terdaftar:", isUserEnrolled);
          }
        } else {
          console.log("Tidak ada user login.");
        }

      } catch (err) {
        setError('Gagal memuat detail kursus.');
        console.error("Error saat fetchAllData:", err);
      } finally {
        setLoading(false);
        console.log("Proses fetch selesai.");
      }
    };

    fetchAllData();
  }, [courseId, user]); // Jalankan ulang jika courseId atau status login user berubah

  // Fungsi untuk menangani aksi pendaftaran
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
      setIsEnrolled(true); // Langsung update status
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Gagal mendaftar.';
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Fungsi untuk menampilkan tombol aksi yang dinamis
  const renderActionButton = () => {
    if (isOwner) {
      return <Link to={`/instructor/courses/edit/${course.id}`} className="btn btn-secondary btn-block">Kelola Kursus</Link>;
    }
    if (isEnrolled) {
      const firstLessonId = course.lessons[0]?.id;
      return <Link to={firstLessonId ? `/learn/course/${course.id}/lesson/${firstLessonId}` : '#'} className="btn btn-success btn-block" disabled={!firstLessonId}>{firstLessonId ? 'Lanjutkan Belajar' : 'Materi Belum Tersedia'}</Link>;
    }
    return <button onClick={handleEnroll} className="btn btn-primary btn-block" disabled={isProcessing}>{isProcessing ? 'Mendaftar...' : 'Daftar Kursus Ini'}</button>;
  };

  // Tampilan loading, error, atau jika kursus tidak ditemukan
  if (loading) return <div className="text-center p-10"><span className="loading loading-lg loading-spinner"></span></div>;
  if (error) return <div className="text-center p-10 text-error">{error}</div>;
  if (!course) return <div className="text-center p-10">Kursus tidak ditemukan.</div>;

  // Tampilan utama
  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* ... (bagian JSX untuk tampilan Anda tetap sama, gunakan renderActionButton() untuk tombol) ... */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* ... Detail kursus dan daftar lesson ... */}
           <div className="badge badge-primary">{course.category.name}</div>
          <h1 className="text-4xl md:text-5xl font-bold my-4">{course.title}</h1>
          <p className="text-lg text-base-content/70">{course.description}</p>
          <div className="mt-4">
            Dibuat oleh <span className="font-semibold">{course.instruktur_username}</span>
          </div>
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Apa yang akan Anda Pelajari</h2>
            <ul className="menu bg-base-200 w-full rounded-box">
              {course.lessons && course.lessons.length > 0 ? (
                course.lessons.map((lesson, index) => (
                  <li key={lesson.id}>
                    <a>
                      <span className="badge badge-neutral">{index + 1}</span>
                      {lesson.title}
                    </a>
                  </li>
                ))
              ) : (
                <li><a>Materi pelajaran belum tersedia.</a></li>
              )}
            </ul>
          </div>
        </div>
        <div className="md:col-span-1">
          <div className="card w-full bg-base-100 shadow-xl sticky top-24">
            <figure><img src={course.thumbnail_url || 'https://placehold.co/400x225?text=Kursus'} alt={course.title} /></figure>
            <div className="card-body">
              <p>{course.enrollment_count} siswa telah terdaftar.</p>
              <div className="card-actions justify-center mt-4">
                {renderActionButton()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

