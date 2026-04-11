import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGrowth } from '../context/GrowthContext';
import { useAuthStore } from '@/store/authStore';
import { getNextLevelXP, calculateLevel } from '../utils/xpUtils';
import { BADGES } from '../utils/badgeUtils';
import WhatNextCard from './WhatNextCard';
import ProfileInsightCard from './ProfileInsightCard';

const XpToast: React.FC = () => {
  const { xpNotification } = useGrowth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (xpNotification) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [xpNotification]);

  return (
    <AnimatePresence>
      {visible && xpNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed bottom-24 right-8 z-[500] pointer-events-none"
        >
          <div className="bg-primary text-white px-6 py-3 rounded-2xl shadow-xl shadow-primary/40 flex items-center gap-3">
            <span className="text-xl">⚡</span>
            <span className="font-black">+{xpNotification.amount} XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const HeroSection: React.FC = () => {
  const { user } = useAuthStore();
  const { streak, xp, badges, todayStatus } = useGrowth();
  const levelInfo = calculateLevel(xp.totalXP);
  const nextLevel = getNextLevelXP(xp.totalXP);
  const firstName = user?.name?.split(' ')[0] || user?.username || 'there';

  // Find next target badge
  const nextTargetBadge = BADGES
    .map(b => ({ ...b, state: badges.find(s => s.id === b.id) }))
    .filter(b => !b.state?.unlocked)
    .sort((a, b) => (b.state?.progress || 0) - (a.state?.progress || 0))[0];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Circular progress ring
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (nextLevel.progress / 100) * circumference;

  return (
    <div className="space-y-6">
      <XpToast />
      
      {/* Today Status Summary Bar (Today Status 🔥) */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
          todayStatus.isSafe 
          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
          : 'bg-amber-500/5 border-amber-500/20 text-amber-600'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${todayStatus.isSafe ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
            {todayStatus.isSafe ? '✅' : '⚡'}
          </div>
          <span className="text-sm font-black uppercase tracking-wider">
            Today Status: {todayStatus.completed}/{todayStatus.total} tasks completed
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base">{todayStatus.isSafe ? '🔥' : '⏳'}</span>
            <span className="text-sm font-bold">
              {todayStatus.isSafe ? 'Streak Safe for Today' : `${todayStatus.total - todayStatus.completed} task left to protect streak`}
            </span>
          </div>
          {!todayStatus.isSafe && (
            <div className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black rounded-lg uppercase">
              Action Required
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card rounded-[32px] p-8 md:p-10 relative overflow-hidden"
      >
        {/* Background gradient accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-primary/10 via-purple-500/5 to-transparent rounded-full blur-3xl -translate-y-20 translate-x-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Identity Signal & Stats */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-[0.2em] mb-1">{getGreeting()}</p>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                Hey {firstName} <span className="inline-block animate-bounce-slow">👋</span>
              </h1>
            </div>

            {/* IDENTITY SIGNAL (NEW 🔥) */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <div className="px-5 py-3 bg-primary/5 border border-primary/10 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest leading-none mb-1">Global Rank</p>
                <p className="text-xl font-black text-primary">Top 15% Users 🏆</p>
              </div>
              <div className="px-5 py-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-amber-600/60 tracking-widest leading-none mb-1">Best Streak</p>
                <p className="text-xl font-black text-amber-600">{streak.bestStreak} days 🔥</p>
              </div>
            </div>

            {/* PROGRESSION TARGET (NEW 🔥) */}
            {nextTargetBadge && (
              <div className="p-5 bg-surface/50 border border-border-color rounded-[24px] max-w-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl grayscale">{nextTargetBadge.icon}</span>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-muted/60 leading-none mb-1">Next Goal</p>
                      <p className="text-sm font-black">{nextTargetBadge.name}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full italic">
                    {nextTargetBadge.state?.progress}% Complete
                  </span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden border border-border-color">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${nextTargetBadge.state?.progress}%` }}
                    className="h-full bg-primary"
                  />
                </div>
                <p className="text-[10px] font-bold text-muted mt-2">
                  🚀 Just a few more actions to unlock this milestone!
                </p>
              </div>
            )}

            {/* Streak risk alert */}
            {!todayStatus.isSafe && streak.currentStreak > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 px-5 py-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl max-w-sm"
              >
                <span className="text-xl animate-pulse">⚠️</span>
                <div>
                  <p className="text-sm font-black text-rose-500">Protect your streak!</p>
                  <p className="text-xs text-rose-400 font-medium font-bold">Complete 1 action today to maintain your {streak.currentStreak}-day streak</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Circular Progress Ring */}
          <div className="relative flex-shrink-0">
            <svg width="180" height="180" viewBox="0 0 140 140" className="transform -rotate-90">
              <circle cx="70" cy="70" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-border-color" />
              <motion.circle
                cx="70" cy="70" r={radius} fill="none" strokeWidth="8" strokeLinecap="round" className="text-primary" stroke="currentColor"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: progressOffset }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black">{levelInfo.icon}</span>
              <span className="text-xl font-black mt-1">Lv.{levelInfo.level}</span>
              <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">{levelInfo.title}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ACTION GUIDANCE SECTION (NEW 🔥) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WhatNextCard />
        <ProfileInsightCard />
      </div>
    </div>
  );
};

export default HeroSection;
