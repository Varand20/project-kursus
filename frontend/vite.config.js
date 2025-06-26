import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- 1. Impor plugin baru

// https://vitejs.dev/config/
export default defineConfig({
  // 2. Daftarkan plugin tailwindcss di sini
  plugins: [react(), tailwindcss()],
})