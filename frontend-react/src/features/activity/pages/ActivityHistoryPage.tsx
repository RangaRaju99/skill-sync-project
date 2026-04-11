
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, ArrowDownRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '@/services/notification.service';
import SummaryHeader from '../components/SummaryHeader';
import ActivitySearch from '../components/ActivitySearch';
import TimelineGroup from '../components/TimelineGroup';
import type { Activity, ActivityType } from '../components/ActivityItem';
import { loadStreakData } from '@/features/growth-dashboard/utils/streakUtils';
import { loadXPData } from '@/features/growth-dashboard/utils/xpUtils';
import { loadBadgeStates } from '@/features/growth-dashboard/utils/badgeUtils';

const ActivityHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);

  // Derive dynamic stats from storage (Step 2 & 3)
  const streakInfo = useMemo(() => loadStreakData(), [activities]);
  const xpData = useMemo(() => loadXPData(), [activities]);
  const badgesEarned = useMemo(() => loadBadgeStates().filter(s => s.unlocked).length, [activities]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res: any = await notificationService.getAll();
        const raw = res.data?.data || res.data || [];
        
        // Map backend to Activity format (Step 18 Colors & Icons already in ActivityItem)
        const mapped = raw.map((n: any) => mapNotification(n));
        
        // Add some local actions as per design (Logins, Profile Updates)
        const local = (JSON.parse(localStorage.getItem('userActivities') || '[]')).map((l: any) => mapLocalAction(l));
        
        const combined = [...mapped, ...local]
          .sort((a, b) => b.timestamp - a.timestamp);
          
        setActivities(combined);
      } catch (err) {
        console.error('Failed to load journey timeline', err);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchData();
  }, []);

  const mapNotification = (n: any): Activity => {
     let type: ActivityType = 'system';
     let title = n.message || 'Activity Recorded';
     
     if (n.type?.includes('MENTOR') || n.type?.includes('SESSION')) {
        type = 'system';
     } else if (n.type?.includes('BADGE')) {
        type = 'badge';
     } else if (n.type?.includes('LEVEL')) {
        type = 'level';
     }

     let ts = Date.now();
     if (Array.isArray(n.createdAt) && n.createdAt.length >= 5) {
       ts = new Date(n.createdAt[0], n.createdAt[1]-1, n.createdAt[2], n.createdAt[3], n.createdAt[4]).getTime();
     } else if (n.createdAt) {
       ts = new Date(n.createdAt).getTime();
     }

     return { id: `nf-${n.id}`, type, title, timestamp: ts };
  };

  const mapLocalAction = (l: any): Activity => {
     let type: ActivityType = 'profile';
     if (l.text?.includes('Logged in')) type = 'login';
     else if (l.iconName === 'Award' || l.text?.includes('Badge')) type = 'badge';
     else if (l.iconName === 'Zap' || l.text?.includes('Level')) type = 'level';

     return { 
       id: l.id, 
       type, 
       title: l.text || l.title || 'System Activity', 
       subtitle: l.subtitle || '',
       timestamp: l.timestamp 
     };
  };

  // Memoized Search & Filter (Step 19 Performance)
  const filteredActivities = useMemo(() => {
    const safeQuery = (query || '').toLowerCase();
    return activities.filter(act => {
      const safeTitle = (act.title || '').toLowerCase();
      const matchesQuery = safeTitle.includes(safeQuery);
      const matchesFilter = activeFilter === 'all' || 
                            (activeFilter === 'achievements' && (act.type === 'badge' || act.type === 'level')) ||
                            (activeFilter === 'profile' && act.type === 'profile') ||
                            (activeFilter === 'activity' && (act.type === 'login' || act.type === 'system'));
      return matchesQuery && matchesFilter;
    });
  }, [activities, query, activeFilter]);

  // Grouping Logic (Today, Yesterday, This Week, Earlier) (Step 11)
  const groupedData = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = new Date(today - 86400000).getTime();
    const startOfWeek = new Date().setHours(0, 0, 0, 0) - (new Date().getDay() * 86400000);

    const groups: Record<string, Activity[]> = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'Earlier': []
    };

    filteredActivities.slice(0, visibleCount).forEach(act => {
       const ts = new Date(act.timestamp).setHours(0, 0, 0, 0);
       if (ts === today) groups['Today'].push(act);
       else if (ts === yesterday) groups['Yesterday'].push(act);
       else if (ts >= startOfWeek) groups['This Week'].push(act);
       else groups['Earlier'].push(act);
    });

    return groups;
  }, [filteredActivities, visibleCount]);

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-12 animate-pulse pb-32">
        <div className="h-10 w-48 bg-surface rounded-2xl" />
        <div className="h-64 bg-surface rounded-[40px]" />
        <div className="space-y-8">
           {[1, 2, 3].map(i => <div key={i} className="h-24 bg-surface rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-5xl mx-auto pb-32"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate('/profile')}
        className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-all mb-12 hover:-translate-x-1 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Return to Profile
      </button>

      {/* Step 12: Summary Header (Step 1-3 Dynamic) */}
      <SummaryHeader 
        bestStreak={streakInfo.bestStreak} 
        badgesEarned={badgesEarned} 
        xpGained={xpData.totalXP} 
      />

      {/* Step 14: Search & Filters */}
      <ActivitySearch 
        query={query} 
        onQueryChange={setQuery} 
        activeFilter={activeFilter} 
        onFilterChange={setActiveFilter} 
      />

      {/* Step 11: Timeline Body */}
      <div className="space-y-24 relative pb-20">
        {/* Step 11: Middle vertical line for timeline */}
        <div className="absolute left-[31px] top-6 bottom-0 w-[2.5px] bg-gradient-to-b from-primary/30 via-border-color/40 to-transparent z-0" />

        {['Today', 'Yesterday', 'This Week', 'Earlier'].map(label => (
          <TimelineGroup key={label} label={label} activities={groupedData[label]} />
        ))}

        {/* Step 14: Load More / Infinite Scroll feel */}
        {filteredActivities.length > visibleCount && (
           <div className="flex flex-col items-center gap-6 pt-12 z-10 relative">
              <button 
                onClick={() => setVisibleCount(p => p + 10)}
                className="group flex flex-col items-center gap-4 hover:-translate-y-2 transition-all duration-500"
              >
                 <div className="w-16 h-16 rounded-full bg-surface border border-border-color flex items-center justify-center shadow-xl group-hover:border-primary group-hover:bg-primary/5 transition-all text-muted-foreground group-hover:text-primary animate-bounce">
                    <ArrowDownRight className="rotate-45" size={24} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 group-hover:text-primary transition-colors">Load more Journey</span>
              </button>
           </div>
        )}

        {filteredActivities.length === 0 && (
           <div className="py-24 text-center border-2 border-dashed border-border-color/30 rounded-[40px] opacity-40 italic font-black uppercase tracking-[0.3em]">
             🔍 No milestones found for this search
           </div>
        )}
      </div>
    </motion.div>
  );
};

export default ActivityHistoryPage;
