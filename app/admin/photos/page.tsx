'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { deletePhoto, fetchPhotos, resetPhotosFilters, setPhotosPage } from '@/store/slices/photosSlice';
import { AdminProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/admin/AdminLayout';
import PhotoCard from '@/components/photos/PhotoCard';
import PhotoFilters from '@/components/photos/PhotoFilters';
import PhotoPagination from '@/components/photos/PhotoPagination';
import PhotoUploadForm from '@/components/admin/PhotoUploadForm';
import { Plus, X, Loader2, Trash2 } from 'lucide-react';

export default function AdminPhotosPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { photos, loading, total, currentPage, totalPages, filters, availableTags, availableTechnologies } = useSelector(
    (state: RootState) => state.photos
  );
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPhotos(filters));
  }, [dispatch, filters]);

  const handlePageChange = (page: number) => {
    dispatch(setPhotosPage(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (newFilters: any) => {
    dispatch(fetchPhotos({ ...filters, ...newFilters, page: 1 }));
  };

  const handleResetFilters = () => {
    dispatch(resetPhotosFilters());
    dispatch(fetchPhotos({ page: 1, limit: 12, sort: 'newest' }));
  };

  const handleDeletePhoto = async (id: string) => {
    if (confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      setDeletingId(id);
      try {
        await dispatch(deletePhoto(id)).unwrap();
        // Refresh the photos list after deletion
        await dispatch(fetchPhotos(filters));
      } catch (error: any) {
        console.error('Failed to delete photo:', error);
        alert(error.message || 'Failed to delete photo');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleEditPhoto = (photo: any) => {
    setSelectedPhoto(photo);
    setShowUploadForm(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    setSelectedPhoto(null);
    dispatch(fetchPhotos(filters));
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout user={user ?? undefined}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Photo Management</h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage your photo collection - add, edit, or remove photos
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedPhoto(null);
                setShowUploadForm(!showUploadForm);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-sm"
            >
              {showUploadForm ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Upload New Photo
                </>
              )}
            </button>
          </div>

          {/* Upload Form */}
          {showUploadForm && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                {selectedPhoto ? 'Edit Photo' : 'Upload New Photo'}
              </h2>
              <PhotoUploadForm onSuccess={handleUploadSuccess} photo={selectedPhoto} />
            </div>
          )}

          {/* Filters */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <PhotoFilters
              availableTags={availableTags}
              availableTechnologies={availableTechnologies}
              currentFilters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">
              Showing {photos.length} of {total} photos
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
          )}

          {/* Empty State */}
          {!loading && photos.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No photos yet</h3>
              <p className="text-sm text-slate-600 mb-4">
                Click the "Upload New Photo" button to add your first photo.
              </p>
            </div>
          )}

          {/* Photos Grid */}
          {!loading && photos.length > 0 && (
            <>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {photos.map((photo: any) => (
                  <PhotoCard
                    key={photo._id}
                    photo={photo}
                    onEdit={handleEditPhoto}
                    onDelete={handleDeletePhoto}
                    isDeleting={deletingId === photo._id}
                  />
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
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}