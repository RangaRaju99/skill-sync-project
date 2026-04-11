import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, CheckCircle } from 'lucide-react';
import type { Skill } from '@/services/skill.service';

interface SkillSelectorProps {
  selectedSkills: string[];
  availableSkills: Skill[];
  isEditing: boolean;
  onToggleSkill: (skill: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const SkillSelector: React.FC<SkillSelectorProps> = ({
  selectedSkills,
  availableSkills,
  isEditing,
  onToggleSkill,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="space-y-8">
      {/* Selected Skills Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest pl-1">Your Proficiency</p>
          <span className="text-[9px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">
            {selectedSkills.length} Expertise Points
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <AnimatePresence mode="popLayout">
            {selectedSkills.length > 0 ? (
              selectedSkills.map((skill) => (
                <motion.div
                  key={skill}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="px-5 py-3 bg-white/5 border border-white/10 text-foreground rounded-2xl text-xs font-bold flex items-center gap-3 group/tag hover:border-primary/40 transition-all shadow-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                  {skill}
                  {isEditing && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => onToggleSkill(skill)}
                      className="w-5 h-5 rounded-lg hover:bg-rose-500/20 flex items-center justify-center text-muted-foreground/40 hover:text-rose-500 transition-all ml-1"
                    >
                      <X size={14} />
                    </motion.button>
                  )}
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full p-10 border-2 border-dashed border-white/10 rounded-[32px] text-center"
              >
                <p className="text-sm font-bold text-muted-foreground/40 italic">No expertise added yet</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Skill Discovery / Search (Only when editing) */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6 pt-8 border-t border-white/5 overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-black uppercase text-primary tracking-widest">Discovery Directory</p>
                <p className="text-[10px] font-bold text-muted-foreground/60 italic">Click to toggle skills</p>
              </div>
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-all" size={18} />
                <input
                  placeholder="Search for technologies, tools, or methodologies..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[24px] py-4.5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all"
                />
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableSkills
                .filter((s) => s.skillName.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((skill) => {
                  const isSelected = selectedSkills.includes(skill.skillName);
                  return (
                    <motion.div
                      key={skill.id}
                      layout
                      onClick={() => onToggleSkill(skill.skillName)}
                      className={`
                        p-4 rounded-[20px] text-xs font-bold cursor-pointer transition-all flex flex-col gap-2 border group relative overflow-hidden
                        ${isSelected
                          ? 'bg-primary border-primary text-white shadow-lg'
                          : 'bg-white/5 border-white/10 text-muted-foreground hover:border-primary/40 hover:text-primary'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate pr-4">{skill.skillName}</span>
                        {isSelected && <CheckCircle size={12} />}
                      </div>
                      {skill.category && (
                        <span className={`text-[9px] font-black uppercase tracking-widest opacity-40 ${isSelected ? 'text-white' : ''}`}>
                          {skill.category}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SkillSelector;
