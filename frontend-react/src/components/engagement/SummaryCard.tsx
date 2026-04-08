
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Flame, Award, Zap } from 'lucide-react';
import { getActivitySummary } from '@/features/engagement/engagementUtils';

const SummaryCard: React.FC = () => {
  const [range, setRange] = useState<'week' | 'month'>('week');
  const summary = useMemo(() => getActivitySummary(range), [range]);

  const stats = [
    { label: 'Active Days', value: summary.activeDays, icon: <Flame size={18} className="text-orange-500" />, bg: 'bg-orange-500/10' },
    { label: 'Badges Earned', value: summary.badgesEarned, icon: <Award size={18} className="text-amber-500" />, bg: 'bg-amber-500/10' },
    { label: 'Total XP', value: summary.xpGained, icon: <Zap size={18} className="text-purple-500" />, bg: 'bg-purple-500/10' }
  ];

  return (
    <div className="p-8 bg-surface dark:bg-slate-900/50 rounded-[40px] border border-border-color shadow-2xl shadow-primary/10 overflow-hidden relative group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full -mr-24 -mt-24 pointer-events-none group-hover:bg-primary/20 transition-all duration-1000" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-foreground text-background dark:bg-white dark:text-slate-900 shadow-xl flex items-center justify-center">
             <BarChart2 size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-foreground dark:text-white uppercase">
              Growth Summary
            </h3>
            <p className="text-[10px] font-black italic text-muted-foreground/40 uppercase tracking-[0.3em]">
               📊 Performance tracking
            </p>
          </div>
        </div>

        <div className="flex items-center p-1.5 bg-surface/80 dark:bg-slate-800 rounded-2xl border border-border-color self-end">
           {['week', 'month'].map((r) => (
             <button
               key={r}
               onClick={() => setRange(r as 'week' | 'month')}
               className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 range === r 
                   ? 'bg-foreground text-background dark:bg-white dark:text-slate-900 shadow-lg scale-105' 
                   : 'text-muted-foreground/40 hover:text-muted-foreground'
               }`}
             >
               {r}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
        <AnimatePresence mode="wait">
          {stats.map((stat, idx) => (
            <motion.div
              key={`${range}-${stat.label}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="p-6 rounded-[28px] border border-border-color bg-white dark:bg-slate-900 hover:shadow-xl hover:shadow-primary/5 transition-all group/stat"
            >
              <div className="flex flex-col gap-5">
                <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center group-hover/stat:scale-110 transition-transform`}>
                   {stat.icon}
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
                      {stat.label}
                   </p>
                   <p className="text-2xl font-black text-foreground dark:text-white">
                      {stat.value}
                   </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SummaryCard;
