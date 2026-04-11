// ─── Streak Utility System ───
// All streak data persists in localStorage (no backend modification)

const STORAGE_KEY = 'ss_streak_data';

export interface DayActivity {
  date: string; // YYYY-MM-DD
  actions: string[];
  count: number;
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  totalActiveDays: number;
  lastActiveDate: string | null;
  activityGrid: DayActivity[];
}

const getToday = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getYesterday = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getDefaultStreakData = (): StreakData => ({
  currentStreak: 0,
  bestStreak: 0,
  totalActiveDays: 0,
  lastActiveDate: null,
  activityGrid: [],
});

export const loadStreakData = (): StreakData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultStreakData();
    const data = JSON.parse(raw) as StreakData;
    return recalculateStreak(data);
  } catch {
    return getDefaultStreakData();
  }
};

export const saveStreakData = (data: StreakData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

/** Recalculate streak considering if user missed a day */
const recalculateStreak = (data: StreakData): StreakData => {
  const today = getToday();
  const yesterday = getYesterday();

  if (data.lastActiveDate && data.lastActiveDate !== today && data.lastActiveDate !== yesterday) {
    // Streak is broken
    return { ...data, currentStreak: 0 };
  }
  return data;
};

/** Record a user action for today */
export const recordAction = (data: StreakData, action: string): StreakData => {
  const today = getToday();
  const yesterday = getYesterday();
  const grid = [...data.activityGrid];

  const todayIdx = grid.findIndex(d => d.date === today);

  if (todayIdx >= 0) {
    // Already active today — just add the action
    if (!grid[todayIdx].actions.includes(action)) {
      grid[todayIdx] = {
        ...grid[todayIdx],
        actions: [...grid[todayIdx].actions, action],
        count: grid[todayIdx].count + 1,
      };
    }

    const updated: StreakData = { ...data, activityGrid: grid };
    saveStreakData(updated);
    return updated;
  }

  // First activity today
  grid.push({ date: today, actions: [action], count: 1 });

  let newStreak = data.currentStreak;
  if (data.lastActiveDate === yesterday || data.lastActiveDate === null) {
    newStreak = data.currentStreak + 1;
  } else if (data.lastActiveDate !== today) {
    newStreak = 1; // streak broken, start fresh
  }

  const updated: StreakData = {
    currentStreak: newStreak,
    bestStreak: Math.max(data.bestStreak, newStreak),
    totalActiveDays: data.totalActiveDays + 1,
    lastActiveDate: today,
    activityGrid: grid.slice(-365), // keep last year
  };

  saveStreakData(updated);
  return updated;
};

/** Get intensity level (0-4) for streak grid cell */
export const getIntensityLevel = (count: number): number => {
  if (count === 0) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
};

/** Generate last N weeks of grid data for display */
export const generateGridData = (data: StreakData, weeks: number = 20): DayActivity[] => {
  const result: DayActivity[] = [];
  const today = new Date();

  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const existing = data.activityGrid.find(a => a.date === dateStr);
    result.push(existing || { date: dateStr, actions: [], count: 0 });
  }
  return result;
};

/** Check if streak is at risk (user hasn't been active today) */
export const isStreakAtRisk = (data: StreakData): boolean => {
  if (data.currentStreak === 0) return false;
  const today = getToday();
  return data.lastActiveDate !== today && data.currentStreak > 0;
};

/** Get hours left in the day */
export const getHoursLeft = (): number => {
  const now = new Date();
  return 23 - now.getHours();
};
