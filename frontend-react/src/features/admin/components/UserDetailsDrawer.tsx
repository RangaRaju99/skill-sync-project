import React from 'react';
import { 
  User, Mail, Calendar, Shield, Zap, Activity, 
  Database, Clock, TrendingUp, AlertTriangle, 
  MessageSquare, Ban, Unlock, ShieldCheck, 
  ChevronRight, ExternalLink, MoreHorizontal, UserCheck, 
  GraduationCap, Users, History, AlertCircle
} from 'lucide-react';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { SaaSDrawer } from './SaaSDrawer';
import { useAdmin } from '../../../hooks/useAdmin';

interface UserDetailsDrawerProps {
  userId: number | null;
  onClose: () => void;
  onAction: (userId: number, type: string, value: string) => void;
}

export const UserDetailsDrawer: React.FC<UserDetailsDrawerProps> = ({ 
  userId, 
  onClose,
  onAction
}) => {
  const { useUserDetailed, useUserLogs } = useAdmin();
  const { data: user, isLoading: isUserLoading } = useUserDetailed(userId);
  const { data: logs, isLoading: isLogsLoading } = useUserLogs(userId);

  if (!userId) return null;

  const getRiskColor = (score: number) => {
    if (score < 3) return 'text-emerald-500';
    if (score < 6) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getRiskLabel = (score: number) => {
    if (score < 3) return 'Safe';
    if (score < 6) return 'Warning';
    return 'Dangerous';
  };

  const Section = ({ title, icon: IconComp, children }: { title: string, icon: any, children: React.ReactNode }) => (
    <div className="space-y-4 mb-10 last:mb-0">
      <div className="flex items-center gap-2 px-1">
        <Icon icon={IconComp} size={16} className="text-indigo-600" />
        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{title}</h4>
      </div>
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        {children}
      </div>
    </div>
  );

  return (
    <SaaSDrawer 
      isOpen={!!userId} 
      onClose={onClose} 
      title=""
      className="p-0" // We'll handle internal padding
    >
      {isUserLoading ? (
        <div className="p-12 space-y-8 animate-pulse">
            <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-slate-100 rounded-[2rem]"></div>
                <div className="flex-1 space-y-3">
                    <div className="h-6 w-3/4 bg-slate-100 rounded-lg"></div>
                    <div className="h-4 w-1/2 bg-slate-50 rounded-lg"></div>
                </div>
            </div>
            <div className="h-96 w-full bg-slate-50 rounded-[3rem]"></div>
        </div>
      ) : user ? (
        <div className="flex flex-col h-full bg-slate-50/50">
          {/* Internal Header - Sticky */}
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-8 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-indigo-100">
                {user.name?.charAt(0) || user.username?.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-2">{user.name}</h2>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                    user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>
                    {user.status}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">ID: {user.userId}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <Button size="icon" variant="ghost" className="rounded-xl"><Icon icon={MoreHorizontal} size={18} /></Button>
               <Button size="icon" variant="secondary" className="rounded-xl" onClick={onClose}><Icon icon={Clock} size={18} /></Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            
            {/* 👤 Section 1: Basic Info */}
            <Section title="Basic Inhabitant Matrix" icon={User}>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Connection</label>
                  <p className="text-sm font-black text-slate-900 break-all">{user.email}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Inhabitant Type</label>
                  <div className="flex items-center gap-2">
                    <Icon icon={user.role === 'MENTOR' ? GraduationCap : Users} size={14} className="text-indigo-600" />
                    <p className="text-sm font-black text-slate-900">{user.role}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Joined Matrix</label>
                  <p className="text-sm font-black text-slate-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Transmission</label>
                  <p className="text-sm font-black text-slate-900 italic opacity-60">2 hours ago</p>
                </div>
              </div>
              {user.bio && (
                <div className="mt-6 pt-6 border-t border-slate-50">
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Subject Bio</label>
                   <p className="text-xs font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl italic">"{user.bio}"</p>
                </div>
              )}
            </Section>

            {/* 📊 Section 2: Activity Overview */}
            <Section title="Operational Metrics" icon={Activity}>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-5 rounded-[2rem] text-center border border-slate-100 hover:bg-white transition-all group">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sessions</p>
                   <p className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{user.totalSessions || 0}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-[2rem] text-center border border-slate-100 hover:bg-white transition-all group">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Groups</p>
                   <p className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{user.totalGroups || 0}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-[2rem] text-center border border-slate-100 hover:bg-white transition-all group">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Review</p>
                   <div className="flex items-center justify-center gap-1">
                      <p className="text-2xl font-black text-slate-900 group-hover:text-amber-500 transition-colors">{user.rating || '0.0'}</p>
                      <Icon icon={Zap} size={14} className="text-amber-400 fill-amber-400" />
                   </div>
                </div>
              </div>
            </Section>

            {/* 👥 Section 3: Groups */}
            <Section title="Recent Nodes" icon={Users}>
              <div className="space-y-3">
                {[
                  { name: 'React Advanced', status: 'Active', type: 'LEARNING' },
                  { name: 'Spring Microservices', status: 'Active', type: 'LEARNING' },
                  { name: 'UI/UX Masterclass', status: 'Archive', type: 'LEARNING' },
                ].map((g, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-50 group hover:border-slate-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        <Icon icon={Database} size={14} className="text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">{g.name}</p>
                        <p className={`text-[9px] font-bold uppercase tracking-widest ${g.status === 'Active' ? 'text-emerald-500' : 'text-slate-400'}`}>{g.status}</p>
                      </div>
                    </div>
                    <button className="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all"><Icon icon={Ban} size={14} /></button>
                  </div>
                ))}
              </div>
            </Section>

            {/* ⚠️ Section 4: Risk Analytics */}
            <Section title="Security & Compliance" icon={ShieldCheck}>
              <div className="flex items-center justify-between p-6 bg-slate-900 rounded-[2.5rem] text-white">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Matrix Risk Score</p>
                    <div className="flex items-baseline gap-2">
                       <h3 className="text-4xl font-black leading-none">{user.riskScore?.toFixed(1) || '0.0'}</h3>
                       <span className={`text-[11px] font-black uppercase tracking-widest ${getRiskColor(user.riskScore || 0)}`}>
                          {getRiskLabel(user.riskScore || 0)}
                       </span>
                    </div>
                 </div>
                 <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl">
                       <Icon icon={AlertCircle} size={14} className="text-rose-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest">{user.reportCount || 0} Reports</span>
                    </div>
                 </div>
              </div>
              
              {(user.reportCount || 0) > 0 && (
                <div className="mt-6 p-5 bg-rose-50/50 border border-rose-100 rounded-2xl">
                   <div className="flex items-center gap-2 mb-3">
                      <Icon icon={AlertTriangle} size={14} className="text-rose-600" />
                      <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Recent Policy Flag</p>
                   </div>
                   <p className="text-xs font-bold text-rose-900 leading-relaxed italic opacity-80">
                      "Detected higher than average session escalation rate. Investigating for potential spam vector."
                   </p>
                </div>
              )}
            </Section>

            {/* 📜 Section 5: Audit Log Timeline */}
            <Section title="Operational History" icon={History}>
              <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                {logs?.slice(0, 5).map((log: any, i: number) => (
                  <div key={i} className="flex gap-6 relative">
                    <div className="w-6 h-6 shrink-0 bg-white border border-slate-100 rounded-full flex items-center justify-center z-10 shadow-sm group hover:border-indigo-500 transition-colors">
                      <Icon icon={log.action.includes('BLOCK') ? Ban : Shield} size={10} className="text-indigo-400 group-hover:text-indigo-600" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-800 tracking-tight leading-none mb-1">{log.action}</h5>
                      <p className="text-[10px] font-medium text-slate-400 leading-relaxed mb-2 opacity-80">{log.description}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest opacity-60 flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-md">
                           <Icon icon={User} size={8} /> {log.performerEmail?.split('@')[0]}
                        </span>
                        <span className="text-[9px] font-bold text-slate-300 italic">{new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {(!logs || logs.length === 0) && (
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic ml-10">No history found.</p>
                )}
              </div>
            </Section>

            {/* ⚙️ Section 6: Action Control Hub */}
            <Section title="Administrative Override" icon={Zap}>
              <div className="grid grid-cols-2 gap-3">
                {user.role === 'LEARNER' ? (
                  <Button variant="secondary" className="justify-start gap-3 h-14 rounded-2xl" onClick={() => onAction(user.userId, 'ROLE', 'MENTOR')}>
                    <Icon icon={GraduationCap} size={18} className="text-indigo-600" />
                    <div className="text-left">
                       <p className="text-[10px] font-black leading-none mb-1">PROMOTE</p>
                       <p className="text-[9px] font-bold text-slate-400 opacity-70">Elevate to Mentor</p>
                    </div>
                  </Button>
                ) : (
                  <Button variant="secondary" className="justify-start gap-3 h-14 rounded-2xl" onClick={() => onAction(user.userId, 'ROLE', 'LEARNER')}>
                    <Icon icon={User} size={18} className="text-amber-600" />
                    <div className="text-left">
                       <p className="text-[10px] font-black leading-none mb-1 text-amber-600">DEMOTE</p>
                       <p className="text-[9px] font-bold text-slate-400 opacity-70">Return to Learner</p>
                    </div>
                  </Button>
                )}

                {user.status === 'ACTIVE' ? (
                  <Button variant="secondary" className="justify-start gap-3 h-14 rounded-2xl" onClick={() => onAction(user.userId, 'STATUS', 'BLOCKED')}>
                    <Icon icon={Ban} size={18} className="text-rose-600" />
                    <div className="text-left">
                       <p className="text-[10px] font-black leading-none mb-1 text-rose-600">ISOLATE</p>
                       <p className="text-[9px] font-bold text-slate-400 opacity-70">Deny all access</p>
                    </div>
                  </Button>
                ) : (
                  <Button variant="secondary" className="justify-start gap-3 h-14 rounded-2xl" onClick={() => onAction(user.userId, 'STATUS', 'ACTIVE')}>
                    <Icon icon={Unlock} size={18} className="text-emerald-600" />
                    <div className="text-left">
                       <p className="text-[10px] font-black leading-none mb-1 text-emerald-600">RESTORE</p>
                       <p className="text-[9px] font-bold text-slate-400 opacity-70">Reactivate access</p>
                    </div>
                  </Button>
                )}
                
                <Button variant="secondary" className="justify-start gap-3 h-14 rounded-2xl col-span-2">
                  <Icon icon={MessageSquare} size={18} className="text-slate-400" />
                  <div className="text-left">
                     <p className="text-[10px] font-black leading-none mb-1">TRANSMIT WARNING</p>
                     <p className="text-[9px] font-bold text-slate-400 opacity-70">Send official policy alert</p>
                  </div>
                </Button>
              </div>
            </Section>

          </div>
          
          {/* Footer - Social Connect */}
          <div className="p-8 bg-white border-t border-slate-100 flex items-center justify-between">
             <Button variant="ghost" className="gap-2 text-indigo-600 font-black tracking-widest uppercase text-[10px]">
                <Icon icon={Mail} size={14} /> Send Email
             </Button>
             <button className="text-[10px] font-black text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2 uppercase tracking-widest">
                External System <Icon icon={ExternalLink} size={12} />
             </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400">Node not found in local matrix.</div>
      )}
    </SaaSDrawer>
  );
};
