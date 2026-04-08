
import React from 'react';
import { Brain, Star, Flame, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface SkillSummaryProps {
  totalSkills: number;
  activeSkills: number;
  completedSkills: number;
  userLevel: number;
  xpPoints: number;
}

const SkillSummary: React.FC<SkillSummaryProps> = ({ 
  totalSkills, 
  activeSkills, 
  completedSkills,
  userLevel, 
  xpPoints 
}) => {
  const completionRate = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;

  const stats = [
    { label: 'Total Matrix', value: totalSkills, icon: Brain, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Active Learning', value: activeSkills, icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Current Level', value: `Lv. ${userLevel}`, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'XP Gained', value: xpPoints, icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-xl hover:shadow-primary-600/5 transition-all"
            >
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} className="fill-current opacity-20" />
                <stat.icon size={20} className="absolute" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-black text-slate-900">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Completion Ring/Progress */}
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] flex items-center gap-6 min-w-[300px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 blur-[60px] group-hover:bg-primary-600/40 transition-all" />
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[3px] text-primary-400">Mastery</p>
            <h4 className="text-3xl font-black">{completionRate}%</h4>
            <p className="text-[10px] font-bold text-slate-400 mt-1 italic">Matrix completion status</p>
          </div>
          <div className="relative w-20 h-20 shrink-0">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-800" />
                <motion.circle 
                   cx="40" cy="40" r="36" 
                   stroke="currentColor" strokeWidth="6" fill="transparent" 
                   className="text-primary-500" 
                   strokeDasharray={226}
                   initial={{ strokeDashoffset: 226 }}
                   animate={{ strokeDashoffset: 226 - (completionRate / 100) * 226 }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center">
                <Trophy size={20} className="text-primary-500" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillSummary;
