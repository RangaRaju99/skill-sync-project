
import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMentors } from '@/hooks/useMentors';
import { Sparkles, ArrowRight, RefreshCw, Info, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import MentorCard from '../components/MentorCard';
import SkeletonCard from '../components/SkeletonCard';
import SearchBar from '../components/SearchBar';
import ViewToggle from '../components/ViewToggle';
import TrendingMentors from '../components/TrendingMentors';
import SortBar from '../components/SortBar';

export default function MentorsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('skill') || '');
  const [sortKey, setSortKey] = useState('featured');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isGroupedByAvail, setIsGroupedByAvail] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    (localStorage.getItem('mentor_view_mode') as 'grid' | 'list') || 'grid'
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chatMentor, setChatMentor] = useState<any>(null);

  // Data Fetching
  const { data: allMentors, isLoading, error, refetch } = useMentors({});

  // Intelligent Search & Filtering Logic (Root Problem Fixes)
  const filteredMentors = useMemo(() => {
    if (!allMentors) return [];
    
    const term = searchQuery.toLowerCase().trim();
    if (!term) return allMentors;

    return allMentors.filter(m => {
      const name = (m.name || m.username || '').toLowerCase();
      const spec = (m.specialization || '').toLowerCase();
      
      // Skills handling (Robust Fix)
      let skillsMatch = false;
      const skills = m.skills || [];
      if (typeof skills === 'string') {
        skillsMatch = skills.toLowerCase().includes(term);
      } else if (Array.isArray(skills)) {
        skillsMatch = skills.some((s: string) => s.toLowerCase().includes(term));
      }

      return name.includes(term) || spec.includes(term) || skillsMatch;
    });
  }, [allMentors, searchQuery]);


  // Client-side Sorting Logic
  const processedMentors = useMemo(() => {
    let result = [...filteredMentors];


    const clickData = JSON.parse(localStorage.getItem('mentor_click_counts') || '{}');

    // Sorting implementation
    result.sort((a, b) => {
      let valA: number = 0;
      let valB: number = 0;

      switch (sortKey) {
        case 'rating':
          valA = a.rating; valB = b.rating;
          break;
        case 'price':
          valA = a.hourlyRate; valB = b.hourlyRate;
          break;
        case 'experience':
          valA = a.yearsOfExperience; valB = b.yearsOfExperience;
          break;
        case 'popular':
          valA = clickData[a.id] || 0; valB = clickData[b.id] || 0;
          break;
        case 'best-match':
          // Best Match Score: Rating (60%) + Students (20%) + Exp (20%)
          valA = (a.rating * 10) + (a.totalStudents / 10) + a.yearsOfExperience;
          valB = (b.rating * 10) + (b.totalStudents / 10) + b.yearsOfExperience;
          break;
        case 'featured':
        default:
          return 0; // Maintain original order
      }

      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    return result;
  }, [filteredMentors, sortKey, sortOrder]);

  // Grouping logic
  const groupedResults = useMemo(() => {
    if (!isGroupedByAvail) return { all: processedMentors };
    
    return {
      available: processedMentors.filter(m => m.availabilityStatus === 'AVAILABLE'),
      busy: processedMentors.filter(m => m.availabilityStatus !== 'AVAILABLE')
    };
  }, [processedMentors, isGroupedByAvail]);

  // Handlers
  const handleRefresh = () => {
    setIsRefreshing(true);
    refetch().finally(() => {
      setTimeout(() => setIsRefreshing(false), 800);
    });
  };

  const handleMentorClick = (id: number) => {
    // Record click for trending
    const clickData = JSON.parse(localStorage.getItem('mentor_click_counts') || '{}');
    clickData[id] = (clickData[id] || 0) + 1;
    localStorage.setItem('mentor_click_counts', JSON.stringify(clickData));

    // Record for recently viewed
    const recent = JSON.parse(localStorage.getItem('recently_viewed_mentors') || '[]');
    const updated = [id, ...recent.filter((rid: number) => rid !== id)].slice(0, 10);
    localStorage.setItem('recently_viewed_mentors', JSON.stringify(updated));

    navigate(`/mentors/${id}`);
  };

  const updateViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('mentor_view_mode', mode);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
              Discover Experts <Sparkles className="text-primary animate-pulse" />
            </h1>
            <p className="text-muted font-bold">1-on-1 mentorship from industry leaders worldwide.</p>
          </div>
          <ViewToggle view={viewMode} onViewChange={updateViewMode} />
        </div>

        <SearchBar 
          onSearch={(q) => setSearchQuery(q)} 
          initialValue={searchQuery}
          sourceData={allMentors || []}
        />
      </div>

      {/* Discovery Layer 1: Trending & History */}
      {!isLoading && allMentors && allMentors.length > 0 && (
        <TrendingMentors mentors={allMentors} onMentorClick={handleMentorClick} />
      )}

      {/* Main Content Control Bar */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md py-2 border-b border-border-color">
         <SortBar 
            currentSort={sortKey}
            currentOrder={sortOrder}
            onSort={(key, order) => {
              setSortKey(key);
              setSortOrder(order);
            }}
            isGroupedByAvailability={isGroupedByAvail}
            onToggleGrouping={() => setIsGroupedByAvail(!isGroupedByAvail)}
          />
      </div>

      {/* Status & Results */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.p 
            key={processedMentors.length}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-black uppercase tracking-[2px] text-muted"
          >
            {processedMentors.length} {processedMentors.length === 1 ? 'Expert' : 'Experts'} Found 
            {searchQuery && (
              <span className="text-primary ml-1">for "{searchQuery}"</span>
            )}
          </motion.p>
          {searchQuery && (
             <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                Active Search
                <X size={12} className="cursor-pointer" onClick={() => setSearchQuery('')} />
             </div>
          )}
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted hover:text-primary transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
        >
          <RefreshCw size={14} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 p-8 rounded-3xl text-center space-y-4">
           <Info className="mx-auto text-rose-500" size={40} />
           <p className="font-bold text-rose-600 dark:text-rose-400">Unable to load mentors. Please check your connection.</p>
           <button onClick={handleRefresh} className="px-6 py-2 bg-rose-500 text-white rounded-xl font-bold">Try Again</button>
        </div>
      )}

      {/* Results Grid/List */}
      {!isLoading && !error && (
        <div className="space-y-12">
          {/* Availability Groups if active */}
          {isGroupedByAvail ? (
            <>
              {groupedResults.available && groupedResults.available.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="text-[10px] font-black uppercase tracking-[4px] text-emerald-600">Available Mentors</h2>
                    <div className="h-px flex-1 bg-emerald-500/10"></div>
                  </div>
                  <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                    {groupedResults.available.map(m => (
                      <MentorCard key={m.id} mentor={m} viewMode={viewMode} searchQuery={searchQuery} onView={handleMentorClick} onBook={(id) => navigate(`/sessions/request?mentorId=${id}`)} />
                    ))}
                  </div>
                </div>
              )}
              {groupedResults.busy && groupedResults.busy.length > 0 && (
                <div className="space-y-6 pt-12">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <h2 className="text-[10px] font-black uppercase tracking-[4px] text-amber-600">Busy Right Now</h2>
                    <div className="h-px flex-1 bg-amber-500/10"></div>
                  </div>
                  <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                    {groupedResults.busy.map(m => (
                      <MentorCard key={m.id} mentor={m} viewMode={viewMode} searchQuery={searchQuery} onView={handleMentorClick} onBook={(id) => navigate(`/sessions/request?mentorId=${id}`)} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Regular Non-Grouped View (with favorites pinning logic removed as per user's focus on sort bar, or I can keep it if compatible) */}
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {processedMentors.map(m => (
                  <MentorCard 
                    key={m.id} 
                    mentor={m} 
                    viewMode={viewMode}
                    searchQuery={searchQuery}
                    onView={handleMentorClick}
                    onBook={(id) => navigate(`/sessions/request?mentorId=${id}`)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Empty State */}
          {processedMentors.length === 0 && (
            <div className="py-24 text-center space-y-6 bg-surface dark:bg-slate-900/50 rounded-[40px] border border-dashed border-border-color">
              <div className="w-24 h-24 bg-card rounded-[32px] flex items-center justify-center mx-auto shadow-inner text-4xl">
                😕
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black">No experts found for "{searchQuery}"</h3>
                <p className="text-muted font-medium max-w-sm mx-auto">Try refining your search or explore these popular skills instead.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 px-10">
                {Array.from(new Set(allMentors?.flatMap(m => 
                  typeof m.skills === 'string' ? m.skills.split(',').map((s:string) => s.trim()) : (Array.isArray(m.skills) ? m.skills : [m.specialization])
                ))).slice(0, 8).map(s => (
                  <button 
                    key={s}
                    onClick={() => setSearchQuery(s)}
                    className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-border-color rounded-2xl text-xs font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all flex items-center gap-2 group"
                  >
                    {s} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat UI Modal (MOCK) */}
      <AnimatePresence>
        {chatMentor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-border-color"
            >
              <div className="p-6 bg-primary text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black">
                      {chatMentor.name[0]}
                   </div>
                   <div>
                      <h4 className="font-black text-sm">{chatMentor.name}</h4>
                      <p className="text-[10px] uppercase font-bold opacity-75">Start a conversation</p>
                   </div>
                </div>
                <X className="cursor-pointer" onClick={() => setChatMentor(null)} />
              </div>
              <div className="p-10 text-center space-y-6">
                <MessageSquare size={48} className="mx-auto text-primary/20" />
                <p className="text-sm font-bold text-muted">Messaging will be available soon with our upcoming collaboration update! 🚀</p>
                <button 
                  onClick={() => setChatMentor(null)}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
