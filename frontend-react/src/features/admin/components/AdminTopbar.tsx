import React, { useState, useEffect } from 'react';
import { Bell, Search, LogOut, Settings, ExternalLink, HelpCircle, Activity } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useAdmin } from '../../../hooks/useAdmin';
import { useLocation } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Input } from '../../../components/ui/Input';

export default function AdminTopbar() {
  const { user, logout } = useAuthStore();
  const { activity } = useAdmin();
  const location = useLocation();
  
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Route Change Behavior
  useEffect(() => {
    setIsNotifyOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  // 2. ESC Key Support
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNotifyOpen(false);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-[100]">
      {/* Universal Search */}
      <div className="flex-1 max-w-xl">
        <Input 
          placeholder="Search users, groups, and logs..." 
          leftIcon={<Icon icon={Search} size={18} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          containerClassName="w-full"
        />
      </div>

      <div className="flex items-center gap-4 ml-8">
        
        {/* Notification Hub */}
        <div className="relative">
          <button 
            onClick={() => { setIsNotifyOpen(!isNotifyOpen); setIsProfileOpen(false); }}
            className={`p-3 rounded-xl transition-all relative border z-50 ${isNotifyOpen ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'}`}
          >
            <Icon icon={Bell} size={20} />
            {activity.length > 0 && !isNotifyOpen && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
            )}
          </button>

          {isNotifyOpen && (
            <>
              {/* Overlay: Closes on click, applies light blur & dim UX */}
              <div 
                 className="fixed inset-0 bg-slate-900/5 backdrop-blur-[1px] z-40 transition-opacity animate-fade-in"
                 onClick={() => setIsNotifyOpen(false)}
              ></div>

              {/* Notification Panel Modal */}
              <div className="absolute right-0 mt-3 w-96 bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 z-50 overflow-hidden transform transition-all duration-200 animate-slide-down origin-top-right">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Recent Activity</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-[8px] font-black text-indigo-600 rounded-md uppercase">{activity.length} System Logs</span>
                </div>
                
                <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                  {activity.length > 0 ? (
                    activity.slice(0, 5).map((log: any) => (
                      <div 
                        key={log.id} 
                        className="p-5 hover:bg-indigo-50/30 cursor-default border-b border-slate-50 transition-colors flex gap-4 items-start"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                           <Icon icon={Activity} size={14} />
                        </div>
                        <div>
                           <p className="text-xs font-black text-slate-900 mb-1">{log.action}</p>
                           <p className="text-[10px] text-slate-500 font-bold max-w-[240px] truncate">{log.description} • {log.target}</p>
                           <p className="text-[8px] font-black text-slate-400 uppercase mt-2">{new Date(log.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center mx-auto mb-3">
                         <Icon icon={Bell} size={20} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">No recent activity.</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 max-w-[200px] mx-auto">Events populate here when you take action.</p>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setIsNotifyOpen(false)} 
                  className="w-full p-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 transition-colors border-t border-slate-50 active:bg-indigo-100"
                >
                  View All Activity Logs
                </button>
              </div>
            </>
          )}
        </div>

        {/* Profile Control */}
        <div className="relative pl-4 border-l border-slate-100">
          <button 
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifyOpen(false); }}
            className="flex items-center gap-3 group relative z-50"
          >
            <div className={`w-10 h-10 border text-sm flex items-center justify-center font-black rounded-xl transition-all shadow-sm ${isProfileOpen ? 'bg-slate-800 border-slate-800 text-white shadow-xl shadow-slate-200' : 'bg-slate-50 border-slate-200 text-slate-600 group-hover:bg-slate-800 group-hover:border-slate-800 group-hover:text-white'}`}>
              {user?.name?.charAt(0) || 'A'}
            </div>
          </button>

          {isProfileOpen && (
            <>
              {/* Overlay Click-Away */}
              <div 
                 className="fixed inset-0 bg-slate-900/5 backdrop-blur-[1px] z-40 transition-opacity animate-fade-in"
                 onClick={() => setIsProfileOpen(false)}
              ></div>

              <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 z-50 overflow-hidden p-2 transform transition-all duration-200 animate-slide-down origin-top-right">
                <div className="p-4 bg-slate-50 rounded-2xl mb-2">
                  <p className="text-sm font-black text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Administrator</p>
                </div>
                 <div className="space-y-1">
                  {[
                    { label: 'System Status', icon: <Icon icon={ExternalLink} size={14} /> },
                    { label: 'Personal Settings', icon: <Icon icon={Settings} size={14} /> },
                    { label: 'Documentation', icon: <Icon icon={HelpCircle} size={14} /> },
                  ].map((item, i) => (
                    <button key={i} className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all">
                      {item.icon} {item.label}
                    </button>
                  ))}
                </div>
                 <button 
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-4 py-4 mt-2 border-t border-slate-50 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Icon icon={LogOut} size={14} /> Log Out
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
