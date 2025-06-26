// Ganti seluruh isi file: src/pages/CoursesPage.jsx
// dengan kode yang sudah diperbarui di bawah ini.

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // <-- Impor hook untuk membaca URL
import api from '../services/api';
import { CourseCard } from '../components/CourseCard';
import { Pagination } from '../components/Pagination';
import { useSearch } from '../context/SearchContext';

export function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const { searchTerm, setSearchTerm } = useSearch();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Ambil daftar kategori saat komponen dimuat
  useEffect(() => {
    api.get('/categories')
      .then(response => setCategories(response.data))
      .catch(err => console.error("Gagal memuat kategori:", err));
  }, []);

  // 2. PERUBAHAN UTAMA: Cek URL untuk parameter kategori saat halaman dimuat
  useEffect(() => {
    // Ambil nama kategori dari URL (contoh: ?category=Pemrograman)
    const categoryNameFromUrl = searchParams.get('category');
    
    // Jalankan hanya jika ada nama kategori di URL dan daftar kategori sudah dimuat
    if (categoryNameFromUrl && categories.length > 0) {
      // Cari objek kategori yang namanya cocok
      const matchedCategory = categories.find(
        cat => cat.name.toLowerCase() === categoryNameFromUrl.toLowerCase()
      );
      
      if (matchedCategory) {
        // Jika cocok, set sebagai kategori yang dipilih
        setSelectedCategory(matchedCategory);
        setSearchTerm(''); // Kosongkan pencarian lain
        
        // Hapus parameter dari URL setelah digunakan agar URL kembali bersih
        setSearchParams({}, { replace: true });
      }
    }
  }, [categories, searchParams, setSearchParams, setSearchTerm]);


  // 3. useEffect utama untuk mengambil data kursus (tidak berubah)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page: currentPage, limit: 12 });
        
        let finalSearchTerm = searchTerm;
        if (selectedCategory) {
          finalSearchTerm = selectedCategory.name;
        }

        if (finalSearchTerm) {
          params.append('search', finalSearchTerm);
        }

        const response = await api.get(`/courses?${params.toString()}`);
        setCourses(response.data.results);
        setTotalPages(response.data.total_pages);
      } catch (err) {
        setError('Gagal memuat data kursus.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [currentPage, searchTerm, selectedCategory]);

  const handleCategoryClick = (category) => {
    setSearchTerm('');
    setSelectedCategory(category);
    setCurrentPage(1);
  };
  
  // JSX return tetap sama persis seperti kode Anda
  return (
    <div className="container mx-auto p-4 sm:p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Jelajahi Kursus Kami</h1>
      
      <div className="flex justify-center flex-wrap gap-2 mb-8">
        <button onClick={() => handleCategoryClick(null)} className={`btn btn-ghost ${!selectedCategory ? 'btn-active' : ''}`}>Semua</button>
        {categories.map(category => (
          <button key={category.id} onClick={() => handleCategoryClick(category)} className={`btn btn-ghost ${selectedCategory?.id === category.id ? 'btn-active' : ''}`}>{category.name}</button>
        ))}
      </div>

      {loading ? (
        <div className="text-center"><span className="loading loading-lg loading-spinner"></span></div>
      ) : error ? (
        <div className="text-center text-error">{error}</div>
      ) : courses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map(course => <CourseCard key={course.id} course={course} />)}
          </div>
          <div className="flex justify-center mt-12">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page)} />
          </div>
        </>
      ) : (
        <p className="text-center">Tidak ada kursus yang cocok dengan pencarian Anda.</p>
      )}
    </div>
  );
}
