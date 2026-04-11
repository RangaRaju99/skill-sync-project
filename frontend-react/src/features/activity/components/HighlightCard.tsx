
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Award, Zap, Edit3, LogIn, Bell } from 'lucide-react';
import type { Activity, ActivityType } from './ActivityItem';

interface HighlightCardProps {
  activity: Activity | null;
}

const ICON_MAP: Record<ActivityType, React.ReactNode> = {
  badge: <Award className="text-amber-500" size={24} />,
  level: <Zap className="text-purple-500" size={24} />,
  profile: <Edit3 className="text-blue-500" size={24} />,
  login: <LogIn className="text-emerald-500" size={24} />,
  system: <Bell className="text-slate-400" size={24} />
};

const COLOR_MAP: Record<ActivityType, string> = {
  badge: 'bg-amber-500/10 border-amber-500/20 shadow-amber-500/5',
  level: 'bg-purple-500/10 border-purple-500/20 shadow-purple-500/5',
  profile: 'bg-blue-500/10 border-blue-500/20 shadow-blue-500/5',
  login: 'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5',
  system: 'bg-slate-500/10 border-slate-500/20 shadow-slate-500/5'
};

const HighlightCard: React.FC<HighlightCardProps> = ({ activity }) => {
  if (!activity) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative overflow-hidden p-6 rounded-[32px] border transition-all duration-700 shadow-xl shadow-primary/5 hover:shadow-primary/20 hover:-translate-y-1 ${COLOR_MAP[activity.type]}`}
    >
      {/* Background Sparkles / Effects */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[60px] rounded-full -mr-16 -mt-16 animate-pulse-slow opacity-20" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 blur-[60px] rounded-full -ml-16 -mb-16 opacity-20" />

      <div className="relative z-10 flex items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[24px] bg-surface-dark border-4 border-white/20 dark:border-slate-800 flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xl relative">
            <div className="absolute -top-2 -right-2 text-primary animate-bounce">
               <Sparkles size={16} />
            </div>
            {ICON_MAP[activity.type]}
          </div>

          <div className="space-y-1">
             <div className="flex items-center gap-2 mb-1">
                <Star size={12} className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-spin-slow" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Today's Highlight</p>
             </div>
             <h3 className="text-xl font-black tracking-tight text-foreground dark:text-white capitalize truncate max-w-[200px]">
               {activity.title}
             </h3>
             <p className="text-[11px] font-bold text-muted-foreground/80 italic line-clamp-1 opacity-70">
               {activity.subtitle || 'Most impactful achievement today'}
             </p>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end gap-3 pr-4">
           <div className="px-5 py-2.5 rounded-2xl bg-surface border border-border-color shadow-sm text-xs font-black uppercase tracking-[0.2em] group-hover:bg-primary group-hover:text-white transition-all cursor-default">
              🎉 Celebate
           </div>
           <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">High Priority</span>
        </div>
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
    </motion.div>
  );
};

export default HighlightCard;
