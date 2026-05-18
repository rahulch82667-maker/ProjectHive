'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Project } from '@/services/projects.api';
import ProjectCard from './ProjectCard';

interface TemplatesGridProps {
  projects: Project[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function TemplatesGrid({
  projects,
  loading,
  error,
  currentPage,
  totalPages,
  onPageChange
}: TemplatesGridProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#e8ddd4] flex overflow-hidden animate-pulse" style={{ height: '180px' }}>
            <div className="w-72 flex-shrink-0 bg-[#efebe9]" />
            <div className="flex-1 p-5 space-y-3">
              <div className="h-3 bg-[#efebe9] rounded-lg w-24" />
              <div className="h-5 bg-[#efebe9] rounded-lg w-3/4" />
              <div className="h-3 bg-[#efebe9] rounded-lg w-full" />
              <div className="h-3 bg-[#efebe9] rounded-lg w-5/6" />
              <div className="h-3 bg-[#efebe9] rounded-lg w-1/3" />
            </div>
            <div className="w-44 flex-shrink-0 bg-[#faf8f6] border-l border-[#efebe9] p-5 flex flex-col gap-3">
              <div className="h-7 bg-[#efebe9] rounded-lg mx-auto w-16" />
              <div className="h-3 bg-[#efebe9] rounded-lg w-full" />
              <div className="h-8 bg-[#efebe9] rounded-lg w-full mt-auto" />
              <div className="h-8 bg-[#efebe9] rounded-lg w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-brown-100 shadow-sm">
        <div className="text-red-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-brown-950 mb-2">Error loading templates</h3>
        <p className="text-brown-600 text-sm">{error}</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-brown-100 shadow-sm">
        <div className="text-brown-400 mb-4 animate-bounce">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-brown-950 mb-2">No templates found</h3>
        <p className="text-brown-600 text-sm">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-5 mb-10">
        {projects.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1.5 px-4 py-2 border border-brown-200 rounded-xl text-brown-700 hover:bg-brown-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200 text-sm font-semibold shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (page > totalPages) return null;

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3.5 py-2 border rounded-xl transition-all duration-200 text-sm font-bold shadow-sm ${
                    page === currentPage
                      ? 'bg-brown-700 text-white border-brown-700'
                      : 'border-brown-200 text-brown-700 hover:bg-brown-50 hover:text-brown-950'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1.5 px-4 py-2 border border-brown-200 rounded-xl text-brown-700 hover:bg-brown-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200 text-sm font-semibold shadow-sm"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}