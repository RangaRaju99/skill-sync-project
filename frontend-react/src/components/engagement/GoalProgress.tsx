
import React from 'react';
import { motion } from 'framer-motion';
import { Target, Trophy } from 'lucide-react';
import { getWeeklyGoalProgress } from '@/features/engagement/engagementUtils';

const GoalProgress: React.FC = () => {
  const goal = getWeeklyGoalProgress();
  const progress = Math.min((goal.current / goal.target) * 100, 100);
  const isCompleted = goal.current >= goal.target;

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-border-color shadow-xl shadow-primary/5 hover:shadow-primary/20 transition-all duration-500 overflow-hidden group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
             <Target size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-foreground dark:text-white">
              Weekly Goal
            </h4>
            <p className="text-[10px] font-bold text-muted-foreground/40 italic">
               Personalized action target
            </p>
          </div>
        </div>
        <div className="text-right">
           <span className="text-2xl font-black text-foreground dark:text-white">
              {goal.current}
           </span>
           <span className="text-xs font-bold text-muted-foreground/40 ml-1">
              / {goal.target}
           </span>
        </div>
      </div>

      {/* Progress Bar (Step 3 UI) */}
      <div className="space-y-4">
        <div className="h-4 bg-surface dark:bg-slate-800 rounded-full overflow-hidden p-1 border border-border-color shadow-inner">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${progress}%` }}
             transition={{ duration: 1.5, ease: 'easeOut' }}
             className={`h-full rounded-full shadow-lg ${isCompleted ? 'bg-emerald-500' : 'bg-primary shadow-primary/30'}`}
           />
        </div>

        <div className="flex justify-between items-center">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 italic">
              {isCompleted ? 'Target Achieved' : `${goal.target - goal.current} actions left`}
           </p>
           {isCompleted && (
             <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[9px] font-black italic tracking-widest"
             >
                <Trophy size={12} />
                Goal Completed 🎉
             </motion.div>
           )}
        </div>
      </div>
    </div>
  );
};

export default GoalProgress;
