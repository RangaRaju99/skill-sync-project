import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageLayout from '../../components/layout/PageLayout';
import api from '../../services/axios';
import { useToast } from '../../components/ui/Toast';
import { useActionConfirm } from '../../components/ui/ActionConfirm';
import { Button } from '../../components/ui/Button';
import { GlassCard } from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/Input';
import { Search, Users, ShieldAlert, User, ShieldCheck } from 'lucide-react';

const PAGE_SIZE = 20;

const UsersCenterPage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { requestConfirmation } = useActionConfirm();

  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isDebouncing, setIsDebouncing] = useState(false);
  const debounceTimerRef = useRef<number | null>(null);
  const firstDebounceRunRef = useRef(true);

  const applySearchValue = (value: string) => {
    setSearchText(value.trim());
    setPage(0);
  };

  const { data: usersData, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'users', page, roleFilter, searchText],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('size', String(PAGE_SIZE));
      if (roleFilter) params.append('role', roleFilter);
      if (searchText) params.append('search', searchText);
      const { data } = await api.get(`/api/admin/users?${params.toString()}`, { signal });
      return data;
    },
  });

  useEffect(() => {
    if (firstDebounceRunRef.current) {
      firstDebounceRunRef.current = false;
      return;
    }

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    setIsDebouncing(true);
    debounceTimerRef.current = window.setTimeout(() => {
      applySearchValue(searchInput);
      setIsDebouncing(false);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchInput]);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/users/${id}`);
    },
    onSuccess: () => {
      showToast({ message: 'User deleted successfully', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: () => showToast({ message: 'Failed to delete user', type: 'error' }),
  });

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      await api.put(`/api/admin/users/${id}/role`, { role });
    },
    onSuccess: () => {
      showToast({ message: 'User role updated', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: () => showToast({ message: 'Failed to update role', type: 'error' }),
  });

  const users = [...(usersData?.content || [])].sort((a: any, b: any) => {
    const aId = Number(a?.id || 0);
    const bId = Number(b?.id || 0);
    return aId - bId;
  });
  const totalElements = Number(usersData?.totalElements || users.length || 0);
  const totalPages = Math.max(1, Number(usersData?.totalPages || 1));
  const currentPage = Number(usersData?.number ?? page);

  const handleSearch = () => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setIsDebouncing(false);
    applySearchValue(searchInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const isSearching = isDebouncing || isFetching;

  const handleDeleteUser = async (id: number, email: string) => {
    const confirmed = await requestConfirmation({
      title: 'Delete User?',
      message: `Are you sure you want to delete user ${email}? This action cannot be undone.`,
      confirmLabel: 'Yes, delete user',
    });

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(id);
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'bg-danger/10 text-danger border-danger/20';
      case 'ROLE_MENTOR':
        return 'bg-accent-violet/10 text-accent-violet border-accent-violet/20';
      default:
        return 'bg-brand/10 text-brand border-brand/20';
    }
  };

  const getRoleLabel = (role: string) => {
    return role?.replace('ROLE_', '') || 'LEARNER';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return <ShieldAlert className="w-3 h-3 mr-1" />;
      case 'ROLE_MENTOR':
        return <ShieldCheck className="w-3 h-3 mr-1" />;
      default:
        return <User className="w-3 h-3 mr-1" />;
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <GlassCard className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-text-main tracking-tight flex items-center">
              <Users className="w-8 h-8 mr-3 text-brand" />
              Manage Users
            </h1>
            <p className="text-text-muted mt-2">View, filter, search, and manage all platform users securely.</p>
          </div>
        </GlassCard>

        {/* Controls */}
        <GlassCard className="flex flex-col md:flex-row items-end gap-4 p-5">
          {/* Left: Role filter */}
          <div className="w-full md:w-48">
            <label className="mb-1.5 text-sm font-medium text-text-main block">Role Filter</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(0);
              }}
              className="w-full h-[42px] bg-surface px-4 rounded-xl text-sm font-semibold text-text-main outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand border border-border transition-colors cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="ROLE_LEARNER">Learner</option>
              <option value="ROLE_MENTOR">Mentor</option>
              <option value="ROLE_ADMIN">Admin</option>
            </select>
          </div>

          {/* Right: Search */}
          <div className="flex-1 w-full flex flex-col md:flex-row gap-4 md:items-end">
            <div className="flex-1">
              <Input
                label="Search by Email"
                placeholder="Type email to search..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <Button
              onClick={handleSearch}
              isLoading={isSearching}
              className="w-full md:w-auto mt-auto"
            >
              Search
            </Button>
          </div>
        </GlassCard>

        {/* Table */}
        <GlassCard className="p-0 overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-text-muted">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mb-4"></div>
              <p className="font-medium">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-text-muted">
              <Search className="w-12 h-12 text-border mb-4" />
              <p className="font-medium text-lg">No users found</p>
              <p className="text-sm">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface/50 border-b border-border">
                  <tr>
                    <th className="py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider">ID</th>
                    <th className="py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider">Email</th>
                    <th className="py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider">Name</th>
                    <th className="py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider">Role</th>
                    <th className="py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="py-4 px-6 text-sm font-bold text-text-main">#{user.id}</td>
                      <td className="py-4 px-6 text-sm font-semibold text-text-main">{user.email}</td>
                      <td className="py-4 px-6 text-sm text-text-muted">{user.firstName} {user.lastName}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getRoleBadgeStyle(user.role)}`}>
                          {getRoleIcon(user.role)}
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex gap-2 justify-end">
                          {user.role === 'ROLE_LEARNER' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => roleMutation.mutate({ id: user.id, role: 'ROLE_MENTOR' })}
                              disabled={roleMutation.isPending}
                              className="text-accent-violet hover:text-accent-violet hover:bg-accent-violet/10"
                            >
                              Promote
                            </Button>
                          )}
                          {user.role === 'ROLE_MENTOR' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => roleMutation.mutate({ id: user.id, role: 'ROLE_LEARNER' })}
                              disabled={roleMutation.isPending}
                              className="text-warning hover:text-warning hover:bg-warning/10"
                            >
                              Demote
                            </Button>
                          )}
                          {user.role !== 'ROLE_ADMIN' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => void handleDeleteUser(user.id, user.email)}
                              disabled={deleteMutation.isPending}
                              className="text-danger hover:text-danger hover:bg-danger/10"
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!isLoading && users.length > 0 && (
            <div className="px-6 py-4 border-t border-border bg-surface/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs font-semibold text-text-muted">
                Showing {users.length} of {totalElements} user{totalElements !== 1 ? 's' : ''}
                {roleFilter && ` • Role: ${getRoleLabel(roleFilter)}`}
                {searchText && ` • Search: "${searchText}"`}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage <= 0}
                >
                  Previous
                </Button>
                <p className="text-xs font-semibold text-text-muted">
                  Page {currentPage + 1} of {totalPages}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </PageLayout>
  );
};

export default UsersCenterPage;
