import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/axios';
import PageLayout from '../../components/layout/PageLayout';

const DiscoverMentorsPage = () => {
  const navigate = useNavigate();
  
  const [draftFilters, setDraftFilters] = useState({ skill: '', rating: '', priceRange: '' });
  const [appliedFilters, setAppliedFilters] = useState({ skill: '', rating: '', priceRange: '' });

  const [page, setPage] = useState(0);
  
  const [mentorsList, setMentorsList] = useState<any[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [isLast, setIsLast] = useState(true);

  // Fetch Skills for dropdown
  const { data: skillsData } = useQuery({
    queryKey: ['skills', 'catalog'],
    queryFn: async () => {
      try {
        const size = 200;
        const pagesToFetch = 10;
        const collected: any[] = [];

        for (let page = 0; page < pagesToFetch; page += 1) {
          const res = await api.get(`/api/skills?page=${page}&size=${size}`, { _skipErrorRedirect: true } as any);
          const content = Array.isArray(res.data?.content) ? res.data.content : [];
          if (content.length === 0) break;
          collected.push(...content);
          if (res.data?.last !== false) break;
        }

        const uniqueById = new Map(collected.map((skill) => [skill.id, skill]));
        return Array.from(uniqueById.values());
      } catch {
        return [];
      }
    }
  });

  const skills = Array.isArray(skillsData) ? skillsData : [];

  // Fetch Mentors
  const { data, isLoading } = useQuery({
    queryKey: ['mentors', 'search', page, appliedFilters.skill, appliedFilters.rating, appliedFilters.priceRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('size', '9');

      if (appliedFilters.skill) {
        params.set('skill', appliedFilters.skill);
      }

      if (appliedFilters.rating) {
        params.set('rating', appliedFilters.rating);
      }

      if (appliedFilters.priceRange === 'under50') {
        params.set('maxPrice', '50');
      } else if (appliedFilters.priceRange === '50to100') {
        params.set('minPrice', '50');
        params.set('maxPrice', '100');
      } else if (appliedFilters.priceRange === 'over100') {
        params.set('minPrice', '100');
      }

      const res = await api.get(`/api/mentors/search?${params.toString()}`);
      return res.data;
    }
  });

  useEffect(() => {
    if (data) {
      if (page === 0) {
        setMentorsList(data.content || []);
      } else {
        setMentorsList(prev => {
          const newItems = (data.content || []).filter((item: any) => !prev.some(p => p.id === item.id));
          return [...prev, ...newItems];
        });
      }
      setTotalElements(data.totalElements || 0);
      setIsLast(data.last ?? true);
    }
  }, [data, page]);

  const applyFilters = () => {
    setPage(0);
    setMentorsList([]);
    setAppliedFilters({ ...draftFilters });
  };

  const clearFilters = () => {
    const reset = { skill: '', rating: '', priceRange: '' };
    setDraftFilters(reset);
    setAppliedFilters(reset);
    setPage(0);
    setMentorsList([]);
  };

  const getInitials = (first?: string, last?: string) => {
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase() || 'M';
  };

  const getAvatarColor = (name?: string) => {
    const colors = ['from-blue-500 to-indigo-500', 'from-emerald-400 to-teal-500', 'from-violet-500 to-purple-500', 'from-amber-400 to-orange-500', 'from-rose-400 to-red-500'];
    const idx = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[idx];
  };

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-8 animate-in">
        <h1 className="text-4xl lg:text-5xl font-display font-bold text-on-surface tracking-tight mb-3">Discover Mentors</h1>
        <p className="text-lg text-on-surface-variant font-medium max-w-2xl leading-relaxed opacity-80">
          Learn from industry experts and accelerate your career path with 1-on-1 mentorship.
        </p>
        <div className="mt-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-4 py-1.5 rounded-xl border border-primary/10">
            {totalElements} mentors available
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="surface-card p-6 flex flex-col md:flex-row gap-5 items-end mb-10 border-outline/5 animate-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex-1 w-full">
          <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] block mb-3 px-1">Filter by Skills</label>
          <select 
            value={draftFilters.skill} 
            onChange={(e) => setDraftFilters(prev => ({ ...prev, skill: e.target.value }))}
            className="w-full h-12 bg-surface-container-low px-4 rounded-xl text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 border border-outline/30 focus:border-primary transition-all appearance-none cursor-pointer"
          >
            <option value="">All Skills</option>
            {skills.map((s: any) => (
              <option key={typeof s === 'string' ? s : (s.id ?? s.name)} value={typeof s === 'string' ? s : s.name}>
                {typeof s === 'string' ? s : s.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 w-full">
          <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] block mb-3 px-1">Rating</label>
          <select 
            value={draftFilters.rating} 
            onChange={(e) => setDraftFilters(prev => ({ ...prev, rating: e.target.value }))}
            className="w-full h-12 bg-surface-container-low px-4 rounded-xl text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 border border-outline/30 focus:border-primary transition-all appearance-none cursor-pointer"
          >
            <option value="">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="5">5 Stars Only</option>
          </select>
        </div>

        <div className="flex-1 w-full">
          <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] block mb-3 px-1">Price Range</label>
          <select 
            value={draftFilters.priceRange} 
            onChange={(e) => setDraftFilters(prev => ({ ...prev, priceRange: e.target.value }))}
            className="w-full h-12 bg-surface-container-low px-4 rounded-xl text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 border border-outline/30 focus:border-primary transition-all appearance-none cursor-pointer"
          >
            <option value="">Any Price</option>
            <option value="under50">Under ₹50</option>
            <option value="50to100">₹50-₹100</option>
            <option value="over100">₹100+</option>
          </select>
        </div>

        <div className="flex gap-3 w-full md:w-auto shrink-0">
          <button 
            onClick={applyFilters}
            className="flex-1 md:flex-none btn-primary h-12 px-8 shadow-primary/10"
          >
            Apply
          </button>
          <button 
            onClick={clearFilters}
            className="w-12 h-12 flex items-center justify-center bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface rounded-xl border border-outline/20 transition-all"
            title="Reset Filters"
          >
            <span className="material-symbols-outlined text-[20px]">restart_alt</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {isLoading && page === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-80 surface-card animate-pulse"></div>
          ))}
        </div>
      ) : mentorsList.length === 0 ? (
        <div className="surface-card p-20 flex flex-col items-center justify-center text-center border-dashed animate-in">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/10 mb-6">person_search</span>
          <h3 className="text-2xl font-bold text-on-surface mb-2">No experts found</h3>
          <p className="text-on-surface-variant font-medium mb-10 max-w-sm">No mentors match your current search criteria.</p>
          <button onClick={clearFilters} className="btn-secondary px-10 h-14">
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in" style={{ animationDelay: '0.2s' }}>
            {mentorsList.map((mentor) => {
              const avgRating = Number(mentor.avgRating ?? mentor.rating ?? 0);
              const sessionsHeld = Number(mentor.totalSessions ?? 0);
              const isNewMentor = sessionsHeld === 0;

              return (
                <div key={mentor.id} className="surface-card rounded-3xl overflow-hidden hover:-translate-y-1 group flex flex-col border-outline/5">
                  <div className="h-44 bg-surface-container-high relative flex items-center justify-center p-4 overflow-hidden border-b border-outline/5">
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${getAvatarColor(mentor.firstName)} text-white flex items-center justify-center text-3xl font-black shadow-2xl z-10 ring-[6px] ring-black/10`}>
                      {getInitials(mentor.firstName, mentor.lastName)}
                    </div>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="min-w-0">
                        <h3 className="text-xl font-bold text-on-surface leading-tight mb-2 group-hover:text-primary transition-colors">
                          {mentor.firstName} {mentor.lastName}
                        </h3>
                        <p className="text-sm font-bold text-on-surface-variant opacity-60 truncate" title={mentor.headline}>
                          {mentor.headline || 'Network Expert'}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg text-[10px] font-black text-amber-500 border border-amber-500/10">
                          <span className="material-symbols-outlined text-[14px] filled">star</span>
                          {isNewMentor ? 'NEW' : avgRating.toFixed(1)}
                        </div>
                        <p className="text-[10px] font-black text-on-surface-variant/40 mt-2 uppercase tracking-widest">
                          {sessionsHeld} Session{sessionsHeld === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>
                  
                    <div className="flex flex-wrap gap-2 mb-10 mt-auto">
                      {(mentor.skills || []).slice(0, 3).map((skill: any, i: number) => (
                        <span key={i} className="px-3 py-1 bg-surface-container-low text-[10px] font-black text-on-surface-variant uppercase tracking-widest rounded-xl border border-outline/10">
                          {typeof skill === 'string' ? skill : (skill.name || `Skill`)}
                        </span>
                      ))}
                      {(mentor.skills?.length > 3) && (
                        <span className="px-3 py-1 bg-surface-container-low text-[10px] font-black text-on-surface-variant/60 rounded-xl">
                          +{mentor.skills.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mb-6 border-t border-outline/5 pt-8">
                      <div>
                        <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-1">Session Rate</p>
                        <p className="text-2xl font-bold text-on-surface">
                          ₹{mentor.hourlyRate}<span className="text-sm font-bold text-on-surface-variant/40 ml-1">/hr</span>
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate(`/mentors/${mentor.id}`)}
                      className="btn-primary w-full py-4 h-auto shadow-primary/10"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {!isLast && (
            <div className="mt-12 flex justify-center pb-10">
              <button 
                onClick={() => setPage(p => p + 1)} 
                disabled={isLoading}
                className="btn-secondary px-10 h-14"
              >
                {isLoading ? 'Loading...' : 'Load More'} 
              </button>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
};

export default DiscoverMentorsPage;
