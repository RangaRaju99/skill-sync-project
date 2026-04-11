import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export interface MentorProfile {
    id: number;
    userId: number;
    name: string;
    email: string;
    roles: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    isApproved: boolean;
    approvedBy?: number;
    approvalDate?: string;
    specialization: string;
    yearsOfExperience: number;
    bio: string;
    hourlyRate: number;
    rating: number;
    totalStudents: number;
    availabilityStatus: 'AVAILABLE' | 'BUSY' | 'AWAY';
    riskScore: number;
    reportCount: number;
    lastActive?: string;
    identityVerified: boolean;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    avatar?: string;
}

/**
 * Public Mentor Hook
 */
export const useMentors = (filters: any = {}) => {
    return useQuery({
        queryKey: ['mentors', 'public', filters],
        queryFn: async () => {
            const response = await apiClient.get('/mentor/approved');
            return response.data || response || [];
        }
    });
};

/**
 * Single Mentor Hook
 */
export const useMentor = (mentorId: number) => {
    return useQuery({
        queryKey: ['mentors', 'single', mentorId],
        queryFn: async () => {
            const response = await apiClient.get(`/mentor/${mentorId}`);
            return response.data || response;
        },
        enabled: !!mentorId
    });
};

/**
 * Admin Mentor Management Hook
 * Supports real-time refresh and advanced SaaS behaviors
 */
export const useAdminMentors = (refreshInterval: number = 0, filters: any = {}) => {
    const queryClient = useQueryClient();

    // Data-sync invalidation helper
    const invalidateMentorState = () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'mentors'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'activity'] });
    };

    const mentorsQuery = useQuery({
        queryKey: ['admin', 'mentors', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
            if (filters.skill) params.append('skill', filters.skill);
            if (filters.experience && filters.experience !== 'ALL') {
                params.append('experience', filters.experience.replace('+', ''));
            }

            const response = await apiClient.get(`/mentor/admin?${params.toString()}`);
            return response.data || response || [];
        },
        refetchInterval: refreshInterval > 0 ? refreshInterval : false
    });

    const pendingCountQuery = useQuery({
        queryKey: ['admin', 'mentors', 'pending-total'],
        queryFn: async () => {
            const response = await apiClient.get('/mentor/pending/count');
            return response.data ?? response ?? 0;
        },
        refetchInterval: 30000 
    });

    const approveMutation = useMutation({
        mutationFn: (mentorId: number) => apiClient.put(`/mentor/${mentorId}/approve`, {}),
        onSuccess: invalidateMentorState
    });

    const rejectMutation = useMutation({
        mutationFn: (data: { mentorId: number; reason: string }) => 
            apiClient.put(`/mentor/${data.mentorId}/reject?reason=${data.reason}`, {}),
        onSuccess: invalidateMentorState
    });

    const suspendMutation = useMutation({
        mutationFn: (data: { mentorId: number; reason: string }) => 
            apiClient.put(`/mentor/${data.mentorId}/suspend?reason=${data.reason}`, {}),
        onSuccess: invalidateMentorState
    });

    const reReviewMutation = useMutation({
        mutationFn: (mentorId: number) => apiClient.put(`/mentor/${mentorId}/re-review`, {}),
        onSuccess: invalidateMentorState
    });

    const bulkActionMutation = useMutation({
        mutationFn: (data: { ids: number[], action: 'APPROVE' | 'SUSPEND' | 'REJECT' }) => 
            apiClient.post('/mentor/admin/bulk', data),
        onSuccess: invalidateMentorState
    });

    const exportMentors = async () => {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
        if (filters.skill) params.append('skill', filters.skill);
        if (filters.experience && filters.experience !== 'ALL') {
            params.append('experience', filters.experience.replace('+', ''));
        }

        const response = await apiClient.get(`/mentor/admin/export?${params.toString()}`, {
            responseType: 'blob'
        });
        
        const blob = response instanceof Blob ? response : new Blob([response as any], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `mentors_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    const mentors = useMemo(() => (mentorsQuery.data || []) as MentorProfile[], [mentorsQuery.data]);
    const filteredMentors = mentors; // Backend-driven, so they are the same
    
    return {
        mentors,
        filteredMentors,
        isLoading: mentorsQuery.isLoading,
        isError: mentorsQuery.isError,
        error: mentorsQuery.error,
        refetch: mentorsQuery.refetch,
        lastUpdated: mentorsQuery.dataUpdatedAt,
        pendingCount: pendingCountQuery.data || 0,
        
        // Actions
        approve: approveMutation.mutateAsync,
        reject: rejectMutation.mutateAsync,
        suspend: suspendMutation.mutateAsync,
        reReview: reReviewMutation.mutateAsync,
        bulkAction: bulkActionMutation.mutateAsync,
        exportMentors,
        
        // Mutation States
        isApproving: approveMutation.isPending,
        isRejecting: rejectMutation.isPending,
        isSuspending: suspendMutation.isPending,
        isBulkProcessing: bulkActionMutation.isPending
    };
};

/**
 * Apply as Mentor Mutation
 */
export const useApplyMentor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => apiClient.post('/mentor/apply', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mentors', 'me'] });
        }
    });
};

/**
 * Personal Mentor Profile Hook
 */
export const useMyMentorProfile = () => {
    return useQuery({
        queryKey: ['mentors', 'me'],
        queryFn: async () => {
            try {
                const response = await apiClient.get('/mentor/profile/me');
                return response.data || response;
            } catch (err) {
                return null;
            }
        },
        retry: false
    });
};
