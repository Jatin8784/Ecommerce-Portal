import React from "react";

const ProductDetailSkeleton = () => {
  return (
    <div className="min-h-screen pt-20 animate-pulse">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Skeleton */}
          <div>
            <div className="glass-card aspect-square w-full rounded-2xl mb-4 bg-white/5 shadow-xl border border-white/10" />
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-20 h-20 rounded-lg bg-white/5 border border-white/10" />
              ))}
            </div>
          </div>

          {/* Info Skeleton */}
          <div className="space-y-6">
            <div className="flex space-x-2">
              <div className="h-6 w-16 bg-white/10 rounded" />
              <div className="h-6 w-24 bg-white/10 rounded" />
            </div>
            <div className="h-10 w-3/4 bg-white/10 rounded-lg" />
            <div className="flex space-x-4">
              <div className="h-6 w-32 bg-white/10 rounded" />
              <div className="h-6 w-24 bg-white/10 rounded" />
            </div>
            <div className="h-8 w-24 bg-white/10 rounded" />
            <div className="h-6 w-48 bg-white/10 rounded" />
            
            <div className="glass-card p-6 space-y-6 border border-white/10 bg-white/5 shadow-inner">
              <div className="flex items-center space-x-4">
                <div className="h-6 w-24 bg-white/10 rounded" />
                <div className="h-10 w-32 bg-white/10 rounded-lg" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-12 bg-white/20 rounded-xl" />
                <div className="h-12 bg-white/20 rounded-xl" />
              </div>
              <div className="flex space-x-4">
                <div className="h-6 w-32 bg-white/10 rounded" />
                <div className="h-6 w-24 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="glass-panel overflow-hidden border border-white/10 bg-white/5">
          <div className="flex border-b border-white/10 overflow-x-auto">
            <div className="h-14 w-32 bg-white/10 border-r border-white/10" />
            <div className="h-14 w-32 bg-white/10" />
          </div>
          <div className="p-6 space-y-4">
            <div className="h-6 w-48 bg-white/10 rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-white/5 rounded" />
              <div className="h-4 w-full bg-white/5 rounded" />
              <div className="h-4 w-3/4 bg-white/5 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
