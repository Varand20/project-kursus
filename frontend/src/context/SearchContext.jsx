import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Fungsi ini akan dipanggil oleh Navbar saat user melakukan pencarian
  const performSearch = (term) => {
    setSearchTerm(term);
    // Jika user mencari, otomatis bawa mereka ke halaman hasil pencarian
    navigate('/courses');
  };

  const value = {
    searchTerm,
    setSearchTerm,
    performSearch,
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

// Custom hook untuk mempermudah
export function useSearch() {
  return useContext(SearchContext);
}