
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface EngagementPreferences {
  mutedCategories: string[];
  pinnedIds: number[];
  snoozedNotifications: Record<number, number>; // id -> expiry timestamp
}

interface EngagementContextType {
  preferences: EngagementPreferences;
  muteCategory: (category: string) => void;
  unmuteCategory: (category: string) => void;
  pinNotification: (id: number) => void;
  unpinNotification: (id: number) => void;
  snoozeNotification: (id: number, durationHours: number) => void;
  isSnoozed: (id: number) => boolean;
  refreshPreferences: () => void;
}

const STORAGE_KEY = 'ss_engagement_prefs';

const EngagementContext = createContext<EngagementContextType | undefined>(undefined);

export const EngagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<EngagementPreferences>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      mutedCategories: [],
      pinnedIds: [],
      snoozedNotifications: {}
    };
  });

  const save = (newPrefs: EngagementPreferences) => {
    setPreferences(newPrefs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
  };

  const muteCategory = (cat: string) => {
    if (!preferences.mutedCategories.includes(cat)) {
      save({ ...preferences, mutedCategories: [...preferences.mutedCategories, cat] });
    }
  };

  const unmuteCategory = (cat: string) => {
    save({ ...preferences, mutedCategories: preferences.mutedCategories.filter(c => c !== cat) });
  };

  const pinNotification = (id: number) => {
    if (!preferences.pinnedIds.includes(id)) {
      save({ ...preferences, pinnedIds: [id, ...preferences.pinnedIds] });
    }
  };

  const unpinNotification = (id: number) => {
    save({ ...preferences, pinnedIds: preferences.pinnedIds.filter(pid => pid !== id) });
  };

  const snoozeNotification = (id: number, durationHours: number) => {
    const expiry = Date.now() + (durationHours * 60 * 60 * 1000);
    save({
      ...preferences,
      snoozedNotifications: { ...preferences.snoozedNotifications, [id]: expiry }
    });
  };

  const isSnoozed = useCallback((id: number) => {
    const expiry = preferences.snoozedNotifications[id];
    if (!expiry) return false;
    if (Date.now() > expiry) {
      // Auto-cleanup would be better in an effect, but check here too
      return false;
    }
    return true;
  }, [preferences.snoozedNotifications]);

  const refreshPreferences = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setPreferences(JSON.parse(saved));
  };

  // Cleanup snoozed notifications that expired
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let changed = false;
      const newSnoozed = { ...preferences.snoozedNotifications };
      
      Object.entries(newSnoozed).forEach(([id, expiry]) => {
        if (now > expiry) {
          delete newSnoozed[Number(id)];
          changed = true;
        }
      });

      if (changed) {
        save({ ...preferences, snoozedNotifications: newSnoozed });
      }
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [preferences]);

  return (
    <EngagementContext.Provider value={{
      preferences,
      muteCategory,
      unmuteCategory,
      pinNotification,
      unpinNotification,
      snoozeNotification,
      isSnoozed,
      refreshPreferences
    }}>
      {children}
    </EngagementContext.Provider>
  );
};

export const useEngagement = () => {
  const context = useContext(EngagementContext);
  if (context === undefined) {
    throw new Error('useEngagement must be used within an EngagementProvider');
  }
  return context;
};
