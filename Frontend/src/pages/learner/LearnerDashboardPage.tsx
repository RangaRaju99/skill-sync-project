import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/axios';
import type { RootState } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '../../components/layout/PageLayout';
import { useToast } from '../../components/ui/Toast';
import { formatDateTimeIST } from '../../utils/dateTime';

const LearnerDashboardPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyData, setApplyData] = useState({
    bio: '',
    experienceYears: 1,
    hourlyRate: 25,
    skillIds: [] as number[],
  });

  // Queries
  const { data: upSessions, isLoading: loadingUp } = useQuery({
    queryKey: ['sessions', 'upcoming'],
    queryFn: async () => {
      const res = await api.get('/api/sessions/learner?page=0&size=50');
      const allSessions = res.data?.content || [];
      const accepted = allSessions.filter((s: any) => s.status === 'ACCEPTED');
      return { ...res.data, content: accepted.slice(0, 3), totalElements: accepted.length };
    }
  });


  const { data: mentors, isLoading: loadingMentors } = useQuery({
    queryKey: ['mentors', 'recommended'],
    queryFn: async () => {
      const res = await api.get('/api/mentors/search?page=0&size=4&sort=avgRating,desc');
      return res.data;
    }
  });

  const { data: groupsData } = useQuery({
    queryKey: ['groups', 'my'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/groups/my');
        return res.data;
      } catch (e: any) {
        if (e.response?.status === 404) return [];
        return [];
      }
    }
  });

  const { data: myMentorProfile } = useQuery({
    queryKey: ['mentor', 'my', 'learner-dashboard'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/mentors/me', { _skipErrorRedirect: true } as any);
        return res.data;
      } catch {
        return null;
      }
    },
  });

  const { data: allSkills } = useQuery({
    queryKey: ['skills', 'all', 'apply'],
    queryFn: async () => {
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

      const uniqueById = new Map(collected.map((skill: any) => [skill.id, skill]));
      return Array.from(uniqueById.values());
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      return api.post('/api/mentors/apply', {
        bio: applyData.bio,
        experienceYears: applyData.experienceYears,
        hourlyRate: applyData.hourlyRate,
        skillIds: applyData.skillIds,
      });
    },
    onSuccess: () => {
      showToast({ message: 'Mentor application submitted successfully.', type: 'success' });
      setShowApplyForm(false);
      queryClient.invalidateQueries({ queryKey: ['mentor', 'my', 'learner-dashboard'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to submit mentor application.';
      showToast({ message, type: 'error' });
    },
  });

  const groups = Array.isArray(groupsData) ? groupsData : groupsData?.content || [];
  const mentorStatus = myMentorProfile?.status || null;
  const canReapply = mentorStatus === 'REJECTED' || mentorStatus === 'SUSPENDED';
  const mentorApplied = Boolean(myMentorProfile) && !canReapply;
  const skills = Array.isArray(allSkills) ? allSkills : [];

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0][0].toUpperCase();
  };

  const getAvatarColor = (name?: string) => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'];
    const idx = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[idx];
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return '';
    return formatDateTimeIST(iso);
  };

  const getSessionMentorName = (session: any) => session.mentorName || 'Mentor';
  const getSessionDateTime = (session: any) => session.startTime || session.sessionDate;

  const toggleSkill = (skillId: number) => {
    setApplyData((prev) => ({
      ...prev,
      skillIds: prev.skillIds.includes(skillId)
        ? prev.skillIds.filter((id) => id !== skillId)
        : [...prev.skillIds, skillId].slice(0, 10),
    }));
  };

  const submitMentorApplication = () => {
    if (applyData.bio.trim().length < 50) {
      showToast({ message: 'Bio must be at least 50 characters for mentor application.', type: 'error' });
      return;
    }

    if (applyData.skillIds.length === 0) {
      showToast({ message: 'Select at least one skill to apply as mentor.', type: 'error' });
      return;
    }

    applyMutation.mutate();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', damping: 25, stiffness: 300 }
    }
  } as const;

  const rightPanel = (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8">
      <motion.div variants={itemVariants} className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[80px] -z-10 group-hover:bg-primary/20 transition-colors" />
        <h3 className="font-display font-black text-xl text-white mb-4 uppercase tracking-tighter">Become a Mentor</h3>
        {mentorApplied ? (
          <div className={`rounded-2xl border p-5 ${
            mentorStatus === 'APPROVED' ? 'border-green-500/20 bg-green-500/5' :
            mentorStatus === 'REJECTED' ? 'border-red-500/20 bg-red-500/5' :
            'border-amber-500/20 bg-amber-500/5'
          }`}>
            <p className="text-sm font-bold text-white flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                mentorStatus === 'APPROVED' ? 'bg-green-500 animate-pulse' :
                mentorStatus === 'REJECTED' ? 'bg-red-500' :
                'bg-amber-500 animate-pulse'
              }`} />
              {mentorStatus || 'PENDING'}
            </p>
            <p className="text-[11px] text-white/50 mt-3 font-medium leading-relaxed">
              {mentorStatus === 'APPROVED' ? 'Congratulations! Your expertise is now officially recognized. Relogin to access your Studio.' :
               mentorStatus === 'REJECTED' ? 'Your application was not approved. Review your profile and reach out to our support.' :
               'Your application is currently being evaluated by our design council. You will receive an update shortly.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-white/40 mb-6 font-medium leading-relaxed">
              {canReapply
                ? 'Your previous application was rejected. Ready to showcase your refined expertise?'
                : 'Empower others with your knowledge and define the next generation of talent.'}
            </p>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowApplyForm(true)}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-primary/40 transition-all"
            >
              {canReapply ? 'Revive Application' : 'Open Application'}
            </motion.button>
          </>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-8 rounded-[2.5rem]">
        <h3 className="font-display font-black text-xl text-white mb-6 uppercase tracking-tighter">Resources</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'LeetCode', url: 'https://leetcode.com' },
            { name: 'HackerRank', url: 'https://www.hackerrank.com' },
            { name: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org' },
            { name: 'CodeChef', url: 'https://www.codechef.com' }
          ].map((link) => (
            <a 
              key={link.name}
              href={link.url} 
              target="_blank" 
              rel="noreferrer" 
              className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-primary hover:bg-primary/10 hover:border-primary/20 transition-all text-center"
            >
              {link.name}
            </a>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-8 rounded-[2.5rem]">
        <h3 className="font-display font-black text-xl text-white mb-6 uppercase tracking-tighter">My Circles</h3>
        {groups.length === 0 ? (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-white/20">group_add</span>
            </div>
            <p className="text-xs font-bold text-white/40 mb-6 uppercase tracking-widest leading-loose">No active circles yet</p>
            <Link to="/groups" className="w-full py-3 rounded-xl border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all text-center">
              Join Circle
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((g: any, i: number) => (
              <motion.div 
                whileHover={{ x: 4 }}
                key={i} 
                className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all"
              >
                <span className="text-xs font-bold text-white">{g.name}</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{g.memberCount || 1} Members</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  return (
    <PageLayout rightPanel={rightPanel}>
      <AnimatePresence>
        {showApplyForm && !mentorApplied && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3rem] bg-slate-900 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] p-10"
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-display font-black text-white tracking-tighter uppercase">Mentor Application</h2>
                  <p className="text-[10px] font-bold text-primary tracking-[0.3em] uppercase mt-2">Elevate the community</p>
                </div>
                <button onClick={() => setShowApplyForm(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-all">
                  <span className="material-symbols-outlined text-white">close</span>
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white uppercase tracking-widest flex justify-between">
                    <span>Professional Bio</span>
                    <span className={applyData.bio.trim().length >= 50 ? 'text-primary' : 'text-rose-500'}>
                      {applyData.bio.trim().length}/50
                    </span>
                  </label>
                  <textarea
                    value={applyData.bio}
                    onChange={(e) => setApplyData((prev) => ({ ...prev, bio: e.target.value }))}
                    rows={5}
                    placeholder="Briefly describe your journey and expertise..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-white/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white uppercase tracking-widest">Industry Experience (Years)</label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={applyData.experienceYears}
                      onChange={(e) => setApplyData((prev) => ({ ...prev, experienceYears: Number(e.target.value) }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white uppercase tracking-widest">Hourly Value (₹ per hour)</label>
                    <input
                      type="number"
                      min={5}
                      max={5000}
                      value={applyData.hourlyRate}
                      onChange={(e) => setApplyData((prev) => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white uppercase tracking-widest">Select Core Skills (max 10)</label>
                  <div className="max-h-64 overflow-y-auto rounded-[2rem] border border-white/10 p-6 bg-white/5">
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill: any) => {
                        const selected = applyData.skillIds.includes(skill.id);
                        return (
                          <motion.button
                            key={skill.id}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleSkill(skill.id)}
                            className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                              selected
                                ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                                : 'bg-white/5 text-white/40 border-white/5 hover:border-primary/40'
                            }`}
                          >
                            {skill.name}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={submitMentorApplication}
                    disabled={applyMutation.isPending}
                    className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl disabled:opacity-50"
                  >
                    {applyMutation.isPending ? 'Propagating...' : 'Deploy Application'}
                  </motion.button>
                  <button
                    onClick={() => setShowApplyForm(false)}
                    className="flex-1 bg-white/5 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all"
                  >
                    Retreat
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={containerVariants} 
        className="space-y-16"
      >
        {/* Header Section */}
        <motion.section variants={itemVariants} className="relative py-4">
          <div className="absolute -left-12 -top-12 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
          <h1 className="text-6xl font-display font-black text-white tracking-tighter leading-[0.9]">
            Systems <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">Online</span>, {user?.firstName}.
          </h1>
          <p className="text-lg text-white/40 font-bold uppercase tracking-[0.3em] mt-6 flex items-center gap-4">
            <span className="w-12 h-[2px] bg-primary/30" />
            Workspace Integrity Optimal
          </p>
        </motion.section>

        {/* Upcoming Sessions Section */}
        <motion.section variants={itemVariants}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Upcoming Missions
            </h2>
            {upSessions?.content?.length > 0 && (
              <Link to="/sessions" className="text-[10px] font-black text-primary uppercase tracking-widest hover:brightness-125 transition-all">
                Full Schedule →
              </Link>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {loadingUp ? (
              Array(2).fill(0).map((_, i) => (
                <div key={i} className="h-24 rounded-3xl glass-card animate-pulse"></div>
              ))
            ) : upSessions?.content?.length > 0 ? (
              upSessions.content.map((session: any) => (
                <motion.div 
                  whileHover={{ x: 8, backgroundColor: 'rgba(255,255,255,0.06)' }}
                  key={session.id} 
                  className="glass-card rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center gap-6 group transition-all"
                >
                  <div className="flex items-center gap-5 flex-1">
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-2xl text-white flex items-center justify-center font-black text-xl shadow-2xl transition-transform group-hover:rotate-6 ${getAvatarColor(getSessionMentorName(session))}`}>
                        {getInitials(getSessionMentorName(session))}
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary border-4 border-slate-900 rounded-full" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-lg tracking-tight leading-none mb-1">{getSessionMentorName(session)}</h4>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{session.topic || 'Advanced Mentorship'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-10">
                    <div className="text-right">
                      <p className="text-xs font-black text-white uppercase tracking-tighter">{formatDateTime(getSessionDateTime(session)).split(',')[0]}</p>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter mt-0.5">{formatDateTime(getSessionDateTime(session)).split(',')[1]}</p>
                    </div>
                    <span className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                      {session.status}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="glass-card rounded-[3rem] p-16 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-4xl text-white/20">event_busy</span>
                </div>
                <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-8">No missions assigned</p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/mentors')} 
                  className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg"
                >
                  Acquire Mentor
                </motion.button>
              </div>
            )}
          </div>
        </motion.section>

        {/* Recommended Mentors Section */}
        <motion.section variants={itemVariants}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Top Operatives
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loadingMentors ? (
              Array(2).fill(0).map((_, i) => (
                <div key={i} className="h-64 rounded-3xl glass-card animate-pulse"></div>
              ))
            ) : mentors?.content?.map((mnt: any) => {
              const avgRating = Number(mnt.avgRating ?? mnt.rating ?? 0);
              const sessionsHeld = Number(mnt.totalSessions ?? 0);
              const isNewMentor = sessionsHeld === 0;

              return (
                <motion.div 
                  whileHover={{ y: -8 }}
                  key={mnt.id} 
                  className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group"
                >
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 blur-[60px] group-hover:bg-primary/10 transition-colors" />
                  
                  <div className="flex items-start gap-5 mb-8 relative z-10">
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-[1.5rem] text-white flex items-center justify-center font-black text-2xl shadow-xl transition-all group-hover:scale-110 group-hover:rotate-3 ${getAvatarColor(mnt.firstName)}`}>
                        {getInitials(`${mnt.firstName} ${mnt.lastName}`)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-slate-900 shadow-lg"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-black text-white tracking-tighter leading-none mb-2">{mnt.firstName} {mnt.lastName}</h3>
                        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full shadow-inner">
                          <span className="material-symbols-outlined text-[16px] text-primary">star</span>
                          <span className="text-[11px] font-black text-white">{isNewMentor ? 'NEW' : avgRating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest line-clamp-2 leading-relaxed">{mnt.headline}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-10 relative z-10">
                    {(mnt.skills || []).slice(0, 3).map((skill: any, i: number) => (
                      <span key={i} className="bg-white/5 border border-white/5 text-[9px] font-black text-white/50 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                        {typeof skill === 'string' ? skill : (skill.name || `Skill #${skill.id}`)}
                      </span>
                    ))}
                    {(mnt.skills?.length > 3) && (
                      <span className="bg-white/5 border border-white/5 text-[9px] font-black text-white/30 px-3 py-1.5 rounded-lg">+{mnt.skills.length - 3}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-auto pt-8 border-t border-white/5 relative z-10">
                    <div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Standard Rate</p>
                      <p className="text-2xl font-black text-white">₹{mnt.hourlyRate}<span className="text-xs font-bold text-white/20 ml-1">/hr</span></p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05, backgroundColor: '#8b5cf6', color: '#fff' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/mentors/${mnt.id}`)}
                      className="px-8 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-xl"
                    >
                      Initialize
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </motion.div>

      {/* Mobile FAB */}
      <motion.button 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 12 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/mentors')}
        className="lg:hidden fixed bottom-10 right-10 w-16 h-16 bg-primary text-white rounded-[2rem] shadow-[0_20px_50px_rgba(139,92,246,0.5)] flex items-center justify-center z-50 border-4 border-slate-900"
      >
        <span className="material-symbols-outlined text-3xl">search</span>
      </motion.button>
    </PageLayout>
  );
};

export default LearnerDashboardPage;
