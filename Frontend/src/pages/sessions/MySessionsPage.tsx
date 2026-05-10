import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { 
  Calendar, 
  Clock, 
  XCircle, 
  Video,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
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
      showToast({ message: 'Session cancelled successfully.', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: () => showToast({ message: 'Failed to cancel session.', type: 'error' }),
  });

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const p = name.split(' ');
    return p.length > 1 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : p[0][0].toUpperCase();
  };

  const getSessionLabel = (session: any) => {
    return isMentor ? (session.learnerName || 'Learner') : (session.mentorName || 'Mentor');
  };

  const handleLearnerCancel = async (sessionId: number) => {
    const confirmed = await requestConfirmation({
      title: 'Cancel Session?',
      message: 'Are you sure you want to cancel the session? No compensation would be provided for it.',
      confirmLabel: 'Yes, cancel session',
    });

    if (!confirmed) return;
    cancelMutation.mutate(sessionId);
  };

  const handleMentorSessionAction = async (id: number, action: 'accept' | 'reject' | 'complete') => {
    try {
      await api.put(`/api/sessions/${id}/${action}`);
      const actionLabel = action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'completed';
      showToast({ message: `Session ${actionLabel} successfully.`, type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    } catch (error) {
      showToast({ message: `Failed to ${action} session.`, type: 'error' });
    }
  };

  const sessions = data?.content || [];

  return (
    <PageLayout>
      <div className="space-y-8 animate-in">
        <div className="surface-card p-8 border-primary/10">
          <h1 className="text-4xl font-bold text-on-surface tracking-tight mb-3">My Sessions</h1>
          <p className="text-on-surface-variant font-medium leading-relaxed max-w-2xl opacity-80">
            {isMentor
              ? 'Review learner bookings, manage incoming requests, and track your completed sessions in real-time. System operational.'
              : 'Synchronize with your mentors, manage scheduled sessions, and review your learning progress. System operational.'}
          </p>
        </div>

        <div className="bg-surface-container-low p-1.5 inline-flex gap-1 rounded-2xl border border-outline/10 shadow-inner">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(0); }}
              className={`whitespace-nowrap px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab
                  ? 'bg-primary text-white shadow-lg shadow-primary/10 scale-[1.02]'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/[0.03]'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <div key={i} className="h-28 surface-card animate-pulse" />)
          ) : isError ? (
            <div className="surface-card p-12 text-center text-error font-bold border-error/20">Protocol failure: Failed to load sessions.</div>
          ) : sessions.length === 0 ? (
            <div className="surface-card p-20 text-center flex flex-col items-center border-dashed">
              <Calendar className="text-on-surface-variant/10 mb-6" size={64} />
              <p className="text-xl font-bold text-on-surface mb-2">No records found</p>
              <p className="text-on-surface-variant font-medium">System reports zero active sessions in this category.</p>
            </div>
          ) : (
            sessions.map((session: any) => {
              const displayName = getSessionLabel(session);
              const sessionDateTime = session.startTime || session.sessionDate;

              let statusVariant = 'bg-primary/5 text-primary border-primary/10';
              if (session.status === 'REQUESTED') statusVariant = 'bg-amber-500/5 text-amber-500 border-amber-500/10';
              if (session.status === 'ACCEPTED') statusVariant = 'bg-primary text-white border-primary/20 shadow-lg shadow-primary/10';
              if (session.status === 'COMPLETED') statusVariant = 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10';
              if (session.status === 'CANCELLED') statusVariant = 'bg-error/5 text-error border-error/10';

              return (
                <div key={session.id} className="surface-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group hover:border-primary/20 transition-all">
                  
                  {/* Participant Info */}
                  <div className="flex items-center gap-5 min-w-[300px]">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl border border-primary/10 group-hover:scale-105 transition-transform">
                      {getInitials(displayName)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-on-surface leading-tight group-hover:text-primary transition-colors">{displayName}</h3>
                      <div className="flex items-center gap-2 text-[10px] font-black text-on-surface-variant/60 mt-2 uppercase tracking-widest">
                        <Clock size={12} className="text-primary/60" />
                        <span>{formatDateTimeIST(sessionDateTime)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Topic Section */}
                  <div className="flex-1 md:px-8 w-full">
                    <div className="bg-surface-container-low px-5 py-3.5 rounded-2xl border border-outline/10 group-hover:border-primary/20 transition-all">
                      <p className="text-sm font-bold text-on-surface-variant group-hover:text-on-surface transition-colors line-clamp-1 opacity-80 group-hover:opacity-100">
                        {session.topic || 'General Protocol Sync'}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${statusVariant}`}>
                      {session.status}
                    </span>

                    <div className="flex items-center gap-3">
                      {isMentor && session.status === 'REQUESTED' && (
                        <>
                          <button
                            onClick={() => handleMentorSessionAction(session.id, 'reject')}
                            className="h-11 px-5 bg-error/5 text-error rounded-xl text-xs font-bold hover:bg-error hover:text-white transition-all border border-error/10"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleMentorSessionAction(session.id, 'accept')}
                            className="btn-primary h-11 px-7 text-xs shadow-primary/10"
                          >
                            Accept Sync
                          </button>
                        </>
                      )}

                      {!isMentor && session.status === 'REQUESTED' && (
                        <button
                          onClick={() => void handleLearnerCancel(session.id)}
                          disabled={cancelMutation.isPending}
                          className="h-11 px-5 bg-error/5 text-error rounded-xl text-xs font-bold hover:bg-error hover:text-white transition-all border border-error/10 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}

                      {!isMentor && session.status === 'ACCEPTED' && (
                        <div className="flex items-center gap-3">
                          <button className="h-11 px-7 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10">
                            <Video size={14} />
                            Join Session
                          </button>
                          <button
                            onClick={() => void handleLearnerCancel(session.id)}
                            disabled={cancelMutation.isPending}
                            className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/5 rounded-xl transition-all border border-transparent hover:border-error/10"
                            title="Cancel Session"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      )}

                      {isMentor && session.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleMentorSessionAction(session.id, 'complete')}
                          className="h-11 px-7 bg-emerald-500/5 text-emerald-500 rounded-xl text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/10"
                        >
                          Complete Sync
                        </button>
                      )}

                      {!isMentor && session.status === 'COMPLETED' && (
                        <button
                          onClick={() => setReviewModalData({ isOpen: true, mentorId: session.mentorId, sessionId: session.id })}
                          className="btn-secondary h-11 px-7 text-xs"
                        >
                          Leave Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          </div>
        )}

        {/* Pagination */}
        {data?.totalElements > 10 && (
          <div className="flex justify-center items-center gap-4 pt-10">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-12 h-12 surface-card flex items-center justify-center text-on-surface hover:border-primary/40 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] px-4">
              Page {page + 1} / {Math.ceil(data.totalElements / 10)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(data.totalElements / 10) - 1}
              className="w-12 h-12 surface-card flex items-center justify-center text-on-surface hover:border-primary/40 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

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
