'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const startPage = Math.max(1, page - 2);
  const endPage = Math.min(totalPages, page + 2);
  const pages = [];

  for (let current = startPage; current <= endPage; current += 1) {
    pages.push(current);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row">
      <p className="text-sm text-slate-600">
        Page <span className="font-semibold text-slate-900">{page}</span> of <span className="font-semibold text-slate-900">{totalPages}</span>
      </p>
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-3xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            className={`rounded-3xl px-2.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold transition ${
              pageNumber === page
                ? 'bg-amber-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-3xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
