
import React from 'react';
import { Star, Plus, Check, Search, BookOpen, Terminal, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import ProgressBar from './ProgressBar';

interface SkillCardProps {
  skill: {
    id: number;
    skillName: string;
    category?: string;
  };
  isSpecialized: boolean;
  completedModules: number;
  totalModules: number;
  mode: 'discovery' | 'specialization';
  onAdd: (e: React.MouseEvent) => void;
  onRemove: (e: React.MouseEvent) => void;
  onContinue: () => void;
  onViewRoadmap: () => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ 
  skill, 
  isSpecialized, 
  completedModules, 
  totalModules, 
  mode,
  onAdd, 
  onRemove, 
  onContinue,
  onViewRoadmap
}) => {
  const progress = (completedModules / totalModules) * 100;
  const isAllSkillsMode = mode === 'discovery';

  return (
    <motion.div 
      layout
      whileHover={{ y: -8 }}
      className={`bg-white p-8 rounded-[3rem] border transition-all duration-500 relative flex flex-col group h-full ${
        isSpecialized ? 'border-primary-200 shadow-2xl shadow-primary-600/10 ring-1 ring-primary-50' : 'border-slate-100 shadow-sm'
      }`}
    >
      {/* Specialized Tag */}
      {isSpecialized && (
        <div className="absolute -top-3 left-8 px-4 py-1.5 bg-primary-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 animate-bounce-subtle z-10">
           <Star size={12} className="fill-current" /> Specialized
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className={`w-16 h-16 rounded-[2.2rem] flex items-center justify-center text-2xl font-black shadow-xl transition-all ${
          isSpecialized ? 'bg-primary-600 text-white shadow-primary-200' : 'bg-slate-50 text-slate-300'
        }`}>
          {skill.skillName[0].toUpperCase()}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="bg-slate-50 text-slate-400 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100 italic">
            {skill.category || 'Standard Domain'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 mb-4 flex-1">
        <h3 className="text-xl font-black text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight leading-none">{skill.skillName}</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60 flex items-center gap-2">
          <Terminal size={12} /> Master Curriculum
        </p>
      </div>

      {/* Specialization Context */}
      {isSpecialized && (
        <div className="space-y-6 mt-6">
          <ProgressBar 
            progress={progress} 
            label="Your Progress" 
            completedText={`✔ ${completedModules} / ${totalModules} steps completed`}
          />
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-2">
         {isAllSkillsMode ? (
           <button 
             onClick={isSpecialized ? onRemove : onAdd}
             className={`h-14 w-full rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
               isSpecialized 
               ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100' 
               : 'bg-primary-600 text-white shadow-lg shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1'
             }`}
           >
             {isSpecialized ? <><Check size={16} /> Specialized</> : <><Plus size={16} /> Add to Focus</>}
           </button>
         ) : (
           <div className="flex gap-2">
              <button 
                onClick={onContinue}
                className="flex-1 h-16 bg-primary-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-widest shadow-2xl shadow-primary-400/20 hover:bg-primary-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
              >
                Continue <BookOpen size={18} />
              </button>
              <button 
                onClick={onViewRoadmap}
                className="w-20 h-16 bg-slate-50 border border-slate-100 text-slate-400 rounded-[2rem] font-black flex items-center justify-center hover:bg-slate-100 transition-all"
                title="View Full Roadmap"
              >
                 <ShieldCheck size={24} />
              </button>
           </div>
         )}
         
         {!isAllSkillsMode && (
           <button 
             onClick={() => {/* Navigate to mentors */}}
             className="h-12 bg-white border border-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-50 hover:text-primary-600 hover:border-primary-100 transition-all flex items-center justify-center gap-2 mt-1"
           >
             <Search size={12} /> Explore Mentors
           </button>
         )}
      </div>
    </motion.div>
  );
};

export default SkillCard;
