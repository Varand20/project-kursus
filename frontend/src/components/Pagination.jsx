import React from 'react';

export function Pagination({ currentPage, totalPages, onPageChange }) {
  const pageNumbers = [];
  // Hanya tampilkan beberapa nomor halaman di sekitar halaman saat ini
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (totalPages > maxPagesToShow) {
    if (endPage === totalPages) {
      startPage = totalPages - maxPagesToShow + 1;
    } else if (startPage === 1) {
      endPage = maxPagesToShow;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  if (totalPages <= 1) {
    return null; // Jangan tampilkan paginasi jika hanya ada 1 halaman
  }

  return (
    <div className="join">
      <button 
        className="join-item btn" 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
      >
        «
      </button>
      {startPage > 1 && (
        <>
          <button className="join-item btn" onClick={() => onPageChange(1)}>1</button>
          {startPage > 2 && <button className="join-item btn btn-disabled">...</button>}
        </>
      )}
      {pageNumbers.map(number => (
        <button 
          key={number} 
          className={`join-item btn ${number === currentPage ? 'btn-active' : ''}`}
          onClick={() => onPageChange(number)}
        >
          {number}
        </button>
      ))}
       {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <button className="join-item btn btn-disabled">...</button>}
          <button className="join-item btn" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}
      <button 
        className="join-item btn" 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
      >
        »
      </button>
    </div>
  );
}