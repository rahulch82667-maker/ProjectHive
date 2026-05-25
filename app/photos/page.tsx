'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchPhotos, setPhotosFilters, setPhotosPage, resetPhotosFilters } from '@/store/slices/photosSlice';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MainLayout from '@/components/layout/MainLayout';
import { Camera, Loader2 } from 'lucide-react';
import PhotoFilters from '@/components/photos/PhotoFilters';
import PhotoCard from '@/components/photos/PhotoCard';
import PhotoPagination from '@/components/photos/PhotoPagination';

export default function PhotosPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { photos, loading, total, currentPage, totalPages, filters, availableTags, availableTechnologies } = useSelector(
    (state: RootState) => state.photos
  );

  useEffect(() => {
    dispatch(fetchPhotos(filters));
  }, [dispatch, filters]);

  const handlePageChange = (page: number) => {
    dispatch(setPhotosPage(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (newFilters: any) => {
    dispatch(setPhotosFilters(newFilters));
  };

  const handleResetFilters = () => {
    dispatch(resetPhotosFilters());
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brown-50 to-white">
      <Navbar />
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-brown-100 p-3">
                <Camera className="h-6 w-6 text-brown-700" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-brown-900">Photo Collection</h1>
                <p className="text-sm text-brown-600 mt-1">
                  Discover stunning photos for your projects
                </p>
              </div>
            </div>
          </div>

          {/* Filters and Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <PhotoFilters
                availableTags={availableTags}
                availableTechnologies={availableTechnologies}
                currentFilters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Results count */}
              <div className="mb-4 flex justify-between items-center">
                <p className="text-sm text-brown-600">
                  Showing {photos.length} of {total} photos
                </p>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-brown-600" />
                </div>
              ) : photos.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-brown-200">
                  <Camera className="mx-auto h-12 w-12 text-brown-400 mb-4" />
                  <h3 className="text-lg font-semibold text-brown-800 mb-2">No photos found</h3>
                  <p className="text-sm text-brown-600">
                    Try adjusting your filters or check back later
                  </p>
                </div>
              ) : (
                <>
                  {/* Photo Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {photos.map((photo) => (
                      <PhotoCard key={photo._id} photo={photo} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8">
                      <PhotoPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </MainLayout>
      <Footer />
    </div>
  );
}