
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSkills } from '@/hooks/useSkills';
import { useProfile } from '@/hooks/useProfile';
import { useMyMentorProfile } from '@/hooks/useMentors';
import { type GroupDto } from '../../../hooks/useGroups';
import { useGroups } from '../../../hooks/useGroups';
import { Loader2, Search, Plus, Target, Activity, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Modular Components
import { GroupTabs, type GroupTabType } from '../components/GroupTabs';
import { GroupList } from '../components/GroupList';

export default function GroupsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: skills } = useSkills();
  const { profile } = useProfile();
  const { data: mentorProfile } = useMyMentorProfile();

  const { groups, isLoading, refetchGroups, createGroup, joinGroup, leaveGroup } = useGroups();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<GroupTabType>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [newlyCreatedGroupId, setNewlyCreatedGroupId] = useState<number | null>(null);

  // Persistent Join State (Frontend Fallback per constraints)
  const [joinedGroupIds, setJoinedGroupIds] = useState<number[]>(() => {
    const saved = localStorage.getItem(`user-${user?.id}-joined-groups`);
    return saved ? JSON.parse(saved) : [];
  });

  const [newGroup, setNewGroup] = useState({
    name: '',
    skillId: 0,
    maxMembers: 20,
    description: '',
    category: ''
  });

  const categories = useMemo(() => {
    if (!skills) return [];
    return [...new Set(skills.map(s => s.category).filter(Boolean) as string[])].sort();
  }, [skills]);

  // Derived logic for tags based on description matching
  const getGroupFocusTag = (description?: string) => {
    const desc = description?.toLowerCase() || '';
    if (desc.includes('interview') || desc.includes('prep')) return { tag: 'Interview Prep', color: 'text-purple-600 bg-purple-50 border-purple-100' };
    if (desc.includes('project') || desc.includes('build')) return { tag: 'Project Based', color: 'text-amber-600 bg-amber-50 border-amber-100' };
    if (desc.includes('beginner') || desc.includes('start')) return { tag: 'Beginner Friendly', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
    return { tag: 'Continuous Learning', color: 'text-blue-600 bg-blue-50 border-blue-100' };
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleToggleJoin = async (e: React.MouseEvent, g: GroupDto) => {
    e.stopPropagation();
    const isJoined = joinedGroupIds.includes(g.id);
    const isInactive = g.status === 'INACTIVE' || g.status === 'DELETED';

    // 🚦 Lifecycle Rule 1: No new joins for inactive systems
    if (isInactive && !isJoined) {
      showToast('Enrollment closed: Hub is currently in offline synchronization mode.');
      return;
    }

    try {
      if (isJoined) {
        await leaveGroup(g.id);

        // 🚦 Lifecycle Rule 2: If leaving an INACTIVE hub, register the departure permanently
        if (g.status === 'INACTIVE') {
          const leftInactive = JSON.parse(localStorage.getItem('left-inactive-groups') || '[]');
          if (!leftInactive.includes(g.id)) {
            localStorage.setItem('left-inactive-groups', JSON.stringify([...leftInactive, g.id]));
          }
        }

        const updated = joinedGroupIds.filter(id => id !== g.id);
        setJoinedGroupIds(updated);
        localStorage.setItem(`user-${user?.id}-joined-groups`, JSON.stringify(updated));
        showToast('Disengaged from community hub.');
      } else {
        await joinGroup(g.id);
        const updated = [...joinedGroupIds, g.id];
        setJoinedGroupIds(updated);
        localStorage.setItem(`user-${user?.id}-joined-groups`, JSON.stringify(updated));
        showToast(`Synchronization successful: Welcome to ${g.name}`);
      }

      // Zero-Stale Sync: Force refetch after state change
      await refetchGroups();
    } catch (err) {
      showToast('Protocol failure: Peer rejected connection or resource busy.');
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroup.name || !newGroup.skillId || !newGroup.maxMembers) return;
    setIsCreating(true);
    try {
      const payload = { ...newGroup };
      const g = await createGroup(payload);

      if (g && g.id) {
        const updated = [...joinedGroupIds, g.id];
        setJoinedGroupIds(updated);
        localStorage.setItem(`user-${user?.id}-joined-groups`, JSON.stringify(updated));
        setNewlyCreatedGroupId(g.id);
        setTimeout(() => setNewlyCreatedGroupId(null), 5000);
      }

      setActiveTab('my_groups');
      setSearchQuery('');
      await refetchGroups();
      setShowCreate(false);
      setNewGroup({ name: '', skillId: 0, maxMembers: 20, description: '', category: '' });
      showToast('Community Deployed 🚀');
    } catch (err) {
      showToast('Deployment Failed');
    } finally {
      setIsCreating(false);
    }
  };

  const isCreatorView = (g: GroupDto) => String(user?.id) === String(g.creatorId);
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  // Smart Filtering pipeline
  const processedGroups = useMemo(() => {
    // 1. GLOBAL OVERRIDE: SEARCH MODE
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      return groups.filter(g =>
        g.name.toLowerCase().includes(query) ||
        g.description?.toLowerCase().includes(query)
      ).map(g => ({ ...g, _matchReason: 'search' }));
    }

    // 2. NORMAL MODES (Tab Logic)
    let filtered = [...groups];

    if (activeTab === 'inactive') {
      return filtered.filter(g => g.status === 'INACTIVE').map(g => ({ ...g, _matchReason: 'archived' }));
    }

    if (activeTab === 'history') {
      return filtered.filter(g => g.status === 'DELETED').map(g => ({ ...g, _matchReason: 'archived' }));
    }

    // All Active -> group.status === "ACTIVE"
    if (activeTab === 'all') {
      return filtered.filter(g => g.status === 'ACTIVE').sort((a, b) => (b.currentMembers || b.memberCount || 0) - (a.currentMembers || a.memberCount || 0));
    }

    // My Groups -> user joined groups
    if (activeTab === 'my_groups') {
      return filtered.filter(g => joinedGroupIds.includes(g.id) || isCreatorView(g));
    }

    // Recommended -> skill-based (Active only)
    if (activeTab === 'recommended') {
      const activeGroups = filtered.filter(g => g.status === 'ACTIVE');
      const userSkillsMap = profile?.skills
        ? profile.skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
        : [];

      if (mentorProfile?.specialization) {
        userSkillsMap.push(...mentorProfile.specialization.split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
      }

      try {
        const localSpecializations = JSON.parse(localStorage.getItem('user-specializations') || '[]');
        if (Array.isArray(localSpecializations)) {
          localSpecializations.forEach((skillId: number) => {
            const sName = skills?.find(s => s.id === skillId)?.skillName?.toLowerCase();
            if (sName && !userSkillsMap.includes(sName)) userSkillsMap.push(sName);
          });
        }
      } catch (e) { }

      const allGroupsEligible = activeGroups.filter(g => (g.currentMembers || g.memberCount || 0) < g.maxMembers);

      const skillMatchedGroups = allGroupsEligible.filter(g => {
        const sName = skills?.find(s => s.id === g.skillId)?.skillName?.toLowerCase() || '';
        const gName = g.name.toLowerCase();
        const gDesc = g.description?.toLowerCase() || '';
        return userSkillsMap.some(skill => sName.includes(skill) || gName.includes(skill) || gDesc.includes(skill));
      }).map(g => ({ ...g, _matchReason: 'skill' }));

      const popularGroups = [...allGroupsEligible]
        .sort((a, b) => (b.currentMembers || b.memberCount || 0) - (a.currentMembers || a.memberCount || 0))
        .map(g => ({ ...g, _matchReason: 'popular' }));

      return skillMatchedGroups.length > 0 ? skillMatchedGroups : popularGroups;
    }

    return filtered.filter(g => g.status === 'ACTIVE');
  }, [groups, searchQuery, activeTab, joinedGroupIds, profile, mentorProfile, skills, user]);

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-12 animate-fade-in font-sans mt-4 text-left space-y-12">

      {/* SaaS Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-primary-50 text-primary-600 rounded-full w-fit">
            <Activity size={14} className="fill-current" />
            <span className="text-[10px] font-black uppercase tracking-[3px]">SaaS Protocol Active</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-5xl font-black tracking-tight text-slate-900 uppercase italic leading-none">
              Community Hub
            </h1>
            <p className="text-slate-400 font-bold text-xl leading-relaxed max-w-2xl mt-4">
              Lifecycle-aware synchronizations.
              <span className="text-primary-600"> Join hubs. Scale skills. Preserve history.</span>
            </p>
          </div>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="h-16 px-10 bg-primary-600 text-white rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-primary-200 hover:bg-primary-700 hover:scale-105 active:scale-95 transition-all mb-4"
          >
            <Plus className="w-6 h-6" /> Deploy Community
          </button>
        )}
      </div>

      {/* Main Orchestration Board */}
      <div className="space-y-10">

        {/* Navigation & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 z-10 sticky top-0 py-4 bg-slate-50/80 backdrop-blur-xl -mx-4 px-4 lg:px-0">
          <GroupTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="relative group flex-1 max-w-xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6 group-focus-within:text-primary-600 transition-colors" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search hubs, topics, or domains..."
              className="w-full h-18 bg-white border border-slate-100 rounded-[1.6rem] pl-16 pr-8 outline-none focus:border-primary-600 focus:shadow-xl focus:shadow-primary-600/5 transition-all font-bold text-lg text-slate-900 shadow-sm"
            />
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex justify-center py-32"><Loader2 className="w-12 h-12 text-primary-600 animate-spin" /></div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {searchQuery.trim().length > 0 ? (
                <motion.div
                  key="search-mode"
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-transparent p-5 rounded-[1.5rem] border-l-[4px] border-blue-500 shadow-sm"
                >
                  <span className="font-bold text-blue-800 tracking-tight flex items-center gap-3 text-lg">
                    <Search className="w-6 h-6 text-blue-600" />
                    Showing results for "{searchQuery}"
                  </span>
                </motion.div>
              ) : activeTab === 'recommended' && (
                <motion.div
                  key="recommended-mode"
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-transparent p-5 rounded-[1.5rem] border-l-[4px] border-orange-500 shadow-sm"
                >
                  <span className="font-bold text-orange-800 tracking-tight flex items-center gap-3 text-lg">
                    <Target className="w-6 h-6 text-orange-600" />
                    {processedGroups.some(g => (g as any)._matchReason === 'skill')
                      ? "✨ Personalized specifically for you based on Skills"
                      : "No personalized skill recommendations yet 👉 Showing popular trending hubs instead."}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <GroupList
              groups={processedGroups}
              joinedGroupIds={joinedGroupIds}
              newlyCreatedGroupId={newlyCreatedGroupId}
              onJoinToggle={handleToggleJoin}
              onNavigate={(id) => navigate(`/groups/${id}`)}
              getGroupFocusTag={getGroupFocusTag}
              isCreator={isCreatorView}
              onResetFilters={() => { setSearchQuery(''); setActiveTab('all'); }}
            />
          </div>
        )}
      </div>

      {/* Deployment Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white rounded-[3rem] w-full max-w-xl p-10 shadow-2xl border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-10 text-left">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Deploy Hub</h2>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Community Initialization</p>
                </div>
                <button onClick={() => setShowCreate(false)} className="w-14 h-14 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all">
                  <span className="material-icons">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-8 text-left">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Hub Designation</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 material-icons">tag</span>
                    <input
                      type="text"
                      placeholder="e.g. Frontend Architecture Masters"
                      className="w-full h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] pl-14 pr-6 outline-none focus:border-primary-600 focus:bg-white transition-all font-black text-slate-900"
                      value={newGroup.name}
                      onChange={e => setNewGroup(p => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Domain Vector</label>
                    <select
                      className="w-full h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] px-6 outline-none focus:border-primary-600 focus:bg-white transition-all font-black text-slate-600 text-sm appearance-none"
                      value={newGroup.category}
                      onChange={e => {
                        setNewGroup(p => ({ ...p, category: e.target.value, skillId: 0 }));
                      }}
                      required
                    >
                      <option value="" disabled>Select Sector...</option>
                      {categories.map(cat => <option key={cat} value={cat} className="font-bold">{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Specific Target</label>
                    <select
                      className="w-full h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] px-6 outline-none focus:border-primary-600 focus:bg-white transition-all font-black text-slate-600 text-sm appearance-none"
                      value={newGroup.skillId || ''}
                      onChange={e => setNewGroup(p => ({ ...p, skillId: Number(e.target.value) }))}
                      disabled={!newGroup.category}
                      required
                    >
                      <option value="" disabled>Select Target...</option>
                      {skills?.filter(s => s.category === newGroup.category).map(s => <option key={s.id} value={s.id} className="font-bold">{s.skillName}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Capacity Limit</label>
                  <div className="relative">
                    <Plus className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 rotate-45" />
                    <input
                      type="number"
                      min="2" max="100"
                      className="w-full h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] pl-14 pr-6 outline-none focus:border-primary-600 focus:bg-white transition-all font-black text-slate-900"
                      value={newGroup.maxMembers}
                      onChange={e => setNewGroup(p => ({ ...p, maxMembers: Number(e.target.value) }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Operational Protocol</label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] p-6 outline-none focus:border-primary-600 focus:bg-white transition-all font-bold text-slate-600 min-h-[120px] resize-none"
                    placeholder="Define the specific goals and behaviors expected in this hub..."
                    value={newGroup.description}
                    onChange={e => setNewGroup(p => ({ ...p, description: e.target.value }))}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full h-20 bg-primary-600 text-white rounded-[2rem] font-black tracking-[0.2em] uppercase text-sm shadow-2xl shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
                >
                  {isCreating ? <Loader2 className="animate-spin w-6 h-6" /> : <><Plus size={20} className="stroke-[3]" /> Execute Deployment</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Local Toast System */}
      <AnimatePresence mode="wait">
        {toastMessage && (
          <motion.div
            key="group-toast"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-12 right-12 bg-slate-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl z-[100] border border-white/10 flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${toastMessage.includes('disabled') ? 'bg-amber-500' : 'bg-primary-600'}`}>
              {toastMessage.includes('disabled') ? <AlertTriangle size={20} /> : <Check size={20} />}
            </div>
            <p className="text-[12px] font-black uppercase tracking-widest">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

