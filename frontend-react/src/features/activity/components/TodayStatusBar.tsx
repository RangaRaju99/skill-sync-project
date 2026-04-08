
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Flame, AlertCircle } from 'lucide-react';

interface TodayStatusBarProps {
  activityCount: number;
}

const TodayStatusBar: React.FC<TodayStatusBarProps> = ({ activityCount }) => {
  const isActive = activityCount > 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-[28px] border flex items-center justify-between transition-all duration-500 shadow-sm ${
        isActive 
          ? 'bg-emerald-500/5 border-emerald-500/20' 
          : 'bg-rose-500/5 border-rose-500/20 shadow-rose-500/5'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform hover:rotate-12 ${
          isActive ? 'bg-emerald-500/20 text-emerald-600' : 'bg-rose-500/20 text-rose-600'
        }`}>
          {isActive ? <ShieldCheck size={24} /> : <AlertCircle size={24} className="animate-pulse" />}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-0.5">Today Status</p>
          <div className="flex items-center gap-2">
            <h4 className={`text-sm font-black ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {isActive ? 'Active' : 'Missing Action'}
            </h4>
            <span className="w-1 h-1 rounded-full bg-border-color" />
            <p className="text-xs font-bold text-muted-foreground">{activityCount} activities completed</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 pr-2">
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-0.5">Streak Safe</p>
          <div className="flex items-center justify-end gap-1.5">
            <Flame size={16} className={isActive ? 'text-orange-500' : 'text-muted-foreground/30'} />
            <span className={`text-sm font-black ${isActive ? 'text-foreground' : 'text-muted-foreground/40'}`}>
              {isActive ? 'For Today' : '1 action needed'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TodayStatusBar;
