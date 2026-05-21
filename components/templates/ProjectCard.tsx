'use client';

import { useState, useEffect } from 'react';
import { Heart, Bookmark, Star, ShoppingCart, ExternalLink, Tag, Cpu } from 'lucide-react';
import Image from 'next/image';
import AddToCollectionModal from '@/components/collections/AddToCollectionModal';
import { useAuth } from '@/hooks/useAuth';
import { Project } from '@/services/projects.api';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchCollections, removeProjectFromCollection } from '@/store/slices/collectionsSlice';
import { toggleWishlist } from '@/store/slices/wishlistSlice';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [optimisticWishlist, setOptimisticWishlist] = useState<boolean | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { isAuthenticated } = useAuth();
  const { collections } = useSelector((state: RootState) => state.collections);
  const { items: wishlistItems, actionLoading: wishlistActionLoading } = useSelector(
    (state: RootState) => state.wishlist
  );

  // Check if project is already in any collection
  useEffect(() => {
    if (isAuthenticated && collections.length > 0) {
      const isProjectInAnyCollection = collections.some(collection => 
        collection.projects.includes(project._id)
      );
      setIsBookmarked(isProjectInAnyCollection);
    }
  }, [collections, project._id, isAuthenticated]);

  const isWishlisted = wishlistItems.some((item) => item._id === project._id);
  const displayedWishlisted = optimisticWishlist !== null ? optimisticWishlist : isWishlisted;

  useEffect(() => {
    if (!wishlistActionLoading) {
      setOptimisticWishlist(null);
    }
  }, [wishlistActionLoading, isWishlisted]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
  };

  const formatPrice = (price: number) =>
    price === 0 ? 'Free' : `$${price}`;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      console.log('Please login to save favorites');
      return;
    }

    const nextValue = !displayedWishlisted;
    setOptimisticWishlist(nextValue);

    try {
      await dispatch(toggleWishlist(project._id)).unwrap();
    } catch (err) {
      setOptimisticWishlist(null);
      console.error('Failed to update wishlist:', err);
    }
  };

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      console.log('Please login to add to collections');
      return;
    }
    
    if (isBookmarked) {
      setIsRemoving(true);
      try {
        const collectionContainingProject = collections.find(collection => 
          collection.projects.includes(project._id)
        );
        
        if (collectionContainingProject) {
          await dispatch(removeProjectFromCollection({ 
            collectionId: collectionContainingProject._id, 
            projectId: project._id 
          })).unwrap();
          setIsBookmarked(false);
          dispatch(fetchCollections());
        }
      } catch (err: any) {
        console.error('Failed to remove project from collection:', err);
      } finally {
        setIsRemoving(false);
      }
    } else {
      setShowCollectionModal(true);
    }
  };

  const handleLivePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(project.liveDemoLink || '#', '_blank');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Add to cart:', project._id);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      const filled = i < Math.floor(rating);
      const half = !filled && i < rating;
      return (
        <span key={i} className="relative inline-block text-amber-500">
          <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-300" />
          {(filled || half) && (
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: half ? '55%' : '100%' }}
            >
              <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current text-amber-500" />
            </span>
          )}
        </span>
      );
    });
  };

  const displayImage = project.thumbnail || null;

  const handleModalClose = () => {
    setShowCollectionModal(false);
    if (isAuthenticated) {
      dispatch(fetchCollections());
    }
  };

  return (
    <>
      <article className="group relative flex flex-col bg-white border border-brown-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-brown-300 transition-all duration-300">
        
        {/* Responsive Layout: Column on mobile, Row on tablet+ */}
        <div className="flex flex-col md:flex-row">
          
          {/* ── Thumbnail Section ── */}
          <div className="relative w-full md:w-48 lg:w-56 xl:w-64 h-48 sm:h-56 md:h-auto bg-brown-50 flex-shrink-0">
            {displayImage ? (
              <Image
                src={displayImage}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 256px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <svg className="h-12 w-12 sm:h-14 sm:w-14 text-brown-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            {/* Mobile-only category badge */}
            <div className="absolute top-2 left-2 md:hidden">
              <span className="inline-block bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wide text-brown-700 shadow-sm">
                {project.category?.replace(/-/g, ' ')}
              </span>
            </div>
          </div>

          {/* ── Content Section ── */}
          <div className="flex-1 flex flex-col p-4 sm:p-5">
            
            {/* Desktop category */}
            <div className="hidden md:block mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-brown-600">
                {project.category?.replace(/-/g, ' ')}
              </span>
            </div>

            <h3 className="text-base sm:text-lg md:text-xl font-bold text-brown-900 leading-tight mb-2 line-clamp-2 group-hover:text-brown-700 transition-colors">
              {project.title}
            </h3>

            <p className="text-xs sm:text-sm text-brown-600 leading-relaxed line-clamp-2 md:line-clamp-3 mb-3">
              {project.shortDescription}
            </p>

            {/* Technologies & Tags - Responsive grid */}
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {project.technologies?.slice(0, 3).map((tech) => (
                <div key={tech} className="flex items-center gap-1.5 text-xs sm:text-sm text-brown-700 min-w-0">
                  <Cpu className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0 text-brown-400" />
                  <span className="truncate">{tech}</span>
                </div>
              ))}
              {project.tags?.slice(0, 2).map((tag) => (
                <div key={tag} className="flex items-center gap-1.5 text-xs sm:text-sm text-brown-700 min-w-0">
                  <Tag className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0 text-brown-400" />
                  <span className="truncate">{tag}</span>
                </div>
              ))}
            </div>

            {/* Meta info - hidden on smallest screens */}
            <div className="hidden sm:flex items-center gap-4 text-xs text-brown-500 pt-3 border-t border-brown-100">
              <span>Updated: {formatDate(project.updatedAt)}</span>
            </div>
          </div>

          {/* ── Actions Section ── */}
          <div className="flex md:flex-col items-center justify-between gap-3 p-4 sm:p-5 border-t md:border-t-0 md:border-l border-brown-100 bg-brown-50/50 md:w-auto lg:w-52">
            
            {/* Action Icons Row */}
            <div className="flex items-center gap-2 md:self-end">
              <button
                onClick={handleWishlistToggle}
                title={displayedWishlisted ? 'Remove from favorites' : 'Add to favorites'}
                className={`p-2 rounded-lg transition-all ${
                  displayedWishlisted
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'text-brown-500 hover:text-red-500 hover:bg-red-50'
                } ${wishlistActionLoading ? 'opacity-70 cursor-wait' : ''}`}
              >
                <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${displayedWishlisted ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleBookmarkClick}
                disabled={isRemoving}
                title={
                  isRemoving
                    ? 'Removing from collection...'
                    : isBookmarked
                    ? 'Remove from collection'
                    : isAuthenticated
                    ? 'Add to collection'
                    : 'Login to add to collection'
                }
                className={`p-2 rounded-lg transition-all ${
                  isBookmarked
                    ? 'bg-brown-700 text-white hover:bg-brown-800'
                    : 'text-brown-500 hover:text-brown-700 hover:bg-brown-100'
                } ${isRemoving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRemoving ? (
                  <div className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Bookmark className={`h-4 w-4 sm:h-5 sm:w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                )}
              </button>
            </div>

            {/* Price & Rating */}
            <div className="flex-1 flex md:flex-col items-center justify-between md:justify-start gap-3 md:gap-2">
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-extrabold text-brown-900 leading-none">
                  {formatPrice(project.price)}
                </div>
                {project.discountPrice && (
                  <div className="text-xs text-brown-500 line-through">
                    ${project.discountPrice}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-0.5">
                  {renderStars(project.rating || 0)}
                </div>
                <div className="text-xs text-brown-600 whitespace-nowrap">
                  ({project.totalReviews || 0}) • {project.salesCount || 0} sales
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
              <button
                onClick={handleAddToCart}
                className="flex-1 md:w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-brown-700 px-3 py-2 text-xs sm:text-sm font-bold text-white hover:bg-brown-800 transition-all shadow-sm"
              >
                <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Add to Cart</span>
              </button>
              <button
                onClick={handleLivePreview}
                className="flex-1 md:w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-brown-300 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-brown-700 hover:bg-brown-50 transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Preview</span>
              </button>
            </div>
          </div>
        </div>
      </article>
      
      {showCollectionModal && (
        <AddToCollectionModal 
          project={project} 
          open={showCollectionModal} 
          onClose={handleModalClose} 
        />
      )}
    </>
  );
}