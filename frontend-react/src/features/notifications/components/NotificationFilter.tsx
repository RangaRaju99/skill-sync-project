
import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Star, Calendar, Settings } from 'lucide-react';

export type NotificationCategory = 'all' | 'important' | 'activity' | 'system';

interface NotificationFilterProps {
  activeCategory: NotificationCategory;
  onCategoryChange: (cat: NotificationCategory) => void;
  counts: Record<NotificationCategory, number>;
}

const NotificationFilter: React.FC<NotificationFilterProps> = ({ 
  activeCategory, 
  onCategoryChange, 
  counts 
}) => {
  const tabs = [
    { id: 'all', label: 'All', icon: <LayoutGrid size={14} />, color: 'primary' },
    { id: 'important', label: 'Important', icon: <Star size={14} />, color: 'red-500' },
    { id: 'activity', label: 'Activity', icon: <Calendar size={14} />, color: 'amber-500' },
    { id: 'system', label: 'System', icon: <Settings size={14} />, color: 'slate-500' }
  ];

  return (
    <div className="flex gap-4 mb-16 overflow-x-auto thin-scrollbar pb-2">
      {tabs.map((tab, idx) => (
        <motion.button
          key={tab.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          onClick={() => onCategoryChange(tab.id as NotificationCategory)}
          className={`flex items-center gap-4 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap shadow-xl shadow-primary/5 active:scale-95 ${
            activeCategory === tab.id 
              ? 'bg-foreground dark:bg-white text-background dark:text-slate-900 shadow-primary/20 scale-105' 
              : 'bg-surface/50 text-muted-foreground/50 border border-border-color hover:text-foreground hover:bg-surface'
          }`}
        >
          <span className={activeCategory === tab.id ? 'text-primary' : 'opacity-40'}>
            {tab.icon}
          </span>
          {tab.label}
          <span className={`px-2 py-0.5 rounded-md ${
            activeCategory === tab.id 
              ? 'bg-primary/20 text-primary' 
              : 'bg-slate-500/10 text-muted-foreground/30'
          }`}>
            {counts[tab.id as NotificationCategory]}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default NotificationFilter;
