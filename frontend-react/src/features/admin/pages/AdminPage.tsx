import React, { useState, useMemo } from 'react';
import {
   Users, UserCheck, Shield, Plus, Search,
   Activity, Database, User, AlertCircle,
   ChevronRight, Globe, ShieldCheck, ChevronLeft,
   Mail, Clock, BarChart, TrendingUp, PieChart, Ban, UserPlus, Lock, Settings, Users2
} from 'lucide-react';
import { useAdmin } from '../../../hooks/useAdmin';
import { useGroups } from '../../../hooks/useGroups';

// Modular Components
import { StatCard } from '../components/StatCard';
import { UserTable } from '../components/UserTable';

export default function AdminPage() {
   const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'groups' | 'mentors' | 'skills' | 'audit' | 'settings' | 'permissions'>('dashboard');
   const {
      pendingMentors,
      registeredUsers, isRegisteredUsersLoading, changeRole, updateStatus,
      auditLogs, systemStats
   } = useAdmin();
   const { groups } = useGroups();

   const [searchQuery, setSearchQuery] = useState('');
   const [roleFilter, setRoleFilter] = useState('ALL');
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 10;

   // Decision Modal Logic
   const [actionModal, setActionModal] = useState<{
      show: boolean;
      userId: number | null;
      type: 'ROLE' | 'STATUS' | 'DELETE';
      value: string;
      reason: string;
   }>({ show: false, userId: null, type: 'ROLE', value: '', reason: '' });

   // Data Filtering
   const filteredUsers = useMemo(() => {
      if (!registeredUsers) return [];
      return registeredUsers
         .filter((u: any) => {
            const matchesSearch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               u.email?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
            return matchesSearch && matchesRole;
         })
         .sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
   }, [registeredUsers, searchQuery, roleFilter]);

   const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
   const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

   const stats = [
      { label: 'Total Inhabitants', value: systemStats?.totalInhabitants || 0, trend: '+12%', trendUp: true, icon: <User className="w-5 h-5" />, color: 'bg-indigo-50 text-indigo-600' },
      { label: 'Active Matrix', value: systemStats?.activeUsers || 0, trend: '+5%', trendUp: true, icon: <Database className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600' },
      { label: 'Registry Queue', value: pendingMentors?.length || 0, trend: '-2%', trendUp: false, icon: <Activity className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600' },
      { label: 'Active Hubs', value: (groups?.filter((g: any) => g.status === 'ACTIVE') || []).length, trend: '+1', trendUp: true, icon: <Users className="w-5 h-5" />, color: 'bg-violet-50 text-violet-600' },
   ];

   return (
      <div className="space-y-10">
         {/* Action Row */}
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic leading-none">Management Core</h2>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                  <Clock className="w-3 h-3 text-indigo-500" /> Operational Cycle: Active
               </p>
            </div>
            <div className="flex items-center gap-3">
               <button className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                  <UserPlus className="w-4 h-4" /> Invite User
               </button>
               <button className="px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-100">
                  <Plus className="w-4 h-4" /> Create Group
               </button>
            </div>
         </div>

         {/* KPI Section */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => <StatCard key={i} {...stat} />)}
         </div>

         {/* Secondary Nav */}
         <div className="flex flex-wrap gap-4 border-b border-slate-100 pb-2">
            {['dashboard', 'users', 'groups', 'mentors', 'skills', 'audit', 'settings', 'permissions'].map((tab) => (
               <button
                  key={tab}
                  onClick={() => { setActiveTab(tab as any); setCurrentPage(1); }}
                  className={`pb-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-indigo-600 font-black' : 'text-slate-400 hover:text-slate-600'
                     }`}
               >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-indigo-600 rounded-full animate-fade-in" />}
               </button>
            ))}
         </div>

         {/* Dashboard View */}
         {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-10">
                     <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">Node Growth Vector</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Growth rate relative to previous cycle</p>
                     </div>
                  </div>
                  <div className="h-64 flex items-end justify-between gap-4 px-4 relative">
                     {[40, 60, 45, 90, 65, 80, 100, 75, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-slate-50 rounded-t-xl group/bar relative hover:bg-indigo-50 transition-all cursor-crosshair">
                           <div className="absolute bottom-0 w-full bg-indigo-600 rounded-t-xl" style={{ height: `${h}%` }}></div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic mb-10">Matrix Distribution</h3>
                  <div className="relative w-48 h-48 mx-auto mb-10 border-[1rem] border-indigo-600 rounded-full flex flex-col items-center justify-center">
                     <p className="text-2xl font-black text-slate-900">88%</p>
                     <p className="text-[8px] font-black text-slate-400">UPTIME</p>
                  </div>
                  <div className="space-y-4">
                     {[
                        { label: 'Learners', count: systemStats?.userDistribution?.LEARNER || 0, color: 'bg-indigo-500' },
                        { label: 'Mentors', count: systemStats?.userDistribution?.MENTOR || 0, color: 'bg-emerald-400' },
                        { label: 'Admins', count: systemStats?.userDistribution?.ADMIN || 0, color: 'bg-amber-400' }
                     ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ">{item.label}</span>
                           </div>
                           <span className="text-[10px] font-black text-slate-900">{item.count}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         )}

         {/* Users View */}
         {activeTab === 'users' && (
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
               <div className="p-8 border-b border-slate-50 flex gap-4">
                  <div className="relative flex-1">
                     <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                     <input
                        type="text"
                        placeholder="Interrogate node database..."
                        className="w-full bg-slate-50 rounded-2xl p-4 pl-12 text-sm font-bold border-none outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                     />
                  </div>
               </div>
               <UserTable
                  users={paginatedUsers}
                  isLoading={isRegisteredUsersLoading}
                  onRoleChange={(id, val) => setActionModal({ show: true, userId: id, type: 'ROLE', value: val, reason: '' })}
                  onStatusChange={(id, status) => setActionModal({ show: true, userId: id, type: 'STATUS', value: status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE', reason: '' })}
               />
               {totalPages > 1 && (
                  <div className="p-8 border-t border-slate-50 flex justify-between items-center bg-slate-50/10">
                     <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-3 bg-white border rounded-xl disabled:opacity-20 transition-all hover:bg-slate-50"><ChevronLeft className="w-5 h-5" /></button>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Matrix Page {currentPage} / {totalPages}</span>
                     <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-3 bg-white border rounded-xl disabled:opacity-20 transition-all hover:bg-slate-50"><ChevronRight className="w-5 h-5" /></button>
                  </div>
               )}
            </div>
         )}

         {/* Audit View */}
         {activeTab === 'audit' && (
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
               <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">Operational Audit Log</h3>
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest">
                     <Activity className="w-3 h-3" /> System Stable
                  </div>
               </div>
               <div className="divide-y divide-slate-50">
                  {auditLogs?.map((log: any, i: number) => (
                     <div key={i} className="p-8 hover:bg-slate-50/50 transition-all flex items-start justify-between gap-6">
                        <div className="flex gap-4">
                           <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400"><Database className="w-5 h-5" /></div>
                           <div>
                              <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-2">{log.action}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.description}</p>
                           </div>
                        </div>
                        <div className="text-right shrink-0">
                           <p className="text-[10px] font-black text-slate-900 leading-none mb-1 uppercase tracking-widest">{log.performerEmail}</p>
                           <p className="text-[9px] font-bold text-slate-400 italic tracking-widest">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                     </div>
                  ))}
                  {(!auditLogs || auditLogs.length === 0) && (
                     <div className="p-20 text-center">
                        <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No audit transmissions found</p>
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* Permissions View */}
         {activeTab === 'permissions' && (
            <div className="bg-white rounded-[2.5rem] p-16 border border-slate-100 shadow-sm text-center">
               <Lock className="w-20 h-20 text-indigo-100 mx-auto mb-8" />
               <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-4 tracking-tighter">Security Matrix Override</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
                  Define granular access vectors for system nodes. This sector is currently protected by root-level encryption protocols.
               </p>
               <button className="mt-10 px-8 py-4 bg-indigo-50 text-indigo-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-indigo-100">Unlock Vector</button>
            </div>
         )}

         {/* Settings View */}
         {activeTab === 'settings' && (
            <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-sm">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 shadow-sm border border-slate-100"><Settings className="w-6 h-6" /></div>
                  <div>
                     <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Core Configuration</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Matrix synchronization parameters</p>
                  </div>
               </div>
               <div className="space-y-6">
                  {[
                     { label: 'Neural Sync Interval', desc: 'Frequency of matrix synchronization cycles', value: '15000ms' },
                     { label: 'Operational Logging', desc: 'Verbosity of administrative audit transmissions', value: 'VERBOSE' },
                     { label: 'Expert Verification', desc: 'Require manual override for all expert mentor requests', value: 'ENABLED' }
                  ].map((s, i) => (
                     <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 bg-slate-50/20 rounded-[2rem] border border-slate-100 hover:bg-slate-50/50 transition-all">
                        <div>
                           <p className="text-xs font-black text-slate-900 uppercase italic mb-1 tracking-widest">{s.label}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.desc}</p>
                        </div>
                        <div className="px-8 py-3 bg-white rounded-2xl text-[10px] font-black text-indigo-600 border border-slate-200 shadow-sm italic tracking-widest">{s.value}</div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* Groups Placeholder */}
         {activeTab === 'groups' && (
            <div className="bg-white rounded-[2.5rem] p-16 border border-slate-100 shadow-sm text-center">
               <Users2 className="w-20 h-20 text-violet-100 mx-auto mb-8" />
               <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-4 tracking-tighter">Community Hub Registry</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
                  Managing {groups?.length || 0} active clusters. Detailed hub lifecycle management is being integrated into this sector.
               </p>
            </div>
         )}

         {actionModal.show && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40">
               <div className="bg-white rounded-[3rem] p-12 max-w-md w-full shadow-2xl animate-modal-in transform scale-100 opacity-100 transition-all">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-indigo-100"><Shield className="w-8 h-8" /></div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-4 italic leading-none">Override Authorization</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">System ID: {actionModal.userId}</p>

                  <textarea
                     className="w-full bg-slate-50 rounded-[1.5rem] p-6 text-sm font-bold outline-none border border-slate-100 focus:ring-4 focus:ring-indigo-100 mb-8 placeholder:text-slate-300 min-h-[120px]"
                     placeholder="Provide justification for security log..."
                     value={actionModal.reason}
                     onChange={(e) => setActionModal(prev => ({ ...prev, reason: e.target.value }))}
                  />

                  <div className="grid grid-cols-2 gap-4">
                     <button onClick={() => setActionModal({ ...actionModal, show: false })} className="py-5 bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Abort</button>
                     <button
                        onClick={async () => {
                           if (actionModal.reason.length < 5) return alert("Security log too short (min 5 chars)");
                           try {
                              if (actionModal.type === 'ROLE') await changeRole({ userId: actionModal.userId!, role: actionModal.value, reason: actionModal.reason });
                              else await updateStatus({ userId: actionModal.userId!, status: actionModal.value, reason: actionModal.reason });
                              setActionModal({ ...actionModal, show: false, reason: '' });
                           } catch (err) {
                              alert("Authorization failed: Check network transmission");
                           }
                        }}
                        className="py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                     >Authorize</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
