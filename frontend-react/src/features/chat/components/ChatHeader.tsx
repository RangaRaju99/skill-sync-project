import React from 'react';
import { Users, Pin, Search, MoreVertical, Hash, Info, Star } from 'lucide-react';

interface ChatHeaderProps {
  name: string;
  memberCount: number;
  onToggleInfo?: () => void;
  onShowPinned?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  name, 
  memberCount, 
  onToggleInfo,
  onShowPinned 
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm z-30">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center shadow-inner">
          <Hash size={24} strokeWidth={2.5} />
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 leading-tight">{name}</h2>
            <Star size={16} className="text-amber-400 fill-amber-400 cursor-pointer" />
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium">{memberCount} participants online</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onShowPinned}
          className="p-2.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-all rounded-xl relative"
          title="Pinned Messages"
        >
          <Pin size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full border-2 border-white" />
        </button>
        
        <button className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all rounded-xl">
          <Search size={20} />
        </button>
        
        <button 
          onClick={onToggleInfo}
          className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all rounded-xl"
        >
          <Info size={20} />
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all rounded-xl">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
