
import { loadStreakData } from '@/features/growth-dashboard/utils/streakUtils';
import { loadXPData } from '@/features/growth-dashboard/utils/xpUtils';
import { loadBadgeStates } from '@/features/growth-dashboard/utils/badgeUtils';

export interface WeeklyGoal {
  target: number;
  current: number;
  label: string;
}

export interface ActivitySummary {
  activeDays: number;
  badgesEarned: number;
  xpGained: number;
}

export interface ActivityInsight {
  id: string;
  type: 'time' | 'day' | 'streak' | 'momentum';
  text: string;
  icon: string;
}

const getStartOfWeek = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  return new Date(d.setDate(diff)).setHours(0, 0, 0, 0);
};

const getStartOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
};

export const getWeeklyGoalProgress = (): WeeklyGoal => {
  const activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
  const startOfWeek = getStartOfWeek();
  
  const currentWeekActions = activities.filter((a: any) => {
    const ts = new Date(a.timestamp).getTime();
    return ts >= startOfWeek;
  }).length;

  return {
    target: 5, // Static weekly goal target as per design docs
    current: currentWeekActions,
    label: 'Weekly Actions'
  };
};

export const getActivitySummary = (range: 'week' | 'month'): ActivitySummary => {
  const activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
  const xpData = loadXPData();
  const badgeStates = loadBadgeStates();
  
  const start = range === 'week' ? getStartOfWeek() : getStartOfMonth();
  
  // Filter for range
  const rangeActivities = activities.filter((a: any) => new Date(a.timestamp).getTime() >= start);
  const rangeXP = xpData.xpHistory.filter(h => new Date(h.date).getTime() >= start).reduce((sum, h) => sum + h.amount, 0);
  const rangeBadges = badgeStates.filter(b => b.unlocked && b.unlockedAt && new Date(b.unlockedAt).getTime() >= start).length;

  // Compute unique active days
  const activeDays = new Set(
    rangeActivities.map((a: any) => new Date(a.timestamp).toDateString())
  ).size;

  return {
    activeDays,
    badgesEarned: rangeBadges,
    xpGained: rangeXP
  };
};

export const generateInsights = (): ActivityInsight[] => {
  const activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
  if (activities.length < 5) return [];

  const hours = activities.map((a: any) => new Date(a.timestamp).getHours());
  const days = activities.map((a: any) => new Date(a.timestamp).getDay());

  const insights: ActivityInsight[] = [];

  // Analyze Hours
  const eveningCount = hours.filter((h: number) => h >= 18 || h < 4).length;
  if (eveningCount > activities.length * 0.6) {
    insights.push({
      id: 'night_owl',
      type: 'time',
      text: 'You are most active in evenings 🌙',
      icon: '🌙'
    });
  }

  // Analyze Weekends (0 = Sunday, 6 = Saturday)
  const weekendCount = days.filter((d: number) => d === 0 || d === 6).length;
  if (weekendCount > activities.length * 0.5) {
    insights.push({
      id: 'weekend_warrior',
      type: 'day',
      text: 'You complete more actions on weekends 🔥',
      icon: '🏃'
    });
  }

  // Analyze Momentum
  const streak = loadStreakData().currentStreak;
  if (streak >= 3) {
    insights.push({
      id: 'momentum',
      type: 'momentum',
      text: `You have a ${streak}-day momentum. Keep going!`,
      icon: '🚀'
    });
  }

  return insights.slice(0, 2); // Show only top 2 as per design specs
};
