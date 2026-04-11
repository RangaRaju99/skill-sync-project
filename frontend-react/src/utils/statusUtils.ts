/**
 * SaaS Standard Mentor Lifecycle States
 */
export type MentorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

/**
 * Valid transitions for Mentor Status
 */
export const MENTOR_TRANSITIONS: Record<MentorStatus, MentorStatus[]> = {
    PENDING: ['APPROVED', 'REJECTED'],
    APPROVED: ['SUSPENDED'],
    SUSPENDED: ['APPROVED'],
    REJECTED: ['PENDING', 'APPROVED'], // PENDING for re-review, APPROVED for direct override
};

/**
 * Checks if a status transition is allowed
 */
export const isValidTransition = (current: MentorStatus, target: MentorStatus): boolean => {
    return MENTOR_TRANSITIONS[current]?.includes(target) || false;
};

/**
 * Contextual Action Definitions
 */
export interface MentorAction {
    id: string;
    label: string;
    targetStatus: MentorStatus;
    variant: 'primary' | 'secondary' | 'danger' | 'success';
}

export const getAvailableActions = (status: MentorStatus): MentorAction[] => {
    switch (status) {
        case 'PENDING':
            return [
                { id: 'approve', label: 'Approve', targetStatus: 'APPROVED', variant: 'success' },
                { id: 'reject', label: 'Reject', targetStatus: 'REJECTED', variant: 'danger' },
            ];
        case 'APPROVED':
            return [
                { id: 'suspend', label: 'Suspend', targetStatus: 'SUSPENDED', variant: 'danger' },
            ];
        case 'SUSPENDED':
            return [
                { id: 'reactivate', label: 'Reactivate', targetStatus: 'APPROVED', variant: 'primary' },
            ];
        case 'REJECTED':
            return [
                { id: 'reapprove', label: 'Re-approve', targetStatus: 'APPROVED', variant: 'secondary' },
            ];
        default:
            return [];
    }
};
