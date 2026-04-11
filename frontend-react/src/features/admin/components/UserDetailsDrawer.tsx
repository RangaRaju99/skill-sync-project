import React, { useState } from 'react';
import { 
  User, Activity as ActivityIcon, History,
  ShieldCheck, X, Download, Copy, Check, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { SaaSDrawer } from './SaaSDrawer';
import { useAdmin } from '../../../hooks/useAdmin';
import { formatHumanDate } from '../../../utils/dateUtils';
import { DownloadReportModal } from './DownloadReportModal';

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
  const { data: logs } = useUserLogs(userId);
  
  const [copied, setCopied] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  if (!userId) return null;

  const copyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const Section = ({ title, icon: IconComp, children }: { title: string, icon: any, children: React.ReactNode }) => (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-2 px-1">
        <Icon icon={IconComp} size={16} className="text-slate-500" />
        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</h4>
      </div>
      <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100/50">
        {children}
      </div>
    </div>
  );

  const calculateProfileStrength = (user: any) => {
    let score = 0;
    if (user.bio) score += 25;
    if (user.skills && user.skills.length > 0) score += 25;
    if (user.role) score += 25;
    if (user.totalSessions && user.totalSessions > 0) score += 25;
    return score;
  };

  const profileStrength = calculateProfileStrength(user || {});

  return (
    <>
      <SaaSDrawer 
        isOpen={!!userId} 
        onClose={onClose} 
        title=""
      >
        {isUserLoading ? (
          <div className="p-8 space-y-6 animate-pulse">
              <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-slate-100 rounded-[1.5rem]"></div>
                  <div className="flex-1 space-y-3">
                      <div className="h-5 w-3/4 bg-slate-100 rounded-lg"></div>
                      <div className="h-3 w-1/2 bg-slate-50 rounded-lg"></div>
                  </div>
              </div>
              <div className="h-64 w-full bg-slate-50 rounded-[1.5rem]"></div>
          </div>
        ) : user ? (
          <div className="flex flex-col h-full bg-slate-50/30">
            {/* HEADER */}
            <div className="z-10 bg-white/90 backdrop-blur-md border border-slate-100 p-8 flex items-start gap-5 mx-8 mt-8 rounded-3xl shadow-sm">
               {/* Avatar */}
               <div className="relative shrink-0">
                  <div className="w-20 h-20 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                    {user.name?.charAt(0) || user.username?.charAt(0) || 'U'}
                  </div>
                  {/* Profile Badge */}
                  <div className="absolute -bottom-2 -right-2">
                    {user.status === 'ACTIVE' ? (
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                          <Icon icon={CheckCircle2} size={20} className="text-green-500 fill-green-50" />
                        </div>
                    ) : (
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                           <Icon icon={AlertCircle} size={20} className="text-red-500 fill-red-50" />
                        </div>
                    )}
                  </div>
               </div>
               
               <div className="flex-1 min-w-0 pt-1">
                  {/* Name */}
                  <h2 className="text-xl font-bold text-slate-900 truncate mb-1">
                    {user.name}
                  </h2>
                  
                  {/* Email & Copy Button */}
                  <div className="flex items-center gap-2 mb-3 text-slate-500 group cursor-pointer" onClick={copyEmail}>
                    <p className="text-sm truncate">{user.email}</p>
                    <button className="p-1 rounded-md hover:bg-slate-100 transition-colors">
                        <Icon icon={copied ? Check : Copy} size={14} className={copied ? 'text-green-500' : 'text-slate-400'} />
                    </button>
                    {copied && <span className="text-[10px] font-bold text-green-500">Copied</span>}
                  </div>

                  {/* Roles and Status badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                      {user.role}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      user.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {user.status === 'ACTIVE' ? 'Approved' : 'Suspended'}
                    </span>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-2">
              
              {/* Profile Strength */}
              {profileStrength > 0 && (
                <div className="mb-8 px-2">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Strength</span>
                        <span className="text-xs font-bold text-slate-900">{profileStrength}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-800 rounded-full transition-all" style={{ width: `${profileStrength}%` }} />
                    </div>
                </div>
              )}

              {/* 👤 Profile Summary */}
              <Section title="Profile Summary" icon={User}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Experience</label>
                    <p className="text-sm text-slate-900 font-medium">
                        {user.bio || 'Experience not provided.'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-2">Skills</label>
                    <div className="flex flex-wrap gap-2">
                       {user.skills ? (
                           user.skills.split(',').map((skill: string, index: number) => (
                               <span key={index} className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-600 text-xs font-medium rounded-md">
                                   {skill.trim()}
                               </span>
                           ))
                       ) : (
                           <span className="text-sm text-slate-400 italic">No skills listed</span>
                       )}
                    </div>
                  </div>
                </div>
              </Section>

              {/* 📊 Activity */}
              <Section title="Activity" icon={ActivityIcon}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                    <span className="text-sm text-slate-500">Last Active</span>
                    <span className="text-sm font-medium text-slate-900">{formatHumanDate(user.lastActive)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-sm text-slate-500">Sessions Conducted</span>
                     <span className="text-sm font-medium text-slate-900">{user.totalSessions || 0}</span>
                  </div>
                </div>
              </Section>

              {/* 📜 Recent Actions */}
              <Section title="Recent Actions" icon={History}>
                <div className="space-y-0">
                  {logs && logs.length > 0 ? (
                    logs.slice(0, 5).map((log: any, i: number) => (
                      <div key={i} className="flex justify-between items-start py-3 border-b border-slate-50 last:border-0 last:pb-0">
                        <div className="pr-4">
                            <p className="text-sm text-slate-900 font-medium">{log.action.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{log.description}</p>
                        </div>
                        <span className="text-xs text-slate-400 whitespace-nowrap mt-0.5">{formatHumanDate(log.timestamp)}</span>
                      </div>
                    ))
                  ) : (
                      <div className="py-2 text-center">
                          <span className="text-sm text-slate-400 italic">No recent actions recorded.</span>
                      </div>
                  )}
                </div>
              </Section>

            </div>
            
            {/* FOOTER */}
            <div className="p-6 bg-white border-t border-slate-100 flex items-center gap-3 shrink-0">
               <Button 
                variant="outline" 
                className="flex-1 rounded-xl h-12 gap-2 font-medium bg-white"
                onClick={() => setIsReportModalOpen(true)}
               >
                  Download Report
               </Button>
               <Button 
                className="flex-1 rounded-xl h-12 font-medium bg-slate-900 text-white hover:bg-slate-800" 
                onClick={onClose}
               >
                  Close
               </Button>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">User not found.</div>
        )}
      </SaaSDrawer>

      {user && (
        <DownloadReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          userId={user.userId}
          userName={user.name || user.username}
        />
      )}
    </>
  );
};
