
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown, ChevronUp, Zap, Edit3, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ActivityItem from './ActivityItem';
import type { Activity } from './ActivityItem';
import TodayStatusBar from './TodayStatusBar';
import HighlightCard from './HighlightCard';

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  // Constants as per design docs
  const INITIAL_COUNT = 3;

  // Filter for today's data ONLY (Step 4)
  const today = new Date().setHours(0, 0, 0, 0);
  const todaysActivities = useMemo(() => {
    return activities
      .filter(act => new Date(act.timestamp).setHours(0, 0, 0, 0) === today)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [activities, today]);

  // Priority Logic for Highlight Card (Step 3)
  const highlightActivity = useMemo(() => {
    if (todaysActivities.length === 0) return null;
    
    // Pick based on priority: Badge > Level > Profile > Login > System
    const priority = ['badge', 'level', 'profile', 'login', 'system'];
    return [...todaysActivities].sort((a, b) => {
       const aIdx = priority.indexOf(a.type);
       const bIdx = priority.indexOf(b.type);
       if (aIdx !== bIdx) return aIdx - bIdx;
       return b.timestamp - a.timestamp;
    })[0];
  }, [todaysActivities]);

  const displayedActivities = isExpanded ? todaysActivities : todaysActivities.slice(0, INITIAL_COUNT);

  return (
    <div className="glass-card p-8 rounded-[40px] space-y-10 relative overflow-hidden group">
      {/* Step 2: Today Status Bar */}
      <TodayStatusBar activityCount={todaysActivities.length} />

      {/* Step 3: Today Highlight */}
      <HighlightCard activity={highlightActivity} />

      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-black uppercase tracking-[0.2em] flex items-center gap-3">
          Timeline
          <span className="w-1 h-1 rounded-full bg-border-color" />
          <span className="text-muted-foreground/40 text-xs font-bold tracking-normal italic">Daily Snapshot</span>
        </h3>
        <div className="w-10 h-10 rounded-xl bg-surface/50 border border-border-color flex items-center justify-center text-muted group-hover:text-primary transition-colors">
          <Clock size={16} />
        </div>
      </div>

      {/* Step 4: Activity List */}
      <div className="space-y-4 relative z-10 transition-all duration-500">
        <AnimatePresence initial={false}>
          {todaysActivities.length > 0 ? (
            displayedActivities.map((act) => (
              <ActivityItem key={act.id} activity={act} />
            ))
          ) : (
            /* Step 9: Empty State (Conversion Focused) */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-border-color/50 rounded-[40px] bg-surface/20 text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-surface border border-border-color flex items-center justify-center text-muted-foreground shadow-inner">
                 <Zap size={32} className="text-primary/40" />
              </div>
              <div className="space-y-2">
                 <h4 className="text-xl font-black text-foreground">No activity today</h4>
                 <p className="text-sm text-muted-foreground font-medium max-w-[240px] leading-relaxed italic opacity-70">
                   Complete 1 action to start your streak 🔥
                 </p>
              </div>
              <button 
                onClick={() => navigate('/profile')}
                className="px-8 py-4 bg-primary text-white rounded-[20px] text-xs font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
              >
                 <Edit3 size={14} /> Update Profile
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step 8: Collapse / Expand & View History */}
      <div className="pt-4 flex flex-col gap-4">
        {todaysActivities.length > INITIAL_COUNT && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary flex items-center justify-center gap-2 transition-all border border-border-color/30 rounded-2xl hover:bg-surface-dark group/expand"
          >
            {isExpanded ? (
              <>COLLAPSE <ChevronUp size={14} className="group-hover/expand:-translate-y-1 transition-transform" /></>
            ) : (
              <>SHOW MORE ↓ <ChevronDown size={14} className="group-hover/expand:translate-y-1 animate-bounce transition-transform" /></>
            )}
          </button>
        )}

        <button
          onClick={() => navigate('/activity-history')}
          className="w-full py-5 px-8 rounded-3xl bg-foreground text-background dark:bg-white dark:text-slate-900 text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl hover:shadow-primary/20 group/btn"
        >
          View Full Journey
          <ArrowRight size={16} className="group-hover/btn:translate-x-1.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;
