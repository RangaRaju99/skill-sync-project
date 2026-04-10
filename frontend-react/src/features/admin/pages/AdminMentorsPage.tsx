import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Filter, RefreshCw, MoreVertical,
  CheckCircle, XCircle, Ban, Download,
  RotateCcw, Trash2, Clock, UserCheck,
  Users, ChevronDown, ListFilter, Shield,
  Mail, Calendar, Briefcase, Award, Activity, Info
} from 'lucide-react';
import { useAdminMentors } from '../../../hooks/useMentors';
import type { MentorProfile } from '../../../hooks/useMentors';
import { useToast } from '../../../hooks/useToast';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { SaaSDrawer } from '../components/SaaSDrawer';
import { SaaSModal } from '../components/SaaSModal';
import { ProfileDrawer } from '../components/ProfileDrawer';
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

  const [isProcessing, setIsProcessing] = useState(false);
  const handleAction = async () => {
    if (!reason && (confirmModal.type === 'REJECT' || confirmModal.type === 'SUSPEND')) {
      showToast('Reason is required', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      if (confirmModal.type === 'APPROVE' && confirmModal.mentor) {
        await approve(confirmModal.mentor.id);
        showToast('Mentor approved', 'success');
      } else if (confirmModal.type === 'REJECT' && confirmModal.mentor) {
        await reject({ mentorId: confirmModal.mentor.id, reason });
        showToast('Application rejected', 'info');
      } else if (confirmModal.type === 'SUSPEND' && confirmModal.mentor) {
        await suspend({ mentorId: confirmModal.mentor.id, reason });
        showToast('Mentor suspended', 'info');
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
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedList = useMemo(() => mentors.filter(m => selectedMentors.includes(m.id)), [mentors, selectedMentors]);

  const bulkActionsValid = useMemo(() => {
    if (selectedList.length === 0) return null;

    const allPending = selectedList.every(m => m.status === 'PENDING');
    const allApproved = selectedList.every(m => m.status === 'APPROVED');
    const allSuspended = selectedList.every(m => m.status === 'SUSPENDED');
    const allRejected = selectedList.every(m => m.status === 'REJECTED');

    return {
      showApprove: allPending || allSuspended,
      showReject: allPending,
      showSuspend: allApproved,
      showReReview: allRejected,
      approveLabel: allSuspended ? 'Reactivate' : 'Approve',
      count: selectedList.length
    };
  }, [selectedList]);

  const toggleSelect = (id: number) => setSelectedMentors(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'REJECTED': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'SUSPENDED': return 'bg-slate-100 text-slate-700 border-slate-300';
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <div className="h-6 w-px bg-slate-200" />

        <select
          className="h-10 px-3 bg-transparent text-[13px] font-medium text-slate-600 outline-none"
          value={filters.status}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...filters, status: e.target.value })}
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, skill: e.target.value })}
        />

        <select
          className="h-10 px-3 bg-transparent text-[13px] font-medium text-slate-600 outline-none"
          value={filters.experience}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...filters, experience: e.target.value })}
        >
          <option value="ALL">All Experience</option>
          <option value="5+">5+ Years</option>
          <option value="10+">10+ Years</option>
        </select>

        <button onClick={() => setFilters({ search: '', status: 'ALL', skill: '', experience: 'ALL' })} className="px-4 h-10 text-[11px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest">
          Reset
        </button>
      </div>

      {/* ⚡ PREMIUM BULK ACTION BAR - INLINE */}
      {selectedMentors.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-2 py-2 flex items-center gap-2">
            {/* Selection Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                <CheckCircle size={12} className="text-white" />
              </div>
              <span className="text-[13px] font-bold text-indigo-700">{selectedMentors.length} selected</span>
            </div>

            <div className="h-8 w-px bg-slate-100 mx-2" />

            {/* Dynamic Actions */}
            <div className="flex items-center gap-1 flex-1">
              {bulkActionsValid?.showApprove && (
                <button
                  disabled={isProcessing}
                  onClick={() => setConfirmModal({ isOpen: true, type: 'BULK_APPROVE' })}
                  className="flex-1 h-10 px-4 text-[12px] font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 rounded-xl transition-all hover:text-emerald-600 disabled:opacity-50"
                >
                  {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <UserCheck size={14} />} {bulkActionsValid.approveLabel}
                </button>
              )}
              {bulkActionsValid?.showReject && (
                <button
                  disabled={isProcessing}
                  onClick={() => setConfirmModal({ isOpen: true, type: 'BULK_REJECT' })}
                  className="flex-1 h-10 px-4 text-[12px] font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 rounded-xl transition-all hover:text-rose-600 disabled:opacity-50"
                >
                  {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <XCircle size={14} />} Reject
                </button>
              )}
              {bulkActionsValid?.showSuspend && (
                <button
                  disabled={isProcessing}
                  onClick={() => setConfirmModal({ isOpen: true, type: 'BULK_SUSPEND' })}
                  className="flex-1 h-10 px-4 text-[12px] font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 rounded-xl transition-all hover:text-amber-600 disabled:opacity-50"
                >
                  {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Ban size={14} />} Suspend
                </button>
              )}
              {bulkActionsValid?.showReReview && (
                <button
                  disabled={isProcessing}
                  onClick={() => setConfirmModal({ isOpen: true, type: 'RE_REVIEW' })}
                  className="flex-1 h-10 px-4 text-[12px] font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 rounded-xl transition-all hover:text-indigo-600 disabled:opacity-50"
                >
                  {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <RotateCcw size={14} />} Re-review
                </button>
              )}
            </div>

            <div className="h-8 w-px bg-slate-100 mx-2" />

            {/* Clear Section */}
            <button
              onClick={() => setSelectedMentors([])}
              className="px-6 h-10 text-[11px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
            >
              Clear Selection
            </button>
          </div>
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.checked ? setSelectedMentors(filteredMentors.map(m => m.id)) : setSelectedMentors([])}
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
                <tr key={mentor.id} className={`hover:bg-slate-50/50 transition-colors group ${selectedMentors.includes(mentor.id) ? 'bg-indigo-50/30' : ''}`}>
                  <td className="p-4">
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
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => setReviewMentor(mentor)} className="px-3 h-7 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-100 transition-all mr-1">
                        View Profile
                      </button>
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

      {/* 🧩 PREMIUM PROFILE DRAWER */}
      <ProfileDrawer reviewMentor={reviewMentor} onClose={() => setReviewMentor(null)} />

      {/* ⚠️ CONFIRMATION MODAL */}
      <SaaSModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title="Confirm Action"
        onConfirm={handleAction}
        confirmLabel={isProcessing ? "Processing..." : `Confirm ${confirmModal.type.replace('BULK_', '').charAt(0) + confirmModal.type.replace('BULK_', '').slice(1).toLowerCase()}`}
        type="info"
        isLoading={isProcessing}
      >
        <div className="space-y-5 pt-2 pb-2 font-sans text-slate-800">

          <div className="text-center bg-transparent">
            <p className="text-[15px] text-slate-600 font-medium">
              You are about to <span className="font-bold text-slate-900 border-b-2 border-indigo-200">{confirmModal.type.replace('BULK_', '').toLowerCase()}</span> this mentor.
            </p>
          </div>

          <div className="flex flex-col gap-1.5 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
            {confirmModal.mentor ? (
              <>
                <p className="text-[13px] font-semibold text-slate-800">User: <span className="font-medium text-slate-500 ml-1">{getUserDisplayName(confirmModal.mentor)}</span></p>
                <p className="text-[13px] font-semibold text-slate-800">Email: <span className="font-medium text-slate-500 ml-1">{confirmModal.mentor.email}</span></p>
                <p className="text-[13px] font-semibold text-slate-800">Current Status: <span className="font-medium text-slate-500 ml-1 capitalize">{confirmModal.mentor.status.toLowerCase()}</span></p>
              </>
            ) : (
              <p className="text-[13px] font-semibold text-slate-600 text-center py-2">Batch Action ({selectedMentors.length} Mentors selected)</p>
            )}
          </div>

          {(confirmModal.type.includes('REJECT') || confirmModal.type.includes('SUSPEND')) && (
            <div className="space-y-3">
              <label className="text-[13px] font-bold text-slate-700">
                Reason (required)
              </label>

              <div className="flex gap-2 flex-wrap mb-2">
                {['Spam activity', 'Inactive', 'Policy violation', 'Low quality', 'Other'].map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setReason(suggestion)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors border shadow-sm ${reason === suggestion ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <textarea
                className="w-full bg-white border border-slate-300 rounded-lg p-3 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 min-h-[90px] shadow-sm transition-all resize-none"
                placeholder="Explain why you are taking this action..."
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-2">
            <p className="text-[13px] font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Info size={16} className="text-indigo-500" /> Action Preview
            </p>
            <p className="text-[12px] text-slate-500 mb-2 font-medium">This will:</p>
            <ul className="text-[12px] text-slate-600 space-y-1.5 ml-5 list-disc marker:text-indigo-300 font-medium tracking-tight">
              <li>Change status to <span className="font-bold text-slate-800 uppercase text-[11px] px-1.5 py-0.5 bg-white border rounded shadow-sm mx-1">{confirmModal.type.replace('BULK_', '')}</span></li>
              <li>Record this action securely in the permanent database log</li>
              <li>Notify the user immediately via email with attached audit</li>
            </ul>
          </div>
        </div>
      </SaaSModal>

    </div>
  );
}
