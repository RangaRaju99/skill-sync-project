
import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap, Award as Trophy } from 'lucide-react';

interface SummaryHeaderProps {
  bestStreak: number;
  badgesEarned: number;
  xpGained: number;
}

const SummaryHeader: React.FC<SummaryHeaderProps> = ({ bestStreak, badgesEarned, xpGained }) => {
  const stats = [
    { label: 'Best Streak', value: `${bestStreak} days`, icon: <Flame size={20} className="text-orange-500" />, color: 'bg-orange-500/10 border-orange-500/20 shadow-orange-500/5' },
    { label: 'Badges Earned', value: badgesEarned, icon: <Trophy size={20} className="text-amber-500" />, color: 'bg-amber-500/10 border-amber-500/20 shadow-amber-500/5' },
    { label: 'XP Gained', value: `+${xpGained}`, icon: <Zap size={20} className="text-purple-500" />, color: 'bg-purple-500/10 border-purple-500/20 shadow-purple-500/5' }
  ];

  return (
    <div className="space-y-12 mb-16 relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -mr-32 -mt-32 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-1000" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full -ml-32 -mb-32 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-1000" />

      <div className="flex flex-col gap-4 relative z-10">
        <h2 className="text-4xl font-black flex items-center gap-6 tracking-tight">
          <span className="w-1.5 h-16 bg-primary rounded-full" />
          Your Activity Summary
        </h2>
        <p className="text-sm font-black text-muted-foreground/40 uppercase tracking-[0.4em] ml-20 italic">
          📊 Tracking your growth and milestones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.6, ease: 'easeOut' }}
            className={`p-8 rounded-[40px] border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group/stat ${stat.color}`}
          >
            <div className="flex flex-col gap-6">
              <div className="w-14 h-14 rounded-2xl bg-surface border border-border-color flex items-center justify-center shadow-lg group-hover/stat:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">{stat.label}</p>
                <p className="text-3xl font-black text-foreground dark:text-white group-hover/stat:text-primary transition-colors">
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SummaryHeader;
