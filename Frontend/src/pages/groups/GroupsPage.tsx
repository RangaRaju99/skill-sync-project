import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Globe, LogOut, MessageSquare, ShieldCheck } from 'lucide-react';
import groupService from '../../services/groupService';
import PageLayout from '../../components/layout/PageLayout';
import { useToast } from '../../components/ui/Toast';
import { useActionConfirm } from '../../components/ui/ActionConfirm';
import type { RootState } from '../../store';

const GroupsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { requestConfirmation } = useActionConfirm();
  const role = useSelector((state: RootState) => state.auth.role);

  const [activeTab, setActiveTab] = useState<'explore' | 'mygroups'>('explore');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const { data: exploreData, isLoading: exploreLoading } = useQuery({
    queryKey: ['groups', 'explore', page, search],
    queryFn: () => groupService.getGroups(search, undefined, page, 10),
  });

  const { data: myGroupsData, isLoading: myGroupsLoading } = useQuery({
    queryKey: ['groups', 'my', page],
    queryFn: () => groupService.getMyGroups(page, 10),
  });

  const joinGroupMutation = useMutation({
    mutationFn: (groupId: number) => groupService.joinGroup(groupId),
    onSuccess: () => {
      showToast({ message: 'Synchronized with Circle.', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: () => showToast({ message: 'Synchronization Failed.', type: 'error' }),
  });

  const leaveGroupMutation = useMutation({
    mutationFn: (groupId: number) => groupService.leaveGroup(groupId),
    onSuccess: () => {
      showToast({ message: 'Circle Terminated.', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: () => showToast({ message: 'Termination Failed.', type: 'error' }),
  });

  const handleLeaveGroup = async (groupId: number, groupName: string) => {
    const confirmed = await requestConfirmation({
      title: 'Exit Circle?',
      message: `Are you sure you want to terminate your connection with "${groupName}"?`,
      confirmLabel: 'Confirm Exit',
    });
    if (confirmed) leaveGroupMutation.mutate(groupId);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } }
  };

  return (
    <PageLayout>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-12">
        {/* Header */}
        <motion.section variants={itemVariants} className="relative py-4">
          <div className="absolute -left-12 -top-12 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
          <h1 className="text-6xl font-display font-black text-white tracking-tighter leading-[0.9]">
            Network <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">Circles</span>.
          </h1>
          <p className="text-lg text-white/40 font-bold uppercase tracking-[0.3em] mt-6 flex items-center gap-4">
            <span className="w-12 h-[2px] bg-primary/30" />
            Global Community Modules
          </p>
        </motion.section>

        {/* Search & Tabs */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex gap-2 p-1.5 glass-card rounded-[1.5rem] w-fit border-white/5">
            {['explore', 'mygroups'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab as typeof activeTab); setPage(0); }}
                className={`relative px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                  activeTab === tab ? 'text-white' : 'text-white/30 hover:text-white/60'
                }`}
              >
                {activeTab === tab && (
                  <motion.div layoutId="tab-pill-groups" className="absolute inset-0 bg-primary rounded-2xl -z-10 shadow-lg shadow-primary/20" />
                )}
                {tab === 'explore' ? 'Explore Network' : 'Active Connections'}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-primary transition-colors" size={18} />
            <input
              type="text"
              placeholder="Locate Circle..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all placeholder:text-white/10"
            />
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'explore' ? (
            <motion.div key="explore" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
              {exploreLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="h-64 glass-card rounded-[2.5rem] animate-pulse" />
                  ))}
                </div>
              ) : exploreData?.content && exploreData.content.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {exploreData.content.map((group: any) => {
                    const isJoining = joinGroupMutation.isPending && joinGroupMutation.variables === group.id;
                    return (
                      <motion.div
                        layout
                        variants={itemVariants}
                        whileHover={{ y: -10 }}
                        key={group.id}
                        className="glass-card rounded-[2.5rem] p-8 flex flex-col border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 blur-[40px]" />
                        <div className="flex justify-between items-start mb-6">
                          <span className="text-[9px] font-black bg-white/5 text-white/40 px-3 py-1 rounded-full uppercase tracking-widest border border-white/5">{group.category}</span>
                          <span className="text-[10px] font-bold text-white/20 flex items-center gap-1.5"><Users size={12} /> {group.memberCount}</span>
                        </div>
                        <h3 className="text-xl font-display font-black text-white mb-3 tracking-tighter uppercase group-hover:text-primary transition-colors">{group.name}</h3>
                        <p className="text-[11px] text-white/40 font-medium uppercase tracking-widest leading-relaxed line-clamp-2 mb-8">{group.description}</p>
                        
                        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                          {group.isJoined || role === 'ROLE_ADMIN' ? (
                            <button
                              onClick={() => navigate(`/groups/${group.id}`)}
                              className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 transition-all flex items-center justify-center gap-3"
                            >
                              {role === 'ROLE_ADMIN' ? <ShieldCheck size={16} /> : <MessageSquare size={16} />}
                              {role === 'ROLE_ADMIN' ? 'Secure Override' : 'Open Channel'}
                            </button>
                          ) : (
                            <button
                              onClick={() => joinGroupMutation.mutate(group.id)}
                              disabled={isJoining}
                              className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
                            >
                              {isJoining ? 'Synchronizing...' : 'Initialize Connection'}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="glass-card rounded-[3rem] p-20 text-center flex flex-col items-center">
                  <Globe className="text-white/10 mb-6" size={48} />
                  <p className="font-black text-white/20 uppercase tracking-[0.3em]">Network Registry Empty</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="mygroups" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
              {myGroupsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-64 glass-card rounded-[2.5rem] animate-pulse" />
                  ))}
                </div>
              ) : myGroupsData?.content && myGroupsData.content.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {myGroupsData.content.map((group: any) => (
                    <motion.div
                      layout
                      variants={itemVariants}
                      whileHover={{ y: -10 }}
                      key={group.id}
                      className="glass-card rounded-[2.5rem] p-8 flex flex-col border-white/5 group relative overflow-hidden"
                    >
                      <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 blur-[40px]" />
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-[9px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">Active Sync</span>
                        <span className="text-[10px] font-bold text-white/20 flex items-center gap-1.5"><Users size={12} /> {group.memberCount}</span>
                      </div>
                      <h3 className="text-xl font-display font-black text-white mb-3 tracking-tighter uppercase group-hover:text-primary transition-colors">{group.name}</h3>
                      <p className="text-[11px] text-white/40 font-medium uppercase tracking-widest leading-relaxed line-clamp-2 mb-8">{group.description}</p>
                      
                      <div className="mt-auto pt-6 border-t border-white/5 flex gap-3">
                        <button
                          onClick={() => navigate(`/groups/${group.id}`)}
                          className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 transition-all flex items-center justify-center gap-3"
                        >
                          <MessageSquare size={16} /> Open
                        </button>
                        <button
                          onClick={() => void handleLeaveGroup(group.id, group.name)}
                          disabled={leaveGroupMutation.isPending}
                          className="px-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                        >
                          <LogOut size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-[3rem] p-20 text-center flex flex-col items-center">
                  <Users className="text-white/10 mb-6" size={48} />
                  <p className="font-black text-white/20 uppercase tracking-[0.3em]">No Active Connections</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {(exploreData?.totalElements > 10 || myGroupsData?.totalElements > 10) && (
          <motion.div variants={itemVariants} className="flex justify-center items-center gap-6 pt-10">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Registry Page {page + 1}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil((activeTab === 'explore' ? exploreData.totalElements : myGroupsData.totalElements) / 10) - 1}
              className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20"
            >
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </motion.div>
        )}
      </motion.div>
    </PageLayout>
  );
};

export default GroupsPage;
