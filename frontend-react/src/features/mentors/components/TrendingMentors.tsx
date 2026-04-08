
import React, { useState, useEffect } from 'react';
import { Flame, Clock } from 'lucide-react';
import type { MentorProfileDto } from '../components/MentorCard';

interface TrendingMentorsProps {
  mentors: MentorProfileDto[];
  onMentorClick: (id: number) => void;
}

const TrendingMentors: React.FC<TrendingMentorsProps> = ({ mentors, onMentorClick }) => {
  const [trending, setTrending] = useState<MentorProfileDto[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<MentorProfileDto[]>([]);

  useEffect(() => {
    // Trending logic: sort mentors by a dummy popularity score or mock it using localStorage click tracking
    const clickData = JSON.parse(localStorage.getItem('mentor_click_counts') || '{}');
    const sortedTrending = [...mentors]
      .filter(m => clickData[m.id])
      .sort((a, b) => (clickData[b.id] || 0) - (clickData[a.id] || 0))
      .slice(0, 3);
    
    setTrending(sortedTrending);

    // Recently viewed logic
    const recentIds = JSON.parse(localStorage.getItem('recently_viewed_mentors') || '[]');
    const sortedRecent = recentIds
      .map((id: number) => mentors.find(m => m.id === id))
      .filter(Boolean)
      .slice(0, 4);
    
    setRecentlyViewed(sortedRecent);
  }, [mentors]);

  if (trending.length === 0 && recentlyViewed.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {trending.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
            <Flame size={16} fill="currentColor" />
            Trending Right Now
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trending.map(m => (
              <div 
                key={m.id}
                onClick={() => onMentorClick(m.userId)}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-border-color hover:border-primary/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary text-white font-black flex items-center justify-center shrink-0">
                  {(m.name || m.username || 'M')[0]}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{m.name || m.username}</h4>
                  <p className="text-[10px] text-muted font-black uppercase tracking-tight truncate">{m.specialization}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentlyViewed.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted">
            <Clock size={16} />
            Continue Browsing
          </div>
          <div className="flex flex-wrap gap-4">
            {recentlyViewed.map(m => (
              <div 
                key={m.id}
                onClick={() => onMentorClick(m.userId)}
                className="flex items-center gap-3 p-2 pr-4 bg-surface dark:bg-slate-800 rounded-xl hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:border-border-color transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 font-bold flex items-center justify-center shrink-0 text-muted group-hover:bg-primary group-hover:text-white transition-all">
                  {(m.name || m.username || 'M')[0]}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-foreground truncate">{m.name || m.username}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendingMentors;
