import React from 'react';
import { X, ShieldAlert, ShieldCheck, AlertCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type?: 'danger' | 'info' | 'success';
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
  isLoading?: boolean;
}

export const SaaSModal: React.FC<ModalProps> = ({ isOpen, onClose, title, type = 'info', children, onConfirm, confirmLabel = 'Authorize', isLoading }) => {
  if (!isOpen) return null;

  const typeConfig = {
    danger: { bg: 'bg-rose-50', text: 'text-rose-600', icon: <ShieldAlert size={32} /> },
    info: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: <AlertCircle size={32} /> },
    success: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <ShieldCheck size={32} /> }
  };

  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-fade-in">
      <div className="bg-white rounded-[3rem] p-12 max-w-md w-full shadow-2xl animate-modal-in border border-white">
        <div className={`w-20 h-20 ${config.bg} ${config.text} rounded-[1.5rem] flex items-center justify-center mb-8 mx-auto shadow-sm`}>
          {config.icon}
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase text-center mb-4 italic leading-tight px-4">
          {title}
        </h2>

        <div className="mb-10 mt-6">
          {children}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onClose} 
            className="py-5 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-all"
          >
            Abort
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isLoading}
            className={`py-5 ${type === 'danger' ? 'bg-rose-600 shadow-rose-100' : 'bg-indigo-600 shadow-indigo-100'} text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
