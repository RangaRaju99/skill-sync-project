
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2, Calendar, Star, Zap, Settings, Bell, Circle, Pin, Clock } from 'lucide-react';
import type { NotificationDto } from '@/hooks/useNotifications';

interface NotificationCardProps {
  notification: NotificationDto;
  isPinned?: boolean;
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
  onAction: (notification: NotificationDto) => void;
  onPin?: (id: number) => void;
  onSnooze?: (id: number) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ 
  notification, 
  isPinned,
  onMarkRead, 
  onDelete, 
  onAction,
  onPin,
  onSnooze
}) => {
  const getPriorityInfo = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes('URGENT') || t.includes('IMPORTANT') || t.includes('ALERT')) {
      return { label: 'Important', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: <Star size={14} className="fill-red-500" /> };
    }
    if (t.includes('SESSION') || t.includes('MENTOR')) {
      return { label: 'Activity', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: <Calendar size={14} /> };
    }
    return { label: 'System', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: <Settings size={14} /> };
  };

  const priority = getPriorityInfo(notification.type);
  const isRead = notification.isRead;

  // Step 12: Real-time time format logic helper
  const getTimeAgo = (iso: any) => {
    const parseDate = (input: any) => {
      if (Array.isArray(input)) return new Date(input[0], input[1] - 1, input[2], input[3] || 0, input[4] || 0);
      return new Date(input);
    };
    const d = parseDate(iso);
    if (isNaN(d.getTime())) return '';
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.005 }}
      className={`group relative overflow-hidden p-6 rounded-[28px] border transition-all duration-300 ${
        !isRead 
          ? 'bg-white dark:bg-slate-900 border-primary shadow-xl shadow-primary/5' 
          : 'bg-surface/30 dark:bg-slate-900/40 border-border-color opacity-80'
      } ${isPinned ? 'ring-2 ring-primary/20 shadow-primary/20' : ''}`}
    >
      {/* Pinned Indicator (Step 2 UI) */}
      {isPinned && (
        <div className="absolute top-4 right-4 text-primary animate-pulse">
           <Pin size={12} className="rotate-45" />
        </div>
      )}
      {/* Unread Highlight Line (Step 7) */}
      {!isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-r-full" />
      )}

      <div className="flex gap-5 relative z-10">
        {/* Step 6: Icon/Badge area */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-sm ${priority.bg} ${priority.color} ${priority.border} border`}>
          {notification.type.toUpperCase().includes('LEVEL') ? <Zap size={24} /> : <Bell size={24} />}
        </div>

        {/* Content (Step 6) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${priority.bg} ${priority.color}`}>
              {priority.label}
            </span>
            {!isRead && (
              <Circle size={8} className="fill-primary text-primary animate-pulse" />
            )}
            <span className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] ml-auto">
              {getTimeAgo(notification.createdAt)}
            </span>
          </div>

          <h4 className={`text-base tracking-tight mb-1 truncate ${!isRead ? 'font-black text-foreground' : 'font-bold text-muted-foreground'}`}>
             {notification.message.split('\n')[0]}
          </h4>
          
          <p className={`text-xs leading-relaxed line-clamp-2 ${!isRead ? 'font-medium text-muted-foreground' : 'font-medium text-muted-foreground/60 italic font-normal'}`}>
             {notification.message.split('\n').length > 1 ? notification.message.split('\n')[1] : 'Stay updated with your latest profile growth items.'}
          </p>

          {/* Action Button (Step 6) */}
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => onAction(notification)}
              className="px-6 py-2 bg-foreground dark:bg-white text-background dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              View
            </button>
            
            {/* Step 8: Hover specific actions (Desktop Only for clarity) */}
            <div className="hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
              {!isRead && (
                <button
                  onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); }}
                  className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                  title="Mark as read"
                >
                  <Check size={18} />
                </button>
              )}
              {onPin && (
                <button
                  onClick={(e) => { e.stopPropagation(); onPin(notification.id); }}
                  className={`p-2.5 rounded-xl transition-all ${isPinned ? 'text-primary bg-primary/5 border border-primary/20' : 'text-slate-400 hover:text-primary hover:bg-primary/5'}`}
                  title={isPinned ? 'Unpin' : 'Pin to top'}
                >
                  <Pin size={18} className={isPinned ? '' : 'rotate-45'} />
                </button>
              )}
              {onSnooze && (
                <button
                  onClick={(e) => { e.stopPropagation(); onSnooze(notification.id); }}
                  className="p-2.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                  title="Snooze for 1 hour"
                >
                  <Clock size={18} />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationCard;
