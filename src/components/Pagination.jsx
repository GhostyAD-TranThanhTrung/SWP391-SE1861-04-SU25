import React from 'react';
import '../styles/Pagination.scss';

const PaginationComp = ({
  totalItems,
  itemsPerPage,
  currentPage,
  maxPageNumbersToShow,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const half = Math.floor(maxPageNumbersToShow / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (start === 1) {
      end = Math.min(totalPages, maxPageNumbersToShow);
    }
    if (end === totalPages) {
      start = Math.max(1, totalPages - maxPageNumbersToShow + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <nav>
      <ul className="pagination justify-content-center custom-pagination">
        <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>&laquo;</button>
        </li>
        <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&lsaquo;</button>
        </li>

        {currentPage >= 4 && (
          <>
            <li className="page-item">
              <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
            </li>
            <li className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          </>
        )}

        {getPageNumbers().map((page) => (
          <li key={page} className={`page-item${page === currentPage ? ' active' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(page)}
              disabled={page === currentPage}
            >
              {page}
            </button>
          </li>
        ))}

        {currentPage < totalPages - 2 && (
          <>
            <li className="page-item disabled">
              <span className="page-link">...</span>
            </li>
            <li className="page-item">
              <button className="page-link" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
            </li>
          </>
        )}

        <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>&rsaquo;</button>
        </li>
        <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>&raquo;</button>
        </li>
      </ul>
    </nav>
  );
};

export default PaginationComp;
