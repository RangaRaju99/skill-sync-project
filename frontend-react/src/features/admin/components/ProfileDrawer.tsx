import React, { useState } from 'react';
import { DownloadReportModal } from './DownloadReportModal';
import { SaaSDrawer } from './SaaSDrawer';
import { formatHumanDate } from '../../../utils/dateUtils';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { User, Activity, History, Copy, Check, CheckCircle2, AlertCircle } from 'lucide-react';
import { getUserDisplayName, parseRoles } from '../../../utils/userUtils';
import { useAdmin } from '../../../hooks/useAdmin';
import type { MentorProfile } from '../../../hooks/useMentors';

const SectionCard = ({ title, icon: IconComp, children }: { title: string, icon: any, children: React.ReactNode }) => (
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

const ProfileHeader = ({ mentor, copied, setCopied }: { mentor: any, copied: boolean, setCopied: any }) => (
  <div className="z-10 bg-white/90 backdrop-blur-md border border-slate-100 p-8 flex items-start gap-5 mx-8 mt-8 rounded-3xl shadow-sm">
    <div className="relative shrink-0">
      <div className="w-20 h-20 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-3xl font-bold text-white shadow-lg">
        {mentor.name?.charAt(0) || mentor.email?.charAt(0) || 'U'}
      </div>
      <div className="absolute -bottom-2 -right-2">
        {mentor.status === 'APPROVED' || mentor.status === 'ACTIVE' ? (
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
      <h2 className="text-xl font-bold text-slate-900 truncate mb-1">
        {mentor.name}
        {mentor.identityVerified && <span className="ml-2 text-indigo-500 inline-flex items-center text-xs">✔ Verified</span>}
      </h2>
      <div className="flex items-center gap-2 mb-3 text-slate-500 group cursor-pointer" onClick={() => {
        navigator.clipboard.writeText(mentor.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}>
        <p className="text-sm truncate">{mentor.email}</p>
        <button className="p-1 rounded-md hover:bg-slate-100 transition-colors">
            <Icon icon={copied ? Check : Copy} size={14} className={copied ? 'text-green-500' : 'text-slate-400'} />
        </button>
        {copied && <span className="text-[10px] font-bold text-green-500">Copied</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {parseRoles(mentor.roles || '').map((r: string) => (
            <span key={r} className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
              {r}
            </span>
        ))}
        {mentor.status === 'APPROVED' && <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600">Approved</span>}
        {mentor.status === 'SUSPENDED' && <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600">Suspended</span>}
        {mentor.status === 'PENDING' && <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-yellow-50 text-yellow-600">Pending</span>}
      </div>
    </div>
  </div>
);

const ProfileSummaryCard = ({ mentor }: { mentor: any }) => (
  <SectionCard title="Profile Summary" icon={User}>
    <div className="space-y-5">
      <div>
        <label className="block text-[11px] font-medium text-slate-400 mb-1">Experience</label>
        <p className="text-sm text-slate-900 font-medium">
            {mentor.yearsOfExperience ? `${mentor.yearsOfExperience} Years` : 'Experience not specified'}
        </p>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-slate-400 mb-2">Skills</label>
        <div className="flex flex-wrap gap-2">
            {mentor.specialization ? (
                mentor.specialization.split(',').map((skill: string, index: number) => (
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
  </SectionCard>
);

const ActivityCard = ({ mentor }: { mentor: any }) => (
  <SectionCard title="Activity" icon={Activity}>
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-4 border-b border-slate-50">
        <span className="text-sm text-slate-500">Last Active</span>
        <span className="text-sm font-medium text-slate-900">{formatHumanDate(mentor.lastActive)}</span>
      </div>
      <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">Sessions Conducted</span>
          <span className="text-sm font-medium text-slate-900">{mentor.totalSessions || mentor.totalStudents || 0}</span>
      </div>
    </div>
  </SectionCard>
);

const ActionsCard = ({ logs }: { logs: any[] }) => (
  <SectionCard title="Recent Actions" icon={History}>
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
  </SectionCard>
);

export const ProfileDrawer = ({ reviewMentor, onClose }: { reviewMentor: MentorProfile | null, onClose: () => void }) => {
  const { useUserLogs } = useAdmin();
  const { data: logs } = useUserLogs(reviewMentor?.userId || null); // Note: using actual userId
  const [copied, setCopied] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  if (!reviewMentor) return null;

  return (
    <>
      <SaaSDrawer isOpen={true} onClose={onClose} title="" className="p-0">
        <div className="flex flex-col h-full bg-slate-50/30 font-sans">
          <ProfileHeader mentor={{...reviewMentor, name: getUserDisplayName(reviewMentor)}} copied={copied} setCopied={setCopied} />
          
          <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-2">
            <ProfileSummaryCard mentor={reviewMentor} />
            <ActivityCard mentor={reviewMentor} />
            <ActionsCard logs={logs || []} />
          </div>
          
          <div className="p-6 bg-white border-t border-slate-100 flex items-center gap-3 shrink-0">
            <Button variant="outline" className="flex-1 rounded-xl h-12 gap-2 font-medium bg-white" onClick={() => setIsReportModalOpen(true)}>
              Download Report
            </Button>
            <Button className="flex-1 rounded-xl h-12 font-medium bg-slate-900 text-white hover:bg-slate-800" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </SaaSDrawer>

      <DownloadReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        userId={reviewMentor.userId} // CORRECTED: Use User ID for user-service endpoint
        userName={getUserDisplayName(reviewMentor)}
      />
    </>
  );
};
