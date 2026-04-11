
import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap } from 'lucide-react';
import { useGrowth } from '../context/GrowthContext';

const WhatNextCard: React.FC = () => {
  const { streak } = useGrowth();
  const currentStreak = streak.currentStreak;

  // Milestone logic: 3, 7, 14, 30 days
  const milestones = [3, 7, 14, 30];
  const nextMilestone = milestones.find(m => m > currentStreak) || 100;
  const progress = Math.min((currentStreak / nextMilestone) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-3xl p-6 relative overflow-hidden group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Target size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-foreground dark:text-white">Next Goal</h4>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest italic">Reach {nextMilestone}-day streak</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-primary leading-none">{currentStreak} / {nextMilestone}</p>
          <p className="text-[8px] font-black uppercase text-muted-foreground/40 tracking-widest">Days Logged</p>
        </div>
      </div>

      <div className="h-2 bg-surface dark:bg-slate-800 rounded-full overflow-hidden border border-border-color mb-4">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-primary shadow-lg shadow-primary/20"
        />
      </div>

      <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
        <Zap size={14} className="text-amber-500 fill-amber-500/30" />
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
          Complete 1 action today to grow your streak!
        </p>
      </div>
    </motion.div>
  );
};

export default WhatNextCard;
