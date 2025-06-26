import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export function Footer() {
  const [categories, setCategories] = useState([]);

  // Ambil beberapa kategori untuk ditampilkan di footer
  useEffect(() => {
    api.get('/categories?limit=4') // Ambil 4 kategori pertama
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => console.error("Gagal memuat kategori untuk footer:", error));
  }, []);

  return (
    <footer className="footer p-10 bg-base-200 text-base-content mt-16">
      <nav>
        <h6 className="footer-title">Kategori</h6> 
        {/* Tampilkan link secara dinamis */}
        {categories.map(category => (
          <Link 
            key={category.id}
            // Link ini akan menyertakan nama kategori sebagai parameter URL
            to={`/courses?category=${encodeURIComponent(category.name)}`} 
            className="link link-hover"
          >
            {category.name}
          </Link>
        ))}
      </nav> 
      <nav>
        <h6 className="footer-title">Perusahaan</h6> 
        <a className="link link-hover">Tentang Kami</a>
        <a className="link link-hover">Kontak</a>
      </nav> 
      <nav>
        <h6 className="footer-title">Legal</h6> 
        <a className="link link-hover">Syarat & Ketentuan</a>
        <a className="link link-hover">Kebijakan Privasi</a>
      </nav>
    </footer>
  );
}