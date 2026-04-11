
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, ArrowDown, ArrowUp } from 'lucide-react';

interface AdvancedSortModalProps {
  isOpen: boolean;
  onClose: () => void;
  sortKey: string;
  sortOrder: 'asc' | 'desc';
  onApply: (key: string, order: 'asc' | 'desc') => void;
}

const AdvancedSortModal: React.FC<AdvancedSortModalProps> = ({ 
  isOpen, onClose, sortKey, sortOrder, onApply 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-border-color"
          >
            <div className="p-6 border-b border-border-color flex justify-between items-center">
              <div className="flex items-center gap-2 text-primary">
                <Settings size={18} />
                <h3 className="font-black uppercase tracking-widest text-sm">Advanced Sorting</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-surface rounded-xl text-muted">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Field Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Sort by Field</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'rating', label: 'Rating' },
                    { id: 'price', label: 'Price' },
                    { id: 'experience', label: 'Experience' },
                    { id: 'students', label: 'Students' },
                  ].map((field) => (
                    <button
                      key={field.id}
                      onClick={() => onApply(field.id, sortOrder)}
                      className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                        sortKey === field.id 
                          ? 'bg-primary text-white shadow-lg' 
                          : 'bg-surface border border-border-color text-muted hover:border-primary/20'
                      }`}
                    >
                      {field.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Direction</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onApply(sortKey, 'desc')}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-bold transition-all ${
                      sortOrder === 'desc' 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'bg-surface border border-border-color text-muted hover:border-primary/20'
                    }`}
                  >
                    <ArrowDown size={14} /> High to Low
                  </button>
                  <button
                    onClick={() => onApply(sortKey, 'asc')}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-bold transition-all ${
                      sortOrder === 'asc' 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'bg-surface border border-border-color text-muted hover:border-primary/20'
                    }`}
                  >
                    <ArrowUp size={14} /> Low to High
                  </button>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-5 bg-foreground text-background dark:bg-white dark:text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:opacity-90 transition-opacity"
              >
                Apply Custom Sort
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AdvancedSortModal;
