import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { normalizeUser } from '../utils/userUtils';

/**
 * Enterprise Admin Hook
 * Handles unified state for the SaaS Dashboard
 */
export const useAdmin = () => {
    const queryClient = useQueryClient();

    // 1. Unified Stats (KPI Cards)
    const statsQuery = useQuery({
        queryKey: ['admin', 'stats'],
        queryFn: async () => apiClient.get('/user/admin/stats'),
        refetchInterval: 30000, 
    });

    // 2. Global Node Search
    const useGlobalSearch = (query: string) => useQuery({
        queryKey: ['admin', 'search', query],
        queryFn: async () => apiClient.get(`/user/admin/search?query=${query}`),
        enabled: query.length > 2,
    });

    // 3. Activity & Audit Feed
    const activityQuery = useQuery({
        queryKey: ['admin', 'activity'],
        queryFn: async () => {
            try {
                const response = await apiClient.get('/user/admin/audit-logs');
                const localLogs = JSON.parse(localStorage.getItem('mock_audit_logs') || '[]');
                const apiLogs = response.data || response || [];
                return [...localLogs, ...(Array.isArray(apiLogs) ? apiLogs : [])];
            } catch {
                return JSON.parse(localStorage.getItem('mock_audit_logs') || '[]');
            }
        },
        refetchInterval: 15000,
    });

    // 4. Live Notifications
    const notificationQuery = useQuery({
        queryKey: ['admin', 'notifications'],
        queryFn: async () => apiClient.get('/user/admin/notifications'),
        refetchInterval: 10000,
    });

    // 4.1 Pending Mentors Count (Cross-service KPI)
    const pendingMentorsQuery = useQuery({
        queryKey: ['admin', 'mentors', 'pending-count'],
        queryFn: async () => {
            const res = await apiClient.get('/mentor/pending/count');
            return res.data ?? res ?? 0;
        },
        refetchInterval: 30000,
    });

    // 5. User Management — fetches ALL registered users via admin endpoint
    const usersQuery = useQuery({
        queryKey: ['admin', 'users'],
        queryFn: async () => {
            const response = await apiClient.get('/user/admin/users');
            const rawUsers = response.data || response || [];
            return Array.isArray(rawUsers) ? rawUsers.map(normalizeUser) : [];
        },
    });

    // MUTATIONS
    const changeRoleMutation = useMutation({
        mutationFn: (data: { userId: number; role: string; reason: string }) => 
            apiClient.put(`/user/admin/role?userId=${data.userId}&newRole=${data.role}&reason=${data.reason}`, {}),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
    });

    const updateStatusMutation = useMutation({
        mutationFn: (data: { userId: number; status: string; reason: string }) => 
            apiClient.put(`/user/admin/status?userId=${data.userId}&newStatus=${data.status}&reason=${data.reason}`, {}),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
    });

    const markAsReadMutation = useMutation({
        mutationFn: (id: number) => apiClient.put(`/user/admin/notifications/${id}/read`, {}),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] }),
    });

    const createAuditLogMutation = useMutation({
        mutationFn: (logData: { action: string; target: string; admin: string; description: string }) => {
            const storedLogs = JSON.parse(localStorage.getItem('mock_audit_logs') || '[]');
            const newLog = {
                id: Date.now(),
                ...logData,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('mock_audit_logs', JSON.stringify([newLog, ...storedLogs]));
            return Promise.resolve(newLog);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'activity'] }),
    });

    // Analytics
    const useAnalyticsGrowth = (timeRange: string, userType: string) => useQuery({ 
      queryKey: ['admin', 'analytics', 'users-growth', timeRange, userType], 
      queryFn: async () => apiClient.get(`/user/admin/analytics/users-growth?timeRange=${timeRange}&userType=${userType}`) 
    });
    
    const useAnalyticsStatus = () => useQuery({ 
      queryKey: ['admin', 'analytics', 'user-status'], 
      queryFn: async () => apiClient.get('/user/admin/analytics/user-status') 
    });
    
    const useAnalyticsRoles = () => useQuery({ 
      queryKey: ['admin', 'analytics', 'roles'], 
      queryFn: async () => apiClient.get('/user/admin/analytics/roles') 
    });

    // Detailed User Info
    const useUserDetailed = (userId: number | null) => useQuery({
        queryKey: ['admin', 'user-detailed', userId],
        queryFn: async () => {
            const res = await apiClient.get(`/user/admin/users/${userId}/detailed`);
            const normalized = normalizeUser(res.data || res);
            return normalized;
        },
        enabled: !!userId,
    });

    const useUserLogs = (userId: number | null) => useQuery({
        queryKey: ['admin', 'user-logs', userId],
        queryFn: async () => {
            const res = await apiClient.get(`/user/admin/users/${userId}/logs`);
            return res.data || res;
        },
        enabled: !!userId,
    });

    return {
        systemStats: {
           ...(statsQuery.data?.data || statsQuery.data || {}),
           pendingMentors: pendingMentorsQuery.data || 0
        },
        pendingMentors: pendingMentorsQuery.data || 0,
        registeredUsers: usersQuery.data || [],
        auditLogs: activityQuery.data || [],
        
        isStatsLoading: statsQuery.isLoading,
        activity: activityQuery.data || [],
        isActivityLoading: activityQuery.isLoading,
        notifications: notificationQuery.data || [],
        users: (usersQuery.data || []) as any[],
        isUsersLoading: usersQuery.isLoading,
        isUsersError: usersQuery.isError,
        refetchUsers: usersQuery.refetch,
        
        useAnalyticsGrowth,
        useAnalyticsStatus,
        useAnalyticsRoles,
        useUserDetailed,
        useUserLogs,

        changeRole: changeRoleMutation.mutateAsync,
        updateStatus: updateStatusMutation.mutateAsync,
        markAsRead: markAsReadMutation.mutateAsync,
        createAuditLog: createAuditLogMutation.mutateAsync,
        useGlobalSearch,
        
        hasError: statsQuery.isError || usersQuery.isError,
        refetchAll: () => {
            statsQuery.refetch();
            usersQuery.refetch();
            activityQuery.refetch();
        }
    };
};
