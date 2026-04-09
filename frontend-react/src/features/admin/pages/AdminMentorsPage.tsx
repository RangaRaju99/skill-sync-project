import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Filter, RefreshCw, MoreVertical, 
  CheckCircle, XCircle, Ban, Download, 
  RotateCcw, Trash2, Clock, UserCheck, 
  Users, ChevronDown, ListFilter, Shield,
  Mail, Calendar, Briefcase, Award, Activity
} from 'lucide-react';
import { useAdminMentors } from '../../../hooks/useMentors';
import type { MentorProfile } from '../../../hooks/useMentors';
import { useToast } from '../../../hooks/useToast';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { SaaSDrawer } from '../components/SaaSDrawer';
import { SaaSModal } from '../components/SaaSModal';
import { getUserDisplayName, parseRoles } from '../../../utils/userUtils';

const AUTO_REFRESH_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '30s', value: 30000 },
  { label: '1m', value: 60000 },
  { label: '5m', value: 300000 },
];

export default function AdminMentorsPage() {
  const [refreshInterval, setRefreshInterval] = useState(0);
  
  // Search & Filter State
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    skill: '',
    experience: 'ALL'
  });

  const { 
    mentors, filteredMentors, isLoading, refetch, lastUpdated,
    approve, reject, suspend, reReview,
    bulkAction, exportMentors 
  } = useAdminMentors(refreshInterval, filters);
  
  const { showToast } = useToast();
  
  const [selectedMentors, setSelectedMentors] = useState<number[]>([]);
  const [reviewMentor, setReviewMentor] = useState<MentorProfile | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'APPROVE' | 'REJECT' | 'SUSPEND' | 'RE_REVIEW' | 'BULK_APPROVE' | 'BULK_REJECT' | 'BULK_SUSPEND';
    mentor?: MentorProfile;
  }>({ isOpen: false, type: 'APPROVE' });
  
  const [reason, setReason] = useState('');

  // Auto-refresh logic
  useEffect(() => {
    const timer = setInterval(() => { if (refreshInterval > 0) refetch(); }, refreshInterval);
    return () => clearInterval(timer);
  }, [refreshInterval, refetch]);

  const handleAction = async () => {
    if (!reason && (confirmModal.type === 'REJECT' || confirmModal.type === 'SUSPEND')) {
      showToast('Reason is required', 'error');
      return;
    }

    try {
      const adminId = 1; // Simulation
      if (confirmModal.type === 'APPROVE' && confirmModal.mentor) {
        await approve(confirmModal.mentor.id);
        showToast('Mentor approved', 'success');
      } else if (confirmModal.type === 'REJECT' && confirmModal.mentor) {
        await reject({ mentorId: confirmModal.mentor.id, reason });
        showToast('Application rejected', 'info');
      } else if (confirmModal.type === 'SUSPEND' && confirmModal.mentor) {
        await suspend({ mentorId: confirmModal.mentor.id, reason });
        showToast('Mentor suspended', 'warning');
      } else if (confirmModal.type === 'RE_REVIEW' && confirmModal.mentor) {
        await reReview(confirmModal.mentor.id);
        showToast('Moved to re-review queue', 'info');
      } else if (confirmModal.type.startsWith('BULK_')) {
        const action = confirmModal.type.split('_')[1] as any;
        await bulkAction({ ids: selectedMentors, action });
        showToast(`Bulk ${action.toLowerCase()} completed`, 'success');
        setSelectedMentors([]);
      }
      
      setConfirmModal({ ...confirmModal, isOpen: false });
      setReason('');
      setReviewMentor(null);
    } catch (err) {
      showToast('Action failed: Backend synchronization error', 'error');
    }
  };

  const selectedList = mentors.filter(m => selectedMentors.includes(m.id));
  const bulkActionsValid = useMemo(() => {
    if (selectedList.length === 0) return null;
    return {
      canApprove: selectedList.every(m => m.status === 'PENDING' || m.status === 'SUSPENDED' || m.status === 'REJECTED'),
      canReject: selectedList.every(m => m.status === 'PENDING'),
      canSuspend: selectedList.every(m => m.status === 'APPROVED'),
    };
  }, [selectedList]);

  const toggleSelect = id => setSelectedMentors(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const getStatusBadge = (status: string) => {
    switch(status) {
        case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'REJECTED': return 'bg-rose-50 text-rose-700 border-rose-200';
        case 'SUSPENDED': return 'bg-rose-50 text-rose-700 border-rose-200';
        default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 space-y-8 font-sans antialiased text-slate-900">
      
      {/* 🧭 HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mentor Management</h1>
          <p className="text-[13px] text-slate-500">Manage mentor access, approvals and performance metrics</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-[13px] font-medium h-8 px-3 gap-2">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          
          <div className="h-4 w-px bg-slate-200 mx-1" />
          
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 h-8 text-[13px] font-medium hover:bg-slate-50 rounded-md">
              <Clock size={14} className="text-slate-400" />
              Auto-refresh: {AUTO_REFRESH_OPTIONS.find(o => o.value === refreshInterval)?.label}
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            <div className="absolute top-full right-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg hidden group-hover:block z-50 overflow-hidden">
               {AUTO_REFRESH_OPTIONS.map(opt => (
                 <button key={opt.value} onClick={() => setRefreshInterval(opt.value)} className="w-full text-left px-4 py-2 text-[12px] hover:bg-slate-50">
                   {opt.label}
                 </button>
               ))}
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={exportMentors} className="text-[13px] font-medium h-8 px-3 gap-2">
            <Download size={14} className="text-slate-400" />
            Export
          </Button>
        </div>
      </div>

      {/* 📊 KPI CARDS */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Pending Requests', value: mentors.filter(m => m.status === 'PENDING').length, count: mentors.filter(m => m.status === 'PENDING').length },
          { label: 'Active Mentors', value: mentors.filter(m => m.status === 'APPROVED').length },
          { label: 'Suspended', value: mentors.filter(m => m.status === 'SUSPENDED').length },
          { label: 'Total Matrix', value: mentors.length },
        ].map((m, i) => (
          <div key={i} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
             <p className="text-2xl font-bold tracking-tight mb-0.5">{m.value}</p>
             <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">{m.label}</p>
          </div>
        ))}
      </div>

      {/* 🔍 FILTER ROW */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 flex items-center gap-2 shadow-sm">
        <div className="relative flex-1 group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            placeholder="Search mentors (name, email, skill...)"
            className="w-full pl-10 h-10 bg-transparent text-[13px] outline-none"
            value={filters.search}
            onChange={e => setFilters({...filters, search: e.target.value})}
          />
        </div>

        <div className="h-6 w-px bg-slate-200" />

        <select 
          className="h-10 px-3 bg-transparent text-[13px] font-medium text-slate-600 outline-none"
          value={filters.status}
          onChange={e => setFilters({...filters, status: e.target.value})}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
        </select>

        <Input 
          placeholder="Skill..." 
          className="w-32 h-10 text-[13px] border-none bg-slate-50/50 rounded-lg"
          value={filters.skill}
          onChange={e => setFilters({...filters, skill: e.target.value})}
        />

        <select 
          className="h-10 px-3 bg-transparent text-[13px] font-medium text-slate-600 outline-none"
          value={filters.experience}
          onChange={e => setFilters({...filters, experience: e.target.value})}
        >
          <option value="ALL">All Experience</option>
          <option value="5+">5+ Years</option>
          <option value="10+">10+ Years</option>
        </select>

        <button onClick={() => setFilters({search: '', status: 'ALL', skill: '', experience: 'ALL'})} className="px-4 h-10 text-[11px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest">
          Reset
        </button>
      </div>

      {/* ⚡ BULK ACTION BAR */}
      {selectedMentors.length > 0 && (
         <div className="bg-slate-900 text-white rounded-xl px-6 py-4 flex items-center justify-between shadow-2xl animate-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-4">
              <span className="text-[13px] font-bold italic">{selectedMentors.length} inhabitants selected</span>
              <div className="h-4 w-px bg-slate-700" />
              <div className="flex items-center gap-4">
                {bulkActionsValid?.canApprove && (
                   <button onClick={() => setConfirmModal({ isOpen: true, type: 'BULK_APPROVE' })} className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest hover:text-emerald-300">Approve Selection</button>
                )}
                {bulkActionsValid?.canReject && (
                   <button onClick={() => setConfirmModal({ isOpen: true, type: 'BULK_REJECT' })} className="text-[11px] font-bold text-rose-400 uppercase tracking-widest hover:text-rose-300">Reject Selection</button>
                )}
                {bulkActionsValid?.canSuspend && (
                   <button onClick={() => setConfirmModal({ isOpen: true, type: 'BULK_SUSPEND' })} className="text-[11px] font-bold text-amber-400 uppercase tracking-widest hover:text-amber-300">Suspend Selection</button>
                )}
              </div>
            </div>
            <button onClick={() => setSelectedMentors([])} className="text-slate-400 hover:text-white transition-colors">
              <Trash2 size={16} />
            </button>
         </div>
      )}

      {/* 📋 OPERATIONS TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 w-12">
                 <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-100"
                  onChange={e => e.target.checked ? setSelectedMentors(filteredMentors.map(m => m.id)) : setSelectedMentors([])}
                  checked={selectedMentors.length > 0 && selectedMentors.length === filteredMentors.length}
                 />
              </th>
              <th className="p-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Mentor</th>
              <th className="p-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Roles</th>
              <th className="p-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Skills</th>
              <th className="p-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest text-center">Status</th>
              <th className="p-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
               <tr><td colSpan={6} className="p-20 text-center text-slate-400 italic">Syncing matrix data...</td></tr>
            ) : mentors.length === 0 ? (
               <tr><td colSpan={6} className="p-20 text-center text-slate-400">No mentors found matching your filters.</td></tr>
            ) : mentors.map(mentor => {
              const displayName = getUserDisplayName(mentor);
              const roles = parseRoles(mentor.roles);
              return (
                <tr key={mentor.id} className={`hover:bg-slate-50/50 transition-colors cursor-pointer group ${selectedMentors.includes(mentor.id) ? 'bg-indigo-50/30' : ''}`} onClick={() => setReviewMentor(mentor)}>
                  <td className="p-4" onClick={e => e.stopPropagation()}>
                     <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-100"
                      checked={selectedMentors.includes(mentor.id)}
                      onChange={() => toggleSelect(mentor.id)}
                     />
                  </td>
                  <td className="p-4">
                     <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-[13px] font-bold text-slate-600">
                           {mentor.avatar ? <img src={mentor.avatar} className="w-full h-full object-cover rounded-lg" alt="" /> : displayName.charAt(0)}
                        </div>
                        <div>
                           <p className="text-[13px] font-semibold text-slate-900 uppercase italic truncate max-w-[150px]">{displayName}</p>
                           <p className="text-[11px] text-slate-400 font-medium truncate max-w-[180px]">{mentor.email}</p>
                        </div>
                     </div>
                  </td>
                  <td className="p-4">
                     <div className="flex gap-1.5 font-sans">
                        {roles.map(r => (
                           <span key={r} className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${r === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                              {r}
                           </span>
                        ))}
                     </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[11px] font-medium text-slate-600">
                      {mentor.specialization || 'Generalist'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${getStatusBadge(mentor.status)}`}>
                      {mentor.status}
                    </span>
                  </td>
                  <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                       {mentor.status === 'PENDING' && (
                         <>
                            <button onClick={() => setConfirmModal({ isOpen: true, type: 'APPROVE', mentor })} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-all"><CheckCircle size={16} /></button>
                            <button onClick={() => setConfirmModal({ isOpen: true, type: 'REJECT', mentor })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-all"><XCircle size={16} /></button>
                         </>
                       )}
                       {mentor.status === 'APPROVED' && (
                         <button onClick={() => setConfirmModal({ isOpen: true, type: 'SUSPEND', mentor })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-all"><Ban size={16} /></button>
                       )}
                       {mentor.status === 'SUSPENDED' && (
                         <button onClick={() => setConfirmModal({ isOpen: true, type: 'APPROVE', mentor })} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-all"><RotateCcw size={16} /></button>
                       )}
                       {mentor.status === 'REJECTED' && (
                         <button onClick={() => setConfirmModal({ isOpen: true, type: 'RE_REVIEW', mentor })} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-all"><RotateCcw size={16} /></button>
                       )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 🧩 READ-ONLY PROFILE DRAWER */}
      <SaaSDrawer isOpen={!!reviewMentor} onClose={() => setReviewMentor(null)} title="Inhabitant Intelligence">
        {reviewMentor && (
          <div className="flex flex-col h-full bg-[#f8fafc]">
            {/* Header */}
            <div className="p-8 bg-white border-b border-slate-200 flex flex-col items-center">
               <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-xl">
                  {getUserDisplayName(reviewMentor).charAt(0)}
               </div>
               <h3 className="text-xl font-bold text-slate-900 uppercase italic">{getUserDisplayName(reviewMentor)}</h3>
               <p className="text-[13px] font-medium text-slate-500 mt-1">{reviewMentor.email}</p>
               <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {parseRoles(reviewMentor.roles).map(r => (
                    <span key={r} className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-lg border border-slate-200">{r}</span>
                  ))}
               </div>
            </div>

            <div className="flex-1 p-8 space-y-12 overflow-y-auto pb-20">
               {/* Metadata Section */}
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Inhabitant Status</p>
                    <p className={`text-[13px] font-bold ${reviewMentor.status === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'}`}>{reviewMentor.status}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Matrix Joined</p>
                    <p className="text-[13px] font-bold text-slate-900">{new Date(reviewMentor.createdAt).toLocaleDateString()}</p>
                  </div>
               </div>

               {/* Bio/Summary */}
               <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Shield size={14} className="text-indigo-600" /> Dossier Summary
                  </h4>
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl text-[13px] font-medium text-slate-600 leading-relaxed italic shadow-sm">
                    "{reviewMentor.bio || 'Initial intelligence screening reveals no biographical data provided.'}"
                  </div>
               </div>

               {/* Experience & Skills */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                    <div className="flex items-center gap-4">
                       <Briefcase className="text-slate-400" size={18} />
                       <p className="text-[13px] font-bold text-slate-700">Experience Domain</p>
                    </div>
                    <p className="text-[13px] font-black">{reviewMentor.yearsOfExperience}y Professional</p>
                  </div>

                  <div className="flex flex-col gap-3 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                       <Award className="text-amber-500" size={18} />
                       <p className="text-[13px] font-bold text-slate-700">Skill Matrix</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {reviewMentor.specialization?.split(',').map(s => (
                         <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[11px] font-bold rounded-full border border-indigo-100">{s.trim()}</span>
                       )) || <span className="text-slate-400 italic">No skills documented</span>}
                    </div>
                  </div>
               </div>

               {/* Telemetry */}
               <div className="space-y-4">
                 <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={14} className="text-indigo-600" /> Activity Telemetry
                 </h4>
                 <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center text-[12px]">
                       <span className="text-slate-500 font-medium">Last Interaction</span>
                       <span className="font-bold text-slate-900">{reviewMentor.lastActive ? new Date(reviewMentor.lastActive).toLocaleString() : 'Never'}</span>
                    </div>
                    <div className="p-4 flex justify-between items-center text-[12px]">
                       <span className="text-slate-500 font-medium">Sessions Handled</span>
                       <span className="font-bold text-slate-900">{reviewMentor.totalStudents || 0}</span>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        )}
      </SaaSDrawer>

      {/* ⚠️ CONFIRMATION MODAL */}
      <SaaSModal 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} 
        title="Administrative Directive"
        onConfirm={handleAction}
        confirmLabel={`Execute ${confirmModal.type.replace('BULK_', '').toLowerCase()}`}
        type={confirmModal.type.includes('REJECT') || confirmModal.type.includes('SUSPEND') ? 'danger' : 'info'}
      >
        <div className="space-y-6 pt-4 font-sans text-slate-900">
           <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-slate-200 font-bold">
                 {confirmModal.mentor ? getUserDisplayName(confirmModal.mentor).charAt(0) : 'Σ'}
              </div>
              <div>
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Directive Target</p>
                 <p className="text-sm font-bold truncate max-w-[200px]">
                    {confirmModal.mentor ? getUserDisplayName(confirmModal.mentor) : `${selectedMentors.length} Selections`}
                 </p>
              </div>
           </div>

           {(confirmModal.type.includes('REJECT') || confirmModal.type.includes('SUSPEND')) && (
             <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700 tracking-tight flex items-center gap-2">
                   Override Justification <span className="text-rose-500">*</span>
                </label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-5 text-[14px] font-medium outline-none focus:ring-4 ring-indigo-500/10 min-h-[120px] shadow-inner"
                  placeholder="Clearly justify the operational inhibitor..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 italic">This justification will be logged in the permanent audit trail and transmitted to the inhabitant via secure email alert.</p>
             </div>
           )}

           <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100 italic">
              <Shield size={14} className="text-amber-600" />
              <p className="text-[11px] font-medium text-amber-700">Confirming this directive creates an immutable audit node and triggers inhabitat notification protocol.</p>
           </div>
        </div>
      </SaaSModal>

    </div>
  );
}
