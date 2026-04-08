
import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  label?: string;
  completedText?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, completedText, className = "" }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span>{label}</span>
        <span className="text-primary-600">{Math.round(progress)}%</span>
      </div>
      <div className="h-3 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 shadow-md"
        />
      </div>
      {completedText && (
        <p className="text-[9px] font-bold text-slate-300 italic">{completedText}</p>
      )}
    </div>
  );
};

export default ProgressBar;
