import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '../../components/layout/PageLayout';
import api from '../../services/axios';
import { useToast } from '../../components/ui/Toast';
import { formatDateTimeIST } from '../../utils/dateTime';

const MentorDashboardPage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [rejectingId, setRejectingId] = useState<number | null>(null);

  const { data: mentorData } = useQuery({
    queryKey: ['mentor', 'my'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/mentors/me', { _skipErrorRedirect: true } as any);
        return res.data;
      } catch (e) {
        return null;
      }
    }
  });

  const mentorId = mentorData?.id;

  const { data: mentorSessionsObj } = useQuery({
    queryKey: ['sessions', 'mentor', 'dashboard-summary'],
    queryFn: async () => {
      const res = await api.get('/api/sessions/mentor?page=0&size=200', { _skipErrorRedirect: true } as any);
      return res.data;
    },
    refetchInterval: 20000,
  });

  const { data: recentReviewsObj } = useQuery({
    queryKey: ['reviews', mentorId],
    queryFn: async () => {
      const res = await api.get(`/api/reviews/mentor/${mentorId}?page=0&size=3`, { _skipErrorRedirect: true } as any);
      return res.data;
    },
    enabled: !!mentorId
  });

  const acceptMutation = useMutation({
    mutationFn: async (id: number) => api.put(`/api/sessions/${id}/accept`, undefined, { _skipErrorRedirect: true } as any),
    onSuccess: () => {
      showToast({ message: 'Mission Accepted.', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => api.put(`/api/sessions/${id}/reject`, undefined, { _skipErrorRedirect: true } as any),
    onSuccess: () => {
      showToast({ message: 'Mission Terminated.', type: 'success' });
      setRejectingId(null);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });

  const completeMutation = useMutation({
    mutationFn: async (id: number) => api.put(`/api/sessions/${id}/complete`, undefined, { _skipErrorRedirect: true } as any),
    onSuccess: () => {
      showToast({ message: 'Deployment Complete.', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['mentor', 'earnings'] });
      queryClient.invalidateQueries({ queryKey: ['mentor', 'earnings', 'completed-sessions'] });
    }
  });

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const p = name.split(' ');
    return p.length > 1 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : p[0][0].toUpperCase();
  };

  const allMentorSessions = mentorSessionsObj?.content || [];
  const pendingRequests = allMentorSessions.filter((session: any) => session.status === 'REQUESTED').slice(0, 5);
  const pendingRequestsCount = allMentorSessions.filter((session: any) => session.status === 'REQUESTED').length;
  const upcomingSessions = allMentorSessions.filter((session: any) => session.status === 'ACCEPTED').slice(0, 5);
  const upcomingSessionsCount = allMentorSessions.filter((session: any) => session.status === 'ACCEPTED').length;
  const totalSessionsCount = Number(
    mentorData?.totalSessions ?? allMentorSessions.filter((session: any) => session.status === 'COMPLETED').length
  );
  const recentReviews = recentReviewsObj?.content || [];
  const mentorRating = Number(mentorData?.avgRating ?? mentorData?.rating ?? 0);
  const isNewMentor = totalSessionsCount === 0;

  const getSessionDisplayName = (session: any) => session.learnerName || 'Learner';
  const getSessionDateTimeLabel = (session: any) => {
    const raw = session.startTime || session.sessionDate;
    if (!raw) return 'TBD';
    return formatDateTimeIST(raw);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } }
  } as const;

  const rightPanel = (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8">
      <motion.div variants={itemVariants} className="glass-card p-8 rounded-[2.5rem]">
        <h3 className="font-display font-black text-xl text-white mb-6 uppercase tracking-tighter">Transmission Feed</h3>
        {recentReviews.length > 0 ? (
          <div className="space-y-6">
            {recentReviews.map((review: any) => (
              <div key={review.id} className="pb-6 border-b border-white/5 last:border-0 last:pb-0">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-black text-xs text-white uppercase tracking-tight">{review.learnerName || 'Operative'}</span>
                  <span className="text-[10px] font-bold text-white/30 uppercase">{formatDateTimeIST(review.createdAt).split(',')[0]}</span>
                </div>
                <div className="flex text-primary text-[10px] mb-3">
                  {Array(5).fill(0).map((_, i) => (
                    <span key={i} className={`material-symbols-outlined text-[14px] ${i < review.rating ? 'fill-1' : 'opacity-20'}`}>
                      star
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-white/50 italic leading-relaxed line-clamp-2">"{review.comment}"</p>
              </div>
            ))}
            {mentorId && (
              <button 
                onClick={() => navigate(`/mentors/${mentorId}`)}
                className="w-full py-3 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-all"
              >
                Full Intel Report
              </button>
            )}
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-3xl text-white/10 mb-4">forum</span>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">No transmissions logged</p>
          </div>
        )}
      </motion.div>

      {mentorId && (
        <motion.div variants={itemVariants} className="glass-card p-8 rounded-[2.5rem] bg-primary/5 border-primary/20">
          <h3 className="font-display font-black text-xl text-white mb-4 uppercase tracking-tighter flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">event_available</span> 
            Availability
          </h3>
          <p className="text-[11px] text-white/40 font-medium mb-6 leading-relaxed uppercase tracking-widest">
            Configure your active time windows for optimal synchronization.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/mentor/availability')}
            className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary/20"
          >
            Open Schedule Core
          </motion.button>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="glass-card p-8 rounded-[2.5rem]">
        <h3 className="font-display font-black text-xl text-white mb-4 uppercase tracking-tighter flex items-center gap-3">
          <span className="material-symbols-outlined">groups</span> 
          Command Circles
        </h3>
        <p className="text-[11px] text-white/40 font-medium mb-6 leading-relaxed uppercase tracking-widest">
          Coordinate with teams and moderate active communication channels.
        </p>
        <button
          onClick={() => navigate('/groups')}
          className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all"
        >
          Access Group Hub
        </button>
      </motion.div>
    </motion.div>
  );

  return (
    <PageLayout rightPanel={rightPanel}>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-16">
        {/* Header */}
        <motion.section variants={itemVariants} className="relative py-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="absolute -left-12 -top-12 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
          <div>
            <h1 className="text-6xl font-display font-black text-white tracking-tighter leading-[0.9]">
              Mentor <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">Studio</span>.
            </h1>
            <p className="text-lg text-white/40 font-bold uppercase tracking-[0.3em] mt-6 flex items-center gap-4">
              <span className="w-12 h-[2px] bg-primary/30" />
              Strategic Overview Dashboard
            </p>
          </div>
          {mentorId && (
            <motion.button 
              whileHover={{ scale: 1.05, x: -4 }}
              onClick={() => navigate(`/mentors/${mentorId}`)} 
              className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3"
            >
              Public Profile <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </motion.button>
          )}
        </motion.section>

        {/* Stats Row */}
        <motion.section variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: 'Completed Missions', value: totalSessionsCount, color: 'text-white' },
            { label: 'Integrity Rating', value: isNewMentor ? 'NEW' : mentorRating.toFixed(1), color: 'text-primary', suffix: !isNewMentor ? ' ★' : '' },
            { label: 'Action Required', value: pendingRequestsCount, color: pendingRequestsCount > 0 ? 'text-amber-500' : 'text-emerald-500' }
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className={`text-5xl font-display font-black mb-3 ${stat.color} tracking-tighter`}>
                {stat.value}{stat.suffix}
              </span>
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{stat.label}</span>
            </div>
          ))}
        </motion.section>

        {/* Pending Requests */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${pendingRequestsCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              Critical Requests
            </h2>
            {pendingRequestsCount > 0 && (
              <span className="text-[9px] font-black bg-amber-500 text-black px-3 py-1 rounded-full uppercase tracking-widest">
                {pendingRequestsCount} Pending
              </span>
            )}
          </div>

          <div className="space-y-6">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((req: any) => (
                <motion.div 
                  layout
                  whileHover={{ x: 8 }}
                  key={req.id} 
                  className="glass-card rounded-[2.5rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 border-amber-500/10 group"
                >
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white flex items-center justify-center font-black text-2xl shadow-2xl transition-transform group-hover:rotate-6">
                        {getInitials(getSessionDisplayName(req))}
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 border-4 border-slate-900 rounded-full" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-xl tracking-tighter leading-none mb-2">{getSessionDisplayName(req)}</h4>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px] text-amber-500">schedule</span>
                        {getSessionDateTimeLabel(req)} • {req.durationMinutes || 60}m
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-auto">
                    <AnimatePresence mode="wait">
                      {rejectingId === req.id ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex items-center gap-3 bg-rose-500/10 p-2 pr-4 rounded-2xl border border-rose-500/20"
                        >
                          <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-2">Confirm?</span>
                          <button onClick={() => rejectMutation.mutate(req.id)} disabled={rejectMutation.isPending} className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all">Yes</button>
                          <button onClick={() => setRejectingId(null)} className="text-white/40 hover:text-white px-2 py-2 text-[10px] font-black uppercase tracking-widest transition-all">No</button>
                        </motion.div>
                      ) : (
                        <>
                          <button 
                            onClick={() => setRejectingId(req.id)}
                            className="px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/50 text-[10px] font-black uppercase tracking-widest hover:text-rose-400 hover:bg-rose-500/5 transition-all"
                          >
                            Decline
                          </button>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => acceptMutation.mutate(req.id)}
                            disabled={acceptMutation.isPending}
                            className="px-8 py-3.5 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50"
                          >
                            Authorize
                          </motion.button>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="glass-card rounded-[3rem] p-16 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                  <span className="material-symbols-outlined text-4xl text-emerald-500">verified</span>
                </div>
                <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em]">All Systems Clear</p>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-2">No pending requests in queue</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Upcoming Sessions */}
        <motion.section variants={itemVariants}>
          <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Scheduled Missions
          </h2>
          <div className="space-y-6">
            {upcomingSessionsCount > 0 ? (
              upcomingSessions.map((session: any) => (
                <motion.div 
                  whileHover={{ x: 8 }}
                  key={session.id} 
                  className="glass-card rounded-[2.5rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center font-black text-2xl shadow-xl transition-transform group-hover:rotate-6">
                      {getInitials(getSessionDisplayName(session))}
                    </div>
                    <div>
                      <h4 className="font-black text-white text-xl tracking-tighter leading-none mb-2">{getSessionDisplayName(session)}</h4>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px] text-primary">calendar_today</span>
                        {getSessionDateTimeLabel(session)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-auto">
                    <button className="px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/70 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px]">videocam</span> Join Comms
                    </button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => completeMutation.mutate(session.id)}
                      disabled={completeMutation.isPending}
                      className="px-6 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                    >
                      Finalize
                    </motion.button>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-4">No confirmed missions in log</p>
            )}
          </div>
        </motion.section>
      </motion.div>
    </PageLayout>
  );
};

export default MentorDashboardPage;
