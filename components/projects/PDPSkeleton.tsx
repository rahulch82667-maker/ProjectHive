import React from 'react';

export default function PDPSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb skeleton */}
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-6 animate-pulse" />

        {/* Hero Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Column Skeletons */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery Skeleton */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
              <div className="aspect-video bg-gray-200 rounded-xl animate-pulse" />
              <div className="flex gap-3 overflow-x-auto py-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 w-24 bg-gray-200 rounded-lg flex-shrink-0 animate-pulse" />
                ))}
              </div>
            </div>

            {/* Info Skeleton */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
              
              <div className="flex gap-2 pt-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                ))}
              </div>
            </div>

            {/* Tabs content mock skeleton */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Sidebar Pricing Card Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg space-y-6 sticky top-24">
              <div className="flex justify-between items-center">
                <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
                <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="space-y-3 pt-4">
                <div className="h-12 bg-gray-200 rounded-xl w-full animate-pulse" />
                <div className="h-12 bg-gray-200 rounded-xl w-full animate-pulse" />
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
