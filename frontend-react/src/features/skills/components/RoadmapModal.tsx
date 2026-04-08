
import React from 'react';
import { X, CheckCircle2, Circle, Zap, Sparkles, Milestone, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RoadmapModalProps {
  skill: {
    id: number;
    skillName: string;
    category?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  roadmap: Array<{ id: string; title: string; completed: boolean }>;
  onToggleStep: (stepId: string) => void;
  onFindMentor: () => void;
}

const RoadmapModal: React.FC<RoadmapModalProps> = ({ 
  skill, 
  isOpen, 
  onClose, 
  roadmap, 
  onToggleStep,
  onFindMentor
}) => {
  if (!skill) return null;

  const completedCount = roadmap.filter(s => s.completed).length;
  const totalCount = roadmap.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 bg-slate-900/60 backdrop-blur-md" onClick={onClose}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] text-left border border-white/20"
            onClick={e => e.stopPropagation()}
          >
            {/* Header Layer */}
            <div className="p-10 pb-8 flex justify-between items-start border-b border-slate-50 bg-slate-50/50">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-primary-600 text-white rounded-[2.2rem] flex items-center justify-center text-3xl font-black shadow-2xl shadow-primary-200">
                  {skill.skillName[0].toUpperCase()}
                </div>
                <div>
                   <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] font-sans flex items-center gap-2 mb-1">
                      <Milestone size={14} /> Domain Master Path
                   </p>
                   <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase italic">{skill.skillName}</h2>
                   <div className="flex gap-2 mt-4">
                      <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-xl border border-emerald-100 flex items-center gap-2">
                         <CheckCircle2 size={12} /> {completedCount} / {totalCount} Modules Verified
                      </span>
                      <span className="px-4 py-1.5 bg-primary-50 text-primary-600 text-[9px] font-black uppercase tracking-widest rounded-xl border border-primary-100">
                         {Math.round(progress)}% Mastery
                      </span>
                   </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 bg-white text-slate-400 hover:text-slate-600 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm border border-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Path Content */}
            <div className="flex-1 overflow-y-auto p-12 pt-10 space-y-8 custom-scrollbar">
               <div className="space-y-6">
                  {roadmap.map((step, i) => (
                    <motion.div 
                      key={step.id} 
                      layout
                      className={`flex gap-8 relative items-start group cursor-pointer transition-all ${step.completed ? 'opacity-60 grayscale' : 'hover:translate-x-2'}`}
                      onClick={() => onToggleStep(step.id)}
                    >
                      {/* Connector Line */}
                      {i < roadmap.length - 1 && (
                        <div className={`absolute left-5 top-10 bottom-0 w-1 ${
                          step.completed && roadmap[i+1]?.completed ? 'bg-emerald-200' : 'bg-slate-100'
                        } rounded-full`} />
                      )}
                      
                      {/* Checkpoint Icon */}
                      <button className={`w-10 h-10 rounded-[1.2rem] flex items-center justify-center z-10 transition-all ${
                        step.completed ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-200' : 'bg-white border-4 border-slate-50 text-slate-200 hover:border-primary-100 hover:text-primary-400'
                      }`}>
                         {step.completed ? <CheckCircle2 size={24} /> : <Circle size={20} className="fill-white" />}
                      </button>

                      {/* Info */}
                      <div className="flex-1 pb-12">
                        <div className="flex items-center justify-between mb-2">
                           <h4 className={`text-xl font-black tracking-tighter ${
                             step.completed ? 'text-slate-900 line-through' : 'text-slate-900 group-hover:text-primary-600'
                           }`}>
                             {step.title}
                           </h4>
                           {!step.completed && i === roadmap.findIndex(s => !s.completed) && (
                             <span className="text-[10px] font-black tracking-widest uppercase text-primary-500 bg-primary-50 px-3 py-1 rounded-xl border border-primary-100 animate-pulse">
                               Next Step
                             </span>
                           )}
                        </div>
                        <p className="text-sm font-bold text-slate-400 leading-relaxed italic max-w-sm">
                           {step.completed ? 'Domain module verified and added to profile registry.' : 'Click to initialize module learning session and mark as completed.'}
                        </p>
                      </div>

                      {/* Ripple/Action Visual */}
                      {!step.completed && (
                        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                           <Zap size={16} className="text-primary-600" />
                        </div>
                      )}
                    </motion.div>
                  ))}
               </div>
            </div>

            {/* Footer Actions */}
            <div className="p-10 bg-slate-900 text-white border-t border-slate-800 flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white/10 rounded-3xl flex items-center justify-center text-primary-400 shadow-inner border border-white/5">
                     <Sparkles size={28} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-[3px] text-primary-400">System Feedback</p>
                     <p className="text-lg font-black">{Math.round(progress)}% Expertise Logged</p>
                  </div>
               </div>
               <button 
                onClick={onFindMentor}
                className="px-10 py-5 bg-primary-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-primary-500/20 hover:bg-primary-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-4"
               >
                 <ArrowRight size={18} /> Connect with Expert
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RoadmapModal;
