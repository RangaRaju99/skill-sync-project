
import React from 'react';
import { SlidersHorizontal, ArrowDownWideNarrow, DollarSign, Award, Star } from 'lucide-react';

interface FilterBarProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
  availFilter: string;
  onAvailChange: (avail: string) => void;
  priceSort: string;
  onPriceSortChange: (sort: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  sortBy, 
  onSortChange, 
  availFilter, 
  onAvailChange,
  priceSort,
  onPriceSortChange
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-border-color">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-surface dark:bg-slate-800/50 rounded-xl border border-border-color text-xs font-black uppercase tracking-widest text-muted">
          <SlidersHorizontal size={14} />
          Filters
        </div>
        
        {/* Availability Toggle */}
        <select 
          value={availFilter}
          onChange={(e) => onAvailChange(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-border-color rounded-xl px-4 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
        >
          <option value="">All Availability</option>
          <option value="AVAILABLE">🟢 Available Now</option>
          <option value="BUSY">🟡 Busy</option>
        </select>

        {/* Price Filter */}
        <select 
          value={priceSort}
          onChange={(e) => onPriceSortChange(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-border-color rounded-xl px-4 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
        >
          <option value="">Price: Featured</option>
          <option value="low-to-high">Price: Low to High</option>
          <option value="high-to-low">Price: High to Low</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted mr-2">
          <ArrowDownWideNarrow size={14} />
          Sort by
        </div>
        
        <div className="flex bg-surface dark:bg-slate-800/50 p-1 rounded-xl border border-border-color">
          {[
            { id: 'rating', label: 'Rating', icon: Star },
            { id: 'experience', label: 'Experience', icon: Award },
            { id: 'price', label: 'Price', icon: DollarSign },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onSortChange(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                sortBy === item.id 
                  ? 'bg-white dark:bg-slate-900 shadow-sm text-primary' 
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <item.icon size={12} />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
