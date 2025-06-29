import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import { InstructorToggleButton } from './InstructorToggleButton';

function SearchInput() {
  const { performSearch } = useSearch();
  const [localTerm, setLocalTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(localTerm);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label className="input input-bordered flex items-center gap-2 input-sm max-w-xs bg-white/10 text-white placeholder-white/60 border border-white/20">
        <input
          type="text"
          className="grow bg-transparent text-white"
          placeholder="Cari kursus..."
          value={localTerm}
          onChange={(e) => setLocalTerm(e.target.value)}
        />
        <button type="submit" aria-label="search">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70">
            <path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" />
          </svg>
        </button>
      </label>
    </form>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();

  const navLinks = (
    <>
      <li><Link to="/courses">Courses</Link></li>
      {user && <li><Link to="/my-learning">Kursus Saya</Link></li>}
    </>
  );

  return (
    <div className="navbar sticky top-0 z-50 backdrop-blur-md bg-gradient-to-br from-indigo-900/70 via-slate-800/70 to-gray-900/70 text-white border-b border-white/20 shadow-md">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-box w-52">
            {navLinks}
            <div className="divider my-1"></div>
            <li className="p-2"><SearchInput /></li>
            {!user && (
              <>
                <div className="divider my-1"></div>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost normal-case text-xl text-white font-bold">
          KursusKu
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 text-white font-medium">
          {navLinks}
        </ul>
      </div>

      <div className="navbar-end gap-2">
        <div className="hidden md:block">
          <SearchInput />
        </div>

        {user ? (
          <>
            <InstructorToggleButton />
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img
                    alt="User Avatar"
                    src={`https://ui-avatars.com/api/?name=${user.name.replace(/\s/g, '+')}&background=random`}
                  />
                </div>
              </div>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-white/10 backdrop-blur-lg border border-white/20 rounded-box w-52 text-white">
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
            <Link to="/login" className="btn btn-ghost text-white">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </div>
        )}
      </div>
    </div>
  );
}
