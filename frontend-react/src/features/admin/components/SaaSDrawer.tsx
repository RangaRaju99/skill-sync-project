import React, { useEffect } from 'react';
import { X, Shield, Users, AlertTriangle, History } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const SaaSDrawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.1)] z-[101] transition-transform duration-500 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic leading-none">{title}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                <Shield className="w-3 h-3 text-indigo-500" /> Operational Context Active
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all hover:rotate-90"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
