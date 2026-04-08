import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession, useSessions } from '@/hooks/useSessions';
import { useAuthStore } from '@/store/authStore';
import { Loader2, ArrowLeft, ShieldCheck, CheckCircle2, XCircle, Clock, Ban, CreditCard, Star, Activity, CalendarDays, History } from 'lucide-react';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  REQUESTED: { color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock className="w-6 h-6" />, label: 'Requested' },
  ACCEPTED: { color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <CheckCircle2 className="w-6 h-6" />, label: 'Accepted' },
  CONFIRMED: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <ShieldCheck className="w-6 h-6" />, label: 'Confirmed' },
  REJECTED: { color: 'text-red-600', bg: 'bg-red-50', icon: <XCircle className="w-6 h-6" />, label: 'Rejected' },
  CANCELLED: { color: 'text-slate-400', bg: 'bg-slate-50', icon: <Ban className="w-6 h-6" />, label: 'Cancelled' },
  PAYMENT_FAILED: { color: 'text-red-600', bg: 'bg-red-50', icon: <CreditCard className="w-6 h-6" />, label: 'Failed' },
  REFUNDED: { color: 'text-violet-600', bg: 'bg-violet-50', icon: <History className="w-6 h-6" />, label: 'Refunded' },
};

export default function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sessionId = Number(id);
  
  const { user } = useAuthStore();
  const { data: session, isLoading } = useSession(sessionId);
  const { acceptSession, rejectSession, cancelSession } = useSessions();
  
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Retrieving Session Node...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="py-32 flex flex-col items-center text-center space-y-6">
        <XCircle className="w-16 h-16 text-slate-200" />
        <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Node Not Found</h3>
        <button onClick={() => navigate('/sessions')} className="h-14 px-10 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:rotate-1 transition-all">
          Return to Registry
        </button>
      </div>
    );
  }

  const isMentor = user?.roles.includes('ROLE_MENTOR') && user.id === String(session.mentorId);
  const isLearner = user?.id === String(session.learnerId);
  const config = STATUS_CONFIG[session.status] || STATUS_CONFIG.CANCELLED;

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-12 animate-fade-in font-sans mt-4 text-left">
      <button 
        onClick={() => navigate('/sessions')}
        className="flex items-center gap-2 text-slate-400 hover:text-primary-600 font-black text-xs uppercase tracking-[0.2em] transition-all mb-12 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Operational Registry
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden animate-drop-in">
            <div className={`p-10 flex items-center gap-8 ${config.bg}`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-white shadow-xl ${config.color}`}>
                {config.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Session #{session.id}</h2>
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${config.color.replace('text-', 'bg-')}`}>
                      {config.label}
                   </span>
                </div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest pl-1">Knowledge Transfer Protocol</p>
              </div>
            </div>

            <div className="p-10 space-y-12">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                {[
                  { label: "Temporal Window", val: new Date(session.scheduledAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), sub: new Date(session.scheduledAt).toLocaleTimeString(), icon: <CalendarDays className="w-5 h-5 text-primary-600" /> },
                  { label: "Phase Span", val: `${session.durationMinutes} Minutes`, icon: <Activity className="w-5 h-5 text-primary-600" /> },
                  { label: "Domain Key", val: `SKL-${session.skillId}`, icon: <ShieldCheck className="w-5 h-5 text-primary-600" /> },
                  { label: "Expert Node", val: `MTR-${session.mentorId}`, icon: <History className="w-5 h-5 text-primary-600" /> },
                  { label: "Initialization", val: new Date(session.createdAt).toLocaleDateString(), icon: <Clock className="w-5 h-5 text-primary-600" /> },
                  { label: "Last Sync", val: new Date(session.updatedAt).toLocaleDateString(), icon: <History className="w-5 h-5 text-primary-600" /> }
                ].map((item, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center gap-2 opacity-40">
                       {item.icon}
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                    </div>
                    <div className="pl-7">
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.val}</p>
                      {item.sub && <p className="text-xs font-bold text-slate-400 mt-1">{item.sub}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {session.rejectionReason && (
                <div className="bg-red-50/50 p-8 rounded-[2rem] border border-red-100 flex gap-6 items-start">
                  <Ban className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-red-600 uppercase tracking-[0.2em]">Rejection Protocol Log</h4>
                    <p className="text-sm font-bold text-red-700 leading-relaxed italic">"{session.rejectionReason}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-10">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] font-sans border-b border-slate-50 pb-6">Operations Panel</h3>
            
            <div className="space-y-4">
              {session.status === 'ACCEPTED' && isLearner && (
                <button 
                  onClick={() => navigate(`/payment?sessionId=${session.id}`)}
                  className="w-full h-18 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all py-5"
                >
                  <CreditCard className="w-6 h-6" /> Initialize Payment
                </button>
              )}

              {isMentor && session.status === 'REQUESTED' && !showRejectForm && (
                <>
                  <button 
                    onClick={async () => await acceptSession(session.id)}
                    className="w-full h-18 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all py-5"
                  >
                    <CheckCircle2 className="w-6 h-6" /> Accept Request
                  </button>
                  <button 
                    onClick={() => setShowRejectForm(true)}
                    className="w-full h-18 bg-red-50 text-red-600 rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-red-100 transition-all py-5"
                  >
                    <XCircle className="w-6 h-6" /> Decline Request
                  </button>
                </>
              )}

              {(session.status === 'REQUESTED' || session.status === 'ACCEPTED') && (
                <button 
                  onClick={async () => await cancelSession(session.id)}
                  className="w-full h-18 bg-slate-50 text-slate-400 rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-slate-100 hover:text-slate-900 transition-all py-5"
                >
                  <Ban className="w-6 h-6" /> Termination
                </button>
              )}

              {session.status === 'CONFIRMED' && isLearner && (
                <button 
                  onClick={() => navigate(`/mentors/${session.mentorId}`)}
                  className="w-full h-18 bg-primary-50 text-primary-600 rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-primary-600 hover:text-white transition-all py-5"
                >
                  <Star className="w-6 h-6" /> Deploy Review
                </button>
              )}

              <button 
                onClick={() => navigate(`/mentors/${session.mentorId}`)}
                className="w-full h-18 bg-white border-2 border-slate-100 text-slate-900 rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-slate-50 hover:border-slate-200 transition-all py-5"
              >
                <History className="w-6 h-6" /> Expert Profile
              </button>
            </div>
          </div>

          {showRejectForm && (
            <div className="bg-red-50 rounded-[2.5rem] p-10 border border-red-100 shadow-2xl animate-drop-in space-y-8">
              <div className="space-y-1">
                <h4 className="text-base font-black text-red-700 tracking-tight leading-none uppercase italic">Decline Protocol</h4>
                <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mt-2">Specify reason for termination</p>
              </div>

              <div className="space-y-3">
                 <input 
                   value={rejectReason}
                   onChange={e => setRejectReason(e.target.value)}
                   placeholder="Identify constraint..." 
                   className="w-full h-16 bg-white border border-red-100 rounded-[1.2rem] px-6 outline-none focus:border-red-500 transition-all font-black text-red-900" 
                 />
              </div>

              <div className="flex gap-4">
                 <button onClick={() => setShowRejectForm(false)} className="flex-1 h-16 text-xs font-black text-red-400 uppercase tracking-widest">Abort</button>
                 <button 
                   disabled={!rejectReason}
                   onClick={async () => {
                     await rejectSession({ id: session.id, reason: rejectReason });
                     setShowRejectForm(false);
                   }}
                   className="flex-1 h-16 bg-red-600 text-white rounded-[1.2rem] font-black uppercase tracking-widest shadow-xl shadow-red-200 hover:bg-red-700 active:scale-95 transition-all"
                 >
                   Confirm
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
