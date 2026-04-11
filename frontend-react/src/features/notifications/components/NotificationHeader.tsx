
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCheck, Trash2, ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationHeaderProps {
  totalCount: number;
  unreadCount: number;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

const NotificationHeader: React.FC<NotificationHeaderProps> = ({ 
  totalCount, 
  unreadCount, 
  onMarkAllRead, 
  onClearAll 
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-10 mb-12 relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -mr-32 -mt-32 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-1000" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full -ml-32 -mb-32 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-1000" />

      {/* Back Button */}
      <button
        onClick={() => navigate('/profile')}
        className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-all group/back mb-10 hover:-translate-x-1"
      >
        <ArrowLeft size={16} className="group-hover/back:-translate-x-1 transition-transform" />
        Return to Journey
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[28px] bg-primary text-white shadow-xl shadow-primary/20 flex items-center justify-center animate-pulse-slow">
              <Bell size={28} />
            </div>
            <h2 className="text-4xl font-black tracking-tight text-foreground dark:text-white">
              Notifications
            </h2>
          </div>
          <div className="flex items-center gap-6 ml-20">
            <p className="text-sm font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic">
               Total: {totalCount}
            </p>
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest ring-1 ring-red-500/20">
                {unreadCount} UNREAD
              </span>
            )}
          </div>
        </div>

        {/* Action Controls (Step 3) */}
        <div className="flex items-center gap-4 self-end">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-4 px-6 py-3.5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 group/mark"
            >
              <CheckCheck size={16} className="group-hover/mark:scale-125 transition-transform" />
              ✔ Mark all as read
            </button>
          )}
          
          {totalCount > 0 && (
            <button
              onClick={onClearAll}
              className="px-6 py-3.5 bg-surface/80 border border-border-color text-muted-foreground/60 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center gap-4 group/clear"
            >
              <Trash2 size={16} className="group-hover/clear:rotate-12 transition-transform" />
              🧹 Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationHeader;
