import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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

  useEffect(() => {
    api.get('/categories')
      .then(response => setCategories(response.data))
      .catch(err => console.error("Gagal memuat kategori:", err));
  }, []);

  useEffect(() => {
    const categoryNameFromUrl = searchParams.get('category');
    if (categoryNameFromUrl && categories.length > 0) {
      const matchedCategory = categories.find(
        cat => cat.name.toLowerCase() === categoryNameFromUrl.toLowerCase()
      );
      if (matchedCategory) {
        setSelectedCategory(matchedCategory);
        setSearchTerm('');
        setSearchParams({}, { replace: true });
      }
    }
  }, [categories, searchParams, setSearchParams, setSearchTerm]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page: currentPage, limit: 4 });

        if (selectedCategory) {
          params.append('category_id', selectedCategory.id);
        }
        if (searchTerm) {
          params.append('search', searchTerm);
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
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-800 to-gray-900 text-white px-4 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Jelajahi Kursus Kami</h1>

        <div className="flex justify-center flex-wrap gap-2 mb-10">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-4 py-2 rounded-full border ${
              !selectedCategory ? 'bg-white/20 border-white/30 text-white font-semibold' : 'bg-white/10 text-white hover:bg-white/20'
            } transition`}
          >
            Semua
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className={`px-4 py-2 rounded-full border ${
                selectedCategory?.id === category.id
                  ? 'bg-white/20 border-white/30 text-white font-semibold'
                  : 'bg-white/10 text-white hover:bg-white/20'
              } transition`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <span className="loading loading-lg loading-spinner text-white"></span>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 font-medium">{error}</div>
        ) : courses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            <div className="flex justify-center mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        ) : (
          <p className="text-center text-white/70 mt-20">Tidak ada kursus yang cocok dengan kriteria Anda.</p>
        )}
      </div>
    </div>
  );
}
