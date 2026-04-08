import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessions } from '@/hooks/useSessions';
import { useAuthStore } from '@/store/authStore';
import type { SessionDto } from '../components/SessionCard';
import SessionCard from '../components/SessionCard';

type FilterTab = 'all' | 'active' | 'completed' | 'cancelled';

export default function SessionsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { learnerSessions, mentorSessions, isLoading, cancelSession, acceptSession, rejectSession } = useSessions();
  const [viewMode, setViewMode] = useState<'learner' | 'mentor'>(user?.roles?.includes('ROLE_MENTOR') ? 'mentor' : 'learner');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const isMentor = user?.roles?.includes('ROLE_MENTOR');
  const sessions = viewMode === 'mentor' ? mentorSessions : learnerSessions;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all',       label: 'All Sessions' },
    { key: 'active',    label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const activeCount = sessions.filter((s: SessionDto) => ['REQUESTED','ACCEPTED','CONFIRMED'].includes(s.status)).length;
  const completedCount = sessions.filter((s: SessionDto) => s.status === 'CONFIRMED').length;
  const cancelledCount = sessions.filter((s: SessionDto) => ['CANCELLED','REJECTED','PAYMENT_FAILED'].includes(s.status)).length;

  const filteredSessions = () => {
    switch (activeTab) {
      case 'active':    return sessions.filter((s: SessionDto) => ['REQUESTED','ACCEPTED','CONFIRMED'].includes(s.status));
      case 'completed': return sessions.filter((s: SessionDto) => s.status === 'CONFIRMED');
      case 'cancelled': return sessions.filter((s: SessionDto) => ['CANCELLED','REJECTED','PAYMENT_FAILED'].includes(s.status));
      default:          return sessions;
    }
  };

  const emptyState = () => {
    const data: Record<FilterTab, { icon: string, title: string, desc: string }> = {
      all: { 
        icon: 'event_note', 
        title: 'No sessions recorded', 
        desc: viewMode === 'mentor' ? 'You haven\'t received any mentorship requests yet.' : 'Your journey starts here. Book a session with a top-tier mentor to accelerate your growth.' 
      },
      active: { 
        icon: 'auto_fix_off', 
        title: 'No ongoing sessions', 
        desc: 'You are all caught up! Browse upcoming slots or reach out to mentors.' 
      },
      completed: { 
        icon: 'assignment_turned_in', 
        title: 'No completed goals', 
        desc: 'Once you finish your first session, it will appear here for review.' 
      },
      cancelled: { 
        icon: 'event_busy', 
        title: 'No cancelled sessions', 
        desc: 'Good news! You have no cancelled or rejected sessions.' 
      }
    };
    return data[activeTab];
  };

  const handleCancel = async (id: number) => {
    if (window.confirm('Are you sure you want to cancel this session?')) {
      try {
        await cancelSession(id);
      } catch (err) {
        console.error('Cancel failed', err);
      }
    }
  };

  const handleAccept = async (id: number) => {
    if (window.confirm('Accept this session request?')) {
      try {
        await acceptSession(id);
      } catch (err) {
        console.error('Accept failed', err);
      }
    }
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt('Please provide a reason for rejecting this request:');
    if (reason !== null) {
      try {
        await rejectSession({ id, reason: reason || 'No reason provided.' });
      } catch (err) {
        console.error('Reject failed', err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20 px-4 lg:px-8 font-sans mt-8">

      {/* Mode Toggle */}
      {isMentor && (
        <div className="flex justify-center md:justify-start">
          <div className="bg-surface p-1.5 rounded-2xl inline-flex gap-2">
            <button 
              onClick={() => setViewMode('learner')}
              className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'learner' ? 'bg-card shadow-xl text-primary-600 dark:text-primary-400' : 'text-muted hover:text-foreground'}`}
            >
              Learner Mode
            </button>
            <button 
              onClick={() => setViewMode('mentor')}
              className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'mentor' ? 'bg-card shadow-xl text-primary-600 dark:text-primary-400' : 'text-muted hover:text-foreground'}`}
            >
              Mentor Mode
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            My <span className="text-primary-600 dark:text-primary-400 uppercase italic leading-none">{viewMode === 'mentor' ? 'Mentorship' : 'Learning'}</span> Sessions
          </h1>
          <p className="text-muted font-bold text-lg">Track your progress and upcoming mentorship meetings.</p>
        </div>
        {viewMode === 'learner' && (
          <button 
            onClick={() => navigate('/mentors')}
            className="bg-primary-600 text-white rounded-2xl px-8 py-4 font-bold shadow-xl shadow-primary-200 dark:shadow-primary-900/50 hover:bg-primary-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2">
            <span className="material-icons text-xl">add_circle</span>
            Book New Session
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div onClick={() => setActiveTab('all')} 
             className={`neu-panel p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 ring-primary-500 ring-offset-2 dark:ring-offset-background ${activeTab === 'all' ? 'ring-2' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center text-muted">
              <span className="material-icons">event</span>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Total</p>
              <p className="text-2xl font-extrabold text-foreground tracking-tight">{sessions.length}</p>
            </div>
          </div>
        </div>
        <div onClick={() => setActiveTab('active')} 
             className={`neu-panel p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 ring-blue-500 ring-offset-2 dark:ring-offset-background ${activeTab === 'active' ? 'ring-2' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
              <span className="material-icons">bolt</span>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Active</p>
              <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-500 tracking-tight">{activeCount}</p>
            </div>
          </div>
        </div>
        <div onClick={() => setActiveTab('completed')} 
             className={`neu-panel p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 ring-emerald-500 ring-offset-2 dark:ring-offset-background ${activeTab === 'completed' ? 'ring-2' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <span className="material-icons">check_circle</span>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Done</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-500 tracking-tight">{completedCount}</p>
            </div>
          </div>
        </div>
        <div onClick={() => setActiveTab('cancelled')} 
             className={`neu-panel p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 ring-red-500 ring-offset-2 dark:ring-offset-background ${activeTab === 'cancelled' ? 'ring-2' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
              <span className="material-icons">cancel</span>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Cancelled</p>
              <p className="text-2xl font-extrabold text-red-600 dark:text-red-500 tracking-tight">{cancelledCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        
        {/* Filter Bar */}
        <div className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl w-fit">
          {tabs.map((tab) => (
            <button 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 whitespace-nowrap ${
                activeTab === tab.key ? 'bg-card shadow-md text-primary-600 dark:text-primary-400' : 'text-muted'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Session List / Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map((i) => (
              <div key={i} className="h-64 bg-surface rounded-[2.5rem] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSessions().map((s: SessionDto) => (
              <SessionCard 
                key={s.id}
                session={s}
                onView={(id) => navigate(`/sessions/${id}`)}
                onCancel={handleCancel}
                onPay={(id) => navigate(`/payment?sessionId=${id}`)}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}
            {filteredSessions().length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center animate-drop-in">
                <div className="w-24 h-24 bg-surface rounded-[2rem] flex items-center justify-center text-muted mb-6">
                  <span className="material-icons text-6xl">{emptyState().icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground">{emptyState().title}</h3>
                <p className="text-muted max-w-sm mt-2 font-medium">{emptyState().desc}</p>
                {activeTab === 'all' && viewMode === 'learner' && (
                  <button onClick={() => navigate('/mentors')} className="mt-8 px-8 py-3 bg-primary-600 text-white rounded-2xl text-sm font-bold hover:shadow-lg transition-all active:scale-95">Find Your First Mentor</button>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
