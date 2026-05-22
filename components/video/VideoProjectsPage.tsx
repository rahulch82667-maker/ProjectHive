'use client';

import { useEffect, useState } from 'react';
import { Search, Film, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import Image from 'next/image';
import { Project, getProjectsApi } from '@/services/projects.api';
import VideoProjectCard from './VideoProjectCard';
import Container from '@/components/layout/Container';

const categories = [
  'All Videos',
  'Motion Graphics',
  'Stock Footage',
  'Intro & Openers',
  'Logo Reveals',
  'Title Sequences',
  'Transitions',
  'Other'
];

export default function VideoProjectsPage() {
  // Local state for items & paging
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'salesCount' | 'price'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  // Reset page when category or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortBy, sortOrder]);

  // Fetch projects from the API
  const fetchVideoProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProjectsApi(currentPage, 12, {
        status: 'published',
        hasVideo: true,
        search: debouncedSearch || undefined,
        category: selectedCategory !== 'All Videos' && selectedCategory ? selectedCategory : undefined,
        sortBy,
        sortOrder,
      });

      setProjects(response.projects || []);
      setTotalProjects(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err: any) {
      console.error('Error loading video projects:', err);
      setError(err.message || 'Failed to retrieve video projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideoProjects();
  }, [currentPage, debouncedSearch, selectedCategory, sortBy, sortOrder]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F6]">
      {/* ── Page Header Banner ───────────────────────────────────── */}
      <div className="bg-white border-b border-brown-100/50 py-8 sm:py-12 relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brown-50/30 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brown-50/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

        <Container>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            {/* Left Side - Text Content */}
            <div className="flex-1 max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brown-900 tracking-tight leading-none mb-3">
                Premium Video Templates
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-brown-600 font-medium max-w-2xl leading-relaxed mb-6">
                Elevate your visual storytelling. Discover ready-to-use motion graphics, titles, transitions, and openers meticulously crafted for videographers and creators.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-xl shadow-md rounded-2xl bg-white border border-brown-100 focus-within:border-brown-300 focus-within:ring-2 focus-within:ring-brown-100 transition-all duration-300">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brown-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search templates, motion graphics, openers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 pr-4 py-4 w-full bg-transparent outline-none text-brown-900 placeholder-brown-400 text-sm sm:text-base font-medium rounded-2xl"
                />
              </div>
            </div>

            {/* Right Side - Decorative Image */}
            <div className="hidden lg:block flex-shrink-0">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                <Image
                  src="/Images/video_deco.png"
                  alt="Video templates decoration"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-8 sm:py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ── Filters Sidebar ─────────────────────────────────────── */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white border border-brown-100 rounded-2xl p-5 sm:p-6 sticky top-24 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-brown-50 mb-5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4.5 w-4.5 text-brown-750" />
                  <h2 className="text-base font-bold text-brown-900">Refine Search</h2>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-brown-500 hover:text-brown-800 transition-colors uppercase tracking-wider"
                >
                  Reset
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-brown-400 uppercase tracking-wider mb-2.5">
                  Category
                </label>
                <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const value = cat === 'All Videos' ? '' : cat;
                    const isSelected = selectedCategory === value;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(value)}
                        className={`text-left text-sm py-2 px-3 rounded-lg font-semibold transition-all ${
                          isSelected
                            ? 'bg-brown-700 text-white shadow-sm'
                            : 'text-brown-700 hover:bg-brown-50'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort Orders */}
              <div>
                <label className="block text-xs font-bold text-brown-400 uppercase tracking-wider mb-2.5">
                  Sort By
                </label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-') as [any, any];
                    setSortBy(sort);
                    setSortOrder(order);
                  }}
                  className="w-full border border-brown-100 hover:border-brown-200 rounded-xl px-3 py-2.5 bg-white text-brown-850 font-semibold text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brown-100"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="salesCount-desc">Best Selling</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </aside>

          {/* ── Main Content Grid ───────────────────────────────────── */}
          <main className="flex-1">
            {/* Header row */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2.5">
              <h2 className="text-sm text-brown-500 font-bold uppercase tracking-wider">
                {loading 
                  ? 'Searching database...' 
                  : `${totalProjects} ${totalProjects === 1 ? 'project' : 'projects'} found`}
              </h2>
            </div>

            {/* Error State */}
            {error && (
              <div className="text-center py-16 bg-white rounded-2xl border border-red-100 shadow-sm p-6 max-w-xl mx-auto">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
                <h3 className="text-lg font-bold text-brown-900 mb-1">Failed to load videos</h3>
                <p className="text-brown-600 text-sm mb-4">{error}</p>
                <button
                  onClick={fetchVideoProjects}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-brown-700 hover:bg-brown-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try Again
                </button>
              </div>
            )}

            {/* Loading Grid Skeleton */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-brown-100 overflow-hidden animate-pulse shadow-sm flex flex-col h-[400px]">
                    <div className="aspect-video bg-brown-50 w-full" />
                    <div className="flex-1 p-5 space-y-3.5 flex flex-col justify-between">
                      <div>
                        <div className="h-3 bg-brown-50 rounded-lg w-20" />
                        <div className="h-5 bg-brown-50 rounded-lg w-3/4 mt-2" />
                        <div className="h-3 bg-brown-50 rounded-lg w-full mt-3" />
                        <div className="h-3 bg-brown-50 rounded-lg w-5/6 mt-1.5" />
                      </div>
                      <div className="h-9 bg-brown-50 rounded-xl w-full mt-auto" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && projects.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-brown-100 shadow-sm p-8 max-w-xl mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brown-50 text-brown-400 mb-4.5">
                  <Film className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-brown-900 mb-1">No video templates found</h3>
                <p className="text-brown-600 text-sm mb-5.5">
                  We couldn't find any video assets matching your current filters or search terms.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-brown-700 hover:bg-brown-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Data Grid */}
            {!loading && !error && projects.length > 0 && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {projects.map((project) => (
                    <VideoProjectCard key={project._id} project={project} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1.5 px-3.5 py-2 border border-brown-100 hover:border-brown-200 rounded-xl text-brown-700 hover:bg-brown-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200 text-xs font-bold shadow-sm"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Prev
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => {
                        const page = i + 1;
                        if (
                          totalPages > 5 &&
                          Math.abs(page - currentPage) > 1 &&
                          page !== 1 &&
                          page !== totalPages
                        ) {
                          if (page === 2 || page === totalPages - 1) {
                            return <span key={page} className="text-brown-400 px-1 text-xs">...</span>;
                          }
                          return null;
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-all duration-200 ${
                              page === currentPage
                                ? 'bg-brown-700 text-white border-brown-700 shadow-sm'
                                : 'border-brown-100 text-brown-700 hover:bg-brown-50 hover:text-brown-900'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1.5 px-3.5 py-2 border border-brown-100 hover:border-brown-200 rounded-xl text-brown-700 hover:bg-brown-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200 text-xs font-bold shadow-sm"
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>

        </div>
      </Container>
    </div>
  );
}