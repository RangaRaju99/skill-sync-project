
import React, { useState } from 'react';
import { Flame, Star, Banknote, ShieldCheck, Users, Sparkles, Settings2, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import SortChip from './SortChip';
import AdvancedSortModal from './AdvancedSortModal';

interface SortBarProps {
  currentSort: string;
  currentOrder: 'asc' | 'desc';
  onSort: (key: string, order: 'asc' | 'desc') => void;
  isGroupedByAvailability: boolean;
  onToggleGrouping: () => void;
}

const SortBar: React.FC<SortBarProps> = ({
  currentSort,
  currentOrder,
  onSort,
  isGroupedByAvailability,
  onToggleGrouping
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const SORT_OPTIONS = [
    { id: 'featured', label: 'Featured', icon: Flame, tooltip: 'Default platform order' },
    { id: 'rating', label: 'Rating', icon: Star, tooltip: 'Highest rated mentors first' },
    { id: 'price', label: 'Price', icon: Banknote, tooltip: 'Affordability and value' },
    { id: 'experience', label: 'Experience', icon: ShieldCheck, tooltip: 'Industry veterans first' },
    { id: 'popular', label: 'Popular', icon: Users, tooltip: 'Most viewed by community' },
    { id: 'best-match', label: 'Best Match', icon: Sparkles, tooltip: 'Smart score: Rating + Exp + Students' },
  ];

  const handleChipClick = (id: string) => {
    if (id === 'featured') {
      onSort('featured', 'desc');
      return;
    }

    if (currentSort === id) {
      // Toggle order if clicking same chip
      onSort(id, currentOrder === 'desc' ? 'asc' : 'desc');
    } else {
      // New chip, default to DESC
      onSort(id, 'desc');
    }
  };

  const activeLabel = SORT_OPTIONS.find(o => o.id === currentSort)?.label || 'Advanced';
  const orderLabel = currentOrder === 'desc' ? 'High → Low' : 'Low → High';

  return (
    <div className="space-y-4 py-4 w-full">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Chips Container */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mr-2 shrink-0">Sort by:</p>
          <div className="flex items-center gap-2">
            {SORT_OPTIONS.map((option) => (
              <SortChip
                key={option.id}
                id={option.id}
                label={option.label}
                icon={option.icon}
                isActive={currentSort === option.id}
                order={currentOrder}
                onClick={handleChipClick}
                tooltip={option.tooltip}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-border-color mx-2 hidden sm:block" />

          {/* Advanced Trigger */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdvancedOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${currentSort === 'custom'
                ? 'bg-primary border-primary text-white'
                : 'bg-surface border-border-color text-muted hover:border-primary/40'
              }`}
          >
            <Settings2 size={14} />
            <span className="hidden sm:inline">Advanced</span>
          </motion.button>
        </div>

        {/* Grouping Toggle (Optional) */}
        <button
          onClick={onToggleGrouping}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${isGroupedByAvailability
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
              : 'bg-white dark:bg-slate-900 border-border-color text-muted group-hover:text-foreground'
            }`}
        >
          <div className={`w-2 h-2 rounded-full ${isGroupedByAvailability ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          Group By Availability
        </button>
      </div>

      {/* Dynamic Summary Label */}
      <div className="flex items-center gap-2 px-2">
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        <p className="text-xs font-bold text-foreground">
          Sorted by: <span className="text-primary">{activeLabel}</span>
          {currentSort !== 'featured' && (
            <span className="text-muted ml-1">({orderLabel})</span>
          )}
        </p>
        <div className="flex-1 h-px bg-border-color/50 ml-2" />
        <div className="flex items-center gap-1 group cursor-help">
          <Info size={12} className="text-muted group-hover:text-primary transition-colors" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted">Client-side Sort Active</span>
        </div>
      </div>

      <AdvancedSortModal
        isOpen={isAdvancedOpen}
        onClose={() => setIsAdvancedOpen(false)}
        sortKey={currentSort}
        sortOrder={currentOrder}
        onApply={(key, order) => {
          onSort(key, order);
          setIsAdvancedOpen(false);
        }}
      />
    </div>
  );
};

export default SortBar;
