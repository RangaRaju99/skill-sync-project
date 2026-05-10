import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import api from '../../services/axios';
import { useToast } from '../../components/ui/Toast';
import { formatDateTimeIST } from '../../utils/dateTime';

const MentorDashboardPage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // For Inline Reject Confirm
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  // Fetch Mentor Profile to get mentorId and rating
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

  // Reviews Query
  const { data: recentReviewsObj } = useQuery({
    queryKey: ['reviews', mentorId],
    queryFn: async () => {
      const res = await api.get(`/api/reviews/mentor/${mentorId}?page=0&size=3`, { _skipErrorRedirect: true } as any);
      return res.data;
    },
    enabled: !!mentorId
  });

  // Mutations
  const acceptMutation = useMutation({
    mutationFn: async (id: number) => api.put(`/api/sessions/${id}/accept`, undefined, { _skipErrorRedirect: true } as any),
    onSuccess: () => {
      showToast({ message: 'Session accepted!', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => api.put(`/api/sessions/${id}/reject`, undefined, { _skipErrorRedirect: true } as any),
    onSuccess: () => {
      showToast({ message: 'Session rejected.', type: 'success' });
      setRejectingId(null);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });

  const completeMutation = useMutation({
    mutationFn: async (id: number) => api.put(`/api/sessions/${id}/complete`, undefined, { _skipErrorRedirect: true } as any),
    onSuccess: () => {
      showToast({ message: 'Session marked complete!', type: 'success' });
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

  const getSessionDisplayName = (session: any) => {
    if (session.learnerName) return session.learnerName;
    return 'Learner';
  };

  const getSessionDateTimeLabel = (session: any) => {
    const raw = session.startTime || session.sessionDate;
    if (!raw) return 'Time unavailable';
    return formatDateTimeIST(raw);
  };

  const rightPanel = (
    <div className="space-y-6 animate-in" style={{ animationDelay: '0.1s' }}>
      {/* Recent Reviews */}
      <div className="surface-card p-6 border-outline/5">
        <h3 className="font-bold text-lg text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">reviews</span>
          Recent Reviews
        </h3>

        {recentReviews.length > 0 ? (
          <div className="space-y-5">
            {recentReviews.map((review: any) => (
              <div key={review.id} className="pb-5 border-b border-outline/5 last:border-0 last:pb-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-on-surface">{review.learnerName || 'Learner'}</span>
                  <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">{formatDateTimeIST(review.createdAt)}</span>
                </div>
                <div className="flex text-amber-500 text-[10px] mb-2 gap-0.5">
                  {Array(5).fill(0).map((_, i) => (
                    <span key={i} className={`material-symbols-outlined text-[14px] ${i < review.rating ? 'filled' : 'opacity-20'}`}>
                      star
                    </span>
                  ))}
                </div>
                <p className="text-sm text-on-surface-variant italic font-medium leading-relaxed opacity-80 line-clamp-2">"{review.comment}"</p>
              </div>
            ))}
            {mentorId && (
              <button
                onClick={() => navigate(`/mentors/${mentorId}`)}
                className="w-full text-center text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:text-primary-dark transition-colors pt-4"
              >
                View Profile Reviews
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/10 mb-4">rate_review</span>
            <p className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">No reviews logged</p>
          </div>
        )}
      </div>

      {/* Mark Sessions Complete Helper */}
      {mentorId && (
        <div className="surface-card p-6 border-primary/20 bg-primary/[0.02]">
          <h3 className="font-bold text-lg text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">event_available</span> 
            Availability
          </h3>
          <p className="text-sm text-on-surface-variant font-medium mb-6 leading-relaxed opacity-80">
            Manage your weekly availability from the dedicated page.
          </p>
          <button
            onClick={() => navigate('/mentor/availability')}
            className="btn-primary w-full shadow-primary/10"
          >
            Manage Availability
          </button>
        </div>
      )}

      <div className="surface-card p-6 border-outline/5">
        <h3 className="font-bold text-lg text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">groups</span> 
          Group Hub
        </h3>
        <p className="text-sm text-on-surface-variant font-medium mb-6 leading-relaxed opacity-80">
          Browse groups and join community discussions.
        </p>
        <button
          onClick={() => navigate('/groups')}
          className="btn-secondary w-full"
        >
          Open Group Hub
        </button>
      </div>
    </div>
  );

  return (
    <PageLayout rightPanel={rightPanel}>
      <div className="mb-10 w-full flex flex-col lg:flex-row lg:items-end justify-between gap-6 animate-in">
        <div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-on-surface tracking-tight mb-3">Mentor Dashboard</h1>
          <p className="text-lg text-on-surface-variant font-medium max-w-2xl opacity-80">
            Welcome back. Manage your session requests and track your schedule.
          </p>
        </div>
        {mentorId && (
          <button onClick={() => navigate(`/mentors/${mentorId}`)} className="btn-secondary h-12 px-6 flex items-center gap-2">
            <span className="text-xs font-bold">Public Profile</span>
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          </button>
        )}
      </div>

      {/* Stats Row */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 animate-in" style={{ animationDelay: '0.1s' }}>
        <div className="surface-card p-8 flex flex-col items-center justify-center text-center border-outline/5">
          <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-4">Total Sessions</span>
          <span className="text-4xl font-bold text-on-surface">{totalSessionsCount}</span>
        </div>
        <div className="surface-card p-8 flex flex-col items-center justify-center text-center border-outline/5">
          <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-4">Avg Rating</span>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-on-surface">
              {isNewMentor ? 'NEW' : mentorRating.toFixed(1)}
            </span>
            {!isNewMentor && <span className="text-amber-500 text-2xl font-bold pb-1">★</span>}
          </div>
        </div>
        <div className="surface-card p-8 flex flex-col items-center justify-center text-center border-amber-500/10">
          <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-4">Pending Requests</span>
          <span className={`text-4xl font-bold ${pendingRequestsCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {pendingRequestsCount}
          </span>
        </div>
      </section>

      {/* Pending Requests */}
      <section className="mb-10 animate-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-on-surface">Action Required</h2>
            {pendingRequestsCount > 0 && (
              <span className="bg-amber-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                {pendingRequestsCount} Pending
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {pendingRequests.length > 0 ? (
            pendingRequests.map((req: any) => (
              <div key={req.id} className="surface-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-amber-500/20 group">
                <div className="flex items-center gap-5 min-w-[280px]">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xl border border-amber-500/10 group-hover:scale-105 transition-transform">
                    {getInitials(getSessionDisplayName(req))}
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface leading-tight text-lg group-hover:text-primary transition-colors">{getSessionDisplayName(req)}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-black text-on-surface-variant/60 mt-2 uppercase tracking-widest">
                      <span className="material-symbols-outlined text-[14px] text-amber-500/60">calendar_today</span>
                      <span>{getSessionDateTimeLabel(req)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  {rejectingId === req.id ? (
                    <div className="flex items-center gap-4 bg-error/5 p-2 px-4 rounded-xl border border-error/10">
                      <span className="text-[10px] font-black text-error uppercase tracking-widest">Reject this request?</span>
                      <div className="flex gap-2">
                        <button onClick={() => rejectMutation.mutate(req.id)} disabled={rejectMutation.isPending} className="px-4 py-1.5 bg-error text-white text-[10px] font-black uppercase rounded-lg hover:bg-error/90 transition-all">Yes</button>
                        <button onClick={() => setRejectingId(null)} className="px-3 py-1.5 text-[10px] font-black text-on-surface-variant uppercase hover:text-on-surface transition-all">No</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setRejectingId(req.id)}
                        className="btn-secondary h-11 px-6 text-xs"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => acceptMutation.mutate(req.id)}
                        disabled={acceptMutation.isPending}
                        className="btn-primary h-11 px-8 text-xs shadow-primary/10"
                      >
                        Accept Request
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="surface-card p-16 text-center flex flex-col items-center border-dashed border-emerald-500/20 bg-emerald-500/[0.02]">
              <span className="material-symbols-outlined text-5xl text-emerald-500/20 mb-6">verified_user</span>
              <p className="text-xl font-bold text-on-surface mb-2">No pending requests</p>
              <p className="text-on-surface-variant font-medium max-w-xs opacity-60">You have no pending session requests at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Sessions */}
      <section className="animate-in" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-2xl font-bold text-on-surface mb-6">Upcoming Sessions</h2>
        <div className="space-y-4">
          {upcomingSessionsCount > 0 ? (
            upcomingSessions.map((session: any) => (
              <div key={session.id} className="surface-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                <div className="flex items-center gap-5 min-w-[280px]">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold text-xl border border-outline/10 group-hover:scale-105 transition-transform">
                    {getInitials(getSessionDisplayName(session))}
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface leading-tight text-lg group-hover:text-primary transition-colors">{getSessionDisplayName(session)}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-black text-on-surface-variant/60 mt-2 uppercase tracking-widest">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      <span>{getSessionDateTimeLabel(session)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <button className="btn-secondary h-11 px-6 flex items-center gap-2 group-hover:border-primary/20">
                    <span className="material-symbols-outlined text-[18px]">videocam</span> Join Call
                  </button>
                  <button
                    onClick={() => completeMutation.mutate(session.id)}
                    disabled={completeMutation.isPending}
                    className="h-11 px-6 bg-emerald-500/5 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/10"
                  >
                    Mark Complete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-2">
              <p className="text-sm font-bold text-on-surface-variant/40 uppercase tracking-widest">No upcoming sessions</p>
            </div>
          )}
        </div>
      </section>

    </PageLayout>
  );
};

export default MentorDashboardPage;
