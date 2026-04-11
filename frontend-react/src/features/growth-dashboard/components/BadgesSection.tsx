import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGrowth } from '../context/GrowthContext';
import { BADGES, getCategoryColor } from '../utils/badgeUtils';
import type { Badge } from '../utils/badgeUtils';

const BadgesSection: React.FC = () => {
  const { badges } = useGrowth();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All', icon: '🏅' },
    { id: 'early', label: 'Early', icon: '🌱' },
    { id: 'mid', label: 'Mid', icon: '⭐' },
    { id: 'advanced', label: 'Advanced', icon: '💎' },
    { id: 'legendary', label: 'Legendary', icon: '🏆' },
  ];

  const getCount = (catId: string) => {
    if (catId === 'all') return BADGES.length;
    return BADGES.filter(b => b.category === catId).length;
  };

  const filteredBadges = activeCategory === 'all'
    ? BADGES
    : BADGES.filter(b => b.category === activeCategory);

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card rounded-[32px] p-8 space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-black tracking-tight">Achievement Badges</h3>
          <p className="text-xs text-muted font-bold mt-1">Unlocked {unlockedCount} of {BADGES.length} — You're killing it! 🚀</p>
        </div>
        <div className="flex items-center gap-4 bg-surface p-2 rounded-2xl border border-border-color">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">🏆</div>
          <div>
            <p className="text-sm font-black italic">{Math.round((unlockedCount / BADGES.length) * 100)}% Complete</p>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest leading-none">Total Mastery</p>
          </div>
        </div>
      </div>

      {/* Category tabs (With Counts 🔥) */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 group ${
              activeCategory === cat.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                : 'bg-surface border border-border-color text-muted hover:text-foreground hover:bg-surface-dark'
            }`}
          >
            <span className="text-base group-hover:scale-125 transition-transform">{cat.icon}</span>
            <span>{cat.label}</span>
            <span className={`px-1.5 py-0.5 rounded-lg text-[9px] ${activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-border-color text-muted'}`}>
              {getCount(cat.id)}
            </span>
          </button>
        ))}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredBadges.map((badge, i) => {
          const state = badges.find(b => b.id === badge.id);
          const isUnlocked = state?.unlocked || false;
          const progress = state?.progress || 0;

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedBadge(badge)}
              className={`
                relative p-5 rounded-[28px] cursor-pointer transition-all border group overflow-hidden flex flex-col items-center text-center gap-3
                ${isUnlocked
                  ? 'bg-gradient-to-br ' + getCategoryColor(badge.category) + ' text-white border-transparent shadow-xl hover:scale-105 active:scale-95'
                  : 'bg-surface border-border-color hover:border-primary/40 hover:bg-primary/5'
                }
              `}
            >
              {/* Unlock Glow Pulse (Micro interaction 🔥) */}
              {isUnlocked && (
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse-slow" />
              )}

              <span className={`text-4xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${!isUnlocked ? 'grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-60' : ''}`}>
                {badge.icon}
              </span>

              <div className="space-y-1">
                <p className={`text-[10px] font-black uppercase tracking-widest ${isUnlocked ? 'text-white' : 'text-muted'}`}>
                  {badge.name}
                </p>
                
                {/* BADGE PROGRESS INSIDE CARD (NEW 🔥) */}
                <div className="w-full space-y-1 mt-1">
                  <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider opacity-60">
                    <span>{progress}%</span>
                    <span>{isUnlocked ? '✅' : '🎯'}</span>
                  </div>
                  <div className={`h-1 rounded-full overflow-hidden ${isUnlocked ? 'bg-white/20' : 'bg-border-color'}`}>
                    <motion.div
                      className={`h-full ${isUnlocked ? 'bg-white' : 'bg-primary'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.05 }}
                    />
                  </div>
                </div>
              </div>

              {!isUnlocked && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-black text-primary italic">+{badge.xpReward} XP</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              className="bg-card border border-border-color rounded-[40px] p-8 max-w-sm w-full text-center space-y-6 shadow-[0_0_100px_rgba(124,58,237,0.2)] overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-purple-500 to-amber-500" />
              
              {(() => {
                const state = badges.find(b => b.id === selectedBadge.id);
                const isUnlocked = state?.unlocked || false;
                const progress = state?.progress || 0;
                return (
                  <>
                    <div className="relative inline-block py-2">
                       <span className={`text-7xl block relative z-10 ${!isUnlocked ? 'grayscale opacity-40' : 'animate-bounce-slow'}`}>{selectedBadge.icon}</span>
                       {isUnlocked && <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />}
                    </div>
                    
                    <div>
                      <h4 className="text-2xl font-black tracking-tight">{selectedBadge.name}</h4>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-2">{selectedBadge.category} Tier</p>
                      <p className="text-sm text-muted font-semibold px-4">{selectedBadge.description}</p>
                    </div>

                    <div className="bg-surface/50 p-6 rounded-[32px] border border-border-color space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted">
                          <span>Current Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-4 bg-surface rounded-full overflow-hidden border border-border-color p-1">
                          <motion.div
                            className={`h-full rounded-full ${isUnlocked ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-primary shadow-[0_0_10px_rgba(124,58,237,0.5)]'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.2 }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-2">
                        <div className="flex items-center gap-3 text-xs font-bold text-muted justify-center">
                          <span className="w-8 h-8 rounded-lg bg-surface-dark flex items-center justify-center">🎯</span>
                          <span>{selectedBadge.requirement}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold text-muted justify-center">
                          <span className="w-8 h-8 rounded-lg bg-surface-dark flex items-center justify-center">⭐</span>
                          <span>+{selectedBadge.xpReward} XP Reward</span>
                        </div>
                      </div>
                    </div>

                    {isUnlocked ? (
                      <div className="py-4 border-t border-border-color text-emerald-500 font-black italic">
                         🎉 Achievement Mastered
                      </div>
                    ) : (
                      <div className="py-2">
                         <p className="text-xs font-black text-primary animate-pulse italic">
                           {progress >= 75 ? "You're at the finish line! 🏁" :
                            progress >= 50 ? "Halfway point passed! 🔥" :
                            "Keep pushing to unlock! 💎"}
                         </p>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedBadge(null)}
                      className="w-full px-8 py-4 bg-surface border border-border-color rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
                    >
                      Close Achievement
                    </button>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BadgesSection;
