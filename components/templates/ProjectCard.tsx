'use client';

import { useState } from 'react';
import { Heart, Bookmark, Star, ShoppingCart, ExternalLink, Tag, Cpu } from 'lucide-react';
import Image from 'next/image';
import { Project } from '@/services/projects.api';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
  };

  const formatPrice = (price: number) =>
    price === 0 ? 'Free' : `$${price}`;

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorited(!isFavorited);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsBookmarked(!isBookmarked);
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

  return (
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

      {/* ── Middle content block ─`───────────────────────────────` */}
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
            onClick={handleBookmark}
            title="Save"
            className={`p-1.5 rounded-lg transition-all ${
              isBookmarked
                ? 'bg-[#5d4037] text-white'
                : 'text-[#a1887f] hover:text-[#5d4037] hover:bg-[#efebe9]'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleFavorite}
            title="Wishlist"
            className={`p-1.5 rounded-lg transition-all ${
              isFavorited
                ? 'bg-red-500 text-white'
                : 'text-[#a1887f] hover:text-red-500 hover:bg-red-50'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
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

        {/* CTA Buttons */}
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
  );
}