import React from 'react';

const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700/50 rounded ${className}`}></div>
  );
};

export const TableRowSkeleton = ({ columns }) => {
  return (
    <tr className="border-t dark:border-gray-800">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
};

export const OrderCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-[#1a1c23] shadow-lg rounded-lg p-6 mb-6 border border-gray-100 dark:border-gray-800">
      <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
        <div className="space-y-2 w-full max-w-xs">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-2 mb-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-60" />
        <Skeleton className="h-4 w-50" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="flex gap-4">
          <Skeleton className="w-16 h-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
