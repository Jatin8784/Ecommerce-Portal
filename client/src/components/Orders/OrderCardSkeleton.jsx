import React from 'react';

const OrderCardSkeleton = () => {
  return (
    <div className="glass-card p-6 animate-pulse space-y-6">
      {/* Order Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="text-right space-y-1">
            <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
            <div className="h-7 bg-gray-200 rounded w-20 ml-auto"></div>
          </div>
        </div>
      </div>

      {/* Order Items Skeleton */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 bg-secondary/30 rounded-lg">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>

      {/* Actions Skeleton */}
      <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border/20">
        {[1, 2].map((i) => (
          <div key={i} className="h-9 bg-gray-200 rounded-lg w-28"></div>
        ))}
      </div>
    </div>
  );
};

export default OrderCardSkeleton;
