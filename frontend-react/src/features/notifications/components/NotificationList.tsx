
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { NotificationDto } from '@/hooks/useNotifications';
import NotificationCard from './NotificationCard';

interface NotificationListProps {
  notifications: NotificationDto[];
  isLoading: boolean;
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
  onAction: (notification: NotificationDto) => void;
  onPin: (id: number) => void;
  onSnooze: (id: number) => void;
  pinnedIds: number[];
}

const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications, 
  isLoading, 
  onMarkRead, 
  onDelete, 
  onAction,
  onPin,
  onSnooze,
  pinnedIds
}) => {
  // Step 9: Smart Grouping (Today, Yesterday, Earlier)
  const groupedNotifs = React.useMemo(() => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    const parseDate = (input: any) => {
      if (Array.isArray(input)) return new Date(input[0], input[1] - 1, input[2], input[3] || 0, input[4] || 0);
      return new Date(input);
    };

    const groups: Record<string, NotificationDto[]> = {
      'Pinned Notifications': [],
      'Today': [],
      'Yesterday': [],
      'Earlier': []
    };

    notifications.forEach(n => {
      const id = Number(n.id);
      if (pinnedIds.includes(id)) {
        groups['Pinned Notifications'].push(n);
        return;
      }

      const d = parseDate(n.createdAt).toDateString();
      if (d === today) groups['Today'].push(n);
      else if (d === yesterday) groups['Yesterday'].push(n);
      else groups['Earlier'].push(n);
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [notifications]);

  if (isLoading) {
    return (
      <div className="space-y-12 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-4">
            <div className="h-4 w-24 bg-surface rounded-full" />
            <div className="h-32 bg-surface rounded-[28px]" />
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-24 text-center border-2 border-dashed border-border-color/50 rounded-[40px] bg-surface/10 space-y-8"
      >
        <div className="w-24 h-24 rounded-[32px] bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary animate-bounce-slow">
           <Sparkles size={40} />
        </div>
        <div className="space-y-2">
           <h3 className="text-2xl font-black text-slate-800 tracking-tight">🎉 All caught up!</h3>
           <p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-[0.2em] italic">No new notifications for this category</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-16 pb-20 relative">
      {/* Timeline background line */}
      <div className="absolute left-[31px] top-6 bottom-0 w-[1px] bg-gradient-to-b from-primary/30 to-transparent z-0 hidden sm:block" />

      <AnimatePresence initial={false} mode="popLayout">
        {groupedNotifs.map(([label, items]) => (
          <div key={label} className="space-y-6 relative z-10 transition-all duration-300">
            <div className="flex items-center gap-4 group">
               <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(124,58,237,0.5)] scale-150 ring-4 ring-background" />
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 group-hover:text-primary transition-colors">
                 {label}
               </h3>
               <div className="h-[1px] flex-1 bg-border-color/50" />
            </div>

            <div className="space-y-4 sm:ml-4">
              {items.map((n) => (
                <NotificationCard 
                  key={n.id} 
                  notification={n} 
                  isPinned={pinnedIds.includes(Number(n.id))}
                  onMarkRead={onMarkRead} 
                  onDelete={onDelete} 
                  onAction={onAction}
                  onPin={onPin}
                  onSnooze={onSnooze}
                />
              ))}
            </div>
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationList;
