import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGrowth } from '../context/GrowthContext';

/** Confetti particle */
const Confetti: React.FC = () => {
  const colors = ['#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#f97316'];
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 4 + Math.random() * 6,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1.5,
    rotation: Math.random() * 720 - 360,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: '50%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            y: [0, -200 - Math.random() * 200, 400],
            x: [0, (Math.random() - 0.5) * 200],
            opacity: [1, 1, 0],
            rotate: p.rotation,
            scale: [1, 1.2, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

const UnlockModal: React.FC = () => {
  const { unlockQueue, dismissUnlock } = useGrowth();
  const currentUnlock = unlockQueue[0] || null;
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (currentUnlock) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentUnlock]);

  return (
    <AnimatePresence>
      {currentUnlock && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          onClick={dismissUnlock}
        >
          <motion.div
            initial={{ scale: 0.3, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 100 }}
            className="bg-card border border-border-color rounded-[40px] p-10 max-w-sm w-full text-center space-y-6 shadow-[0_0_100px_rgba(124,58,237,0.3)] relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {showConfetti && <Confetti />}

            {/* Glow effect behind icon */}
            <div className="relative z-10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              </div>
              <motion.span
                className="text-7xl block relative"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10, stiffness: 80, delay: 0.2 }}
              >
                {currentUnlock.badge.icon}
              </motion.span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3 relative z-10"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Achievement Unlocked</p>
              <h3 className="text-2xl font-black tracking-tight">{currentUnlock.badge.name}</h3>
              <p className="text-sm text-muted font-medium">{currentUnlock.badge.description}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary/10 border border-primary/20 rounded-full mx-auto w-fit relative z-10"
            >
              <span className="text-sm">⭐</span>
              <span className="text-sm font-black text-primary">+{currentUnlock.badge.xpReward} XP</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs text-muted font-bold italic relative z-10"
            >
              Keep pushing — great things are ahead! 🚀
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              onClick={dismissUnlock}
              className="px-8 py-3 bg-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg relative z-10"
            >
              🎉 Awesome!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UnlockModal;
