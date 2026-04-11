
import React from 'react';
import { Target, ArrowRight, Zap, Flame, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface NextActionCardProps {
  nextSkill: string;
  nextStep: string;
  daysAgo: number;
  onContinue: () => void;
}

const NextActionCard: React.FC<NextActionCardProps> = ({ 
  nextSkill, 
  nextStep, 
  daysAgo, 
  onContinue 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -5 }}
      className="bg-primary-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-primary-500/20 flex flex-col justify-between h-full relative overflow-hidden group min-h-[360px]"
    >
      {/* Background Micro-Interactions */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] group-hover:bg-white/20 transition-all rounded-full" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary-800/40 blur-[40px] group-hover:bg-primary-800/60 transition-all rounded-full" />

      <div className="relative z-10 space-y-8">
        <div className="flex justify-between items-center">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                 <Target size={20} className="text-white" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[4px] text-primary-200">Next Action</h3>
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black text-primary-300">
              <Clock size={12} /> Last active: {daysAgo} days ago
           </div>
        </div>

        <div className="space-y-4">
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary-300 opacity-60">Continue Master Session</p>
              <h2 className="text-4xl font-black tracking-tight leading-none uppercase italic">{nextSkill}</h2>
           </div>
           
           <div className="flex items-center gap-4 py-6 border-y border-white/10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary-200">
                 <Zap size={24} className="fill-current" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary-300">Current Milestone</p>
                 <p className="text-lg font-bold text-white break-words">{nextStep}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="relative z-10 pt-10">
         <button 
           onClick={onContinue}
           className="w-full py-5 bg-white text-primary-700 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-slate-50 hover-scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
         >
           Initialize Session <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
         </button>
         <div className="flex items-center justify-center gap-2 mt-4 text-[10px] font-black text-primary-300 uppercase tracking-widest opacity-60">
            <Flame size={12} /> XP Reward Pending Deployment
         </div>
      </div>
    </motion.div>
  );
};

export default NextActionCard;
