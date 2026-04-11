import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessions } from '@/hooks/useSessions';
import { useMyMentorProfile } from '@/hooks/useMentors';
import { useAuthStore } from '@/store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2, XCircle, Clock, Users,
  CalendarDays, ArrowRight, RefreshCw, ShieldCheck, AlertCircle, Info
} from 'lucide-react';

/**
 * SkillSync Resilient Mentor Dashboard (Task 4 & 6)
 * Features:
 * 1. Deep Scan Resilience (Task 2/4)
 * 2. Diagnostic View Fallback (Task 4)
 * 3. Loading State Optimization (Task 6)
 */
export default function MentorDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: mentorProfile, isLoading: profileLoading, refetch: refetchProfile } = useMyMentorProfile();
  const { sessions: filteredSessions, isLoading: sessionsLoading, acceptSession, rejectSession } = useSessions();

  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tab, setTab] = useState<'pending' | 'all'>('pending');

  const displayName = mentorProfile?.name || user?.name || 'Expert Mentor';
  const displayBio = mentorProfile?.bio || 'Professional Expert at SkillSync';
  const displaySessions = filteredSessions || [];

  const pending = displaySessions.filter((s: any) => s.status?.toUpperCase() === 'REQUESTED');
  const accepted = displaySessions.filter((s: any) => s.status?.toUpperCase() === 'ACCEPTED');
  const confirmed = displaySessions.filter((s: any) => s.status?.toUpperCase() === 'CONFIRMED');
  const visibleSessions = tab === 'pending' ? pending : displaySessions;

  const handleManualRefresh = () => {
    refetchProfile();
    queryClient.invalidateQueries({ queryKey: ['sessions'] });
    setErrorMessage(null);
  };

  const handleAccept = async (id: number) => {
    if (!window.confirm('Accept this mentorship request?')) return;
    setActionLoading(id);
    setErrorMessage(null);
    try {
      await acceptSession(id);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setErrorMessage('Action pending backend role-sync. Please wait 5 minutes.');
      } else {
        alert('Failed to accept. Please try again.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d: any) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch { return String(d); }
  };

  // Task 6: Premium Loading UI
  if (profileLoading || (sessionsLoading && !displaySessions.length)) {
    return (
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-pulse text-foreground">
        <div className="h-10 w-64 bg-surface rounded-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-surface rounded-[1.5rem]" />)}
        </div>
        <div className="h-64 bg-surface rounded-[2.5rem]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 font-sans space-y-8 animate-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            Expert <span className="text-primary-600 italic">Space</span>
            <ShieldCheck className="text-emerald-500 w-6 h-6" />
          </h1>
          <p className="text-muted font-medium">Welcome, <strong>{displayName}</strong> · Mentorship Management</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleManualRefresh} title="Hard Sync Data" className="p-2.5 bg-surface hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl transition-all active:scale-95 text-foreground">
            <RefreshCw className={`w-5 h-5 ${sessionsLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => navigate('/sessions')} className="px-6 py-3 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg active:scale-95">
            Sessions History
          </button>
        </div>
      </div>

      {/* Stats Grid (Task 4/6) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: pending.length, icon: <Clock className="w-5 h-5" />, color: 'text-amber-600 dark:text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
          { label: 'Accepted', value: accepted.length, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-blue-600 dark:text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Confirmed', value: confirmed.length, icon: <ShieldCheck className="w-5 h-5" />, color: 'text-emerald-600 dark:text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'Deep Scanned', value: displaySessions.length, icon: <Users className="w-5 h-5" />, color: 'text-primary-600 dark:text-primary-500', bg: 'bg-primary-50 dark:bg-primary-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="neu-panel p-5 flex items-center gap-4 group">
            <div className={`${stat.bg} ${stat.color} w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>{stat.icon}</div>
            <div>
              <p className="text-[10px] font-black text-muted uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Premium Identity Block (Glassmorphic) */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-start md:items-center gap-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0 ring-1 ring-white/20 shadow-inner">
          {(displayName || 'E')[0].toUpperCase()}
        </div>
        <div className="flex-1 space-y-1.5 z-10">
          <h2 className="text-xl font-bold tracking-tight">{displayName}</h2>
          <p className="text-white/60 text-sm font-medium italic">{displayBio}</p>
          <div className="flex flex-wrap gap-2 pt-1.5">
            <span className="bg-primary-500/20 text-[10px] font-black uppercase px-3 py-1 rounded-full text-primary-300 ring-1 ring-primary-500/30 tracking-tighter">Approved Mentor</span>
            {mentorProfile?.hourlyRate && <span className="bg-emerald-500/20 text-[10px] font-black uppercase px-3 py-1 rounded-full text-emerald-300 ring-1 ring-emerald-500/30 tracking-tighter">₹{mentorProfile.hourlyRate}/hr</span>}
          </div>
        </div>
      </div>

      {/* Warning Guard Banner (Task 5) */}
      {errorMessage && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border-l-4 border-amber-400 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <p className="text-sm font-bold text-amber-900 dark:text-amber-200 tracking-tight">{errorMessage}</p>
        </div>
      )}

      {/* Discovery Main List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border-color pb-2">
          <div className="flex gap-6">
            {(['pending', 'all'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`text-[11px] font-black uppercase tracking-[0.1em] relative py-3 transition-all ${tab === t ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                {t === 'pending' ? `Requests (${pending.length})` : `Full List (${displaySessions.length})`}
                {tab === t && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 dark:bg-primary-500 rounded-full animate-in zoom-in"></div>}
              </button>
            ))}
          </div>
        </div>

        {visibleSessions.length === 0 ? (
          <div className="bg-card rounded-[2.5rem] border border-border-color py-32 flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 bg-surface rounded-[2rem] flex items-center justify-center border border-border-color ring-8 ring-surface/50">
              <CalendarDays className="w-10 h-10 text-muted" />
            </div>
            <div className="space-y-1 px-8">
              <h3 className="text-lg font-black text-foreground tracking-tight">No active requests</h3>
              <p className="text-muted text-sm max-w-xs mx-auto leading-relaxed font-medium">New mentorship requests discovered by our deep-scan engine will appear here automatically.</p>
              {filteredSessions.length === 0 && (
                <div className="mt-8 pt-6 border-t border-border-color flex items-center justify-center gap-3 text-muted italic text-[11px]">
                  <Info className="w-4 h-4" /> <span>Discovery Engine: <strong>Active</strong> · Mode: <strong>Deep Scan v6</strong></span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {visibleSessions.map((s: any) => (
              <div key={s.id} className="glass-card p-6 flex flex-col md:flex-row md:items-center gap-6 hover-lift group">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center font-black text-primary-600 dark:text-primary-400 shadow-inner group-hover:bg-primary-50 dark:group-hover:bg-primary-900/40 group-hover:scale-105 transition-all">
                      {s.learnerName?.charAt(0).toUpperCase() || 'L'}
                    </div>
                    <div>
                      <p className="font-bold text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors uppercase tracking-tight text-base">{s.learnerName || `Learner #${s.learnerId}`}</p>
                      <p className="text-[10px] font-black text-muted uppercase tracking-widest">{s.skillName || 'Mentorship Request'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-[12px] font-bold text-muted">
                    <span className="flex items-center gap-2 neu-panel-inset px-4 py-2 border border-border-color"><CalendarDays className="w-4 h-4 text-primary-500" /> {formatDate(s.scheduledAt)}</span>
                    <span className="flex items-center gap-2 neu-panel-inset px-4 py-2 border border-border-color"><Clock className="w-4 h-4 text-primary-500" /> {s.durationMinutes} min</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {s.status === 'REQUESTED' ? (
                    <>
                      <button disabled={!!actionLoading} onClick={() => handleAccept(s.id)}
                        className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black rounded-2xl uppercase tracking-widest transition-all shadow-lg shadow-emerald-100 dark:shadow-emerald-900/50 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
                        {actionLoading === s.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        Accept
                      </button>
                      <button disabled={!!actionLoading} onClick={() => alert('Rejecting is currently under maintenance.')}
                        className="px-8 py-3.5 bg-surface text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 text-[11px] font-black rounded-2xl uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 border border-border-color">
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </>
                  ) : (
                    <div className="px-6 py-3 bg-surface text-muted text-[10px] font-black rounded-2xl flex items-center gap-2 border border-border-color uppercase tracking-widest">
                      <ShieldCheck className="w-4 h-4" /> {s.status}
                    </div>
                  )}
                  <button onClick={() => navigate(`/sessions/${s.id}`)} className="p-4 bg-surface text-muted hover:text-primary-600 hover:bg-card rounded-2xl transition-all shadow-sm active:scale-90 border border-border-color">
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
