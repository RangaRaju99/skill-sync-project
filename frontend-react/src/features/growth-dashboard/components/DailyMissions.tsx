import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGrowth } from '../context/GrowthContext';
import { useNavigate } from 'react-router-dom';

const DailyMissions: React.FC = () => {
  const { missions, missionState, completeMission, todayStatus } = useGrowth();
  const navigate = useNavigate();

  const handleMissionClick = (mission: typeof missions[0]) => {
    const state = missionState.missions.find(m => m.id === mission.id);
    if (state?.completed) return;

    // Navigate to relevant page and complete mission
    switch (mission.checkKey) {
      case 'visit_dashboard':
        completeMission(mission.id);
        break;
      case 'visit_profile':
        completeMission(mission.id);
        navigate('/profile');
        break;
      case 'explore_mentors':
        completeMission(mission.id);
        navigate('/mentors');
        break;
      case 'view_skills':
        completeMission(mission.id);
        navigate('/skills');
        break;
      case 'check_notifications':
        completeMission(mission.id);
        navigate('/notifications');
        break;
      default:
        completeMission(mission.id);
    }
  };

  const completedCount = missionState.missions.filter(m => m.completed).length;
  const totalMissions = missions.length;
  const allDone = completedCount === totalMissions && totalMissions > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="glass-card rounded-[32px] p-8 space-y-6 overflow-hidden relative"
    >
      {/* Background glow when safe */}
      {todayStatus.isSafe && (
        <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h3 className="text-xl font-black tracking-tight">Today Status</h3>
          <p className="text-xs text-muted font-bold mt-1">Complete tasks to maintain your streak 🔥</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
            todayStatus.isSafe 
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
          }`}>
             {todayStatus.isSafe ? '🔥 Streak Protected' : '⚡ 1 Task Remaining'}
          </div>
          <div className="px-3 py-2 bg-surface border border-border-color rounded-xl text-xs font-black">
            {completedCount}/{totalMissions}
          </div>
        </div>
      </div>

      {/* Mission progress bars (Small dots) */}
      <div className="flex gap-2 relative z-10">
        {missions.map((_, i) => {
          const isDone = missionState.missions[i]?.completed;
          return (
            <div key={i} className="flex-1 space-y-1.5">
               <div className={`h-2 rounded-full transition-all duration-500 ${isDone ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-border-color'}`} />
            </div>
          );
        })}
      </div>

      {/* Mission list */}
      <div className="space-y-4 pt-2 relative z-10">
        {missions.map((mission, i) => {
          const state = missionState.missions.find(m => m.id === mission.id);
          const isDone = state?.completed || false;

          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              onClick={() => handleMissionClick(mission)}
              className={`
                flex items-center gap-5 p-5 rounded-[24px] cursor-pointer transition-all border group relative overflow-hidden
                ${isDone
                  ? 'bg-emerald-500/5 border-emerald-500/15 scale-95 opacity-80'
                  : 'bg-surface border-border-color hover:border-primary/40 hover:bg-surface-dark hover:scale-[1.02] active:scale-95'
                }
              `}
            >
              {/* Checkmark pop animation (Micro-interaction 🔥) */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-all duration-300 ${
                isDone 
                ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/30 rotate-[360deg]' 
                : 'bg-surface border border-border-color group-hover:border-primary/40'
              }`}>
                <AnimatePresence mode="wait">
                  {isDone ? (
                    <motion.span 
                      key="checked" 
                      initial={{ scale: 0, rotate: -180 }} 
                      animate={{ scale: 1, rotate: 0 }} 
                      className="inline-block"
                    >
                      ✅
                    </motion.span>
                  ) : (
                    <motion.span 
                      key="icon" 
                      initial={{ scale: 0.8 }} 
                      animate={{ scale: 1 }}
                    >
                      {mission.icon}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-base font-black ${isDone ? 'line-through text-muted/60' : ''}`}>{mission.title}</p>
                <p className="text-[11px] text-muted font-bold opacity-80">{mission.description}</p>
              </div>

              <div className={`flex flex-col items-end gap-1 ${isDone ? 'opacity-40' : ''}`}>
                 <span className="text-[10px] font-black text-primary">XP</span>
                 <span className="text-sm font-black">+{mission.xpReward}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* All complete celebration */}
      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[32px] mt-2"
        >
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-xl shadow-emerald-500/30 shrink-0">
             🏁
          </div>
          <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-400">All targets met!</h4>
          <p className="text-sm text-muted font-bold mt-2">Your streak is safe. New challenges arrive in 14 hours. 🏆</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DailyMissions;
