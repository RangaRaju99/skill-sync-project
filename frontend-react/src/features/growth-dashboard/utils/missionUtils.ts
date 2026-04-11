// ─── Daily Missions System ───
const STORAGE_KEY = 'ss_missions_data';

export interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  checkKey: string; // key to match against completed actions
}

export interface MissionState {
  date: string;
  missions: { id: string; completed: boolean }[];
  allCompleted: boolean;
  totalCompleted: number;
}

const DAILY_MISSION_POOL: Mission[] = [
  { id: 'visit_dashboard', title: 'Visit Dashboard', description: 'Open the growth dashboard', icon: '🏠', xpReward: 5, checkKey: 'visit_dashboard' },
  { id: 'visit_profile', title: 'Check Profile', description: 'Visit your profile page', icon: '👤', xpReward: 5, checkKey: 'visit_profile' },
  { id: 'explore_mentors', title: 'Explore Mentors', description: 'Browse the mentors page', icon: '🔍', xpReward: 10, checkKey: 'explore_mentors' },
  { id: 'view_skills', title: 'Review Skills', description: 'Visit the skills page', icon: '🧩', xpReward: 5, checkKey: 'view_skills' },
  { id: 'check_notifications', title: 'Check Notifications', description: 'View your notifications', icon: '🔔', xpReward: 5, checkKey: 'check_notifications' },
];

const getToday = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Deterministically pick missions for today based on date seed */
const pickDailyMissions = (count: number = 4): Mission[] => {
  const today = getToday();
  let seed = 0;
  for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);

  const shuffled = [...DAILY_MISSION_POOL].sort((a, b) => {
    const ha = (seed * 31 + a.id.charCodeAt(0)) % 100;
    const hb = (seed * 31 + b.id.charCodeAt(0)) % 100;
    return ha - hb;
  });

  return shuffled.slice(0, count);
};

export const loadMissionState = (): { missions: Mission[]; state: MissionState } => {
  const today = getToday();
  const missions = pickDailyMissions();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as MissionState;
      if (saved.date === today) {
        return { missions, state: saved };
      }
    }
  } catch { /* ignore */ }

  const state: MissionState = {
    date: today,
    missions: missions.map(m => ({ id: m.id, completed: false })),
    allCompleted: false,
    totalCompleted: 0,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return { missions, state };
};

export const completeMission = (missionId: string): MissionState => {
  const { missions, state } = loadMissionState();
  const updated = { ...state };
  const missionIdx = updated.missions.findIndex(m => m.id === missionId);
  if (missionIdx >= 0 && !updated.missions[missionIdx].completed) {
    updated.missions[missionIdx].completed = true;
    updated.totalCompleted = updated.missions.filter(m => m.completed).length;
    updated.allCompleted = updated.totalCompleted === updated.missions.length;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const getTodayMissions = (): Mission[] => pickDailyMissions();
