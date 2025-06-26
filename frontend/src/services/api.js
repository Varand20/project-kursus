import axios from 'axios';

// Buat instance Axios dengan base URL dari backend kita
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Alamat backend FastAPI Anda
});

export default api;