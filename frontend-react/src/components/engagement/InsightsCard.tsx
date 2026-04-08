
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { generateInsights, type ActivityInsight } from '@/features/engagement/engagementUtils';

const InsightsCard: React.FC = () => {
  const [insights, setInsights] = useState<ActivityInsight[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const data = generateInsights();
    setInsights(data);

    if (data.length > 1) {
      const interval = setInterval(() => {
        setIndex(prev => (prev + 1) % data.length);
      }, 8000); // Rotate insights every 8 seconds as per design
      return () => clearInterval(interval);
    }
  }, []);

  if (insights.length === 0) return null;

  const current = insights[index];

  return (
    <div className="p-8 bg-foreground text-background dark:bg-white dark:text-slate-900 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden relative group">
      {/* Background Sparkles / Effects (Step 5 UI) */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[40px] rounded-full -mr-16 -mt-16 animate-pulse-slow pointer-events-none group-hover:bg-primary/40 transition-all duration-1000" />
      <div className="absolute top-1/2 left-0 w-16 h-16 bg-purple-500/20 blur-[20px] rounded-full -ml-8 -mt-8 opacity-20 pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-background/10 dark:bg-slate-100 border border-white/20 dark:border-slate-200 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
             <Sparkles size={24} />
          </div>
          <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                Activity Insights
             </p>
             <h4 className="text-sm font-black italic tracking-widest text-background dark:text-slate-900">
                SMART UX ENGINE
             </h4>
          </div>
        </div>

        <div className="min-h-[4rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="flex items-center gap-6"
            >
               <span className="text-4xl filter drop-shadow-lg group-hover:rotate-12 transition-transform duration-500">
                  {current.icon}
               </span>
               <p className="text-xl font-black italic tracking-tight leading-tight max-w-[200px]">
                  {current.text}
               </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center mt-4">
           <div className="flex gap-2">
              {insights.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === index ? 'bg-primary w-6' : 'bg-background/20 dark:bg-slate-200'}`} 
                />
              ))}
           </div>
           <span className="text-[9px] font-black uppercase tracking-widest opacity-20 italic">
              AI Powered Insights
           </span>
        </div>
      </div>
    </div>
  );
};

export default InsightsCard;
