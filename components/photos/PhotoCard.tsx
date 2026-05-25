import { useState } from 'react';
import Image from 'next/image';
import { Tag, Pencil, Trash, Loader2 } from 'lucide-react';
import { Photo } from '@/services/photos.api';
import AddToCollectionModal from '@/components/collections/AddToCollectionModal';

interface PhotoCardProps {
  photo: Photo;
  onEdit?: (photo: Photo) => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export default function PhotoCard({ photo, onEdit, onDelete, isDeleting }: PhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  const formatPrice = (price: number) => (price === 0 ? 'Free' : `$${price}`);

  const handleEdit = () => {
    if (onEdit) onEdit(photo);
  };
  
  const handleDelete = async () => {
    if (onDelete && confirm('Delete this photo? This action cannot be undone.')) {
      onDelete(photo._id);
    }
  };

  return (
    <>
      <div
        className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-brown-50">
          <Image
            src={photo.imageUrl}
            alt={photo.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Overlay Actions */}
          <div
            className={`absolute inset-0 bg-black/50 flex items-center justify-center gap-3 transition-opacity duration-300 ${
              isHovered && !isDeleting ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {isDeleting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            ) : (
              <>
                {/* Admin edit/delete */}
                {onEdit && (
                  <button
                    className="p-2 bg-white rounded-full text-brown-700 hover:bg-brown-700 hover:text-white transition-all"
                    title="Edit Photo"
                    onClick={handleEdit}
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    className="p-2 bg-white rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-all"
                    title="Delete Photo"
                    onClick={handleDelete}
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-brown-900 line-clamp-1 mb-1">{photo.title}</h3>
          <p className="text-sm text-brown-600 line-clamp-2 mb-3">{photo.description}</p>

          {/* Tags */}
          {photo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {photo.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 text-xs text-brown-600 bg-brown-50 px-2 py-0.5 rounded">
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
              {photo.tags.length > 2 && (
                <span className="text-xs text-brown-500">+{photo.tags.length - 2}</span>
              )}
            </div>
          )}

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between pt-2 border-t border-brown-100">
            <span className="text-lg font-bold text-brown-900">{formatPrice(photo.price)}</span>
          </div>
        </div>
      </div>

      {showCollectionModal && (
        <AddToCollectionModal
          project={photo as any}
          open={showCollectionModal}
          onClose={() => setShowCollectionModal(false)}
        />
      )}
    </>
  );
}