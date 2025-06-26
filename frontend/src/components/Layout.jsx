import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer'; // <-- Impor Footer

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Outlet adalah tempat di mana semua halaman akan ditampilkan */}
        <Outlet />
      </main>
      <Footer /> {/* <-- Tambahkan Footer di sini */}
    </div>
  );
}