import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Search, 
  Star, 
  ExternalLink, 
  TrendingUp, 
  Award, 
  ArrowRight
} from 'lucide-react';
import api from '../../services/axios';
import type { RootState } from '../../store';
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
      const res = await api.get(`/api/skills?page=0&size=${size}`, { _skipErrorRedirect: true } as any);
      return res.data?.content || [];
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      return api.post('/api/mentors/apply', applyData);
    },
    onSuccess: () => {
      showToast({ message: 'Authorization request submitted.', type: 'success' });
      setShowApplyForm(false);
      queryClient.invalidateQueries({ queryKey: ['mentor', 'my', 'learner-dashboard'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Submission failed.';
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
      showToast({ message: 'Description insufficient (min 50 chars).', type: 'error' });
      return;
    }
    if (applyData.skillIds.length === 0) {
      showToast({ message: 'Select specialization areas.', type: 'error' });
      return;
    }
    applyMutation.mutate();
  };

  const rightPanel = (
    <div className="space-y-6 animate-in" style={{ animationDelay: '0.1s' }}>
      <div className="surface-card p-6 border-primary/10">
        <h3 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <Award size={18} className="text-primary" />
          Become a Mentor
        </h3>
        {mentorApplied ? (
          <div className={`p-5 rounded-2xl border ${
            mentorStatus === 'APPROVED' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-primary/5 border-primary/20'
          }`}>
            <p className="text-xs font-black uppercase tracking-[0.1em] text-on-surface flex items-center justify-between">
              Application Status 
              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                mentorStatus === 'APPROVED' ? 'bg-emerald-500 text-white' : 'bg-primary text-white'
              }`}>
                {mentorStatus || 'PENDING'}
              </span>
            </p>
            <p className="text-sm text-on-surface-variant mt-4 leading-relaxed font-medium">
              {mentorStatus === 'APPROVED' ? 'Your application is active. Re-login to access mentor features.' : 'Application review in progress. We will notify you soon.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed font-medium">
              Apply to be a mentor and share your expertise with the community.
            </p>
            <button
              onClick={() => setShowApplyForm(true)}
              className="btn-primary w-full shadow-primary/10"
            >
              Start Application
            </button>
          </>
        )}
      </div>

      <div className="surface-card p-6">
        <h3 className="text-lg font-bold text-on-surface mb-5 flex items-center gap-2">
          <TrendingUp size={18} className="text-primary" />
          Network Resources
        </h3>
        <div className="space-y-1">
          {['LeetCode', 'HackerRank', 'GeeksforGeeks', 'CodeChef'].map((link) => (
            <a key={link} href={`https://${link.toLowerCase()}.com`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] text-sm font-bold text-on-surface-variant hover:text-on-surface transition-all group">
              {link}
              <ExternalLink size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
            </a>
          ))}
        </div>
      </div>

      <div className="surface-card p-6">
        <h3 className="text-lg font-bold text-on-surface mb-5 flex items-center gap-2">
          <Users size={18} className="text-primary" />
          Active Connections
        </h3>
        {groups.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-4">No active groups</p>
            <Link to="/groups" className="text-xs font-bold text-primary hover:text-primary-dark transition-colors">Join a group...</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.slice(0, 4).map((g: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl hover:bg-white/[0.03] transition-all group cursor-pointer border border-transparent hover:border-outline/10" onClick={() => navigate(`/groups/${g.id}`)}>
                <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{g.name}</span>
                <ArrowRight size={14} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <PageLayout rightPanel={rightPanel}>
      <div className="space-y-10 animate-in">
        {/* Header Section */}
        <section className="relative py-4">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-on-surface tracking-tight mb-3">
            Welcome back, <span className="text-primary">{user?.firstName}</span>
          </h1>
          <p className="text-lg text-on-surface-variant font-medium max-w-2xl leading-relaxed">
            System status: <span className="text-emerald-500/80">Active</span>. All synchronization services are operational and ready.
          </p>
        </section>

        {/* Upcoming Sessions */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-on-surface flex items-center gap-3">
              <Calendar size={20} className="text-primary" />
              Upcoming Sessions
            </h2>
            {upSessions?.content?.length > 0 && (
              <Link to="/sessions" className="text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2">
                Manage All <ArrowRight size={14} />
              </Link>
            )}
          </div>

          <div className="space-y-4">
            {loadingUp ? (
              Array(2).fill(0).map((_, i) => <div key={i} className="h-24 surface-card animate-pulse" />)
            ) : upSessions?.content?.length > 0 ? (
              upSessions.content.map((session: any) => (
                <div key={session.id} className="surface-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-primary/20">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 group-hover:scale-105 transition-transform">
                      {getInitials(getSessionMentorName(session))}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-on-surface group-hover:text-primary transition-colors">{getSessionMentorName(session)}</h4>
                      <p className="text-sm font-bold text-on-surface-variant mt-0.5">{session.topic || 'General Session'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-bold text-on-surface">{formatDateTimeIST(getSessionDateTime(session))}</p>
                      <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mt-1">Scheduled Time</p>
                    </div>
                    <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl border border-primary/20">
                      {session.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="surface-card p-16 text-center flex flex-col items-center border-dashed">
                <Calendar className="text-on-surface-variant/10 mb-6" size={56} />
                <p className="text-xl font-bold text-on-surface mb-2">No active syncs found</p>
                <p className="text-on-surface-variant font-medium mb-8 max-w-xs">Initialize a new mentor connection to start your learning journey.</p>
                <button onClick={() => navigate('/mentors')} className="btn-primary px-10">Find a Mentor</button>
              </div>
            )}
          </div>
        </section>

        {/* Recommended Mentors */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-on-surface flex items-center gap-3">
              <Search size={20} className="text-primary" />
              Available Mentors
            </h2>
            <Link to="/mentors" className="text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2">
              Explore All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {loadingMentors ? (
              Array(2).fill(0).map((_, i) => <div key={i} className="h-72 surface-card animate-pulse" />)
            ) : mentors?.content?.map((mnt: any) => (
              <div key={mnt.id} className="surface-card p-8 flex flex-col hover:-translate-y-1 group">
                <div className="flex items-start gap-6 mb-8">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl border border-primary/10 group-hover:scale-105 transition-transform">
                      {getInitials(`${mnt.firstName} ${mnt.lastName}`)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-surface-container-low shadow-lg"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-on-surface leading-tight truncate pr-4">{mnt.firstName} {mnt.lastName}</h3>
                      <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg text-[10px] font-bold text-amber-500 border border-amber-500/10">
                        <Star size={10} fill="currentColor" />
                        {Number(mnt.avgRating || 0).toFixed(1)}
                      </div>
                    </div>
                    <p className="text-sm font-bold text-on-surface-variant mt-2 line-clamp-2 leading-relaxed opacity-80">{mnt.headline}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {(mnt.skills || []).slice(0, 3).map((skill: any, i: number) => (
                    <span key={i} className="px-3 py-1 bg-surface-container-high text-[10px] font-black text-on-surface-variant/80 uppercase tracking-widest rounded-xl border border-outline/10">
                      {typeof skill === 'string' ? skill : (skill.name || 'Skill')}
                    </span>
                  ))}
                  {mnt.skills?.length > 3 && (
                    <span className="px-3 py-1 bg-surface-container-high text-[10px] font-black text-on-surface-variant/60 rounded-xl">+{mnt.skills.length - 3}</span>
                  )}
                </div>

                <div className="mt-auto pt-8 border-t border-outline/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-1">Session Rate</p>
                    <p className="text-2xl font-bold text-on-surface">₹{mnt.hourlyRate}<span className="text-sm font-bold text-on-surface-variant/40 ml-1">/hr</span></p>
                  </div>
                  <button
                    onClick={() => navigate(`/mentors/${mnt.id}`)}
                    className="btn-secondary px-8 py-3 h-auto"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Mentor Application Modal */}
      {showApplyForm && !mentorApplied && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in">
          <div className="w-full max-w-2xl bg-surface-container border border-outline/20 rounded-3xl p-8 lg:p-10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-6">
              <button onClick={() => setShowApplyForm(false)} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all">
                <ArrowRight className="rotate-180" size={24} />
              </button>
            </div>

            <h2 className="text-3xl font-display font-bold text-on-surface mb-2">Become a Mentor</h2>
            <p className="text-on-surface-variant mb-10 font-bold opacity-60">Share your experience and skills to help others grow.</p>

            <div className="space-y-8">
              <div>
                <label className="block text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4 opacity-50">Professional Bio</label>
                <textarea
                  value={applyData.bio}
                  onChange={(e) => setApplyData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Detail your professional journey and areas of specialization..."
                  rows={4}
                  className="w-full bg-surface-container-low border border-outline/30 rounded-2xl p-5 text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none placeholder:text-on-surface-variant/30"
                />
                <div className="flex justify-between mt-3 px-1">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${applyData.bio.trim().length >= 50 ? 'text-emerald-500' : 'text-on-surface-variant/30'}`}>
                    {applyData.bio.trim().length} / 50 characters required
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4 opacity-50">Years of Experience</label>
                  <input
                    type="number"
                    value={applyData.experienceYears}
                    onChange={(e) => setApplyData((prev) => ({ ...prev, experienceYears: Number(e.target.value) }))}
                    className="w-full h-14 bg-surface-container-low border border-outline/30 rounded-2xl px-6 text-on-surface font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4 opacity-50">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    value={applyData.hourlyRate}
                    onChange={(e) => setApplyData((prev) => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                    className="w-full h-14 bg-surface-container-low border border-outline/30 rounded-2xl px-6 text-on-surface font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4 opacity-50">Areas of Expertise (Max 10)</label>
                <div className="max-h-56 overflow-y-auto pr-3 scrollbar-hide">
                  <div className="flex flex-wrap gap-2.5">
                    {skills.map((skill: any) => {
                      const selected = applyData.skillIds.includes(skill.id);
                      return (
                        <button
                          key={skill.id}
                          onClick={() => toggleSkill(skill.id)}
                          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                            selected ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-container-high/50 border-outline/20 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
                          }`}
                        >
                          {skill.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={submitMentorApplication}
                  disabled={applyMutation.isPending}
                  className="btn-primary flex-1 h-14 text-lg shadow-primary/20"
                >
                  {applyMutation.isPending ? 'Submitting...' : 'Apply Now'}
                </button>
                <button
                  onClick={() => setShowApplyForm(false)}
                  className="flex-1 h-14 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold rounded-2xl transition-all border border-outline/20"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default LearnerDashboardPage;
