
import React, { useState, useEffect, useRef } from 'react';
import { Search, History, Sparkles, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
  sourceData: any[]; // The mentors list to extract suggestions from
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialValue = '', sourceData }) => {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extract suggestions from real data
  const suggestions = React.useMemo(() => {
    if (!sourceData) return [];
    
    const skills = new Set<string>();
    const names = new Set<string>();
    
    sourceData.forEach(m => {
      if (m.name) names.add(m.name);
      if (typeof m.skills === 'string') {
        m.skills.split(',').forEach((s: string) => skills.add(s.trim()));
      } else if (Array.isArray(m.skills)) {
        m.skills.forEach((s: string) => skills.add(s));
      } else if (m.specialization) {
        skills.add(m.specialization);
      }
    });

    const skillList = Array.from(skills).map(s => ({ type: 'skill', value: s }));
    const nameList = Array.from(names).map(n => ({ type: 'mentor', value: n }));
    
    return [...skillList, ...nameList]
      .filter(s => s.value.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8);
  }, [sourceData, query]);

  useEffect(() => {
    const saved = localStorage.getItem('recent_mentor_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
    
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerSearch = (term: string) => {
    onSearch(term);
    setQuery(term);
    setIsFocused(false);
    
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_mentor_searches', JSON.stringify(updated));
  };

  const removeRecent = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    localStorage.setItem('recent_mentor_searches', JSON.stringify(updated));
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className={`flex items-center bg-white dark:bg-slate-900 border overflow-hidden rounded-[24px] shadow-2xl transition-all duration-300 ${
        isFocused ? 'ring-4 ring-primary/10 border-primary shadow-primary/5' : 'border-border-color'
      }`}>
        <div className="pl-6 pr-3 text-muted">
          <Search size={22} className={isFocused ? 'text-primary' : ''} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value); // Real-time
            setIsFocused(true);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => e.key === 'Enter' && triggerSearch(query)}
          placeholder="Search by name, skill, or experience..."
          className="flex-1 bg-transparent border-none py-5 px-0 text-foreground text-base focus:ring-0 outline-none font-medium placeholder:text-muted/60"
        />
        <div className="flex items-center gap-2 pr-4 pl-2">
          {query && (
            <button 
              onClick={() => { setQuery(''); onSearch(''); }}
              className="p-2 text-muted hover:text-foreground hover:bg-surface rounded-full transition-all"
            >
              <X size={18} />
            </button>
          )}
          <div className="w-px h-6 bg-border-color mx-2 hidden sm:block" />
          <button 
            onClick={() => triggerSearch(query)}
            className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            Find Experts
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isFocused && (query.length > 0 || recentSearches.length > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 border border-border-color rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] p-4 z-[100] max-h-[480px] overflow-y-auto overflow-x-hidden scrollbar-none"
          >
            {/* Suggestions Layer */}
            {query.length > 0 && suggestions.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-[2px] text-primary">
                  <Sparkles size={14} className="fill-primary" /> Dynamic Suggestions
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => triggerSearch(suggestion.value)}
                      className="group flex items-center justify-between p-4 hover:bg-surface dark:hover:bg-slate-800/50 rounded-2xl text-left transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                          suggestion.type === 'skill' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'
                        }`}>
                          {suggestion.type === 'skill' ? '⚡' : '👤'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{suggestion.value}</p>
                          <p className="text-[10px] font-black text-muted uppercase tracking-widest">{suggestion.type}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recents Layer */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-[2px] text-muted">
                  <History size={14} /> Recently Searched
                </div>
                <div className="flex flex-wrap gap-2 p-3">
                  {recentSearches.map(term => (
                    <div 
                      key={term}
                      onClick={() => triggerSearch(term)}
                      className="group flex items-center gap-3 px-4 py-2 bg-surface hover:bg-primary/10 border border-border-color hover:border-primary/30 rounded-xl cursor-pointer transition-all"
                    >
                      <span className="text-xs font-bold text-muted group-hover:text-primary transition-colors">{term}</span>
                      <X 
                        size={12} 
                        onClick={(e) => removeRecent(e, term)}
                        className="text-muted hover:text-rose-500 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
