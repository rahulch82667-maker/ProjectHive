import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { formatRating } from '@/utils/formatters';

interface ReviewsSummaryProps {
  rating: number;
  totalReviews: number;
}

export default function ReviewsSummary({ rating, totalReviews }: ReviewsSummaryProps) {
  // Let's create an elegant placeholder breakdown for stars
  // In a real application, these counts would come from the backend.
  const breakdown = [
    { stars: 5, percentage: totalReviews > 0 ? 70 : 0, count: Math.round(totalReviews * 0.7) },
    { stars: 4, percentage: totalReviews > 0 ? 15 : 0, count: Math.round(totalReviews * 0.15) },
    { stars: 3, percentage: totalReviews > 0 ? 10 : 0, count: Math.round(totalReviews * 0.1) },
    { stars: 2, percentage: totalReviews > 0 ? 3 : 0, count: Math.round(totalReviews * 0.03) },
    { stars: 1, percentage: totalReviews > 0 ? 2 : 0, count: Math.round(totalReviews * 0.02) },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
        <MessageSquare className="text-brown-700" size={20} />
        <h2 className="text-lg font-bold text-gray-900">Customer Reviews</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Left Column: Big score */}
        <div className="text-center md:border-r md:border-gray-100 md:pr-8 py-4 space-y-2">
          <p className="text-5xl font-extrabold text-gray-900 tracking-tight leading-none">
            {formatRating(rating)}
          </p>
          <div className="flex items-center justify-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={18}
                className={
                  s <= Math.round(rating)
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-gray-200'
                }
              />
            ))}
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Based on {totalReviews.toLocaleString()} ratings
          </p>
        </div>

        {/* Middle Column: Star bars */}
        <div className="md:col-span-2 space-y-2.5">
          {breakdown.map((row) => (
            <div key={row.stars} className="flex items-center gap-4 text-sm font-semibold text-gray-600">
              <span className="w-3 flex-shrink-0 text-right">{row.stars}</span>
              <Star size={14} className="text-amber-500 fill-amber-500 flex-shrink-0" />
              <div className="flex-grow bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${row.percentage}%` }}
                />
              </div>
              <span className="w-12 text-right text-xs font-bold text-gray-400">
                {row.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {totalReviews === 0 && (
        <div className="text-center py-6 text-sm text-gray-400 font-medium bg-gray-50/50 border border-dashed border-gray-200 rounded-xl">
          No reviews yet. Purchase this template to leave feedback!
        </div>
      )}
    </div>
  );
}
