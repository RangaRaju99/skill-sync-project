/**
 * SaaS User Utilities
 * Handles robust role parsing, normalization, and derived field logic.
 */

export interface NormalizedUser {
    userId: number;
    name: string;
    email: string;
    rolesRaw: string;
    roles: string[];
    isLearner: boolean;
    isMentor: boolean;
    isAdmin: boolean;
    status: string;
    createdAt: string;
    mentorStatus?: string;
    [key: string]: any;
}

/**
 * Parses a comma-separated roles string into a normalized array.
 */
export const parseRoles = (rolesString: string = ''): string[] => {
    if (!rolesString) return ['LEARNER']; // Default role
    return Array.from(new Set(
        rolesString.split(',')
            .map(r => r.trim().toUpperCase())
            .filter(r => r.length > 0)
    ));
};

/**
 * Checks if a user has a specific role.
 */
export const hasRole = (roles: string[] | string, targetRole: string): boolean => {
    const rolesArray = typeof roles === 'string' ? parseRoles(roles) : roles;
    const search = targetRole.toUpperCase();
    return rolesArray.includes(search) || rolesArray.includes(`ROLE_${search}`);
};

/**
 * Normalizes a raw API user object into a robust SaaS model.
 */
export const normalizeUser = (user: any): NormalizedUser => {
    const roles = parseRoles(user.roles || user.role || '');
    
    return {
        ...user,
        rolesRaw: user.roles || user.role || '',
        roles: roles,
        isLearner: roles.includes('LEARNER') || roles.length === 0,
        isMentor: roles.includes('MENTOR'),
        isAdmin: roles.includes('ADMIN'),
        // Ensure status mapping
        status: user.status || 'ACTIVE'
    };
};

/**
 * Resolves a display name using SaaS fallback hierarchy:
 * 1. Full Name
 * 2. Username
 * 3. Email
 * 4. "Unknown User"
 */
export const getUserDisplayName = (user: any): string => {
    if (!user) return 'Unknown User';
    return user.name || user.username || user.email || (user.id || user.userId ? `User #${user.id || user.userId}` : 'Unknown User');
};

/**
 * Formats risk levels based on a numerical score.
 */
export const formatRiskLevel = (score: number = 0): { label: 'Safe' | 'Warning' | 'High Risk', color: string } => {
    if (score < 30) return { label: 'Safe', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
    if (score < 70) return { label: 'Warning', color: 'text-amber-600 bg-amber-50 border-amber-100' };
    return { label: 'High Risk', color: 'text-rose-600 bg-rose-50 border-rose-100' };
};
