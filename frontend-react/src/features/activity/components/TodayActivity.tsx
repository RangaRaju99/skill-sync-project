
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ActivityItem from './ActivityItem';
import type { ActivityType } from './ActivityItem';
import ShowMoreToggle from './ShowMoreToggle';

interface TodayActivityProps {
  activities: any[]; // Raw activity data from parent
}

const TodayActivity: React.FC<TodayActivityProps> = ({ activities }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_ITEMS = 3;

  // Step 4 & 7: Filter ONLY clean, today's data (no noise)
  const todaysCleanActivities = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    
    // Noise filters (Step 1 & 7)
    const unwantedTypes = ['MENTOR_REQUEST', 'SESSION_BOOKED', 'SESSION_REQUESTED', 'SESSION_ACCEPTED', 'PAYMENT_COMPLETED'];
    const meaningfulKeywords = ['Logged in', 'Profile Updated', 'Badge Earned', 'Level Up', 'Skills Added', 'Avatar Updated'];

    return activities
      .filter(act => {
        const ts = new Date(act.timestamp).setHours(0, 0, 0, 0);
        if (ts !== today) return false;

        // Ensure title/text contains meaningful growth actions
        const isMeaningful = meaningfulKeywords.some(kw => act.title?.toLowerCase().includes(kw.toLowerCase()) || act.text?.toLowerCase().includes(kw.toLowerCase()));
        return isMeaningful && !unwantedTypes.includes(act.rawType);
      })
      .map(act => ({
        id: act.id,
        type: act.type as ActivityType,
        title: act.title || act.text || 'Activity',
        subtitle: act.subtitle,
        timestamp: act.timestamp
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [activities]);

  const displayedItems = isExpanded ? todaysCleanActivities : todaysCleanActivities.slice(0, MAX_ITEMS);

  return (
    <div className="glass-card p-8 rounded-[32px] space-y-6 relative overflow-hidden group">
      {/* Step 6: Simplified Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
            TODAY ACTIVITY 🔥
          </h3>
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </div>
        <div className="w-8 h-8 rounded-lg bg-surface/50 border border-border-color flex items-center justify-center text-muted opacity-30 group-hover:opacity-100 transition-opacity">
          <Clock size={14} />
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-1 relative z-10 transition-all duration-300">
        <AnimatePresence initial={false}>
          {todaysCleanActivities.length > 0 ? (
            displayedItems.map((act) => (
              <ActivityItem key={act.id} activity={act} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-surface border border-border-color flex items-center justify-center mx-auto mb-4 text-muted-foreground opacity-20">
                 <Zap size={24} />
              </div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">No activity today yet</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step 8: Smart Low Data State Trigger */}
      {todaysCleanActivities.length > 0 && todaysCleanActivities.length < 2 && (
        <div className="px-4 py-3 bg-primary/5 rounded-[20px] border border-primary/10 flex items-center gap-3 animate-fade-in group/hint">
           <Zap size={12} className="text-primary group-hover:scale-125 transition-transform" />
           <p className="text-[10px] font-bold text-primary opacity-60">
             Complete one action to grow your profile status
           </p>
        </div>
      )}

      {/* Toggle Expand / Full History Link */}
      <div className="pt-2 flex flex-col gap-2">
        {todaysCleanActivities.length > MAX_ITEMS && (
          <ShowMoreToggle 
            isExpanded={isExpanded} 
            onToggle={() => setIsExpanded(!isExpanded)} 
          />
        )}
        
        <button
          onClick={() => navigate('/activity-history')}
          className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground flex items-center justify-between border-t border-border-color/50 mt-2 px-2 hover:bg-surface/30 px-3 rounded-xl transition-all"
        >
          <span>View Full Timeline</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default TodayActivity;
