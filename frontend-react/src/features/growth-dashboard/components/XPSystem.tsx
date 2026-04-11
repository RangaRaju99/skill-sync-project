import React from 'react';
import { motion } from 'framer-motion';
import { useGrowth } from '../context/GrowthContext';
import { getNextLevelXP, calculateLevel, getStreakMultiplier, LEVELS } from '../utils/xpUtils';

const XPSystem: React.FC = () => {
  const { xp, streak } = useGrowth();
  const levelInfo = calculateLevel(xp.totalXP);
  const nextLevel = getNextLevelXP(xp.totalXP);
  const multiplier = getStreakMultiplier(streak.currentStreak);
  const nextLevelData = LEVELS.find(l => l.level === levelInfo.level + 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card rounded-[32px] p-8 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black tracking-tight">XP & Level</h3>
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
          <span className="text-sm">⭐</span>
          <span className="text-xs font-black text-primary">{xp.totalXP.toLocaleString()} XP</span>
        </div>
      </div>

      {/* Current Level */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-2xl border border-primary/10">
          {levelInfo.icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-black uppercase tracking-widest text-muted">Current Level</p>
          <p className="text-xl font-black">Level {levelInfo.level} — {levelInfo.title}</p>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted">
            {nextLevelData ? `Next: ${nextLevelData.title} ${nextLevelData.icon}` : 'Max Level!'}
          </span>
          <span className="text-[10px] font-bold text-muted">
            {nextLevel.current} / {nextLevel.next} XP
          </span>
        </div>
        <div className="h-3 bg-surface rounded-full overflow-hidden border border-border-color">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full shadow-[0_0_10px_rgba(124,58,237,0.3)]"
            initial={{ width: 0 }}
            animate={{ width: `${nextLevel.progress}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          />
        </div>
      </div>

      {/* Streak Multiplier Bonus */}
      {multiplier > 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl"
        >
          <span className="text-2xl">⚡</span>
          <div>
            <p className="text-sm font-black text-amber-600">Streak Multiplier Active</p>
            <p className="text-xs text-muted font-medium">
              {streak.currentStreak}-day streak → {multiplier}x XP on all actions
            </p>
          </div>
        </motion.div>
      )}

      {/* Level Roadmap */}
      <div className="space-y-2 pt-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted pl-1">Level Roadmap</p>
        <div className="flex gap-1">
          {LEVELS.map((l) => (
            <div
              key={l.level}
              className={`flex-1 h-2 rounded-full transition-all ${
                l.level <= levelInfo.level
                  ? 'bg-primary shadow-[0_0_6px_rgba(124,58,237,0.3)]'
                  : 'bg-border-color'
              }`}
              title={`Level ${l.level}: ${l.title}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[9px] font-bold text-muted/60">
          <span>🌱 Lv.1</span>
          <span>🏆 Lv.{LEVELS.length}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default XPSystem;
