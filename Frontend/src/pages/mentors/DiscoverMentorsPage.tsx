import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Zap, Filter, ArrowRight, X } from 'lucide-react';
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
      } catch { return []; }
    }
  });

  const skills = Array.isArray(skillsData) ? skillsData : [];

  const { data, isLoading } = useQuery({
    queryKey: ['mentors', 'search', page, appliedFilters.skill, appliedFilters.rating, appliedFilters.priceRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('size', '9');
      if (appliedFilters.skill) params.set('skill', appliedFilters.skill);
      if (appliedFilters.rating) params.set('rating', appliedFilters.rating);
      if (appliedFilters.priceRange === 'under50') params.set('maxPrice', '50');
      else if (appliedFilters.priceRange === '50to100') { params.set('minPrice', '50'); params.set('maxPrice', '100'); }
      else if (appliedFilters.priceRange === 'over100') params.set('minPrice', '100');
      const res = await api.get(`/api/mentors/search?${params.toString()}`);
      return res.data;
    }
  });

  useEffect(() => {
    if (data) {
      if (page === 0) setMentorsList(data.content || []);
      else setMentorsList(prev => {
        const newItems = (data.content || []).filter((item: any) => !prev.some(p => p.id === item.id));
        return [...prev, ...newItems];
      });
      setTotalElements(data.totalElements || 0);
      setIsLast(data.last ?? true);
    }
  }, [data, page]);

  const applyFilters = () => { setPage(0); setMentorsList([]); setAppliedFilters({ ...draftFilters }); };
  const clearFilters = () => {
    const reset = { skill: '', rating: '', priceRange: '' };
    setDraftFilters(reset); setAppliedFilters(reset); setPage(0); setMentorsList([]);
  };

  const getInitials = (first?: string, last?: string) => `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase() || 'M';
  const getAvatarColor = (name?: string) => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'];
    return colors[name ? name.charCodeAt(0) % colors.length : 0];
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } } as const;
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } } } as const;

  return (
    <PageLayout>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-12">
        {/* Header */}
        <motion.section variants={itemVariants} className="relative py-4">
          <div className="absolute -left-12 -top-12 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
          <h1 className="text-6xl font-display font-black text-white tracking-tighter leading-[0.9]">
            Nexus <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">Experts</span>.
          </h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-8">
            <p className="text-lg text-white/40 font-bold uppercase tracking-[0.3em] flex items-center gap-4">
              <span className="w-12 h-[2px] bg-primary/30" />
              Advanced Knowledge Transfer
            </p>
            <div className="flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-primary/10 border border-primary/20">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">{totalElements} Nodes Online</span>
            </div>
          </div>
        </motion.section>

        {/* Filter Glass Bar */}
        <motion.div variants={itemVariants} className="glass-card rounded-[2.5rem] p-4 flex flex-col lg:flex-row items-end gap-6 border-white/5 shadow-2xl">
          <div className="flex-1 w-full space-y-2">
            <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Specialization</label>
            <div className="relative group">
              <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary transition-colors" size={16} />
              <select 
                value={draftFilters.skill} 
                onChange={(e) => setDraftFilters(prev => ({ ...prev, skill: e.target.value }))}
                className="w-full h-12 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-primary/30 appearance-none transition-all cursor-pointer"
              >
                <option value="" className="bg-[#0a0514]">All Domains</option>
                {skills.map((s: any) => (
                  <option key={typeof s === 'string' ? s : (s.id ?? s.name)} value={typeof s === 'string' ? s : s.name} className="bg-[#0a0514]">
                    {typeof s === 'string' ? s : s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full lg:w-48 space-y-2">
            <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Signal Strength</label>
            <select 
              value={draftFilters.rating} 
              onChange={(e) => setDraftFilters(prev => ({ ...prev, rating: e.target.value }))}
              className="w-full h-12 bg-white/5 border border-white/5 rounded-2xl px-6 text-xs font-bold text-white outline-none focus:border-primary/30 appearance-none transition-all cursor-pointer"
            >
              <option value="" className="bg-[#0a0514]">Any Power</option>
              <option value="4" className="bg-[#0a0514]">4.0+ Stars</option>
              <option value="4.5" className="bg-[#0a0514]">4.5+ Stars</option>
              <option value="5" className="bg-[#0a0514]">5.0 Perfect</option>
            </select>
          </div>

          <div className="w-full lg:w-48 space-y-2">
            <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Credits</label>
            <select 
              value={draftFilters.priceRange} 
              onChange={(e) => setDraftFilters(prev => ({ ...prev, priceRange: e.target.value }))}
              className="w-full h-12 bg-white/5 border border-white/5 rounded-2xl px-6 text-xs font-bold text-white outline-none focus:border-primary/30 appearance-none transition-all cursor-pointer"
            >
              <option value="" className="bg-[#0a0514]">Any Cost</option>
              <option value="under50" className="bg-[#0a0514]">Low Efficiency</option>
              <option value="50to100" className="bg-[#0a0514]">Standard Tier</option>
              <option value="over100" className="bg-[#0a0514]">Premium Tier</option>
            </select>
          </div>

          <button 
            onClick={applyFilters}
            className="w-full lg:w-auto h-12 px-8 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 transition-all flex items-center justify-center gap-3 shrink-0"
          >
            <Filter size={14} /> Calibrate
          </button>
        </motion.div>

        {/* Results Grid */}
        <div className="space-y-12">
          <AnimatePresence mode="popLayout">
            {isLoading && page === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-96 glass-card rounded-[3rem] animate-pulse" />
                ))}
              </div>
            ) : mentorsList.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-[3rem] p-24 text-center flex flex-col items-center">
                <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center mb-8 border border-white/5">
                  <Search className="text-white/10" size={48} />
                </div>
                <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter mb-4 italic">No Nodes Detected</h3>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-10">System search returned zero matches for current parameters.</p>
                <button onClick={clearFilters} className="px-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                  <X size={16} /> Reset Parameters
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mentorsList.map((mentor) => {
                  const avgRating = Number(mentor.avgRating ?? mentor.rating ?? 0);
                  const sessionsHeld = Number(mentor.totalSessions ?? 0);
                  return (
                    <motion.div 
                      layout
                      variants={itemVariants}
                      whileHover={{ y: -10 }}
                      key={mentor.id} 
                      className="glass-card rounded-[3rem] overflow-hidden border-white/5 flex flex-col group relative"
                    >
                      <div className="h-44 bg-gradient-to-br from-white/[0.02] to-white/[0.05] relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className={`w-24 h-24 rounded-[2rem] ${getAvatarColor(mentor.firstName)} p-[1px] shadow-2xl relative z-10 transition-transform duration-700 group-hover:rotate-6 group-hover:scale-110`}>
                          <div className="w-full h-full rounded-[1.9rem] bg-[#0a0514]/20 backdrop-blur-md flex items-center justify-center text-3xl font-black text-white italic tracking-tighter">
                            {getInitials(mentor.firstName, mentor.lastName)}
                          </div>
                        </div>
                        <div className="absolute top-6 right-6">
                           <Zap size={20} className="text-primary/20 group-hover:text-primary/60 transition-colors" />
                        </div>
                      </div>
                      
                      <div className="p-8 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                          <div className="space-y-1">
                            <h3 className="text-2xl font-display font-black text-white tracking-tighter uppercase italic group-hover:text-primary transition-colors">
                              {mentor.firstName} {mentor.lastName}
                            </h3>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{mentor.headline || 'System Expert'}</p>
                          </div>
                          <div className="text-right">
                             <div className="flex items-center gap-1.5 justify-end">
                                <Star size={14} className="text-primary fill-primary" />
                                <span className="text-sm font-black text-white">{avgRating > 0 ? avgRating.toFixed(1) : 'NEW'}</span>
                             </div>
                             <p className="text-[9px] font-black text-white/20 uppercase tracking-tighter">{sessionsHeld} Syncs</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-8">
                          {(mentor.skills || []).slice(0, 3).map((skill: any, i: number) => (
                            <span key={i} className="text-[9px] font-black text-white/40 bg-white/5 border border-white/5 px-3 py-1 rounded-full uppercase tracking-widest transition-colors group-hover:border-primary/20 group-hover:text-primary/60">
                              {typeof skill === 'string' ? skill : (skill.name || 'Module')}
                            </span>
                          ))}
                        </div>

                        <div className="mt-auto flex items-end justify-between border-t border-white/5 pt-8 mb-8">
                          <div className="space-y-1">
                             <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Transmission Cost</p>
                             <p className="text-2xl font-black text-white tracking-tighter italic font-display">₹{mentor.hourlyRate}<span className="text-[10px] text-white/20 ml-1">/HR</span></p>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20">
                             <ArrowRight size={18} />
                          </div>
                        </div>

                        <button 
                          onClick={() => navigate(`/mentors/${mentor.id}`)}
                          className="w-full py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 transition-all flex items-center justify-center gap-3 group/btn"
                        >
                          Establish Connection
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>

          {!isLast && (
            <motion.div variants={itemVariants} className="flex justify-center pt-12">
              <button 
                onClick={() => setPage(p => p + 1)} 
                disabled={isLoading}
                className="px-12 py-5 rounded-3xl bg-white/5 border border-white/10 text-white/40 font-black text-[10px] uppercase tracking-[0.3em] hover:text-white hover:bg-white/10 transition-all flex items-center gap-4 group"
              >
                {isLoading ? 'Decrypting Nodes...' : 'Expand Discovery Array'} 
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:translate-y-1 transition-transform">
                  <ArrowRight size={14} className="rotate-90" />
                </div>
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </PageLayout>
  );
};

export default DiscoverMentorsPage;
