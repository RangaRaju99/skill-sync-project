import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypingIndicatorProps {
  typingUsers: { userName: string }[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  const text = typingUsers.length === 1 
    ? `${typingUsers[0].userName} is typing...`
    : typingUsers.length === 2
    ? `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`
    : `${typingUsers.length} people are typing...`;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="flex items-center gap-2 px-4 py-1 text-sm text-slate-500 italic"
      >
        <div className="flex gap-1">
          <motion.span 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            className="w-1.5 h-1.5 bg-slate-400 rounded-full"
          />
          <motion.span 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            className="w-1.5 h-1.5 bg-slate-400 rounded-full"
          />
          <motion.span 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            className="w-1.5 h-1.5 bg-slate-400 rounded-full"
          />
        </div>
        {text}
      </motion.div>
    </AnimatePresence>
  );
};

export default TypingIndicator;
