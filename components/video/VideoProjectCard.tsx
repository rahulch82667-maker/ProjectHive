'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Heart, Bookmark, Star,  ExternalLink, Tag, Play, Pause } from 'lucide-react';
import Image from 'next/image';
import AddToCollectionModal from '@/components/collections/AddToCollectionModal';
import IframePreviewModal from '@/components/ui/IframePreviewModal';
import { useAuth } from '@/hooks/useAuth';
import { Project } from '@/services/projects.api';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchCollections, removeProjectFromCollection } from '@/store/slices/collectionsSlice';
import { toggleWishlist } from '@/store/slices/wishlistSlice';

interface VideoProjectCardProps {
  project: Project;
}

export default function VideoProjectCard({ project }: VideoProjectCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [optimisticWishlist, setOptimisticWishlist] = useState<boolean | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { isAuthenticated } = useAuth();
  
  const { collections } = useSelector((state: RootState) => state.collections);
  const { items: wishlistItems, actionLoading: wishlistActionLoading } = useSelector(
    (state: RootState) => state.wishlist
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isNearScreen, setIsNearScreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsNearScreen(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

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

  const formatPrice = (price: number) =>
    price === 0 ? 'Free' : `$${price}`;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    e.stopPropagation();
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
    e.stopPropagation();
    setShowPreviewModal(true);
  };

  const handleModalClose = () => {
    setShowCollectionModal(false);
    if (isAuthenticated) {
      dispatch(fetchCollections());
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      const filled = i < Math.floor(rating);
      const half = !filled && i < rating;
      return (
        <span key={i} className="relative inline-block text-amber-500">
          <Star className="h-3 w-3 text-brown-200" />
          {(filled || half) && (
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: half ? '55%' : '100%' }}
            >
              <Star className="h-3 w-3 fill-current text-amber-500" />
            </span>
          )}
        </span>
      );
    });
  };

  const handleMouseEnter = async () => {
    if (videoRef.current && !isPlaying) {
      setIsVideoLoading(true);
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Video play was interrupted or blocked:', err);
      } finally {
        setIsVideoLoading(false);
      }
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <>
      <article 
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group flex flex-col bg-white border border-brown-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-brown-300 transition-all duration-300 transform hover:-translate-y-1"
      >
        {/* ── Top video/thumbnail container (16:9) ───────────────── */}
        <Link href={`/projects/${project.slug}`} className="block">
          <div className="relative aspect-video w-full bg-brown-50 overflow-hidden select-none cursor-pointer">
            {isNearScreen && project.demoVideo ? (
              <>
                <video
                  ref={videoRef}
                  src={project.demoVideo}
                  poster={project.thumbnail}
                  preload="none"
                  muted
                  playsInline
                  loop
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    isPlaying ? 'opacity-100' : 'opacity-90'
                  }`}
                />
                {/* Playback Indicators */}
                {!isPlaying && !isVideoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors pointer-events-none">
                    <div className="bg-white/95 text-brown-900 p-3 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      <Play className="h-5 w-5 fill-current text-brown-700" />
                    </div>
                  </div>
                )}
                {isVideoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] pointer-events-none">
                    <div className="h-8 w-8 rounded-full border-2 border-brown-200 border-t-brown-700 animate-spin" />
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-md font-medium tracking-wider uppercase pointer-events-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    Preview
                  </div>
                )}
              </>
            ) : (
              // static poster if not near screen
              project.thumbnail ? (
                <Image
                  src={project.thumbnail}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <svg className="h-12 w-12 text-brown-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              )
            )}
          </div>
        </Link>

        {/* ── Card Content ─────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col justify-between p-4 min-w-0 bg-white">
          <div className="mb-3">
            {/* Category */}
            <Link href={`/projects/${project.slug}`}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-brown-500 mb-1 hover:text-brown-700 transition-colors">
                {project.category?.replace(/-/g, ' ')}
              </div>
            </Link>

            {/* Title */}
            <Link href={`/projects/${project.slug}`}>
              <h3 className="text-sm sm:text-base font-bold text-brown-900 leading-snug line-clamp-1 group-hover:text-brown-700 transition-colors hover:text-brown-700">
                {project.title}
              </h3>
            </Link>

            {/* Short Description */}
            <Link href={`/projects/${project.slug}`}>
              <p className="text-xs text-brown-600 line-clamp-2 mt-1 mb-2 leading-relaxed hover:text-brown-700 transition-colors">
                {project.shortDescription}
              </p>
            </Link>

            {/* Technologies / Tags */}
            <div className="flex flex-wrap gap-1">
              {project.tags?.slice(0, 3).map((tag) => (
                <span 
                  key={tag} 
                  className="inline-flex items-center gap-1 text-[10px] font-medium text-brown-600 bg-brown-50 px-2 py-0.5 rounded-md border border-brown-100/50"
                >
                  <Tag className="h-2.5 w-2.5 text-brown-300" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Pricing & rating block */}
          <Link href={`/projects/${project.slug}`}>
            <div className="pt-3 border-t border-brown-50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-brown-400 font-medium">Price</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base sm:text-lg font-black text-brown-900 leading-none">
                    {formatPrice(project.price)}
                  </span>
                  {project.discountPrice ? (
                    <span className="text-xs text-brown-300 line-through">
                      ${project.discountPrice}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Star rating */}
              <div className="flex flex-col items-end gap-0.5">
                <div className="flex items-center gap-0.5">
                  {renderStars(project.rating || 0)}
                </div>
                <span className="text-[10px] text-brown-500">
                  ({project.totalReviews || 0}) • {project.salesCount || 0} sales
                </span>
              </div>
            </div>
          </Link>

          {/* ── Actions Row ────────────────────────────────────────── */}
          <div className="mt-3 flex gap-2">
            {/* Wishlist & Collection Icon buttons */}
            <div className="flex gap-1.5">
              <button
                onClick={handleWishlistToggle}
                title={displayedWishlisted ? 'Remove from favorites' : 'Add to favorites'}
                className={`p-2 rounded-xl transition-all border ${
                  displayedWishlisted
                    ? 'bg-red-500 text-white border-red-500 shadow-sm shadow-red-100'
                    : 'text-brown-400 border-brown-100 hover:text-red-500 hover:bg-red-50/50 hover:border-red-100'
                } ${wishlistActionLoading ? 'opacity-70 cursor-wait' : ''}`}
              >
                <Heart className={`h-4 w-4 ${displayedWishlisted ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={handleBookmarkClick}
                disabled={isRemoving}
                title={
                  isRemoving
                    ? 'Removing...'
                    : isBookmarked
                    ? 'Remove from collection'
                    : isAuthenticated
                    ? 'Add to collection'
                    : 'Login to add to collection'
                }
                className={`p-2 rounded-xl transition-all border ${
                  isBookmarked
                    ? 'bg-brown-700 text-white border-brown-700 shadow-sm shadow-brown-100 hover:bg-brown-800'
                    : 'text-brown-400 border-brown-100 hover:text-brown-700 hover:bg-brown-50/50 hover:border-brown-200'
                } ${isRemoving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRemoving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                )}
              </button>
            </div>

            {/* Preview CTA buttons */}
            <div className="flex-1 flex gap-1.5">
              <button
                onClick={handleLivePreview}
                className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-brown-200 hover:border-brown-300 text-brown-700 hover:text-brown-800 text-xs font-bold transition-colors py-2"
              >
                <ExternalLink className="h-3 w-3" />
                Preview
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Reusable Iframe Preview Modal */}
      <IframePreviewModal
        isOpen={showPreviewModal}
        title={project.title}
        url={project.liveDemoLink}
        onClose={() => setShowPreviewModal(false)}
      />

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