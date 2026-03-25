import React from 'react';

const ProductCardSkeleton = () => {
  return (
    <div className="glass-card p-4 flex flex-col space-y-4 animate-pulse h-full">
      {/* Image Skeleton */}
      <div className="relative aspect-square bg-gray-200 rounded-lg"></div>
      
      {/* Title Skeleton */}
      <div className="space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      
      {/* Rating Skeleton */}
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="w-4 h-4 bg-gray-200 rounded-full"></div>
          ))}
        </div>
        <div className="h-4 bg-gray-200 rounded w-8"></div>
      </div>
      
      {/* Price & Badge Skeleton */}
      <div className="flex justify-between items-center pt-2">
        <div className="h-7 bg-gray-200 rounded w-20"></div>
        <div className="h-6 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
};

export const ProductSliderSkeleton = () => {
  return (
    <div className="flex space-x-4 overflow-hidden pb-4">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="shrink-0 w-[280px] sm:w-80">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
};

export default ProductCardSkeleton;
