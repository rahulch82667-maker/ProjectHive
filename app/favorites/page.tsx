'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchWishlist } from '@/store/slices/wishlistSlice';
import ProjectCard from '@/components/templates/ProjectCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MainLayout from '@/components/layout/MainLayout';
import { Heart, Bookmark, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((state: RootState) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-brown-50 to-white">
        <Navbar />
        <MainLayout>
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {/* Skeleton Header */}
            <div className="mb-8 rounded-2xl border border-brown-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-100 p-3 animate-pulse">
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <div className="h-8 w-48 bg-brown-200 rounded-lg animate-pulse"></div>
                  <div className="h-4 w-64 bg-brown-100 rounded-lg mt-2 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Skeleton List View */}
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-white rounded-xl border border-brown-200 overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-64 h-48 bg-brown-100"></div>
                      <div className="flex-1 p-5 space-y-3">
                        <div className="h-5 bg-brown-100 rounded w-1/4"></div>
                        <div className="h-6 bg-brown-100 rounded w-3/4"></div>
                        <div className="h-20 bg-brown-50 rounded"></div>
                        <div className="flex justify-between items-center">
                          <div className="h-6 bg-brown-100 rounded w-24"></div>
                          <div className="h-8 bg-brown-100 rounded w-32"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </MainLayout>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-brown-50 to-white">
        <Navbar />
        <MainLayout>
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to load favorites</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => dispatch(fetchWishlist())}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </MainLayout>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brown-50 to-white">
      <Navbar />
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 lg:py-10 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <div className="rounded-2xl bg-white border border-brown-200 shadow-sm overflow-hidden">
              {/* Decorative top bar */}
              <div className="h-1 bg-gradient-to-r from-red-500 via-brown-500 to-red-500"></div>
              
              <div className="p-5 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="rounded-full bg-gradient-to-br from-red-100 to-red-200 p-3 sm:p-4 shadow-sm">
                      <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 fill-current" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brown-900">
                        My Favorites
                      </h1>
                      <p className="text-sm sm:text-base text-brown-600 mt-1 flex items-center gap-1 flex-wrap">
                        <span>Projects you've liked</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="inline-flex items-center gap-1">
                          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
                          {items.length} {items.length === 1 ? 'project' : 'projects'} saved
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick stats */}
                {items.length > 0 && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-brown-100 flex flex-wrap gap-4 sm:gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-bold text-sm">{items.length}</span>
                      </div>
                      <span className="text-xs sm:text-sm text-brown-600">Total Favorites</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bookmark className="h-4 w-4 text-brown-500" />
                      <span className="text-xs sm:text-sm text-brown-600">
                        Click heart to remove from favorites
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Empty State */}
          {items.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-brown-200 bg-white/50 backdrop-blur-sm p-8 sm:p-12 lg:p-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brown-100 mb-6">
                  <Heart className="h-10 w-10 text-brown-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-brown-800 mb-2">
                  Your favorites list is empty
                </h3>
                <p className="text-sm sm:text-base text-brown-600 mb-6">
                  Start exploring projects and click the heart icon on any project to add it to your favorites.
                </p>
                <Link
                  href="/templates"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-brown-700 text-white rounded-xl hover:bg-brown-800 transition-all shadow-sm hover:shadow-md"
                >
                  Browse Projects
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Results count */}
              <div className="mb-4 sm:mb-6 flex justify-between items-center flex-wrap gap-2">
                <p className="text-xs sm:text-sm text-brown-600">
                  Showing {items.length} {items.length === 1 ? 'project' : 'projects'}
                </p>
                <p className="text-xs text-brown-500">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>

              {/* Projects List View */}
              <div className="space-y-4 sm:space-y-5">
                {items.map((project, index) => (
                  <div
                    key={project._id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </MainLayout>
      <Footer />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}