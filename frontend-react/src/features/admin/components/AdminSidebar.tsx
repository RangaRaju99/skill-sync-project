import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart, Users, ShieldCheck, 
  Settings, FileText, Lock, Bell, LineChart,
  LogOut, ChevronLeft, ChevronRight, ArrowLeft, Shield,
  GraduationCap
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuthStore();

  const menuItems = [
    { title: 'Dashboard', path: '/admin/dashboard', icon: <BarChart size={20} /> },
    { title: 'Analytics', path: '/admin/analytics', icon: <LineChart size={20} /> },
    { title: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { title: 'Mentors', path: '/admin/mentors', icon: <GraduationCap size={20} /> },
    { title: 'Groups', path: '/admin/groups', icon: <Users size={20} /> },
    { title: 'Roles Overview', path: '/admin/roles', icon: <ShieldCheck size={20} /> },
    { title: 'Notifications', path: '/admin/notifications', icon: <Bell size={20} /> },
    { title: 'Audit Logs', path: '/admin/audit-logs', icon: <FileText size={20} /> },
    { title: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className={`bg-white border-r border-slate-100 flex flex-col transition-all duration-300 h-screen sticky top-0 ${isCollapsed ? 'w-24' : 'w-72'}`}>
      {/* Brand */}
      <div className="p-6 flex items-center justify-between">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'hidden' : 'flex'}`}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Shield size={22} fill="currentColor" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">
            SkillSync
          </span>
        </div>
        <button 
          onClick={onToggle}
          className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 mt-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (location.pathname === '/admin' && item.path === '/admin/dashboard');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all group ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className={`shrink-0 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-900'}`}>
                {item.icon}
              </div>
              {!isCollapsed && <span className="truncate">{item.title}</span>}
              {isActive && !isCollapsed && <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-50 space-y-2">
        <Link 
          to="/mentor" 
          className="flex items-center gap-4 w-full px-4 py-3.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-bold text-sm"
        >
           <ArrowLeft size={20} />
           {!isCollapsed && <span>Back to App</span>}
        </Link>
        <button 
          onClick={logout}
          className="flex items-center gap-4 w-full px-4 py-3.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
