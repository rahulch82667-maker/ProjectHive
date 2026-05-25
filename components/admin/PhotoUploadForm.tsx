'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { createPhoto, updatePhoto, fetchPhotos } from '@/store/slices/photosSlice';
import { uploadPhotoImageApi } from '@/services/photos.api';
import { Image, X, Plus, Loader2, Pencil } from 'lucide-react';
import { Photo } from '@/services/photos.api';

interface PhotoUploadFormProps {
  onSuccess?: () => void;
  photo?: Photo;
}

export default function PhotoUploadForm({ onSuccess, photo }: PhotoUploadFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { creating, loading } = useSelector((state: RootState) => state.photos);
  
  const [formData, setFormData] = useState({
    title: photo?.title || '',
    description: photo?.description || '',
    price: photo?.price || 0,
    tags: photo?.tags?.join(', ') || '',
    technologies: photo?.technologies?.join(', ') || '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(photo?.imageUrl || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (formData.price < 0) {
      setError('Price must be 0 or greater');
      return;
    }

    // Ensure image for new photo
    if (!photo && !selectedImage) {
      setError('Please select an image');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const data = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: formData.price,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      technologies: formData.technologies.split(',').map(t => t.trim()).filter(Boolean),
    };

    try {
      if (photo) {
        // Editing existing photo
        let imageUrl = photo.imageUrl;
        if (selectedImage) {
          const uploadResult = await uploadPhotoImageApi(selectedImage);
          imageUrl = uploadResult.url;
        }
        await dispatch(updatePhoto({ 
          id: photo._id, 
          data: { ...data, imageUrl } 
        })).unwrap();
      } else {
        // Creating new photo
        const uploadResult = await uploadPhotoImageApi(selectedImage!);
        await dispatch(createPhoto({ 
          data: { ...data, imageUrl: uploadResult.url }, 
          imageFile: selectedImage! 
        })).unwrap();
        
        // Reset form for new photo
        setFormData({ title: '', description: '', price: 0, tags: '', technologies: '' });
        setSelectedImage(null);
        setImagePreview('');
      }
      
      if (onSuccess) onSuccess();
      // Refresh list
      dispatch(fetchPhotos({ page: 1, limit: 12 }));
    } catch (err: any) {
      setError(err.message || (photo ? 'Failed to update photo' : 'Failed to create photo'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProcessing = creating || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-brown-800 mb-2">
          Photo Image {!photo && '*'}
        </label>
        <div className="flex items-center gap-4 flex-wrap">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border border-brown-200"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(photo?.imageUrl || '');
                }}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-brown-300 rounded-lg cursor-pointer hover:border-brown-500 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Image className="h-8 w-8 text-brown-500" />
                <p className="text-xs text-brown-500">Upload</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
          <p className="text-xs text-brown-500">Max file size: 5MB (JPG, PNG, WEBP)</p>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-brown-800 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-brown-200 focus:outline-none focus:ring-2 focus:ring-brown-300"
          placeholder="e.g., Mountain Landscape"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-brown-800 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 rounded-lg border border-brown-200 focus:outline-none focus:ring-2 focus:ring-brown-300"
          placeholder="Describe the photo..."
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-semibold text-brown-800 mb-2">
          Price ($) *
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
          className="w-full px-4 py-2 rounded-lg border border-brown-200 focus:outline-none focus:ring-2 focus:ring-brown-300"
          placeholder="0.00"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold text-brown-800 mb-2">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-brown-200 focus:outline-none focus:ring-2 focus:ring-brown-300"
          placeholder="nature, landscape, mountains"
        />
        <p className="text-xs text-brown-500 mt-1">Separate tags with commas</p>
      </div>

      {/* Technologies */}
      <div>
        <label className="block text-sm font-semibold text-brown-800 mb-2">
          Technologies (comma-separated)
        </label>
        <input
          type="text"
          value={formData.technologies}
          onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-brown-200 focus:outline-none focus:ring-2 focus:ring-brown-300"
          placeholder="photography, editing, drone"
        />
        <p className="text-xs text-brown-500 mt-1">Separate technologies with commas</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brown-700 text-white font-semibold rounded-lg hover:bg-brown-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {photo ? 'Updating...' : 'Creating...'}
          </>
        ) : (
          <>
            {photo ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {photo ? 'Update Photo' : 'Create Photo'}
          </>
        )}
      </button>
    </form>
  );
}