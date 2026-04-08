
import React from 'react';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecommendedSkill {
  id: number;
  skillName: string;
  category: string;
  reason: string;
}

interface RecommendationSectionProps {
  recommendations: RecommendedSkill[];
  onStartSkill: (skillName: string) => void;
}

const RecommendationSection: React.FC<RecommendationSectionProps> = ({ 
  recommendations, 
  onStartSkill 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
         <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <Sparkles size={16} className="fill-current" />
         </div>
         <h3 className="text-sm font-black uppercase tracking-[3px] text-slate-400">Strategic Recommendations</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((skill, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary-600/5 transition-all group flex flex-col justify-between h-full"
          >
            <div className="space-y-4">
               <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg shadow-primary-200">
                     {skill.skillName[0].toUpperCase()}
                  </div>
                  <span className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-1 shrink-0">
                     <TrendingUp size={10} /> Next-level
                  </span>
               </div>
               <div>
                  <h4 className="text-lg font-black text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{skill.skillName}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-60 italic">{skill.category}</p>
               </div>
               <p className="text-xs font-bold text-slate-400 leading-relaxed italic line-clamp-2">
                  {skill.reason}
               </p>
            </div>
            
            <button 
              onClick={() => onStartSkill(skill.skillName)}
              className="mt-6 w-full h-12 bg-slate-50 border border-slate-100 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all flex items-center justify-center gap-3 group/btn"
            >
              Initialize Deployment <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ))}
        {/* Next Action Placeholder if needed */}
        {recommendations.length === 0 && (
          <div className="col-span-full h-32 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-bold italic">
             No recommendations found based on current profile matrix. 
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationSection;
