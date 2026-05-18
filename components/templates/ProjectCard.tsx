'use client';

import { useState } from 'react';
import { Heart, Bookmark, Eye, ShoppingCart, Star } from 'lucide-react';
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

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

  const handleViewReviews = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('View reviews:', project._id);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-row h-48 w-full max-w-full group">
      {/* Project Image - Left side */}
      <div className="relative w-56 h-full flex-shrink-0 bg-gray-100 overflow-hidden">
        {project.images && project.images.length > 0 ? (
          <Image
            src={project.images[0]}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-300">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-1.5 z-10">
          <button
            onClick={handleFavorite}
            className={`p-1.5 rounded-full transition-all shadow-sm ${
              isFavorited
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white/90 backdrop-blur-md text-gray-700 hover:text-red-500 hover:bg-white'
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleBookmark}
            className={`p-1.5 rounded-full transition-all shadow-sm ${
              isBookmarked
                ? 'bg-gray-700 text-white hover:bg-gray-800'
                : 'bg-white/90 backdrop-blur-md text-gray-700 hover:text-gray-900 hover:bg-white'
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Project Content - Right side */}
      <div className="flex-1 p-5 flex flex-col overflow-hidden min-w-0">
        {/* Title and Price */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900 truncate flex-1 mr-3" title={project.title}>
            {project.title}
          </h3>
          <span className="text-xl font-bold text-gray-900 whitespace-nowrap">
            {formatPrice(project.price)}
          </span>
        </div>

        {/* Short Description */}
        <p className="text-gray-600 text-sm mb-3 leading-relaxed line-clamp-2">
          {project.shortDescription}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-current text-amber-500" />
            <span className="font-semibold text-gray-800">{project.rating || 0}</span>
          </div>
          <button
            onClick={handleViewReviews}
            className="hover:text-gray-800 transition-colors"
          >
            ({project.totalReviews || 0} reviews)
          </button>
          <div className="flex items-center gap-1.5">
            <ShoppingCart className="h-4 w-4 text-gray-500" />
            <span>{project.salesCount || 0} sales</span>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-gray-400 mb-4">
          Updated {formatDate(project.updatedAt)}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-auto">
          <button
            onClick={handleLivePreview}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-4 py-2 rounded-lg transition-all text-sm font-medium"
          >
            <Eye className="h-4 w-4" />
            Live Preview
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}