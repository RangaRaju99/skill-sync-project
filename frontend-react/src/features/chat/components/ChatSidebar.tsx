import React from 'react';
import { Hash, Plus, MessageCircle, Settings, LogOut, Bell, User } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

interface ChatSidebarProps {
  groups: { id: number; name: string }[];
  activeGroupId: number | null;
  onSelectGroup: (groupId: number) => void;
  onLogout: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  groups, 
  activeGroupId, 
  onSelectGroup,
  onLogout 
}) => {
  const { user } = useAuthStore();

  return (
    <div className="w-[300px] h-screen bg-white border-r border-slate-200 flex flex-col z-40">
      {/* Sidebar Header */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
            <MessageCircle size={24} />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">SkillSync Chat</h1>
        </div>

        <div className="space-y-1">
          <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">General</p>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors rounded-xl font-medium">
            <Bell size={18} />
            Notifications
            <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">2</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors rounded-xl font-medium">
            <User size={18} />
            Direct Messages
          </button>
        </div>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <div className="flex items-center justify-between px-2 py-2 mb-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Groups</p>
          <button className="p-1 text-slate-400 hover:text-primary-600 transition-colors">
            <Plus size={16} />
          </button>
        </div>

        <div className="space-y-1">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => onSelectGroup(group.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                ${activeGroupId === group.id 
                  ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-100' 
                  : 'text-slate-600 hover:bg-slate-50'
                }
              `}
            >
              <div className={`p-1.5 rounded-lg transition-colors
                ${activeGroupId === group.id ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}
              `}>
                <Hash size={16} strokeWidth={2.5} />
              </div>
              <span className={`text-sm truncate font-semibold activeChild`}>{group.name}</span>
              {activeGroupId === group.id && (
                <div className="ml-auto w-1.5 h-1.5 bg-primary-600 rounded-full" />
              )}
            </button>
          ))}
          
          {groups.length === 0 && (
            <div className="px-3 py-10 text-center">
              <p className="text-xs text-slate-400 italic">No groups joined yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="w-10 h-10 bg-slate-200 rounded-xl overflow-hidden shadow-inner">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} 
              alt="Avatar" 
              className="w-full h-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Online</p>
          </div>
          <div className="flex flex-col gap-1">
            <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
              <Settings size={16} />
            </button>
            <button onClick={onLogout} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
