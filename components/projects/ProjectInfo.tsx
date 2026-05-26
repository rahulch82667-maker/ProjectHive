import React from 'react';
import { Star, StarHalf, Tag, Calendar, Database, Sparkles, FolderOpen } from 'lucide-react';
import { formatDate, formatRating } from '@/utils/formatters';

interface ProjectInfoProps {
  title: string;
  shortDescription: string;
  category: string;
  tags: string[];
  rating: number;
  totalReviews: number;
  salesCount: number;
  version?: string;
  fileSize?: string;
  createdAt: string;
}

export default function ProjectInfo({
  title,
  shortDescription,
  category,
  tags,
  rating,
  totalReviews,
  salesCount,
  version,
  fileSize,
  createdAt,
}: ProjectInfoProps) {
  // Render star ratings beautifully
  const renderStars = (ratingValue: number) => {
    const stars = [];
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 >= 0.25 && ratingValue % 1 < 0.75;
    const roundedFullStars = ratingValue % 1 >= 0.75 ? fullStars + 1 : fullStars;

    for (let i = 1; i <= 5; i++) {
      if (i <= roundedFullStars) {
        stars.push(
          <Star key={i} size={16} className="text-amber-500 fill-amber-500 flex-shrink-0 animate-in zoom-in-50 duration-300" />
        );
      } else if (i === roundedFullStars + 1 && hasHalfStar) {
        stars.push(
          <StarHalf key={i} size={16} className="text-amber-500 fill-amber-500 flex-shrink-0" />
        );
      } else {
        stars.push(
          <Star key={i} size={16} className="text-gray-300 flex-shrink-0" />
        );
      }
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6 animate-fade-in-up">
      {/* Category Badge & Top Meta */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-brown-50 text-brown-800 tracking-wide uppercase border border-brown-100">
          <FolderOpen size={12} />
          {category}
        </span>
        <div className="flex items-center gap-1 text-sm font-semibold text-gray-500">
          <span>{salesCount.toLocaleString()} sales</span>
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-base text-gray-600 leading-relaxed max-w-3xl font-medium">
          {shortDescription}
        </p>
      </div>

      {/* Ratings & Reviews */}
      <div className="flex flex-wrap items-center gap-4 py-3 border-y border-gray-50">
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-gray-900 leading-none">
            {formatRating(rating)}
          </span>
          <div className="flex items-center gap-0.5">
            {renderStars(rating)}
          </div>
        </div>
        <span className="text-sm font-medium text-gray-500">
          ({totalReviews} verified reviews)
        </span>
      </div>

      {/* Tech Specifications / Details */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
        {version && (
          <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-brown-200 transition-colors">
            <Sparkles className="text-brown-500 flex-shrink-0" size={18} />
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Version</p>
              <p className="text-sm font-bold text-gray-800">{version}</p>
            </div>
          </div>
        )}
        
        {fileSize && (
          <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-brown-200 transition-colors">
            <Database className="text-brown-500 flex-shrink-0" size={18} />
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">File Size</p>
              <p className="text-sm font-bold text-gray-800">{fileSize}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-brown-200 transition-colors col-span-2 sm:col-span-1">
          <Calendar className="text-brown-500 flex-shrink-0" size={18} />
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Released</p>
            <p className="text-sm font-bold text-gray-800">{formatDate(createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Tags strip */}
      {tags && tags.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tags</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100/80 hover:bg-gray-200/80 text-gray-600 transition-colors cursor-pointer select-none border border-gray-200/50"
              >
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
