
import React from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, Edit3, LogIn, Bell } from 'lucide-react';

export type ActivityType = 'badge' | 'level' | 'profile' | 'login' | 'system';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  subtitle?: string;
  timestamp: number;
}

const ICON_MAP: Record<ActivityType, React.ReactNode> = {
  badge: <Award className="text-amber-500" size={16} />,
  level: <Zap className="text-purple-500" size={16} />,
  profile: <Edit3 className="text-blue-500" size={16} />,
  login: <LogIn className="text-emerald-500" size={16} />,
  system: <Bell className="text-slate-400" size={16} />
};

interface ActivityItemProps {
  activity: Activity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const formatTime = (ts: number) => {
    const date = new Date(ts);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `Today • ${hours}:${minutes}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group flex gap-4 p-3 rounded-2xl transition-all duration-200 hover:bg-surface/60 hover:-translate-y-0.5 cursor-default"
    >
      <div className="w-10 h-10 rounded-xl bg-surface border border-border-color flex items-center justify-center shrink-0 shadow-sm group-hover:border-primary/20 transition-colors">
        {ICON_MAP[activity.type]}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-baseline justify-between gap-4">
          <h4 className="text-[13px] font-bold text-foreground truncate group-hover:text-primary transition-colors">
            {activity.title}
          </h4>
          <span className="text-[10px] font-bold text-muted opacity-40 whitespace-nowrap uppercase tracking-wider">
            {formatTime(activity.timestamp)}
          </span>
        </div>
        
        {activity.subtitle && (
          <p className="text-[11px] text-muted font-medium truncate mt-0.5 leading-relaxed opacity-60">
            {activity.subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ActivityItem;
