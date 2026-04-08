import { useAuthStore } from '../../../store/authStore';
import { useSkills } from '../../../hooks/useSkills';
import { Clock, CheckCircle2, ShieldCheck, XCircle, Ban, CreditCard, History, Calendar, GraduationCap, User, Trash2, ArrowRight } from 'lucide-react';

export interface SessionDto {
  id: number;
  mentorId: number;
  learnerId: number;
  skillId: number;
  topic?: string;
  status: string;
  scheduledAt: string;
  durationMinutes: number;
  mentorName?: string;
  learnerName?: string;
  meetingLink?: string;
  rejectionReason?: string;
  cancelledAt?: string;
  createdAt: string;
}

const STATUS_MAP: Record<string, { color: string; bg: string; icon: any; label: string; ring: string }> = {
  REQUESTED:      { color: 'text-amber-600 dark:text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-500/10',    icon: <Clock className="w-5 h-5" />,  label: 'Requested',       ring: 'ring-amber-500/20' },
  ACCEPTED:       { color: 'text-blue-600 dark:text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-500/10',     icon: <CheckCircle2 className="w-5 h-5" />, label: 'Accepted',        ring: 'ring-blue-500/20' },
  CONFIRMED:      { color: 'text-emerald-600 dark:text-emerald-500',bg: 'bg-emerald-50 dark:bg-emerald-500/10',  icon: <ShieldCheck className="w-5 h-5" />, label: 'Confirmed',       ring: 'ring-emerald-500/20' },
  REJECTED:       { color: 'text-red-600 dark:text-red-500',    bg: 'bg-red-50 dark:bg-red-500/10',      icon: <XCircle className="w-5 h-5" />, label: 'Rejected',        ring: 'ring-red-500/20' },
  CANCELLED:      { color: 'text-slate-500 dark:text-slate-400',  bg: 'bg-slate-50 dark:bg-slate-500/10',    icon: <Ban className="w-5 h-5" />, label: 'Cancelled',       ring: 'ring-slate-500/20' },
  PAYMENT_FAILED: { color: 'text-red-600 dark:text-red-500',    bg: 'bg-red-50 dark:bg-red-500/10',      icon: <CreditCard className="w-5 h-5" />, label: 'Payment Failed',  ring: 'ring-red-500/20' },
  REFUNDED:       { color: 'text-violet-600 dark:text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10',   icon: <History className="w-5 h-5" />, label: 'Refunded',        ring: 'ring-violet-500/20' },
};

interface SessionCardProps {
  session: SessionDto;
  onView: (id: number) => void;
  onCancel: (id: number) => void;
  onPay: (id: number) => void;
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
}

export default function SessionCard({ session, onView, onCancel, onPay, onAccept, onReject }: SessionCardProps) {
  const { user } = useAuthStore();
  const { data: skills } = useSkills();

  const isLearner = Number(user?.id) === Number(session.learnerId);
  const skill = skills?.find(s => s.id === session.skillId);
  const skillName = skill ? (skill.skillName) : ('Skill #' + session.skillId);
  const s = STATUS_MAP[session.status] ?? STATUS_MAP['CANCELLED'];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="group glass-card p-8 hover:shadow-primary-600/10 transition-all duration-500 hover:-translate-y-1.5 relative flex flex-col justify-between h-full font-sans text-left">
      
      {/* Top Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`${s.bg} ${s.color} w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
              {s.icon}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Node Cluster</p>
              <p className="text-sm font-black text-foreground tracking-tight italic uppercase">#{session.id}</p>
            </div>
          </div>
          <div className={`${s.bg} ${s.color} ${s.ring} px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 flex items-center gap-2`}>
             <span className={`w-1.5 h-1.5 rounded-full bg-current ${['REQUESTED', 'ACCEPTED'].includes(session.status) ? 'animate-pulse' : ''}`}></span>
             {s.label}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-4 text-muted group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
             <Calendar className="w-5 h-5 flex-shrink-0" />
             <p className="text-sm font-bold tracking-tight text-slate-700 dark:text-slate-300">{formatDate(session.scheduledAt)}</p>
          </div>
          <div className="flex items-center gap-4 text-muted group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
             <GraduationCap className="w-5 h-5 flex-shrink-0" />
             <p className="text-xs font-black tracking-[0.1em] text-foreground uppercase italic truncate">{skillName}</p>
          </div>
          <div className="flex items-center gap-4 text-muted group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
             <User className="w-5 h-5 flex-shrink-0" />
             <p className="text-sm font-bold tracking-tight text-slate-700 dark:text-slate-300">{session.mentorName || ('Expert Node ' + session.mentorId)}</p>
          </div>
        </div>

        {/* Dynamic Context Alerts */}
        {session.status === 'REQUESTED' && isLearner && (
           <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/50 flex items-center gap-4">
              <Clock className="w-4 h-4 text-amber-500 animate-spin" />
              <p className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest leading-none">Syncing with Expert Node</p>
           </div>
        )}
        {session.status === 'ACCEPTED' && isLearner && (
           <div className="p-4 bg-primary-50/50 dark:bg-primary-950/20 rounded-2xl border border-primary-100 dark:border-primary-900/50 flex items-center gap-4">
              <CreditCard className="w-4 h-4 text-primary-600 dark:text-primary-500 animate-bounce" />
              <p className="text-[10px] font-black text-primary-700 dark:text-primary-400 uppercase tracking-widest leading-none">Initialization Required: Pay Now</p>
           </div>
        )}
      </div>

     {/* Action Section */}
      <div className="pt-8 mt-8 border-t border-border-color flex gap-2">
         <button 
           onClick={() => onView(session.id)} 
           className="flex-1 h-14 bg-surface text-muted hover:bg-slate-900 hover:text-white dark:hover:bg-slate-100 dark:hover:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group/btn"
         >
            Detail Node
            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
         </button>
         
         {session.status === 'ACCEPTED' && isLearner && (
           <button onClick={() => onPay(session.id)} className="flex-[1.5] h-14 bg-primary-600 text-white rounded-xl px-4 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-200 dark:shadow-primary-900/40 hover:bg-primary-700 transition-all flex items-center justify-center gap-2">
              <CreditCard className="w-3.5 h-3.5" />
              Pay
           </button>
         )}

         {/* Mentor Quick Actions */}
         {session.status === 'REQUESTED' && !isLearner && onAccept && (
           <button onClick={(e) => { e.stopPropagation(); onAccept(session.id); }} className="w-14 h-14 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-200 dark:border-emerald-900/50 hover:text-white hover:bg-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 transition-all shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
           </button>
         )}
         {session.status === 'REQUESTED' && !isLearner && onReject && (
           <button onClick={(e) => { e.stopPropagation(); onReject(session.id); }} className="w-14 h-14 rounded-xl flex items-center justify-center text-red-500 border border-red-200 dark:border-red-900/50 hover:text-white hover:bg-red-500 bg-red-50 dark:bg-red-500/10 transition-all shadow-sm">
              <XCircle className="w-5 h-5" />
           </button>
         )}
         
         {/* Cancel Action */}
         {(session.status === 'REQUESTED' || session.status === 'ACCEPTED') && isLearner && (
           <button onClick={() => onCancel(session.id)} className="w-14 h-14 rounded-xl flex items-center justify-center text-muted border border-border-color hover:text-white hover:bg-slate-800 dark:hover:bg-slate-200 dark:hover:text-slate-900 transition-all">
              <Trash2 className="w-5 h-5" />
           </button>
         )}
      </div>
    </div>
  );
}
