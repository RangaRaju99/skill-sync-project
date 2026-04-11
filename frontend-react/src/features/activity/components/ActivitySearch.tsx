
import React from 'react';
import { Search, LayoutGrid, Award, User, Zap } from 'lucide-react';
import type { ActivityType } from './ActivityItem';

interface ActivitySearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  activeFilter: string;
  onFilterChange: (f: string) => void;
}

const ActivitySearch: React.FC<ActivitySearchProps> = ({ query, onQueryChange, activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'All', icon: <LayoutGrid size={14} /> },
    { id: 'achievements', label: 'Achievements', icon: <Award size={14} /> },
    { id: 'profile', label: 'Profile', icon: <User size={14} /> },
    { id: 'activity', label: 'Activity', icon: <Zap size={14} /> }
  ];

  return (
    <div className="space-y-12 mb-16 relative z-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
        {/* Search Bar */}
        <div className="relative flex-1 group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
          <input 
            type="text" 
            placeholder="Search your journey..." 
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full bg-surface/50 border border-border-color rounded-[32px] py-6 pl-16 pr-8 text-sm font-black focus:outline-none focus:ring-4 focus:ring-primary/10 hover:border-primary/20 transition-all placeholder:text-muted-foreground/30 placeholder:italic"
          />
        </div>

        {/* Smart Filters (Step 15 Only in History) */}
        <div className="flex flex-wrap items-center gap-3 p-2 bg-surface/50 border border-border-color rounded-[40px] shadow-sm">
           {filters.map(f => (
             <button
               key={f.id}
               onClick={() => onFilterChange(f.id)}
               className={`px-8 py-4 rounded-[28px] text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 transition-all duration-300 ${
                 activeFilter === f.id 
                 ? 'bg-primary text-white shadow-xl shadow-primary/20 translate-y-[-2px]' 
                 : 'text-muted-foreground hover:bg-surface-dark/50 hover:text-foreground'
               }`}
             >
                {f.icon}
                {f.label}
             </button>
           ))}
        </div>
      </div>

      {/* Quick Navigation (Step 13) */}
      <div className="flex items-center gap-6 px-4">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">Jump To:</p>
        <div className="flex items-center gap-2">
           {['Today', 'This Week', 'This Month'].map(time => (
             <button 
               key={time}
               className="px-5 py-2.5 rounded-xl border border-border-color hover:border-primary/20 hover:text-primary text-[9px] font-black uppercase tracking-widest transition-all hover:bg-primary/5 active:scale-95"
             >
               {time}
             </button>
           ))}
        </div>
      </div>
    </div>
  );
};

export default ActivitySearch;
