import { useMemo } from 'react';

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
  onPageChange
}) {
  const pageNumbers = useMemo(() => {
    const pages = [];
    const range = 3;
    let start = Math.max(1, currentPage - range);
    let end = Math.min(totalPages, currentPage + range);
    if (start > 2) pages.push(1, '...');
    else if (start === 2) pages.push(1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('...', totalPages);
    else if (end === totalPages - 1) pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="pagination-bar">
      <div className="pagination-info">
        <span className="text-on-surface-variant">Show</span>
        <select
          className="filter-select"
          value={itemsPerPage}
          onChange={e => onItemsPerPageChange(Number(e.target.value))}
          style={{ width: 'auto', padding: '4px 8px', fontSize: '13px' }}
        >
          {[10, 15, 20, 25, 30, 35, 40, 45, 50].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span className="text-on-surface-variant">of {totalItems} transactions</span>
      </div>
      <div className="pagination-controls">
        <button
          className="btn-secondary"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          style={{ padding: '6px 10px', fontSize: '13px' }}
        >
          Previous
        </button>
        <div className="pagination-pages">
          {pageNumbers.map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="pagination-ellipsis">...</span>
            ) : (
              <button
                key={p}
                className={`pagination-page-btn ${p === currentPage ? 'active' : ''}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            )
          )}
        </div>
        <div className="pagination-jump">
          <span className="text-on-surface-variant" style={{ fontSize: '13px' }}>Go to</span>
          <input
            type="number"
            className="form-input"
            min={1}
            max={totalPages}
            placeholder="#"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 1 && val <= totalPages) {
                  onPageChange(val);
                  e.target.value = '';
                }
              }
            }}
            style={{ width: '48px', textAlign: 'center', padding: '4px', fontSize: '13px' }}
          />
          <span className="text-on-surface-variant" style={{ fontSize: '13px' }}>/ {totalPages}</span>
        </div>
        <button
          className="btn-secondary"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          style={{ padding: '6px 10px', fontSize: '13px' }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
