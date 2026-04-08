
import React from 'react';
import { motion } from 'framer-motion';
import { BellOff, Bell, Settings, Filter } from 'lucide-react';
import { useEngagement } from '@/features/engagement/EngagementContext';

const NotificationControls: React.FC = () => {
  const { preferences, muteCategory, unmuteCategory } = useEngagement();

  const categories = [
    { id: 'sessions', label: 'Sessions', icon: <Bell size={14} />, color: 'emerald-500' },
    { id: 'updates', label: 'Updates', icon: <Bell size={14} />, color: 'blue-500' }
  ];

  const handleToggle = (id: string, isMuted: boolean) => {
    if (isMuted) unmuteCategory(id);
    else muteCategory(id);
  };

  return (
    <div className="p-8 bg-surface/50 border border-border-color rounded-[32px] shadow-2xl shadow-primary/5 hover:shadow-primary/20 transition-all duration-700 relative overflow-hidden group">
      {/* Background decoration (Step 2 UI) */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-1000" />
      
      <div className="flex flex-col gap-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
             <Settings size={22} />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-foreground dark:text-white">
              Snooze Settings
            </h4>
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] italic">
               ⚙️ Preferences
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {categories.map((cat, idx) => {
            const isMuted = preferences.mutedCategories.includes(cat.id);
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group/cat ${
                  isMuted 
                    ? 'bg-red-500/5 border-red-500/20 text-red-500' 
                    : 'bg-white dark:bg-slate-900 border-border-color text-foreground'
                }`}
              >
                <div className="flex items-center gap-5">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover/cat:scale-110 ${
                     isMuted ? 'bg-red-500/10' : 'bg-surface dark:bg-slate-800'
                   }`}>
                      {isMuted ? <BellOff size={18} /> : cat.icon}
                   </div>
                   <div className="space-y-1">
                      <p className={`text-xs font-black uppercase tracking-widest leading-none ${isMuted ? 'text-red-500' : 'text-foreground'}`}>
                         {cat.label}
                      </p>
                      <span className="text-[9px] font-bold text-muted-foreground/40 italic">
                         {isMuted ? 'Notifications Muted' : 'Direct Alerts Active'}
                      </span>
                   </div>
                </div>

                <button
                  onClick={() => handleToggle(cat.id, isMuted)}
                  className={`relative w-12 h-6 rounded-full transition-all duration-500 ring-2 ring-transparent active:ring-primary/20 ${
                    isMuted ? 'bg-red-500/20' : 'bg-primary'
                  }`}
                >
                   <motion.div
                     initial={false}
                     animate={{ x: isMuted ? 4 : 28 }}
                     className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                   />
                </button>
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 p-4 bg-surface dark:bg-slate-800 rounded-2xl border border-border-color mt-4">
           <Filter size={14} className="text-muted-foreground/40" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic leading-snug">
              Updates occur in background. <br /> Settings persist across sessions.
           </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationControls;
