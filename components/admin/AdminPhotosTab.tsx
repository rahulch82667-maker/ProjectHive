import { useEffect, useState } from 'react';
import { Photo, getPhotosApi } from '@/services/photos.api';
import PhotoCard from '@/components/photos/PhotoCard';
import PhotoPagination from '@/components/photos/PhotoPagination';
import PhotoFilters from '@/components/photos/PhotoFilters';
import PhotoUploadForm from '@/components/admin/PhotoUploadForm';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { deletePhoto, fetchPhotos } from '@/store/slices/photosSlice';

export default function AdminPhotosTab() {
  const dispatch = useDispatch<AppDispatch>();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [filters, setFilters] = useState({});
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const fetchPhotos = async () => {
    try {
      const data = await getPhotosApi({ page, limit, ...filters });
      setPhotos(data.photos);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch photos', err);
    }
  };

  useEffect(() => {
    fetchPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deletePhoto(id)).unwrap();
      // Refetch after deletion
      fetchPhotos();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleEdit = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <section className="space-y-6">
      {/* Edit Form */}
      {selectedPhoto && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
          <PhotoUploadForm
            photo={selectedPhoto}
            onSuccess={() => {
              setSelectedPhoto(null);
              fetchPhotos();
            }}
          />
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900">Manage Photos</h2>
        <PhotoFilters
          availableTags={[]}
          availableTechnologies={[]}
          currentFilters={filters}
          onFilterChange={handleFilterChange}
          onReset={() => {
            setFilters({});
            setPage(1);
          }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => (
          <PhotoCard
            key={photo._id}
            photo={photo}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <PhotoPagination
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
        onPageChange={handlePageChange}
      />
    </section>
  );
}
