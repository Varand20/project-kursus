import React, { useState, useEffect } from 'react';
import api from '../services/api';

export function CourseForm({ onSubmit, initialData = {}, isEditing = false, isLoading = false }) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    category_id: initialData.category_id || '',
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState(initialData.thumbnail_url || null);

  // Ambil daftar kategori untuk dropdown saat komponen dimuat
  useEffect(() => {
    api.get('/categories')
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => console.error("Gagal memuat kategori:", error));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      // Buat preview gambar yang dipilih
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Siapkan data untuk dikirim dalam format multipart/form-data
    const submissionData = new FormData();
    submissionData.append('title', formData.title);
    submissionData.append('description', formData.description);
    submissionData.append('category_id', formData.category_id);
    
    // Hanya tambahkan file jika ada file baru yang dipilih
    if (thumbnailFile) {
      submissionData.append('file', thumbnailFile);
    }
    
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label"><span className="label-text">Judul Kursus</span></label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} className="input input-bordered w-full" required />
      </div>
      
      <div className="form-control">
        <label className="label"><span className="label-text">Deskripsi</span></label>
        <textarea name="description" value={formData.description} onChange={handleChange} className="textarea textarea-bordered h-24"></textarea>
      </div>

      <div className="form-control">
        <label className="label"><span className="label-text">Kategori</span></label>
        <select name="category_id" value={formData.category_id} onChange={handleChange} className="select select-bordered" required>
          <option value="" disabled>Pilih kategori</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      
      <div className="form-control">
        <label className="label"><span className="label-text">Gambar Sampul (Thumbnail)</span></label>
        <input type="file" onChange={handleFileChange} className="file-input file-input-bordered w-full" accept="image/*" />
        {preview && <img src={preview} alt="Preview" className="mt-4 rounded-lg shadow-md max-h-48" />}
      </div>
      
      <div className="form-control mt-6">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? <span className="loading loading-spinner"></span> : (isEditing ? 'Simpan Perubahan' : 'Buat Kursus')}
        </button>
      </div>
    </form>
  );
}