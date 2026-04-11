
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ShowMoreToggleProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const ShowMoreToggle: React.FC<ShowMoreToggleProps> = ({ isExpanded, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="w-full py-3 flex items-center justify-center gap-2 group transition-all"
    >
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-primary transition-colors">
        {isExpanded ? 'Show Less ↑' : 'Show More ↓'}
      </span>
      {isExpanded ? (
        <ChevronUp size={12} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
      ) : (
        <ChevronDown size={12} className="text-muted-foreground/30 group-hover:text-primary transition-colors animate-bounce-slow" />
      )}
    </button>
  );
};

export default ShowMoreToggle;
