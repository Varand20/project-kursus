import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <-- Impor BrowserRouter
import { AuthProvider } from './context/AuthContext';
import App from './App.jsx';
import './index.css';
import { FavoritesProvider } from './context/FavoritesContext';
import { SearchProvider } from './context/SearchContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
          <SearchProvider> {/* <-- Bungkus App di sini */}
            <App />
          </SearchProvider>
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);