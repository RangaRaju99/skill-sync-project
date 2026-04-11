import React, { useState, useMemo, useCallback } from 'react';
import { Search, MoreVertical, Download, Users, Lock, Unlock, Trash2, Archive, Eye, AlertTriangle, ShieldCheck, ShieldAlert, RotateCcw, History, Send, User } from 'lucide-react';
import { useGroups } from '../../../hooks/useGroups';
import { SaaSDrawer } from '../components/SaaSDrawer';
import { SaaSModal } from '../components/SaaSModal';
import { useAdmin } from '../../../hooks/useAdmin';
import { useToast } from '../../../hooks/useToast';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export default function AdminGroupsPage() {
  const { groups, isLoading, markGroupInactive, deleteGroup, refetchGroups } = useGroups();
  const { createAuditLog } = useAdmin();
  const { showToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  // Drawer / Modals
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [actionModal, setActionModal] = useState<{isOpen: boolean, type: string | null, groupId: number | null}>({ isOpen: false, type: null, groupId: null });
  const [reason, setReason] = useState('');

  // Filtered groups with search + status
  const filteredGroups = useMemo(() => {
    if (!groups) return [];
    return groups.filter((g: any) => {
      const name = g.title || g.name || '';
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || g.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [groups, searchQuery, statusFilter]);

  const activeGroup = useMemo(() => groups?.find((g: any) => g.id === activeGroupId), [activeGroupId, groups]);

  // Risk level based on reports count
  const getRiskLevel = (reports: number) => {
    if (reports > 5) return { label: 'High Risk', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: <ShieldAlert size={12} /> };
    if (reports >= 3) return { label: 'Warning', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: <AlertTriangle size={12} /> };
    return { label: 'Safe', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <ShieldCheck size={12} /> };
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'INACTIVE': return { label: 'Locked', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'DELETED': return { label: 'Archived', cls: 'bg-gray-100 text-gray-500 border-gray-200' };
      default: return { label: status, cls: 'bg-gray-50 text-gray-500 border-gray-200' };
    }
  };

  // Handle single action
  const handleAction = useCallback(async () => {
    if (!actionModal.type || !actionModal.groupId) return;
    try {
      const targetGroup = groups?.find((g: any) => g.id === actionModal.groupId);
      const groupName = targetGroup?.title || targetGroup?.name || 'Unknown';

      if (actionModal.type === 'LOCK') {
        await markGroupInactive(actionModal.groupId);
        await createAuditLog({ action: 'GROUP_LOCKED', target: groupName, admin: 'Admin', description: reason || 'Locked by admin.' });
        showToast(`Group "${groupName}" locked successfully`, 'success');
      } else if (actionModal.type === 'DELETE') {
        await deleteGroup(actionModal.groupId);
        await createAuditLog({ action: 'GROUP_DELETED', target: groupName, admin: 'Admin', description: reason || 'Deleted by admin.' });
        showToast(`Group "${groupName}" deleted permanently`, 'success');
      } else if (actionModal.type === 'UNLOCK') {
        // Remove from archived list
        const archived = JSON.parse(localStorage.getItem('archived-groups') || '[]');
        localStorage.setItem('archived-groups', JSON.stringify(archived.filter((id: number) => id !== actionModal.groupId)));
        refetchGroups();
        await createAuditLog({ action: 'GROUP_UNLOCKED', target: groupName, admin: 'Admin', description: reason || 'Unlocked by admin.' });
        showToast(`Group "${groupName}" unlocked successfully`, 'success');
      } else if (actionModal.type === 'WARNING') {
        await createAuditLog({ action: 'GROUP_WARNING', target: groupName, admin: 'Admin', description: reason || 'Warning issued.' });
        showToast(`Warning sent to group "${groupName}"`, 'success');
      }
      setActionModal({ isOpen: false, type: null, groupId: null });
      setReason('');
    } catch {
      showToast('Action failed. Please try again.', 'error');
    }
  }, [actionModal, groups, reason, markGroupInactive, deleteGroup, createAuditLog, showToast, refetchGroups]);

  // Bulk actions
  const handleBulkAction = async (type: string) => {
    try {
      for (const id of selectedIds) {
        if (type === 'LOCK') await markGroupInactive(id);
        if (type === 'DELETE') await deleteGroup(id);
      }
      await createAuditLog({ action: `BULK_${type}`, target: `${selectedIds.length} groups`, admin: 'Admin', description: `Bulk ${type.toLowerCase()} on ${selectedIds.length} groups.` });
      showToast(`${selectedIds.length} groups ${type.toLowerCase()}ed successfully`, 'success');
      setSelectedIds([]);
    } catch {
      showToast('Bulk action failed.', 'error');
    }
  };

  // CSV Export
  const handleExport = () => {
    const rows = [['Name', 'Status', 'Members', 'Created']];
    filteredGroups.forEach((g: any) => {
      rows.push([g.title || g.name, g.status, g.currentMembers || g.memberCount || 0, g.createdAt]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `groups_export_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    showToast('Groups data exported successfully', 'success');
  };

  // Toggle single checkbox
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Toggle all
  const toggleAll = () => {
    if (selectedIds.length === filteredGroups.length) setSelectedIds([]);
    else setSelectedIds(filteredGroups.map((g: any) => g.id));
  };

  const getModalConfig = () => {
    switch (actionModal.type) {
      case 'DELETE': return { title: 'Delete Group Permanently', type: 'danger' as const, label: 'Delete', placeholder: 'Reason for deletion...' };
      case 'LOCK': return { title: 'Lock Group', type: 'warning' as const, label: 'Lock Group', placeholder: 'Reason for locking...' };
      case 'UNLOCK': return { title: 'Unlock Group', type: 'info' as const, label: 'Unlock', placeholder: 'Reason for unlocking...' };
      case 'WARNING': return { title: 'Send Warning', type: 'warning' as const, label: 'Send Warning', placeholder: 'Warning message to group members...' };
      default: return { title: 'Confirm Action', type: 'info' as const, label: 'Confirm', placeholder: 'Provide a reason...' };
    }
  };

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Groups Management</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Monitor and control all platform groups</p>
        </div>
        <Button 
           variant="secondary"
           onClick={handleExport} 
           leftIcon={<Icon icon={Download} size={14} />}
        >
           Export CSV
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <Input 
             placeholder="Search groups by name..." 
             leftIcon={<Icon icon={Search} size={16} />}
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer">
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Locked</option>
          <option value="DELETED">Archived</option>
        </select>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between animate-fade-in">
          <span className="text-sm font-bold text-indigo-700">{selectedIds.length} group(s) selected</span>
          <div className="flex gap-2">
            <button onClick={() => handleBulkAction('LOCK')} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-all flex items-center gap-1.5"><Icon icon={Lock} size={12} /> Lock</button>
            <button onClick={() => handleBulkAction('DELETE')} className="px-4 py-2 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-all flex items-center gap-1.5"><Icon icon={Trash2} size={12} /> Delete</button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-50">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="p-5 flex items-center gap-4">
                <div className="w-5 h-5 bg-gray-100 rounded animate-pulse" />
                <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse" />
                <div className="flex-1 space-y-2"><div className="h-4 w-40 bg-gray-100 rounded animate-pulse" /><div className="h-3 w-24 bg-gray-50 rounded animate-pulse" /></div>
                <div className="h-6 w-16 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-6 w-16 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="p-20 text-center">
            <Icon icon={Users} size={48} className="text-gray-200 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-gray-900 mb-1">No groups found</h4>
            <p className="text-sm font-medium text-gray-400">Groups will appear here once users create them</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="px-5 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center gap-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <div className="w-5"><input type="checkbox" checked={selectedIds.length === filteredGroups.length && filteredGroups.length > 0} onChange={toggleAll} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" /></div>
              <div className="w-10" />
              <div className="flex-1">Group Name</div>
              <div className="w-20 text-center">Members</div>
              <div className="w-24 text-center">Status</div>
              <div className="w-24 text-center">Risk</div>
              <div className="w-10" />
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-50">
              {filteredGroups.map((g: any) => {
                const reports = g.reportsCount || 0;
                const risk = getRiskLevel(reports);
                const status = getStatusBadge(g.status);
                const memberCount = g.currentMembers || g.memberCount || 0;
                const name = g.title || g.name || 'Unnamed';
                
                return (
                  <div key={g.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors group/row">
                    <div className="w-5"><input type="checkbox" checked={selectedIds.includes(g.id)} onChange={() => toggleSelect(g.id)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" /></div>
                    <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center group-hover/row:bg-indigo-600 group-hover/row:text-white group-hover/row:border-indigo-600 text-indigo-600 transition-all cursor-pointer" onClick={() => setActiveGroupId(g.id)}>
                      <Icon icon={Users} size={16} />
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setActiveGroupId(g.id)}>
                      <p className="text-sm font-bold text-gray-900 truncate group-hover/row:text-indigo-600 transition-colors">{name}</p>
                      <p className="text-xs font-medium text-gray-400 truncate">{g.description?.slice(0,50) || 'No description'}</p>
                    </div>
                    <div className="w-20 text-center text-sm font-bold text-gray-700">{memberCount}</div>
                    <div className="w-24 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border ${status.cls}`}>{status.label}</span>
                    </div>
                    <div className="w-24 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border ${risk.color}`}>{risk.icon}{risk.label}</span>
                    </div>
                    <div className="w-10 relative">
                      <button onClick={() => setActiveMenu(activeMenu === g.id ? null : g.id)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-all">
                        <Icon icon={MoreVertical} size={16} />
                      </button>
                      {activeMenu === g.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                          <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden p-1.5">
                            <button onClick={() => { setActiveGroupId(g.id); setActiveMenu(null); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition-all"><Icon icon={Eye} size={14} /> View Details</button>
                            {g.status === 'ACTIVE' ? (
                              <button onClick={() => { setActionModal({ isOpen: true, type: 'LOCK', groupId: g.id }); setActiveMenu(null); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><Icon icon={Lock} size={14} /> Lock Group</button>
                            ) : g.status === 'INACTIVE' && (
                              <button onClick={() => { setActionModal({ isOpen: true, type: 'UNLOCK', groupId: g.id }); setActiveMenu(null); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Icon icon={Unlock} size={14} /> Unlock Group</button>
                            )}
                            <button onClick={() => { setActionModal({ isOpen: true, type: 'WARNING', groupId: g.id }); setActiveMenu(null); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold text-orange-600 hover:bg-orange-50 rounded-lg transition-all"><Icon icon={Send} size={14} /> Send Warning</button>
                            <div className="my-1 border-t border-gray-100" />
                            <button onClick={() => { setActionModal({ isOpen: true, type: 'DELETE', groupId: g.id }); setActiveMenu(null); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Icon icon={Trash2} size={14} /> Delete Group</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 text-xs font-bold text-gray-400">
              Showing {filteredGroups.length} of {groups?.length || 0} groups
            </div>
          </>
        )}
      </div>

      {/* Drawer */}
      <SaaSDrawer isOpen={activeGroupId !== null} onClose={() => setActiveGroupId(null)} title="Group Details">
        {activeGroup && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center"><Icon icon={Users} size={28} className="text-indigo-600" /></div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{activeGroup.title || activeGroup.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(activeGroup.status || 'ACTIVE').cls}`}>{getStatusBadge(activeGroup.status || 'ACTIVE').label}</span>
                  <span className="text-xs font-medium text-gray-400">{activeGroup.currentMembers || activeGroup.memberCount || 0} members</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Description</h4>
              <p className="text-sm font-medium text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">{activeGroup.description || 'No description provided.'}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                {activeGroup.status === 'ACTIVE' ? (
                  <button onClick={() => { setActionModal({ isOpen: true, type: 'LOCK', groupId: activeGroup.id }); setActiveGroupId(null); }} className="p-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-amber-100 transition-all"><Icon icon={Lock} size={14} /> Lock</button>
                ) : (
                  <button onClick={() => { setActionModal({ isOpen: true, type: 'UNLOCK', groupId: activeGroup.id }); setActiveGroupId(null); }} className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all"><Icon icon={Unlock} size={14} /> Unlock</button>
                )}
                <button onClick={() => { setActionModal({ isOpen: true, type: 'WARNING', groupId: activeGroup.id }); setActiveGroupId(null); }} className="p-3 bg-orange-50 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-orange-100 transition-all"><Icon icon={Send} size={14} /> Warn</button>
                <button onClick={() => { setActionModal({ isOpen: true, type: 'DELETE', groupId: activeGroup.id }); setActiveGroupId(null); }} className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition-all col-span-2"><Icon icon={Trash2} size={14} /> Delete Permanently</button>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Moderation History</h4>
              <div className="p-8 border border-gray-100 rounded-xl bg-gray-50 text-center">
                <Icon icon={History} size={28} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-400">No moderation actions recorded yet</p>
              </div>
            </div>
          </div>
        )}
      </SaaSDrawer>

      {/* Confirmation Modal */}
      <SaaSModal 
        isOpen={actionModal.isOpen} 
        onClose={() => { setActionModal({ isOpen: false, type: null, groupId: null }); setReason(''); }} 
        title={getModalConfig().title} 
        type={getModalConfig().type} 
        onConfirm={handleAction} 
        confirmLabel={getModalConfig().label}
      >
        <textarea 
          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100 min-h-[100px] resize-none" 
          placeholder={getModalConfig().placeholder} 
          value={reason} 
          onChange={e => setReason(e.target.value)} 
        />
      </SaaSModal>
    </div>
  );
}
