import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronUp, CheckCircle2, RotateCcw, X } from 'lucide-react';

interface FloatingSaveBarProps {
  isVisible: boolean;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  status?: 'idle' | 'saving' | 'saved';
  showUndo?: boolean;
  onUndo?: () => void;
  onClose?: () => void;
}

const FloatingSaveBar: React.FC<FloatingSaveBarProps> = ({
  isVisible,
  onSave,
  onCancel,
  isLoading,
  status = 'idle',
  showUndo,
  onUndo,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, x: '-50%', opacity: 0 }}
          animate={{ y: 0, x: '-50%', opacity: 1 }}
          exit={{ y: 100, x: '-50%', opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="fixed bottom-10 left-1/2 z-[100] min-w-[600px]"
        >
          <div className="bg-card/80 backdrop-blur-2xl border border-white/10 p-4 rounded-[32px] shadow-[0_30px_100px_rgba(0,0,0,0.5)] flex items-center justify-between gap-12">
            <div className="flex items-center gap-5 pl-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center relative overflow-hidden group">
                <Zap size={20} className="text-primary group-hover:scale-125 transition-transform" />
                <div className="absolute inset-0 bg-primary/20 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
                  {status === 'saved' ? 'Changes Synchronized' : 'Unsynced Adjustments'}
                </p>
                <p className="text-[11px] text-muted-foreground font-bold italic">
                  {status === 'saved' 
                    ? 'Your profile is now up to date.' 
                    : 'Modifications detected. Sync to persist changes.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {showUndo && status === 'saved' ? (
                <button
                  onClick={onUndo}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 transition-all text-primary"
                >
                  <RotateCcw size={14} />
                  Undo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all hover:bg-white/5"
                >
                  Discard
                </button>
              )}
              
              <button
                onClick={onSave}
                disabled={isLoading || status === 'saved'}
                className={`
                  group/btn px-10 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] 
                  transition-all flex items-center gap-3 relative overflow-hidden
                  ${status === 'saved' 
                    ? 'bg-emerald-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.3)]' 
                    : 'bg-primary text-white shadow-[0_15px_40px_rgba(var(--primary-rgb),0.3)] hover:translate-y-[-2px] hover:shadow-[0_20px_50px_rgba(var(--primary-rgb),0.4)] active:translate-y-[1px]'}
                `}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : status === 'saved' ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <span>Save Changes</span>
                    <ChevronUp size={16} className="rotate-90 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              {status === 'saved' && onClose && (
                 <button
                   onClick={onClose}
                   className="w-12 h-12 rounded-full border border-white/10 hover:bg-white/5 active:scale-90 flex items-center justify-center transition-all ml-1 group/close"
                   title="Close & Return to Preview"
                 >
                   <X size={18} className="text-muted-foreground group-hover/close:text-foreground transition-colors" />
                 </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingSaveBar;
