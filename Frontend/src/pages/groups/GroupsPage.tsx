import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
      showToast({ message: 'Joined group successfully', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: () => {
      showToast({ message: 'Failed to join group', type: 'error' });
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: (groupId: number) => groupService.leaveGroup(groupId),
    onSuccess: () => {
      showToast({ message: 'Left group successfully', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: () => {
      showToast({ message: 'Failed to leave group', type: 'error' });
    },
  });

  const handleLeaveGroup = async (groupId: number, groupName: string) => {
    const confirmed = await requestConfirmation({
      title: 'Leave Group?',
      message: `Are you sure you want to leave "${groupName}"?`,
      confirmLabel: 'Yes, leave group',
    });

    if (!confirmed) {
      return;
    }

    leaveGroupMutation.mutate(groupId);
  };

  return (
    <PageLayout>
      <div className="space-y-8 animate-in">
        <div className="surface-card p-8 border-primary/10">
          <h1 className="text-4xl font-bold text-on-surface tracking-tight">Learning Groups</h1>
          <p className="text-on-surface-variant mt-3 font-medium leading-relaxed max-w-2xl opacity-80">
            Explore communities, join discussions, and collaborate with peers in real-time. System operational.
          </p>
        </div>

        <div className="bg-surface-container-low p-1.5 inline-flex gap-1 rounded-2xl border border-outline/10 shadow-inner">
          {['explore', 'mygroups'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab as typeof activeTab);
                setPage(0);
              }}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 capitalize ${activeTab === tab
                  ? 'bg-primary text-white shadow-lg shadow-primary/10 scale-[1.02]'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/[0.03]'
                }`}
            >
              {tab === 'explore' ? 'Explore Groups' : 'Joined Groups'}
            </button>
          ))}
        </div>

        {activeTab === 'explore' && (
          <div className="space-y-6">
            <div className="surface-card p-5 flex flex-col lg:flex-row items-stretch gap-4 border-outline/5">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40">search</span>
                <input
                  type="text"
                  placeholder="Search network groups..."
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(0);
                  }}
                  className="w-full h-12 bg-surface-container-low pl-12 pr-4 rounded-xl text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 border border-outline/30 focus:border-primary transition-all placeholder:text-on-surface-variant/30"
                />
              </div>
              {role === 'ROLE_ADMIN' && (
                <button
                  onClick={() => navigate('/admin/groups')}
                  className="btn-primary h-12 px-8"
                >
                  Manage Network
                </button>
              )}
            </div>

            {exploreLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-56 surface-card animate-pulse" />
                ))}
              </div>
            ) : exploreData?.content && exploreData.content.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {exploreData.content.map((group: any) => {
                  const isJoining = joinGroupMutation.isPending && joinGroupMutation.variables === group.id;

                  return (
                    <div
                      key={group.id}
                      className="surface-card p-8 flex flex-col hover:-translate-y-1 group"
                    >
                      <h3 className="font-bold text-on-surface mb-3 text-xl tracking-tight group-hover:text-primary transition-colors">{group.name}</h3>
                      <p className="text-sm text-on-surface-variant mb-8 line-clamp-2 leading-relaxed font-medium opacity-80">{group.description}</p>
                      
                      <div className="flex items-center justify-between mb-8">
                        <span className="text-[10px] bg-primary/10 text-primary px-3 py-1.5 rounded-xl font-black uppercase tracking-widest border border-primary/20">
                          {group.category}
                        </span>
                        <div className="flex items-center gap-2 text-on-surface-variant/60">
                          <span className="material-symbols-outlined text-[18px]">groups</span>
                          <span className="text-[11px] font-black uppercase tracking-widest">
                            {group.memberCount} Members
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto">
                        {group.isJoined || role === 'ROLE_ADMIN' ? (
                          <button
                            onClick={() => navigate(`/groups/${group.id}`)}
                            className="btn-primary w-full py-3 h-auto shadow-primary/10"
                          >
                            {role === 'ROLE_ADMIN' ? 'Manage Connection' : 'Access Portal'}
                          </button>
                        ) : (
                          <button
                            onClick={() => joinGroupMutation.mutate(group.id)}
                            disabled={isJoining}
                            className="w-full py-3 h-auto bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl font-bold transition-all disabled:opacity-50 border border-outline/20 hover:border-primary/20"
                          >
                            {isJoining ? 'Initializing...' : 'Join Connection'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="surface-card p-20 text-center flex flex-col items-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/10 mb-6">explore_off</span>
                <p className="text-on-surface font-bold text-xl">No connections found</p>
                <p className="text-on-surface-variant font-medium mt-2">The search parameters yielded zero network protocols.</p>
              </div>
            )}

            {exploreData && exploreData.totalElements > 10 && (
              <div className="flex justify-center items-center gap-4 pt-6">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="w-10 h-10 surface-card flex items-center justify-center text-on-surface disabled:opacity-30"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="text-sm font-bold text-on-surface-variant">
                  {page + 1} / {Math.ceil(exploreData.totalElements / 10)}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(exploreData.totalElements / 10) - 1}
                  className="w-10 h-10 surface-card flex items-center justify-center text-on-surface disabled:opacity-30"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'mygroups' && (
          <div className="space-y-6">
            {myGroupsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-44 surface-card animate-pulse" />
                ))}
              </div>
            ) : myGroupsData?.content && myGroupsData.content.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myGroupsData.content.map((group: any) => (
                  <div
                    key={group.id}
                    className="surface-card p-6 flex flex-col"
                  >
                    <h3 className="font-bold text-on-surface mb-2 text-lg tracking-tight">{group.name}</h3>
                    <p className="text-sm text-on-surface-variant mb-6 line-clamp-2 leading-relaxed">{group.description}</p>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider border border-emerald-500/10">
                        {group.category}
                      </span>
                      <span className="text-xs text-on-surface-variant font-bold">{group.memberCount} members</span>
                    </div>
                    <div className="mt-auto flex gap-3">
                      <button
                        onClick={() => navigate(`/groups/${group.id}`)}
                        className="btn-primary flex-1 h-11"
                      >
                        View
                      </button>
                      <button
                        onClick={() => void handleLeaveGroup(group.id, group.name)}
                        disabled={leaveGroupMutation.isPending}
                        className="px-4 h-11 bg-error/10 text-error rounded-xl font-bold hover:bg-error hover:text-white transition-all disabled:opacity-50"
                      >
                        Leave
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="surface-card p-16 text-center">
                <p className="text-on-surface-variant font-bold text-lg">You have not joined any groups yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default GroupsPage;
