import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  loadStreakData, recordAction as recordStreakAction,
  isStreakAtRisk, getHoursLeft,
  type StreakData
} from '../utils/streakUtils';
import {
  loadXPData, awardXP as awardXPUtil,
  type XPData
} from '../utils/xpUtils';
import {
  loadBadgeStates, evaluateBadges,
  type BadgeState, type BadgeContext, type Badge
} from '../utils/badgeUtils';
import {
  loadMissionState, completeMission as completeMissionUtil,
  type Mission, type MissionState
} from '../utils/missionUtils';

interface UnlockEvent {
  badge: Badge;
  timestamp: number;
}

interface GrowthState {
  streak: StreakData;
  xp: XPData;
  badges: BadgeState[];
  missions: Mission[];
  missionState: MissionState;
  streakAtRisk: boolean;
  hoursLeft: number;
  unlockQueue: UnlockEvent[];
  xpNotification: { amount: number; timestamp: number } | null;
  profileCompletion: number;
  skillCount: number;
  todayStatus: { completed: number; total: number; isSafe: boolean };

  // Actions
  recordAction: (action: string) => void;
  completeMission: (missionId: string) => void;
  dismissUnlock: () => void;
  refreshAll: () => void;
}

const GrowthContext = createContext<GrowthState | null>(null);

export const useGrowth = (): GrowthState => {
  const ctx = useContext(GrowthContext);
  if (!ctx) throw new Error('useGrowth must be used within GrowthProvider');
  return ctx;
};

export const GrowthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const [streak, setStreak] = useState<StreakData>(loadStreakData);
  const [xp, setXP] = useState<XPData>(loadXPData);
  const [badges, setBadges] = useState<BadgeState[]>(loadBadgeStates);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionState, setMissionState] = useState<MissionState>({ date: '', missions: [], allCompleted: false, totalCompleted: 0 });
  const [unlockQueue, setUnlockQueue] = useState<UnlockEvent[]>([]);
  const [xpNotification, setXpNotification] = useState<{ amount: number; timestamp: number } | null>(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [skillCount, setSkillCount] = useState(0);

  const todayStatus = {
    completed: missionState.totalCompleted,
    total: missions.length,
    isSafe: streak.lastActiveDate === new Date().toISOString().split('T')[0]
  };

  // Load mission state on mount
  useEffect(() => {
    const { missions: m, state: s } = loadMissionState();
    setMissions(m);
    setMissionState(s);
  }, []);

  // Calculate profile completion from localStorage
  useEffect(() => {
    try {
      const name = localStorage.getItem('ss_name') || '';
      const email = localStorage.getItem('ss_email') || '';
      const username = localStorage.getItem('ss_username') || '';
      let score = 0;
      if (name) score += 20;
      if (email) score += 20;
      if (username) score += 20;
      // Try to read from cached profile data
      const cachedProfile = localStorage.getItem('ss_profile_cache');
      if (cachedProfile) {
        const p = JSON.parse(cachedProfile);
        if (p.bio) score += 20;
        if (p.skills && p.skills.length > 0) {
          score += 20;
          setSkillCount(typeof p.skills === 'string' ? p.skills.split(',').length : p.skills.length);
        }
      }
      setProfileCompletion(Math.min(100, score));
    } catch {
      setProfileCompletion(40); // default fallback
    }
  }, []);

  const getBadgeContext = useCallback((): BadgeContext => ({
    streak: streak.currentStreak,
    bestStreak: streak.bestStreak,
    totalXP: xp.totalXP,
    level: xp.level,
    totalActiveDays: streak.totalActiveDays,
    profileCompletion,
    skillCount,
    sessionCount: 0,
    missionsCompleted: missionState.totalCompleted,
  }), [streak, xp, profileCompletion, skillCount, missionState]);

  const checkBadges = useCallback(() => {
    const ctx = getBadgeContext();
    const { states, newlyUnlocked } = evaluateBadges(ctx, badges);
    setBadges(states);
    if (newlyUnlocked.length > 0) {
      const events = newlyUnlocked.map(b => ({ badge: b, timestamp: Date.now() }));
      setUnlockQueue(prev => [...prev, ...events]);
      // Award XP for each badge
      let currentXP = xp;
      newlyUnlocked.forEach(() => {
        const result = awardXPUtil(currentXP, 'badge_earned', streak.currentStreak);
        currentXP = result.data;
      });
      setXP(currentXP);
    }
  }, [getBadgeContext, badges, xp, streak.currentStreak]);

  const recordAction = useCallback((action: string) => {
    // 1. Record streak
    const newStreak = recordStreakAction(streak, action);
    setStreak(newStreak);

    // 2. Award XP
    const xpResult = awardXPUtil(xp, action, newStreak.currentStreak);
    setXP(xpResult.data);
    setXpNotification({ amount: xpResult.awarded, timestamp: Date.now() });

    // 3. Check badges after state update
    setTimeout(() => checkBadges(), 100);
  }, [streak, xp, checkBadges]);

  const completeMission = useCallback((missionId: string) => {
    const updated = completeMissionUtil(missionId);
    setMissionState(updated);

    // Award XP for mission completion
    const xpResult = awardXPUtil(xp, 'complete_mission', streak.currentStreak);
    setXP(xpResult.data);

    // Record as streak action
    const newStreak = recordStreakAction(streak, 'mission_' + missionId);
    setStreak(newStreak);

    setTimeout(() => checkBadges(), 100);
  }, [xp, streak, checkBadges]);

  const dismissUnlock = useCallback(() => {
    setUnlockQueue(prev => prev.slice(1));
  }, []);

  const refreshAll = useCallback(() => {
    setStreak(loadStreakData());
    setXP(loadXPData());
    setBadges(loadBadgeStates());
    const { missions: m, state: s } = loadMissionState();
    setMissions(m);
    setMissionState(s);
  }, []);

  // Record login action on mount
  useEffect(() => {
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const lastLogin = localStorage.getItem('ss_last_login_date');
      if (lastLogin !== today) {
        localStorage.setItem('ss_last_login_date', today);
        recordAction('login');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Check badges on mount
  useEffect(() => {
    checkBadges();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: GrowthState = {
    streak,
    xp,
    badges,
    missions,
    missionState,
    streakAtRisk: isStreakAtRisk(streak),
    hoursLeft: getHoursLeft(),
    unlockQueue,
    xpNotification,
    profileCompletion,
    skillCount,
    todayStatus,
    recordAction,
    completeMission,
    dismissUnlock,
    refreshAll,
  };

  return <GrowthContext.Provider value={value}>{children}</GrowthContext.Provider>;
};
