import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext'; // <-- Impor hook search
import { InstructorToggleButton } from './InstructorToggleButton';

// Komponen kecil khusus untuk kotak pencarian
function SearchInput() {
  const { performSearch } = useSearch();
  const [localTerm, setLocalTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(localTerm);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label className="input input-bordered flex items-center gap-2 input-sm">
        <input 
          type="text" 
          className="grow" 
          placeholder="Cari kursus..." 
          value={localTerm}
          onChange={(e) => setLocalTerm(e.target.value)}
        />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" /></svg>
      </label>
    </form>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navLinks = (
    <>
      <li><Link to="/courses">Courses</Link></li>
      {user && <li><Link to="/my-learning">Enrolled Course</Link></li>}
    </>
  );

  return (
    <div className="navbar bg-base-100 shadow-md px-4 sticky top-0 z-50">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            {navLinks}
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost text-xl">KursusKu</Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">{navLinks}</ul>
      </div>

      <div className="navbar-end gap-2">
        {/* Pindahkan SearchInput ke sini agar berada di kanan */}
        <div className="hidden md:block">
            <SearchInput />
        </div>
        {user ? (
          <>
            <InstructorToggleButton />
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img alt="User Avatar" src={`https://ui-avatars.com/api/?name=${user.name.replace(/\s/g, '+')}&background=random`} />
                </div>
              </div>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                <li className="font-semibold p-2">Halo, {user.name}</li>
                <div className="divider my-0"></div>
                <li><Link to="/profile">Profil Saya</Link></li>
                <li><Link to="/my-favorites">Favorit Saya</Link></li>
                <div className="divider my-0"></div>
                <li><button onClick={logout}>Logout</button></li>
              </ul>
            </div>
          </>
        ) : (
          <div className="hidden md:flex gap-2">
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </div>
        )}
      </div>
    </div>
  );
}