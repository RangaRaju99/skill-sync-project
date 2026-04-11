import React from 'react';
import { Clock, UserCheck, ShieldAlert, Zap, Lock, Unlock } from 'lucide-react';

interface FeedItem {
  id: string;
  type: 'PROMOTE' | 'BLOCK' | 'FLAG' | 'LOCK' | 'UNLOCK';
  label: string;
  description: string;
  timestamp: string;
}

export const ActivityPanel: React.FC<{ items: FeedItem[] }> = ({ items }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'PROMOTE': return <Zap className="text-emerald-500" size={16} />;
      case 'BLOCK': return <ShieldAlert className="text-rose-500" size={16} />;
      case 'LOCK': return <Lock className="text-amber-500" size={16} />;
      case 'UNLOCK': return <Unlock className="text-emerald-500" size={16} />;
      default: return <Clock className="text-indigo-500" size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <div key={item.id} className="flex gap-4 group cursor-default">
          <div className="shrink-0 w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-sm">
            {getIcon(item.type)}
          </div>
          <div className="flex-1 border-b border-slate-50 pb-6 group-last:border-none">
            <div className="flex justify-between items-start mb-1">
              <p className="text-[12px] font-black text-slate-900 leading-tight uppercase italic">{item.label}</p>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter whitespace-nowrap ml-2">
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
