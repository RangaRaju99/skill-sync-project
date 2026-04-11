
import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-border-color shadow-xl animate-pulse">
      {/* Header Area */}
      <div className="h-40 bg-slate-200 dark:bg-slate-800 relative">
        <div className="absolute -bottom-10 left-6 w-24 h-24 rounded-3xl bg-slate-300 dark:bg-slate-700 border-4 border-white dark:border-slate-900" />
      </div>
      
      <div className="p-6 pt-12 space-y-4">
        {/* Title & Stats */}
        <div className="space-y-2">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4" />
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/2" />
        </div>
        
        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-16" />
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20" />
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-12" />
        </div>
        
        {/* Bio */}
        <div className="space-y-2 py-2">
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-5/6" />
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3" />
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl w-1/4" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
