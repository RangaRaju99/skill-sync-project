// ─── Badges System ───
const STORAGE_KEY = 'ss_badges_data';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'early' | 'mid' | 'advanced' | 'legendary';
  requirement: string;
  checkFn: (ctx: BadgeContext) => number; // returns progress 0-100
  xpReward: number;
}

export interface BadgeState {
  id: string;
  unlocked: boolean;
  unlockedAt: string | null;
  progress: number;
}

export interface BadgeContext {
  streak: number;
  bestStreak: number;
  totalXP: number;
  level: number;
  totalActiveDays: number;
  profileCompletion: number;
  skillCount: number;
  sessionCount: number;
  missionsCompleted: number;
}

export const BADGES: Badge[] = [
  {
    id: 'first_login', name: 'First Steps', description: 'Log in for the first time',
    icon: '👋', category: 'early', requirement: 'Log in once', xpReward: 10,
    checkFn: (ctx) => ctx.totalActiveDays >= 1 ? 100 : 0,
  },
  {
    id: 'profile_complete', name: 'Identity Forged', description: 'Complete your profile 100%',
    icon: '🪪', category: 'early', requirement: 'Fill all profile fields', xpReward: 30,
    checkFn: (ctx) => ctx.profileCompletion,
  },
  {
    id: 'skill_collector', name: 'Skill Collector', description: 'Add 3 or more skills',
    icon: '🧩', category: 'early', requirement: 'Add at least 3 skills', xpReward: 20,
    checkFn: (ctx) => Math.min(100, Math.round((ctx.skillCount / 3) * 100)),
  },
  {
    id: 'streak_3', name: 'Getting Warm', description: 'Maintain a 3-day streak',
    icon: '🔥', category: 'early', requirement: '3-day activity streak', xpReward: 25,
    checkFn: (ctx) => Math.min(100, Math.round((ctx.bestStreak / 3) * 100)),
  },
  {
    id: 'streak_7', name: 'On Fire', description: 'Maintain a 7-day streak',
    icon: '🌟', category: 'mid', requirement: '7-day activity streak', xpReward: 50,
    checkFn: (ctx) => Math.min(100, Math.round((ctx.bestStreak / 7) * 100)),
  },
  {
    id: 'xp_500', name: 'Half K Club', description: 'Earn 500 total XP',
    icon: '⚡', category: 'mid', requirement: 'Accumulate 500 XP', xpReward: 40,
    checkFn: (ctx) => Math.min(100, Math.round((ctx.totalXP / 500) * 100)),
  },
  {
    id: 'level_5', name: 'Consistent Pro', description: 'Reach Level 5',
    icon: '💪', category: 'mid', requirement: 'Level up to 5', xpReward: 60,
    checkFn: (ctx) => Math.min(100, Math.round((ctx.level / 5) * 100)),
  },
  {
    id: 'streak_14', name: 'Two-Week Warrior', description: 'Maintain a 14-day streak',
    icon: '⚔️', category: 'mid', requirement: '14-day activity streak', xpReward: 75,
    checkFn: (ctx) => Math.min(100, Math.round((ctx.bestStreak / 14) * 100)),
  },
  {
    id: 'streak_30', name: 'Monthly Machine', description: '30-day streak — unstoppable',
    icon: '🤖', category: 'advanced', requirement: '30-day activity streak', xpReward: 100,
    checkFn: (ctx) => Math.min(100, Math.round((ctx.bestStreak / 30) * 100)),
  },
  {
    id: 'xp_1500', name: 'XP Overlord', description: 'Earn 1500 total XP',
    icon: '👑', category: 'advanced', requirement: 'Accumulate 1500 XP', xpReward: 80,
    checkFn: (ctx) => Math.min(100, Math.round((ctx.totalXP / 1500) * 100)),
  },
  {
    id: 'active_30', name: 'Dedication', description: 'Be active for 30 total days',
    icon: '📅', category: 'advanced', requirement: '30 total active days', xpReward: 90,
    checkFn: (ctx) => Math.min(100, Math.round((ctx.totalActiveDays / 30) * 100)),
  },
  {
    id: 'streak_60', name: 'Legendary Streak', description: '60-day streak — legendary status',
    icon: '🏆', category: 'legendary', requirement: '60-day activity streak', xpReward: 200,
    checkFn: (ctx) => Math.min(100, Math.round((ctx.bestStreak / 60) * 100)),
  },
  {
    id: 'xp_2500', name: 'Transcendent', description: 'Reach 2500 XP — the final frontier',
    icon: '🌌', category: 'legendary', requirement: 'Accumulate 2500 XP', xpReward: 150,
    checkFn: (ctx) => Math.min(100, Math.round((ctx.totalXP / 2500) * 100)),
  },
];

export const loadBadgeStates = (): BadgeState[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return BADGES.map(b => ({ id: b.id, unlocked: false, unlockedAt: null, progress: 0 }));
    return JSON.parse(raw);
  } catch {
    return BADGES.map(b => ({ id: b.id, unlocked: false, unlockedAt: null, progress: 0 }));
  }
};

export const saveBadgeStates = (states: BadgeState[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
};

/** Evaluate all badges, return newly unlocked ones */
export const evaluateBadges = (ctx: BadgeContext, currentStates: BadgeState[]): { states: BadgeState[]; newlyUnlocked: Badge[] } => {
  const newlyUnlocked: Badge[] = [];
  const today = new Date().toISOString().split('T')[0];

  const updated = BADGES.map(badge => {
    const existing = currentStates.find(s => s.id === badge.id);
    if (existing?.unlocked) return existing;

    const progress = badge.checkFn(ctx);
    if (progress >= 100 && !existing?.unlocked) {
      newlyUnlocked.push(badge);
      return { id: badge.id, unlocked: true, unlockedAt: today, progress: 100 };
    }
    return { id: badge.id, unlocked: false, unlockedAt: null, progress };
  });

  saveBadgeStates(updated);
  return { states: updated, newlyUnlocked };
};

export const getCategoryColor = (cat: Badge['category']): string => {
  switch (cat) {
    case 'early': return 'from-emerald-500 to-teal-600';
    case 'mid': return 'from-blue-500 to-indigo-600';
    case 'advanced': return 'from-purple-500 to-fuchsia-600';
    case 'legendary': return 'from-amber-500 to-orange-600';
  }
};
