
import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="flex bg-surface dark:bg-slate-800/50 p-1 rounded-2xl border border-border-color shadow-inner">
      <button
        onClick={() => onViewChange('grid')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
          view === 'grid' 
            ? 'bg-white dark:bg-slate-900 text-primary shadow-lg shadow-primary/10' 
            : 'text-muted hover:text-foreground'
        }`}
      >
        <LayoutGrid size={16} />
        <span className="hidden sm:inline">Grid</span>
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
          view === 'list' 
            ? 'bg-white dark:bg-slate-900 text-primary shadow-lg shadow-primary/10' 
            : 'text-muted hover:text-foreground'
        }`}
      >
        <List size={16} />
        <span className="hidden sm:inline">List</span>
      </button>
    </div>
  );
};

export default ViewToggle;
