import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Search, MoreVertical, ArrowUpCircle, ArrowDownCircle, Ban, Lock, Unlock, Users, Mail, Eye, RefreshCw, Settings2, CheckCircle, PauseCircle, Timer, XCircle, UserPlus, UserMinus } from 'lucide-react';
import { useAdmin } from '../../../hooks/useAdmin';
import { SaaSDrawer } from '../components/SaaSDrawer';
import { SaaSModal } from '../components/SaaSModal';
import { useToast } from '../../../hooks/useToast';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { UserDetailsDrawer } from '../components/UserDetailsDrawer';

// Auto-refresh interval options
const REFRESH_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: 'Every 10s', value: 10000 },
  { label: 'Every 30s', value: 30000 },
  { label: 'Every 1 min', value: 60000 },
  { label: 'Every 5 min', value: 300000 },
];

export default function AdminUsersPage() {
  const { users, isUsersLoading, isUsersError, refetchUsers, changeRole, updateStatus, createAuditLog } = useAdmin();
  const { showToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [drawerUserId, setDrawerUserId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Auto-refresh state
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(0);
  const [showRefreshSettings, setShowRefreshSettings] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Modal
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'BLOCK' | 'SUSPEND' | 'UNBLOCK' | 'PROMOTE' | 'DEMOTE' | 'BULK_BLOCK' | 'BULK_PROMOTE' | 'BULK_SUSPEND' | null;
    userId: number | null;
    title: string;
    modalType: 'danger' | 'info' | 'warning';
  }>({ isOpen: false, type: null, userId: null, title: '', modalType: 'info' });
  const [reason, setReason] = useState('Policy Violation');
  const [message, setMessage] = useState('');

  // Track when data loads successfully
  useEffect(() => {
    if (!isUsersLoading && !isUsersError && users?.length > 0) {
      setLastUpdated(new Date());
    }
  }, [users, isUsersLoading, isUsersError]);

  // Auto-refresh logic with visibility API
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoRefreshInterval <= 0) return;

    const doRefresh = () => {
      if (document.visibilityState === 'visible') {
        refetchUsers();
        setLastUpdated(new Date());
      }
    };

    intervalRef.current = setInterval(doRefresh, autoRefreshInterval);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && autoRefreshInterval > 0) {
        doRefresh();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [autoRefreshInterval, refetchUsers]);

  // Manual refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchUsers();
      setLastUpdated(new Date());
      showToast('Users updated successfully', 'success');
    } catch {
      showToast('Failed to refresh users', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Time ago helper
  const getTimeAgo = (date: Date | null) => {
    if (!date) return '';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  // Filtering
  const filteredUsers = useMemo(() => {
    if (!users || !Array.isArray(users)) return [];
    return users.filter((u: any) => {
      const matchesSearch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           u.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'ALL' || u.roles?.includes(roleFilter);
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const drawerUser = useMemo(() => users?.find((u: any) => u.userId === drawerUserId), [drawerUserId, users]);

  // Badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return { label: 'Active', dot: <Icon icon={CheckCircle} size={14} className="text-emerald-500" />, cls: 'text-emerald-700' };
      case 'BLOCKED': return { label: 'Blocked', dot: <Icon icon={Ban} size={14} className="text-rose-500" />, cls: 'text-rose-700' };
      case 'SUSPENDED': return { label: 'Suspended', dot: <Icon icon={PauseCircle} size={14} className="text-amber-500" />, cls: 'text-amber-700' };
      default: return { label: status, dot: <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />, cls: 'text-gray-600' };
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return { label: 'Admin', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'MENTOR': return { label: 'Mentor', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default: return { label: 'Learner', cls: 'bg-gray-50 text-gray-600 border-gray-200' };
    }
  };

  const openModal = (userId: number | null, type: typeof actionModal.type, title: string, modalType: 'danger' | 'info' | 'warning') => {
    setActionModal({ isOpen: true, type, userId, title, modalType });
    setActiveMenu(null);
  };

  // Action handler
  const handleAction = useCallback(async () => {
    if (!actionModal.type) return;
    try {
      const fullReason = `${reason}: ${message}`.trim();
      const targetUser = users?.find((u: any) => u.userId === actionModal.userId);
      const targetName = targetUser?.name || 'Unknown';

      if (actionModal.type === 'BLOCK' && actionModal.userId) {
        await updateStatus({ userId: actionModal.userId, status: 'BLOCKED', reason: fullReason });
        await createAuditLog({ action: 'USER_BLOCKED', target: targetName, admin: 'Admin', description: fullReason });
        showToast(`${targetName} has been blocked`, 'success');
      } else if (actionModal.type === 'SUSPEND' && actionModal.userId) {
        await updateStatus({ userId: actionModal.userId, status: 'SUSPENDED', reason: fullReason });
        await createAuditLog({ action: 'USER_SUSPENDED', target: targetName, admin: 'Admin', description: fullReason });
        showToast(`${targetName} has been suspended`, 'success');
      } else if (actionModal.type === 'UNBLOCK' && actionModal.userId) {
        await updateStatus({ userId: actionModal.userId, status: 'ACTIVE', reason: 'Restored by admin' });
        await createAuditLog({ action: 'USER_UNBLOCKED', target: targetName, admin: 'Admin', description: 'Access restored.' });
        showToast(`${targetName} has been unblocked`, 'success');
      } else if (actionModal.type === 'PROMOTE' && actionModal.userId) {
        await changeRole({ userId: actionModal.userId, role: 'MENTOR', reason: fullReason });
        await createAuditLog({ action: 'USER_PROMOTED', target: targetName, admin: 'Admin', description: 'Promoted to Mentor' });
        showToast(`${targetName} promoted to Mentor`, 'success');
      } else if (actionModal.type === 'DEMOTE' && actionModal.userId) {
        await changeRole({ userId: actionModal.userId, role: 'LEARNER', reason: fullReason });
        await createAuditLog({ action: 'USER_DEMOTED', target: targetName, admin: 'Admin', description: 'Demoted to Learner' });
        showToast(`${targetName} demoted to Learner`, 'success');
      } else if (actionModal.type === 'BULK_BLOCK') {
        await Promise.all(selectedIds.map(id => updateStatus({ userId: id, status: 'BLOCKED', reason: fullReason })));
        await createAuditLog({ action: 'BULK_BLOCK', target: `${selectedIds.length} users`, admin: 'Admin', description: fullReason });
        showToast(`${selectedIds.length} users blocked`, 'success');
        setSelectedIds([]);
      } else if (actionModal.type === 'BULK_PROMOTE') {
        await Promise.all(selectedIds.map(id => changeRole({ userId: id, role: 'MENTOR', reason: fullReason })));
        await createAuditLog({ action: 'BULK_PROMOTE', target: `${selectedIds.length} users`, admin: 'Admin', description: fullReason });
        showToast(`${selectedIds.length} users promoted`, 'success');
        setSelectedIds([]);
      } else if (actionModal.type === 'BULK_SUSPEND') {
        await Promise.all(selectedIds.map(id => updateStatus({ userId: id, status: 'SUSPENDED', reason: fullReason })));
        await createAuditLog({ action: 'BULK_SUSPEND', target: `${selectedIds.length} users`, admin: 'Admin', description: fullReason });
        showToast(`${selectedIds.length} users suspended`, 'success');
        setSelectedIds([]);
      }
      setActionModal({ ...actionModal, isOpen: false });
      setReason('Policy Violation');
      setMessage('');
    } catch {
      showToast('Action failed. Check network and try again.', 'error');
    }
  }, [actionModal, users, reason, message, selectedIds, updateStatus, changeRole, createAuditLog, showToast]);

  const toggleSelect = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleAll = () => {
    if (selectedIds.length === filteredUsers.length) setSelectedIds([]);
    else setSelectedIds(filteredUsers.map((u: any) => u.userId));
  };

  return (
    <div className="space-y-6 pb-32">
      {/* Header with refresh controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Users</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage platform users and access</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-refresh indicator */}
          {autoRefreshInterval > 0 && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1.5">
              <Icon icon={Timer} size={14} className="animate-pulse" />
              Auto-refresh: {REFRESH_OPTIONS.find(o => o.value === autoRefreshInterval)?.label}
            </span>
          )}
          {lastUpdated && (
            <span className="text-xs font-medium text-gray-400">Updated {getTimeAgo(lastUpdated)}</span>
          )}

          {/* Manual Refresh */}
          <button 
            onClick={handleManualRefresh} 
            disabled={isRefreshing}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Icon icon={RefreshCw} size={14} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          {/* Auto-refresh settings */}
          <div className="relative">
            <button 
              onClick={() => setShowRefreshSettings(!showRefreshSettings)}
              className={`px-3 py-2.5 border rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${autoRefreshInterval > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <Icon icon={Settings2} size={14} />
            </button>
            {showRefreshSettings && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowRefreshSettings(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4">
                  <h4 className="text-xs font-bold text-gray-900 mb-3">Auto Refresh Settings</h4>
                  <div className="space-y-1">
                    {REFRESH_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setAutoRefreshInterval(opt.value); setShowRefreshSettings(false); showToast(opt.value > 0 ? `Auto-refresh set to ${opt.label}` : 'Auto-refresh disabled', 'info'); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${autoRefreshInterval === opt.value ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <span className="flex items-center justify-between">
                          {opt.label}
                          {autoRefreshInterval === opt.value && <CheckCircle size={14} className="text-indigo-600" />}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2">
            <Mail size={14} /> Invite User
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Input 
             placeholder="Search by name or email..." 
             leftIcon={<Icon icon={Search} size={16} />}
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer">
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="MENTOR">Mentor</option>
          <option value="LEARNER">Learner</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer">
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="BLOCKED">Blocked</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between animate-fade-in">
          <span className="text-sm font-bold text-indigo-700">{selectedIds.length} user(s) selected</span>
          <div className="flex gap-2">
            <button onClick={() => openModal(null, 'BULK_PROMOTE', 'Promote Selected', 'info')} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all flex items-center gap-1.5"><Icon icon={ArrowUpCircle} size={12} /> Promote</button>
            <button onClick={() => openModal(null, 'BULK_SUSPEND', 'Suspend Selected', 'warning')} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-all flex items-center gap-1.5"><Icon icon={Lock} size={12} /> Suspend</button>
            <button onClick={() => openModal(null, 'BULK_BLOCK', 'Block Selected', 'danger')} className="px-4 py-2 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-all flex items-center gap-1.5"><Icon icon={Ban} size={12} /> Block</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Error State */}
        {isUsersError ? (
          <div className="p-16 text-center">
            <XCircle className="w-12 h-12 text-rose-300 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-gray-900 mb-1">Failed to load users</h4>
            <p className="text-sm font-medium text-gray-400 mb-6">Could not connect to the backend. Check that the user-service is running.</p>
            <Button onClick={handleManualRefresh} leftIcon={<Icon icon={RefreshCw} size={14} />}>
              Retry
            </Button>
          </div>
        ) : isUsersLoading ? (
          <div className="divide-y divide-gray-50">
            <div className="px-5 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <div className="w-5" /><div className="w-10" /><div className="flex-1">Fetching users...</div>
            </div>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="p-5 flex items-center gap-4">
                <div className="w-5 h-5 bg-gray-100 rounded animate-pulse" />
                <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2"><div className="h-4 w-32 bg-gray-100 rounded animate-pulse" /><div className="h-3 w-48 bg-gray-50 rounded animate-pulse" /></div>
                <div className="h-6 w-16 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-6 w-14 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-20 text-center">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-gray-900 mb-1">No users found</h4>
            <p className="text-sm font-medium text-gray-400">Users will appear here once they register</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-5 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center gap-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <div className="w-5"><input type="checkbox" checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0} onChange={toggleAll} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" /></div>
              <div className="w-10" />
              <div className="flex-1">Name</div>
              <div className="w-40">Email</div>
              <div className="w-20 text-center">Role</div>
              <div className="w-24 text-center">Status</div>
              <div className="w-24 text-center">Joined</div>
              <div className="w-10" />
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {filteredUsers.map((u: any) => {
                const status = getStatusBadge(u.status);
                const role = getRoleBadge(u.role);
                return (
                  <div key={u.userId} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors group/row">
                    <div className="w-5"><input type="checkbox" checked={selectedIds.includes(u.userId)} onChange={() => toggleSelect(u.userId)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" /></div>
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600 cursor-pointer group-hover/row:bg-indigo-600 group-hover/row:text-white transition-all" onClick={() => setDrawerUserId(u.userId)}>
                      {u.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setDrawerUserId(u.userId)}>
                      <p className="text-sm font-bold text-gray-900 truncate group-hover/row:text-indigo-600 transition-colors">{u.name || 'Unknown'}</p>
                    </div>
                    <div className="w-40 truncate text-xs font-medium text-gray-500">{u.email}</div>
                    <div className="w-20 text-center flex flex-wrap gap-1 justify-center">
                      {u.roles?.map((r: string) => (
                        <span key={r} className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-wider ${getRoleBadge(r).cls}`}>
                          {getRoleBadge(r).label}
                        </span>
                      ))}
                    </div>
                    <div className="w-24 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${status.cls}`}>
                        {status.dot}
                        {status.label}
                      </span>
                    </div>
                    <div className="w-24 text-center text-xs font-medium text-gray-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </div>
                    <div className="w-10 relative">
                      <button onClick={() => setActiveMenu(activeMenu === u.userId ? null : u.userId)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-all"><Icon icon={MoreVertical} size={16} /></button>
                      {activeMenu === u.userId && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                          <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden p-1.5">
                            <button onClick={() => { setDrawerUserId(u.userId); setActiveMenu(null); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition-all"><Icon icon={Eye} size={14} /> View Profile</button>
                            {u.role === 'LEARNER' && <button onClick={() => openModal(u.userId, 'PROMOTE', 'Promote to Mentor', 'info')} className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Icon icon={ArrowUpCircle} size={14} /> Promote to Mentor</button>}
                            {u.role === 'MENTOR' && <button onClick={() => openModal(u.userId, 'DEMOTE', 'Demote to Learner', 'warning')} className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><Icon icon={ArrowDownCircle} size={14} /> Demote to Learner</button>}
                            {u.status === 'ACTIVE' && (
                              <>
                                <button onClick={() => openModal(u.userId, 'SUSPEND', 'Suspend User', 'warning')} className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><Icon icon={Lock} size={14} /> Suspend User</button>
                                <div className="my-1 border-t border-gray-100" />
                                <button onClick={() => openModal(u.userId, 'BLOCK', 'Block User', 'danger')} className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Icon icon={Ban} size={14} /> Block User</button>
                              </>
                            )}
                            {(u.status === 'BLOCKED' || u.status === 'SUSPENDED') && <button onClick={() => openModal(u.userId, 'UNBLOCK', 'Unblock User', 'info')} className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Icon icon={Unlock} size={14} /> Unblock User</button>}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex justify-between text-xs font-bold text-gray-400">
              <span>Showing {filteredUsers.length} of {users?.length || 0} users</span>
              {lastUpdated && <span>Last updated: {getTimeAgo(lastUpdated)}</span>}
            </div>
          </>
        )}
      </div>

      {/* Premium User Detail Drawer */}
      <UserDetailsDrawer 
        userId={drawerUserId}
        onClose={() => setDrawerUserId(null)}
        onAction={(uid, type, val) => setActionModal({ 
          isOpen: true, 
          type: type === 'ROLE' ? (val === 'MENTOR' ? 'PROMOTE' : 'DEMOTE') : (val === 'BLOCKED' ? 'BLOCK' : 'UNBLOCK'), 
          userId: uid, 
          title: type === 'ROLE' ? 'Adjust Rank' : 'Security Override', 
          modalType: type === 'ROLE' ? 'info' : 'warning' 
        })}
      />

      {/* Modal */}
      <SaaSModal isOpen={actionModal.isOpen} onClose={() => { setActionModal({ ...actionModal, isOpen: false }); setReason('Policy Violation'); setMessage(''); }} title={actionModal.title} type={actionModal.modalType} onConfirm={handleAction} confirmLabel="Confirm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reason</label>
            <select value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="Policy Violation">Policy Violation</option>
              <option value="Suspicious Activity">Suspicious Activity</option>
              <option value="Spam / Abuse">Spam / Abuse</option>
              <option value="Role Change Request">Role Change Request</option>
              <option value="Performance Review">Performance Review</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Details (Optional)</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100 min-h-[100px] resize-none" placeholder="Provide additional context..." />
          </div>
        </div>
      </SaaSModal>
    </div>
  );
}
