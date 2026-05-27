'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { toggleWishlist } from '@/store/slices/wishlistSlice';
import { Project } from '@/services/projects.api';
import { formatPrice } from '@/utils/formatters';
import { Heart, ShieldCheck, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

interface PricingCardProps {
  project: Project;
}

export default function PricingCard({ project }: PricingCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  
  const inWishlist = wishlistItems.some((item) => item._id === project._id);

  const handleWishlistClick = () => {
    dispatch(toggleWishlist(project._id));
  };

  const handleBuyNow = () => {
    window.location.href = `/checkout?projectId=${project._id}`;
  };

  // Determine Stock Status
  const getStockStatus = () => {
    const stock = project.stock !== undefined ? project.stock : -1;
    if (stock === 0) {
      return { label: 'Out of Stock', color: 'bg-red-50 text-red-700 border-red-100', inStock: false };
    }
    if (stock > 0 && stock <= 5) {
      return { label: `Only ${stock} left!`, color: 'bg-amber-50 text-amber-800 border-amber-100 animate-pulse', inStock: true };
    }
    return { label: 'In Stock', color: 'bg-emerald-50 text-emerald-800 border-emerald-100', inStock: true };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xl space-y-6 lg:sticky lg:top-24 transition-all duration-300 hover:shadow-2xl">
      {/* Price tag */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-3">
          {project.discountPrice !== undefined && project.discountPrice > 0 ? (
            <>
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {formatPrice(project.discountPrice)}
              </span>
              <span className="text-lg font-medium text-gray-400 line-through">
                {formatPrice(project.price)}
              </span>
              {project.discountPercentage !== undefined && project.discountPercentage > 0 && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-extrabold bg-red-100 text-red-800 uppercase tracking-wider">
                  {project.discountPercentage}% OFF
                </span>
              )}
            </>
          ) : (
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {formatPrice(project.price)}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase">One-time payment</p>
      </div>

      {/* Stock Status Badge */}
      <div className="flex items-center justify-between border-b border-gray-50 pb-4">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stock Status</span>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${stockStatus.color}`}>
          <CheckCircle2 size={12} />
          {stockStatus.label}
        </span>
      </div>

      {/* Call to Actions */}
      <div className="space-y-3">
        <button
          onClick={handleBuyNow}
          disabled={!stockStatus.inStock}
          className="w-full bg-brown-700 hover:bg-brown-800 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <Zap size={18} className="fill-white" />
          Buy Now
        </button>

        {/* Wishlist Button Only */}
        <button
          onClick={handleWishlistClick}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`w-full border rounded-xl flex items-center justify-center gap-2 py-3.5 px-4 transition-all cursor-pointer ${
            inWishlist
              ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
              : 'bg-white border-gray-200 text-gray-600 hover:text-gray-800 hover:border-gray-300'
          }`}
        >
          <Heart size={18} className={inWishlist ? 'fill-red-500' : ''} />
          <span className="text-sm font-semibold">
            {inWishlist ? 'Remove from Favorites' : 'Add to Favorites'}
          </span>
        </button>
      </div>

      {/* Social Proof Stats */}
      <div className="grid grid-cols-2 gap-4 py-4 px-3 bg-gray-50/50 rounded-2xl border border-gray-100/50 text-center text-xs">
        <div>
          <p className="font-extrabold text-gray-900 text-lg leading-tight">
            {(project.salesCount || 0).toLocaleString()}
          </p>
          <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mt-0.5">Total Sales</p>
        </div>
        <div className="border-l border-gray-100">
          <p className="font-extrabold text-gray-900 text-lg leading-tight">
            {(project.favoritesCount + (inWishlist ? 1 : 0)).toLocaleString()}
          </p>
          <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mt-0.5">Favorites</p>
        </div>
      </div>

      {/* Trust Badges / Safe Check */}
      <div className="space-y-3 pt-2 text-xs font-semibold text-gray-500">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-brown-600" />
          <span>100% Secure Checkout</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-brown-600" />
          <span>Quality Verified by ProjectHive</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-brown-600" />
          <span>Instant Download After Purchase</span>
        </div>
      </div>
    </div>
  );
}