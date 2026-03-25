import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * DashboardPagination - A premium, glassmorphic pagination component for the Admin Dashboard.
 * 
 * @param {number} page - Current active page number.
 * @param {number} maxPage - Total number of pages available.
 * @param {function} setPage - Function to update the current page.
 */
const DashboardPagination = ({ page, maxPage, setPage }) => {
  if (maxPage <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-8 pb-8">
      {/* Previous Button */}
      <button
        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        disabled={page === 1}
        className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-semibold shadow-sm text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page Info */}
      <div className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500/10 to-primary/10 dark:from-blue-500/5 dark:to-primary/5 border border-primary/20 dark:border-primary/10 rounded-xl font-bold text-primary shadow-inner backdrop-blur-md">
        <span className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mr-1">Page</span>
        <span className="text-lg">{page}</span>
        <span className="text-gray-400 dark:text-gray-600 font-normal mx-1">/</span>
        <span className="text-lg font-medium text-gray-600 dark:text-gray-400">{maxPage}</span>
      </div>

      {/* Next Button */}
      <button
        onClick={() => setPage((prev) => Math.min(prev + 1, maxPage))}
        disabled={page === maxPage}
        className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-semibold shadow-sm text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed group"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};

export default DashboardPagination;
