import React, { useState, useEffect } from 'react';

export function LessonForm({ onSubmit, initialData = {}, onCancel, isLoading = false }) {
  const [formData, setFormData] = useState({
    title: '',
    order: '',
    video_url: '',
    content: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        order: initialData.order || '',
        video_url: initialData.video_url || '',
        content: initialData.content || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseInt(formData.order) < 1) {
      alert("Nomor urut tidak boleh kurang dari 1.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Judul Pelajaran</span>
        </label>
        <input 
          type="text" 
          name="title" 
          value={formData.title} 
          onChange={handleChange} 
          placeholder="Masukkan judul pelajaran" 
          className="input input-bordered w-full" 
          required 
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Nomor Urut</span>
        </label>
        <input 
          type="number" 
          name="order" 
          value={formData.order} 
          onChange={handleChange} 
          className="input input-bordered w-full" 
          placeholder="Contoh: 1" 
          required 
          min="1"
          onKeyDown={(e) => {
            if (['e', 'E', '+', '-', '.'].includes(e.key)) {
              e.preventDefault();
            }
          }}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">URL Video (Opsional)</span>
        </label>
        <input 
          type="url" 
          name="video_url" 
          value={formData.video_url} 
          onChange={handleChange} 
          placeholder="https://www.youtube.com/..." 
          className="input input-bordered w-full" 
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Konten Teks (Opsional)</span>
        </label>
        <textarea 
          name="content" 
          value={formData.content} 
          onChange={handleChange} 
          placeholder="Tulis konten pelajaran di sini (mendukung markdown)" 
          className="textarea textarea-bordered h-40 w-full resize-y"
        ></textarea>
      </div>

      <div className="modal-action flex justify-end gap-4 pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="btn btn-outline"
        >
          Batal
        </button>
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isLoading}
        >
          {isLoading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
