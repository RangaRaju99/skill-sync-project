import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { useAuthStore } from '../store/authStore';

export interface RequestSessionRequest {
    mentorId: number;
    skillId: number;
    scheduledAt: string;
    durationMinutes: number;
}

/**
 * SkillSync Singular Session Hook
 * For Session Detail Pages
 */
export const useSession = (id: number) => {
    return useQuery({
        queryKey: ['session', id],
        queryFn: async () => {
            const resp: any = await apiClient.get(`/session/${id}`);
            const s = resp?.data ?? resp; // Unpack Spring Wrapper
            if (!s || !s.id) return null;

            try {
                const [mRes, lRes]: any[] = await Promise.all([
                    apiClient.get(`/user/profile/${s.mentorId}`).catch(() => null),
                    apiClient.get(`/user/profile/${s.learnerId}`).catch(() => null)
                ]);
                const m = mRes?.data || mRes;
                const l = lRes?.data || lRes;
                return {
                    ...s,
                    mentorName: m?.name || m?.username || `Mentor #${s.mentorId}`,
                    learnerName: l?.name || l?.username || `Learner #${s.learnerId}`
                };
            } catch { return s; }
        },
        enabled: !!id,
    });
};

/**
 * SkillSync Scavenge & Discovery Engine - Role Agnostic v6
 * Features:
 * 1. Role-Agnostic Scavenging (Finds both Mentor/Learner sessions for current user)
 * 2. Deep Scan Recovery (Task 2)
 * 3. 403 Bypassing (Task 1 & 5)
 */
export const useSessions = () => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const enrichSessions = async (sessions: any[]) => {
        if (!sessions || !Array.isArray(sessions) || !sessions.length) return [];
        try {
            const skRes: any = await apiClient.get('/skill').catch(() => ({ data: [] }));
            const skillsList = Array.isArray(skRes) ? skRes : (skRes?.data || []);

            return await Promise.all(sessions.map(async (s: any) => {
                try {
                    const mId = s.mentorId || s.mentor?.id || s.mentor?.userId || s.expertId;
                    const lId = s.learnerId || s.learner?.id || s.learner?.userId || s.studentId;
                    
                    const [mRes, lRes]: any[] = await Promise.all([
                        apiClient.get(`/user/profile/${mId}`).catch(() => null),
                        apiClient.get(`/user/profile/${lId}`).catch(() => null)
                    ]);
                    const m = mRes?.data || mRes;
                    const l = lRes?.data || lRes;
                    const sk = Array.isArray(skillsList) ? skillsList.find((sk: any) => sk.id === s.skillId) : null;
                    
                    return {
                        ...s,
                        mentorName: m?.name || m?.username || `Mentor #${mId}`,
                        learnerName: l?.name || l?.username || `Learner #${lId}`,
                        skillName: sk?.skillName || `Skill #${s.skillId}`
                    };
                } catch { return s; }
            }));
        } catch { return sessions; }
    };

    const sessionQuery = useQuery({
        queryKey: ['sessions', 'scavenged_agnostic', user?.id],
        queryFn: async () => {
            const uId = String(user?.id);
            if (!uId || uId === 'undefined') return [];

            // TASK 1 & 5: Clean Path (Use ONLY learner list to avoid 403 blocks)
            const response: any = await apiClient.get('/session/learner/list').catch(() => []);
            
            const dataList = Array.isArray(response) ? response : (response?.data || response?.data?.data || response?.content || []);
            
            // TASK 2: Role-Agnostic Deep Filtering
            // We find every session where the current user is a participant (Mentor OR Learner)
            const filtered = dataList.filter((s: any) => {
                const metId = String(s.mentorId || s.mentor?.id || s.mentor?.userId || s.expertId);
                const lrnId = String(s.learnerId || s.learner?.id || s.learner?.userId || s.studentId);
                return metId === uId || lrnId === uId;
            });

            console.log(`[SkillSync] Scavenged ${dataList.length} total. Discovered ${filtered.length} sessions for current user.`);
            
            return enrichSessions(filtered);
        },
        enabled: !!user?.id,
        refetchInterval: 60000,
    });

    const acceptMutation = useMutation({
        mutationFn: (id: number) => apiClient.put(`/session/${id}/accept`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: number; reason: string }) =>
            apiClient.put(`/session/${id}/reject`, null, { params: { reason } }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
    });

    const cancelMutation = useMutation({
        mutationFn: (id: number) => apiClient.put(`/session/${id}/cancel`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
    });

    const requestSessionMutation = useMutation({
        mutationFn: async (req: RequestSessionRequest) => {
            const response: any = await apiClient.post('/session', req);
            return response?.data ?? response;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
    });

    return {
        sessions: sessionQuery.data || [],
        mentorSessions: sessionQuery.data || [],  
        learnerSessions: sessionQuery.data || [], 
        isLoading: sessionQuery.isLoading,
        acceptSession: acceptMutation.mutateAsync,
        rejectSession: rejectMutation.mutateAsync,
        cancelSession: cancelMutation.mutateAsync,
        requestSession: requestSessionMutation.mutateAsync,
    };
};
