import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import PageLayout from '../../components/layout/PageLayout';
import ReviewModal from '../../components/modals/ReviewModal';
import api from '../../services/axios';
import { useToast } from '../../components/ui/Toast';
import { useActionConfirm } from '../../components/ui/ActionConfirm';
import type { RootState } from '../../store';
import { formatDateTimeIST } from '../../utils/dateTime';

type Tab = 'Upcoming' | 'Pending' | 'Completed' | 'Cancelled';

const statusMap: Record<Tab, string[]> = {
  Upcoming: ['ACCEPTED', 'REQUESTED'],
  Pending: ['REQUESTED'],
  Completed: ['COMPLETED'],
  Cancelled: ['CANCELLED'],
};

const MySessionsPage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { requestConfirmation } = useActionConfirm();
  const role = useSelector((state: RootState) => state.auth.role);
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const isMentor = role === 'ROLE_MENTOR';

  const tabs: Tab[] = ['Upcoming', 'Pending', 'Completed', 'Cancelled'];
  const [activeTab, setActiveTab] = useState<Tab>('Upcoming');
  const [page, setPage] = useState(0);

  const [reviewModalData, setReviewModalData] = useState<{ isOpen: boolean; mentorId: number; sessionId: number }>({
    isOpen: false,
    mentorId: 0,
    sessionId: 0,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['sessions', userId || 'unknown', role || 'unknown', activeTab, page],
    queryFn: async () => {
      const statuses = statusMap[activeTab];
      const endpoint = isMentor ? '/api/sessions/mentor' : '/api/sessions/learner';
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('size', '10');
      params.set('sort', 'createdAt,desc');
      statuses.forEach((status) => params.append('status', status));

      const res = await api.get(`${endpoint}?${params.toString()}`);
      return res.data;
    },
    enabled: !!role && !!userId,
    refetchInterval: activeTab === 'Pending' ? 30000 : false,
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.put(`/api/sessions/${id}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      showToast({ message: 'Deployment Aborted.', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: () => showToast({ message: 'Termination Failed.', type: 'error' }),
  });

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const p = name.split(' ');
    return p.length > 1 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : p[0][0].toUpperCase();
  };

  const getAvatarColor = (name?: string) => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'];
    return colors[name ? name.charCodeAt(0) % colors.length : 0];
  };

  const getSessionLabel = (session: any) => isMentor ? (session.learnerName || 'Learner') : (session.mentorName || 'Mentor');

  const getSessionDateTimeLabel = (sessionDateTime?: string) => {
    if (!sessionDateTime) return 'TBD';
    return formatDateTimeIST(sessionDateTime);
  };

  const handleLearnerCancel = async (sessionId: number) => {
    const confirmed = await requestConfirmation({
      title: 'Abort Mission?',
      message: 'This operation cannot be undone. System synchronization will be lost.',
      confirmLabel: 'Confirm Abortion',
    });
    if (confirmed) cancelMutation.mutate(sessionId);
  };

  const handleMentorSessionAction = async (id: number, action: 'accept' | 'reject' | 'complete') => {
    try {
      await api.put(`/api/sessions/${id}/${action}`);
      const labels = { accept: 'Authorized', reject: 'Terminated', complete: 'Deployed' };
      showToast({ message: `Mission ${labels[action]}.`, type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    } catch (error) {
      showToast({ message: `Protocol Error.`, type: 'error' });
    }
  };

  const sessions = data?.content || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } }
  } as const;

  return (
    <PageLayout>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-12">
        {/* Header */}
        <motion.section variants={itemVariants} className="relative py-4">
          <div className="absolute -left-12 -top-12 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
          <h1 className="text-6xl font-display font-black text-white tracking-tighter leading-[0.9]">
            Mission <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">Log</span>.
          </h1>
          <p className="text-lg text-white/40 font-bold uppercase tracking-[0.3em] mt-6 flex items-center gap-4">
            <span className="w-12 h-[2px] bg-primary/30" />
            Active Deployments & History
          </p>
        </motion.section>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="flex gap-2 p-1.5 glass-card rounded-[1.5rem] w-fit border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(0); }}
              className={`relative px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === tab ? 'text-white' : 'text-white/30 hover:text-white/60'
              }`}
            >
              {activeTab === tab && (
                <motion.div layoutId="tab-pill" className="absolute inset-0 bg-primary rounded-2xl -z-10 shadow-lg shadow-primary/20" />
              )}
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Sessions List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <motion.div key={`skeleton-${i}`} className="h-32 glass-card rounded-[2.5rem] animate-pulse" />
              ))
            ) : isError ? (
              <div className="text-center py-20 text-error font-black uppercase tracking-widest bg-error/5 rounded-[2.5rem] border border-error/10">System Synchronization Failure</div>
            ) : sessions.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-[3rem] p-20 text-center flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-8 border border-white/5">
                  <span className="material-symbols-outlined text-4xl text-white/10">inbox</span>
                </div>
                <p className="font-black text-white/20 uppercase tracking-[0.3em]">No Records Found</p>
              </motion.div>
            ) : (
              sessions.map((session: any) => {
                const displayName = getSessionLabel(session);
                const sessionDateTime = session.startTime || session.sessionDate;
                
                const statusStyles: Record<string, string> = {
                  REQUESTED: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
                  ACCEPTED: 'text-primary bg-primary/10 border-primary/20',
                  COMPLETED: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
                  CANCELLED: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
                };

                return (
                  <motion.div 
                    layout
                    key={session.id} 
                    variants={itemVariants}
                    whileHover={{ x: 8 }}
                    className="glass-card rounded-[2.5rem] p-8 flex flex-col lg:flex-row items-center justify-between gap-8 group"
                  >
                    <div className="flex items-center gap-6 min-w-[300px]">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl transition-transform group-hover:rotate-6 text-white ${getAvatarColor(displayName)}`}>
                        {getInitials(displayName)}
                      </div>
                      <div>
                        <h3 className="font-black text-white text-xl tracking-tighter leading-none mb-2 group-hover:text-primary transition-colors">{displayName}</h3>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px] text-primary">schedule</span>
                          {getSessionDateTimeLabel(sessionDateTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 px-8 py-4 border-l border-white/5 hidden lg:block">
                      <p className="text-[11px] font-black text-white/60 uppercase tracking-widest line-clamp-1">
                        {session.topic || 'Unassigned Objective'}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${statusStyles[session.status] || 'text-white/40 bg-white/5 border-white/10'}`}>
                        {session.status}
                      </span>

                      <div className="flex items-center gap-3">
                        {isMentor && session.status === 'REQUESTED' && (
                          <>
                            <button onClick={() => handleMentorSessionAction(session.id, 'reject')} className="px-6 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Decline</button>
                            <button onClick={() => handleMentorSessionAction(session.id, 'accept')} className="px-6 py-3 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 transition-all">Authorize</button>
                          </>
                        )}

                        {!isMentor && session.status === 'REQUESTED' && (
                          <button onClick={() => void handleLearnerCancel(session.id)} disabled={cancelMutation.isPending} className="px-6 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50">Abort Request</button>
                        )}

                        {!isMentor && session.status === 'ACCEPTED' && (
                          <>
                            <button className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all flex items-center gap-3">
                              <span className="material-symbols-outlined text-[18px]">videocam</span> Join Comms
                            </button>
                            <button onClick={() => void handleLearnerCancel(session.id)} disabled={cancelMutation.isPending} className="p-3 rounded-2xl text-white/20 hover:text-rose-500 hover:bg-rose-500/10 transition-all" title="Terminate">
                              <span className="material-symbols-outlined text-[20px]">cancel</span>
                            </button>
                          </>
                        )}

                        {isMentor && session.status === 'ACCEPTED' && (
                          <button onClick={() => handleMentorSessionAction(session.id, 'complete')} className="px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">Finalize Deployment</button>
                        )}

                        {!isMentor && session.status === 'COMPLETED' && (
                          <button onClick={() => setReviewModalData({ isOpen: true, mentorId: session.mentorId, sessionId: session.id })} className="px-6 py-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Post-Sync Review</button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <ReviewModal 
        isOpen={reviewModalData.isOpen} 
        onClose={() => setReviewModalData(prev => ({ ...prev, isOpen: false }))} 
        mentorId={reviewModalData.mentorId} 
        sessionId={reviewModalData.sessionId}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['sessions'] })}
      />
    </PageLayout>
  );
};

export default MySessionsPage;
