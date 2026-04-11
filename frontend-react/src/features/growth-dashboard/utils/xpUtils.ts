// ─── XP + Level System ───
// Purely frontend-driven, persisted in localStorage

const STORAGE_KEY = 'ss_xp_data';

export interface XPData {
  totalXP: number;
  level: number;
  levelTitle: string;
  xpHistory: { date: string; amount: number; reason: string }[];
}

export const XP_ACTIONS: Record<string, number> = {
  login: 10,
  profile_update: 25,
  add_skill: 15,
  complete_mission: 30,
  session_booked: 40,
  session_completed: 50,
  review_submitted: 20,
  streak_day: 5,
  badge_earned: 50,
};

export const LEVELS = [
  { level: 1, title: 'Newcomer', minXP: 0, icon: '🌱' },
  { level: 2, title: 'Explorer', minXP: 50, icon: '🧭' },
  { level: 3, title: 'Apprentice', minXP: 150, icon: '📚' },
  { level: 4, title: 'Rising Star', minXP: 350, icon: '⭐' },
  { level: 5, title: 'Consistent Pro', minXP: 600, icon: '🔥' },
  { level: 6, title: 'Skill Master', minXP: 1000, icon: '💎' },
  { level: 7, title: 'Elite Mentor', minXP: 1500, icon: '👑' },
  { level: 8, title: 'Legend', minXP: 2500, icon: '🏆' },
];

export const getDefaultXPData = (): XPData => ({
  totalXP: 0,
  level: 1,
  levelTitle: 'Newcomer',
  xpHistory: [],
});

export const loadXPData = (): XPData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultXPData();
    return JSON.parse(raw) as XPData;
  } catch {
    return getDefaultXPData();
  }
};

export const saveXPData = (data: XPData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

/** Calculate level from total XP */
export const calculateLevel = (totalXP: number): { level: number; title: string; icon: string } => {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (totalXP >= l.minXP) current = l;
  }
  return { level: current.level, title: current.title, icon: current.icon };
};

/** Get XP needed for next level */
export const getNextLevelXP = (totalXP: number): { current: number; next: number; progress: number } => {
  const currentLevel = calculateLevel(totalXP);
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);

  if (!nextLevel) {
    return { current: totalXP, next: totalXP, progress: 100 };
  }

  const currentLevelXP = LEVELS.find(l => l.level === currentLevel.level)?.minXP || 0;
  const levelRange = nextLevel.minXP - currentLevelXP;
  const progress = Math.min(100, Math.round(((totalXP - currentLevelXP) / levelRange) * 100));

  return { current: totalXP - currentLevelXP, next: levelRange, progress };
};

/** Get streak multiplier */
export const getStreakMultiplier = (streak: number): number => {
  if (streak >= 50) return 2.0;
  if (streak >= 25) return 1.5;
  if (streak >= 10) return 1.25;
  if (streak >= 5) return 1.1;
  return 1.0;
};

/** Award XP for an action */
export const awardXP = (data: XPData, action: string, streakDays: number = 0): { data: XPData; awarded: number; leveledUp: boolean } => {
  const baseXP = XP_ACTIONS[action] || 10;
  const multiplier = getStreakMultiplier(streakDays);
  const awarded = Math.round(baseXP * multiplier);

  const today = new Date().toISOString().split('T')[0];
  const oldLevel = calculateLevel(data.totalXP).level;

  const newData: XPData = {
    ...data,
    totalXP: data.totalXP + awarded,
    xpHistory: [...data.xpHistory, { date: today, amount: awarded, reason: action }].slice(-100),
    level: 0,
    levelTitle: '',
  };

  const newLevel = calculateLevel(newData.totalXP);
  newData.level = newLevel.level;
  newData.levelTitle = newLevel.title;

  saveXPData(newData);
  return { data: newData, awarded, leveledUp: newLevel.level > oldLevel };
};
