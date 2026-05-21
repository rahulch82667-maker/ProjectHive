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
      // Optionally show a login prompt or redirect
      console.log('Please login to add to collections');
      return;
    }
    
    // If project is already bookmarked (in a collection), remove it
    if (isBookmarked) {
      setIsRemoving(true);
      try {
        // Find which collection contains this project
        const collectionContainingProject = collections.find(collection => 
          collection.projects.includes(project._id)
        );
        
        if (collectionContainingProject) {
          await dispatch(removeProjectFromCollection({ 
            collectionId: collectionContainingProject._id, 
            projectId: project._id 
          })).unwrap();
          setIsBookmarked(false);
          // Refresh collections to update the state
          dispatch(fetchCollections());
        }
      } catch (err: any) {
        console.error('Failed to remove project from collection:', err);
      } finally {
        setIsRemoving(false);
      }
    } else {
      // If not bookmarked, open modal to add to collection
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

  // Render filled + half + empty stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      const filled = i < Math.floor(rating);
      const half = !filled && i < rating;
      return (
        <span key={i} className="relative inline-block text-[#e8a015]">
          <Star className="h-3.5 w-3.5 text-[#d4b896]" />
          {(filled || half) && (
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: half ? '55%' : '100%' }}
            >
              <Star className="h-3.5 w-3.5 fill-current text-[#e8a015]" />
            </span>
          )}
        </span>
      );
    });
  };

  const displayImage = project.thumbnail || null;

  const handleModalClose = () => {
    setShowCollectionModal(false);
    // Refresh collections to update bookmark status
    if (isAuthenticated) {
      dispatch(fetchCollections());
    }
  };

  return (
    <>
      <article className="group relative flex flex-col lg:flex-row bg-white border border-[#e8ddd4] rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-[#c8a882] transition-all duration-300">

        {/* ── Left thumbnail block ─────────────────────────────── */}
        <div className="relative flex-shrink-0 w-full sm:h-64 lg:h-auto lg:w-64 xl:w-72 overflow-hidden bg-[#f0ebe4]">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 288px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg className="h-14 w-14 text-[#c8a882]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* ── Middle content block ─────────────────────────────── */}
        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 min-w-0">

          {/* Title + category */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#8d6e63]">
                {project.category?.replace(/-/g, ' ')}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[#3e2723] leading-snug mb-1 line-clamp-2 group-hover:text-[#5d4037] transition-colors">
              {project.title}
            </h3>

            <p className="text-xs sm:text-sm text-[#795548] leading-relaxed line-clamp-3 mb-3">
              {project.shortDescription}
            </p>

            {/* Tech / tags bullets — ThemeForest-style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mb-4">
              {project.technologies?.slice(0, 3).map((tech) => (
                <div key={tech} className="flex items-center gap-2 text-xs sm:text-sm text-[#6d4c41] min-w-0">
                  <Cpu className="h-3 w-3 flex-shrink-0 text-[#a1887f]" />
                  <span className="truncate">{tech}</span>
                </div>
              ))}
              {project.tags?.slice(0, 2).map((tag) => (
                <div key={tag} className="flex items-center gap-2 text-xs sm:text-sm text-[#6d4c41] min-w-0">
                  <Tag className="h-3 w-3 flex-shrink-0 text-[#a1887f]" />
                  <span className="truncate">{tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom meta row - hidden on mobile, shown on desktop */}
          <div className="hidden sm:flex items-center gap-4 text-xs text-[#8d6e63] pt-3 border-t border-[#efebe9]">
            <span>Last updated: {formatDate(project.updatedAt)}</span>
          </div>
        </div>

        {/* ── Right pricing + actions block ─────────────────────── */}
        <div className="flex flex-row lg:flex-col items-center justify-between border-t lg:border-t-0 lg:border-l border-[#efebe9] bg-[#faf8f6] p-4 sm:p-5 lg:w-44 lg:px-6 lg:py-5 gap-4 lg:gap-0">
          
          {/* Wishlist + Bookmark icons */}
          <div className="flex items-center gap-2 lg:self-end lg:mb-3">
            <button
              onClick={handleWishlistToggle}
              title={displayedWishlisted ? 'Remove from favorites' : 'Add to favorites'}
              className={`p-1.5 rounded-lg transition-all ${
                displayedWishlisted
                  ? 'bg-red-500 text-white'
                  : 'text-[#a1887f] hover:text-red-500 hover:bg-red-50'
              } ${wishlistActionLoading ? 'opacity-70 cursor-wait' : ''}`}
            >
              <Heart className={`h-4 w-4 ${displayedWishlisted ? 'fill-current' : ''}`} />
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
              className={`p-1.5 rounded-lg transition-all ${
                isBookmarked
                  ? 'bg-brown-700 text-white hover:bg-brown-800'
                  : 'text-[#a1887f] hover:text-brown-700 hover:bg-brown-50'
              } ${isRemoving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRemoving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              )}
            </button>
          </div>

          {/* Price + Rating Container - Horizontal on mobile/tablet */}
          <div className="flex-1 flex lg:flex-col items-center justify-between lg:justify-start gap-4 lg:gap-0">
            {/* Price */}
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-extrabold text-[#3e2723] leading-none">
                {formatPrice(project.price)}
              </div>
              {project.discountPrice ? (
                <div className="mt-0.5 text-xs text-[#a1887f] line-through">
                  ${project.discountPrice}
                </div>
              ) : null}
            </div>

            {/* Star rating - Hidden meta row shown on mobile */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-0.5">
                {renderStars(project.rating || 0)}
              </div>
              <div className="text-xs text-[#8d6e63] whitespace-nowrap">
                ({project.totalReviews || 0}) • {project.salesCount || 0} Sales
              </div>
            </div>
          </div>

          {/* CTA Buttons - Only Cart and Live Preview now */}
          <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto">
            <button
              onClick={handleAddToCart}
              className="flex flex-1 lg:w-full items-center justify-center gap-1.5 rounded-lg border border-[#5d4037] bg-[#5d4037] px-3 py-2 text-xs font-bold text-white hover:bg-[#4e342e] transition-colors shadow-sm"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add to Cart</span>
              <span className="sm:hidden">Cart</span>
            </button>
            <button
              onClick={handleLivePreview}
              className="flex flex-1 lg:w-full items-center justify-center gap-1.5 rounded-lg border border-[#c8a882] bg-transparent px-3 py-2 text-xs font-bold text-[#5d4037] hover:bg-[#efebe9] transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Live Preview</span>
              <span className="sm:hidden">Preview</span>
            </button>
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