
import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SortChipProps {
  id: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  order: 'asc' | 'desc';
  onClick: (id: string) => void;
  tooltip?: string;
}

const SortChip: React.FC<SortChipProps> = ({
  id, label, icon: Icon, isActive, order, onClick, tooltip
}) => {
  return (
    <div className="relative group">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onClick(id)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${isActive
            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-105'
            : 'bg-white dark:bg-slate-900 border-border-color text-muted hover:border-primary/30 hover:text-foreground shadow-sm'
          }`}
      >
        <Icon size={14} className={isActive ? 'text-white' : 'text-primary'} />
        {label}
        {isActive && (
          <div className="flex items-center gap-1 border-l border-white/20 pl-2 ml-1">
            {order === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            <Check size={12} />
          </div>
        )}
      </motion.button>

      {/* Basic Tooltip */}
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
};

export default SortChip;
