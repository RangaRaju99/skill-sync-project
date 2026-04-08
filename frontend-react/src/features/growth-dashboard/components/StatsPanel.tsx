import React from 'react';
import { motion } from 'framer-motion';
import { useGrowth } from '../context/GrowthContext';
import { BADGES } from '../utils/badgeUtils';
import { calculateLevel } from '../utils/xpUtils';

const StatsPanel: React.FC = () => {
  const { streak, xp, badges } = useGrowth();
  const levelInfo = calculateLevel(xp.totalXP);
  const unlockedBadges = badges.filter(b => b.unlocked).length;

  // Find next badge to unlock (highest progress, not yet unlocked)
  const nextBadge = BADGES
    .map(b => ({ ...b, state: badges.find(bs => bs.id === b.id) }))
    .filter(b => !b.state?.unlocked)
    .sort((a, b) => (b.state?.progress || 0) - (a.state?.progress || 0))[0];

  const stats = [
    { label: 'Current Streak', value: `${streak.currentStreak}`, icon: '🔥', color: 'text-orange-500' },
    { label: 'Best Streak', value: `${streak.bestStreak}`, icon: '🏅', color: 'text-amber-500' },
    { label: 'Active Days', value: `${streak.totalActiveDays}`, icon: '📅', color: 'text-blue-500' },
    { label: 'Total XP', value: xp.totalXP.toLocaleString(), icon: '⭐', color: 'text-primary' },
    { label: 'Level', value: `${levelInfo.level}`, icon: levelInfo.icon, color: 'text-purple-500' },
    { label: 'Badges', value: `${unlockedBadges}/${BADGES.length}`, icon: '🏆', color: 'text-emerald-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="glass-card rounded-[32px] p-8 space-y-6"
    >
      <h3 className="text-lg font-black tracking-tight">Quick Stats</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.06 }}
            className="p-4 bg-surface border border-border-color rounded-2xl text-center space-y-1 hover:border-primary/20 transition-all group"
          >
            <span className="text-2xl block group-hover:scale-110 transition-transform">{stat.icon}</span>
            <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Next badge progress */}
      {nextBadge && (
        <div className="p-5 bg-surface border border-border-color rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl grayscale">{nextBadge.icon}</span>
              <div>
                <p className="text-xs font-black">{nextBadge.name}</p>
                <p className="text-[10px] text-muted font-medium">{nextBadge.requirement}</p>
              </div>
            </div>
            <span className="text-xs font-black text-primary">{nextBadge.state?.progress || 0}%</span>
          </div>
          <div className="h-2 bg-border-color rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${nextBadge.state?.progress || 0}%` }}
              transition={{ duration: 1, delay: 0.8 }}
            />
          </div>
          {(nextBadge.state?.progress || 0) >= 75 && (
            <p className="text-[10px] font-bold text-primary italic text-center animate-pulse">
              You're SO close to unlocking this! 🔥
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default StatsPanel;
