import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MessageSquare,
  Video,
  MoreVertical,
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
        <div className="surface-card p-8">
          <h1 className="text-4xl font-bold text-on-surface tracking-tight mb-2">My Sessions</h1>
          <p className="text-on-surface-variant font-medium leading-relaxed max-w-2xl">
            {isMentor
              ? 'Review learner bookings, manage incoming requests, and track your completed sessions in real-time.'
              : 'Synchronize with your mentors, manage scheduled sessions, and review your learning progress.'}
          </p>
        </div>

        <div className="bg-surface-container-low p-1.5 inline-flex gap-1 rounded-2xl border border-outline shadow-inner">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(0); }}
              className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'text-on-surface-variant hover:text-on-surface'
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
            <div className="surface-card p-12 text-center text-error font-bold">Protocol failure: Failed to load sessions.</div>
          ) : sessions.length === 0 ? (
            <div className="surface-card p-20 text-center flex flex-col items-center">
              <Calendar className="text-on-surface-variant/20 mb-6" size={64} />
              <p className="text-xl font-bold text-on-surface mb-2">No records found</p>
              <p className="text-on-surface-variant font-medium">System reports zero active sessions in this category.</p>
            </div>
          ) : (
            sessions.map((session: any) => {
              const displayName = getSessionLabel(session);
              const sessionDateTime = session.startTime || session.sessionDate;

              let statusVariant = 'bg-primary/10 text-primary border-primary/10';
              if (session.status === 'REQUESTED') statusVariant = 'bg-amber-500/10 text-amber-500 border-amber-500/10';
              if (session.status === 'ACCEPTED') statusVariant = 'bg-primary text-white border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.3)]';
              if (session.status === 'COMPLETED') statusVariant = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10';
              if (session.status === 'CANCELLED') statusVariant = 'bg-error/10 text-error border-error/10';

              return (
                <div key={session.id} className="surface-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group hover:border-primary/20 transition-all">
                  
                  {/* Participant Info */}
                  <div className="flex items-center gap-5 min-w-[280px]">
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-bold text-xl shadow-inner border border-primary/10 group-hover:scale-105 transition-transform">
                      {getInitials(displayName)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-on-surface leading-tight group-hover:text-primary transition-colors">{displayName}</h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant mt-1.5 uppercase tracking-widest opacity-80">
                        <Clock size={12} className="text-primary" />
                        <span>{formatDateTimeIST(sessionDateTime)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Topic Section */}
                  <div className="flex-1 md:px-8 w-full">
                    <div className="bg-surface-container-low px-4 py-3 rounded-xl border border-outline/5 group-hover:bg-primary/5 transition-colors">
                      <p className="text-sm font-bold text-on-surface-variant group-hover:text-on-surface transition-colors line-clamp-1">
                        {session.topic || 'General Knowledge Exchange'}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${statusVariant}`}>
                      {session.status}
                    </span>

                    <div className="flex items-center gap-3">
                      {isMentor && session.status === 'REQUESTED' && (
                        <>
                          <button
                            onClick={() => handleMentorSessionAction(session.id, 'reject')}
                            className="h-10 px-4 bg-error/10 text-error rounded-xl text-xs font-bold hover:bg-error hover:text-white transition-all border border-error/10"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleMentorSessionAction(session.id, 'accept')}
                            className="btn-primary h-10 px-6 text-xs"
                          >
                            Accept Sync
                          </button>
                        </>
                      )}

                      {!isMentor && session.status === 'REQUESTED' && (
                        <button
                          onClick={() => void handleLearnerCancel(session.id)}
                          disabled={cancelMutation.isPending}
                          className="h-10 px-4 bg-error/10 text-error rounded-xl text-xs font-bold hover:bg-error hover:text-white transition-all border border-error/10 disabled:opacity-50"
                        >
                          Terminate
                        </button>
                      )}

                      {!isMentor && session.status === 'ACCEPTED' && (
                        <div className="flex items-center gap-2">
                          <button className="h-10 px-6 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                            <Video size={14} />
                            Join Session
                          </button>
                          <button
                            onClick={() => void handleLearnerCancel(session.id)}
                            disabled={cancelMutation.isPending}
                            className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      )}

                      {isMentor && session.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleMentorSessionAction(session.id, 'complete')}
                          className="h-10 px-6 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/10"
                        >
                          Complete Sync
                        </button>
                      )}

                      {!isMentor && session.status === 'COMPLETED' && (
                        <button
                          onClick={() => setReviewModalData({ isOpen: true, mentorId: session.mentorId, sessionId: session.id })}
                          className="h-10 px-6 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all border border-primary/20"
                        >
                          Log Feedback
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {data?.totalElements > 10 && (
          <div className="flex justify-center items-center gap-4 pt-8">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-12 h-12 surface-card flex items-center justify-center text-on-surface disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
              Protocol {page + 1} / {Math.ceil(data.totalElements / 10)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(data.totalElements / 10) - 1}
              className="w-12 h-12 surface-card flex items-center justify-center text-on-surface disabled:opacity-30"
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

export default MySessionsPage;
