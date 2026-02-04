import React from 'react';

/**
 * Skeleton placeholder shown while lazy-loaded pages are loading.
 * Uses shimmer animation and block placeholders for a polished loading state.
 */
export default function PageSkeleton() {
  return (
    <div className="min-h-[60vh] bg-gray-950 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Title block */}
        <div className="h-9 w-48 sm:w-64 rounded-lg bg-gray-800/80 skeleton-shimmer" />
        {/* Subtitle */}
        <div className="h-4 w-full max-w-xl rounded bg-gray-800/60 skeleton-shimmer" />
        <div className="h-4 max-w-lg rounded bg-gray-800/50 skeleton-shimmer" />

        {/* Content blocks */}
        <div className="pt-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-4 flex-1 rounded bg-gray-800/60 skeleton-shimmer" />
              <div className="h-4 w-1/4 min-w-[80px] rounded bg-gray-800/40 skeleton-shimmer" />
            </div>
          ))}
        </div>

        {/* Card-style block */}
        <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900/50 p-6 space-y-4">
          <div className="h-5 w-32 rounded bg-gray-700/80 skeleton-shimmer" />
          <div className="h-4 w-full rounded bg-gray-800/50 skeleton-shimmer" />
          <div className="h-4 w-[90%] rounded bg-gray-800/40 skeleton-shimmer" />
          <div className="h-10 w-36 rounded-xl bg-gray-800/60 skeleton-shimmer mt-4" />
        </div>
      </div>
    </div>
  );
}
