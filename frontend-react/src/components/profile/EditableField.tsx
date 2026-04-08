import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface EditableFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  type?: 'text' | 'textarea' | 'tel' | 'email';
  placeholder?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onChange,
  isEditing,
  disabled = false,
  icon: Icon,
  type = 'text',
  placeholder,
}) => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    if (value !== prevValue && isEditing) {
      setIsHighlighted(true);
      const timer = setTimeout(() => setIsHighlighted(false), 2000);
      setPrevValue(value);
      return () => clearTimeout(timer);
    }
  }, [value, isEditing, prevValue]);

  return (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between px-1">
        <label className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 transition-colors group-hover:text-primary/70">
          {label}
        </label>
        {disabled && isEditing && (
          <span className="text-[9px] font-black uppercase tracking-widest text-amber-500/60 bg-amber-500/5 px-2 py-0.5 rounded-full">
            Read Only
          </span>
        )}
      </div>

      <motion.div
        animate={{
          boxShadow: isHighlighted ? '0 0 20px rgba(59, 130, 246, 0.15)' : '0 0 0px rgba(59, 130, 246, 0)',
          borderColor: isHighlighted ? 'rgba(59, 130, 246, 0.5)' : '',
        }}
        transition={{ duration: 0.3 }}
        className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
          isEditing && !disabled
            ? 'bg-white/5 border border-white/10 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10'
            : 'bg-transparent border border-transparent'
        }`}
      >
        <AnimatePresence mode="wait">
          {!isEditing || disabled ? (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="py-3 px-1 flex items-center gap-3 min-h-[52px]"
            >
              {Icon && <Icon size={18} className="text-muted-foreground/40 group-hover:text-primary/40 transition-colors" />}
              <span className={`font-semibold text-base ${!value ? 'text-muted-foreground/30 italic' : 'text-foreground'}`}>
                {value || placeholder || 'Not specified'}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="relative"
            >
              {Icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                  <Icon size={18} />
                </div>
              )}
              {type === 'textarea' ? (
                <textarea
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-transparent py-4 px-6 focus:outline-none font-semibold text-base resize-none min-h-[120px]"
                  rows={4}
                />
              ) : (
                <input
                  type={type}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className={`w-full bg-transparent py-4 ${Icon ? 'pl-12' : 'px-6'} pr-6 focus:outline-none font-semibold text-base`}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default EditableField;
