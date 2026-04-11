import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGrowth } from '../context/GrowthContext';
import { generateGridData, getIntensityLevel } from '../utils/streakUtils';

const INTENSITY_COLORS = [
  'bg-border-color',
  'bg-emerald-300/60',
  'bg-emerald-400/70',
  'bg-emerald-500/80',
  'bg-emerald-600',
];

const INTENSITY_COLORS_DARK = [
  'dark:bg-slate-700',
  'dark:bg-emerald-900/60',
  'dark:bg-emerald-700/70',
  'dark:bg-emerald-600/80',
  'dark:bg-emerald-500',
];

const StreakGrid: React.FC = () => {
  const { streak } = useGrowth();
  const gridData = generateGridData(streak, 18);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; count: number; actions: string[] } | null>(null);

  // Group into weeks (columns of 7)
  const weeks: typeof gridData[] = [];
  for (let i = 0; i < gridData.length; i += 7) {
    weeks.push(gridData.slice(i, i + 7));
  }

  const today = new Date().toISOString().split('T')[0];
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  const legend = [
    { label: '0 Active', color: 'bg-border-color' },
    { label: '1 Active', color: 'bg-emerald-300' },
    { label: 'Moderate', color: 'bg-emerald-500' },
    { label: 'Peak 🔥', color: 'bg-emerald-700' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card rounded-[32px] p-8 space-y-6 relative group/grid"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black tracking-tight">Activity Meaning</h3>
          <p className="text-xs text-muted font-medium mt-1">Your daily engagement over the last 18 weeks</p>
        </div>
        
        {/* ACTIVITY LEGEND (NEW 🔥) */}
        <div className="flex items-center gap-3 bg-surface/50 p-2 rounded-xl border border-border-color">
          {legend.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${item.color}`} />
              <span className="text-[10px] font-black uppercase tracking-wider text-muted/60">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid container with comeback hook (NEW 🔥) */}
      <div className="space-y-4">
        {streak.currentStreak === 0 && streak.bestStreak > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-orange-500/10 border border-orange-500/20 text-orange-600 rounded-2xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">😢</span>
              <div>
                <p className="text-sm font-black">You missed yesterday</p>
                <p className="text-xs font-medium">Start a new streak and beat your best: <span className="font-black underline">{streak.bestStreak} days</span></p>
              </div>
            </div>
            <button className="px-4 py-2 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20">
              Recover Now 🚀
            </button>
          </motion.div>
        )}

        <div className="flex gap-[3px] overflow-x-auto pb-4 scroll-smooth">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-2 flex-shrink-0">
            {dayLabels.map((label, i) => (
              <div key={i} className="h-[14px] flex items-center">
                <span className="text-[9px] font-bold text-muted/60 w-6">{label}</span>
              </div>
            ))}
          </div>

          {/* Grid cells */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => {
                const intensity = getIntensityLevel(day.count);
                const isToday = day.date === today;
                return (
                  <motion.div
                    key={day.date}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: (wi * 7 + di) * 0.001, duration: 0.2 }}
                    className={`
                      w-[15px] h-[15px] rounded-[3px] cursor-pointer transition-all duration-200
                      ${INTENSITY_COLORS[intensity]} ${INTENSITY_COLORS_DARK[intensity]}
                      ${isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
                      hover:scale-[1.3] hover:z-50 hover:shadow-lg relative
                    `}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        x: rect.left + rect.width / 2,
                        y: rect.top - 8,
                        date: day.date,
                        count: day.count,
                        actions: day.actions,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-[200] pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-card glass-effect border border-border-color rounded-[20px] p-4 shadow-2xl text-center min-w-[180px] animate-in fade-in zoom-in duration-200">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
              {new Date(tooltip.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <p className="text-xl font-black">
              {tooltip.count === 0 ? 'No activity' : `${tooltip.count} task${tooltip.count > 1 ? 's' : ''}`}
            </p>
            <p className="text-[10px] text-muted font-bold uppercase tracking-wider mt-1 italic">
              {tooltip.count >= 2 ? 'Peak Activity 🔥' : tooltip.count === 1 ? 'Consistent' : 'Rest day'}
            </p>
            {tooltip.actions.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border-color flex flex-wrap justify-center gap-1">
                {tooltip.actions.slice(0, 3).map((a, i) => (
                  <span key={i} className="text-[8px] bg-surface-dark px-1.5 py-0.5 rounded-md font-bold text-muted-foreground truncate max-w-[120px]">{a}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StreakGrid;
