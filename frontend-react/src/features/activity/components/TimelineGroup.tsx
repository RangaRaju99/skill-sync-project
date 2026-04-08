
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronDown, Sparkles } from 'lucide-react';
import ActivityItem from './ActivityItem';
import type { Activity } from './ActivityItem';

interface TimelineGroupProps {
  label: string;
  activities: Activity[];
}

const TimelineGroup: React.FC<TimelineGroupProps> = ({ label, activities }) => {
  if (activities.length === 0) return null;

  return (
    <div className="space-y-12 relative group/section">
      {/* Group Header */}
      <div className="flex items-center gap-6 mb-12 sticky top-4 z-40">
        <div className="w-14 h-14 bg-surface dark:bg-slate-900 border-4 border-white dark:border-slate-800 rounded-2xl flex items-center justify-center text-primary shadow-2xl relative group-hover/section:scale-110 group-hover/section:rotate-6 transition-all duration-700">
           <Calendar size={24} className="group-hover/section:scale-110 transition-transform" />
           <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg animate-pulse-slow">
              {activities.length}
           </div>
        </div>
        <div className="space-y-1">
           <h3 className="text-2xl font-black uppercase tracking-[0.2em] text-foreground dark:text-white drop-shadow-sm self-end">
             {label}
           </h3>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 italic">
             {label === 'Today' ? '✨ Peak Potential Reached' : '📅 Past Milestones Recorded'}
           </p>
        </div>
      </div>

      {/* Gamification Trigger (Step 16) */}
      {label === 'Today' && activities.length < 3 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="ml-24 p-6 bg-primary/5 border border-primary/20 rounded-[32px] flex items-center gap-6 mb-16 relative overflow-hidden group/trigger"
        >
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full -mr-16 -mt-16 group-hover/trigger:scale-150 transition-transform duration-1000" />
           <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl flex-shrink-0">
              <Sparkles size={20} className="animate-spin-slow" />
           </div>
           <div className="flex-1 space-y-1">
              <p className="text-sm font-black text-primary uppercase tracking-widest">You're close to a milestone!</p>
              <p className="text-xs font-bold text-muted-foreground opacity-70">Complete 2 more actions today to unlock the 'Consistency King' badge 👑</p>
           </div>
           <ChevronDown size={20} className="text-primary/40 group-hover/trigger:translate-y-1 transition-transform" />
        </motion.div>
      )}

      {/* Vertical Timeline Dots & Items */}
      <div className="space-y-10 relative">
        {/* The Dot markers for each item */}
        {activities.map((act, idx) => (
          <div key={act.id} className="relative group/item">
            {/* Step 17: Timeline dot with glow effect on hover */}
            <div className="absolute left-[24.5px] top-4 w-[10px] h-[10px] rounded-full bg-border-color border-2 border-surface-dark group-hover/item:bg-primary group-hover/item:scale-150 group-hover/item:shadow-[0_0_12px_rgba(124,58,237,0.8)] transition-all z-30 ring-4 ring-background" />

            <div className="ml-24">
               <ActivityItem activity={act} />
            </div>
            
            {/* Step 17: Optional spacing or Gamification triggers between items */}
            {idx < activities.length - 1 && idx % 3 === 2 && (
              <div className="ml-24 my-6 opacity-30 group-hover/item:opacity-100 transition-opacity">
                 <div className="flex items-center gap-4 py-4 px-6 border-y border-border-color/30 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground italic">
                    ⚡ Keep pushing your limits
                 </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineGroup;
