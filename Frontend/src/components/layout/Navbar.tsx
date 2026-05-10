import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/axios';
import notificationService from '../../services/notificationService';
import type { RootState } from '../../store';
import { Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggleButton from '../ui/ThemeToggleButton';

const Navbar = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const queryClient = useQueryClient();
  const { toggleSidebar, isSidebarCollapsed, setIsMobileMenuOpen } = useTheme();

  const handleToggle = () => {
    if (window.innerWidth < 1024) {
      setIsMobileMenuOpen(true);
    } else {
      toggleSidebar();
    }
  };

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const unsubscribe = notificationService.subscribeToNotifications(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    });

    return unsubscribe;
  }, [queryClient, user?.id]);

  const { data: notificationData } = useQuery({
    queryKey: ['unread-notifications', user?.id || 'unknown'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/notifications/unread/count', { _skipErrorRedirect: true } as any);
        return response.data;
      } catch (e) {
        return { count: 0 };
      }
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const unreadCount = notificationData?.count || 0;

  const initial1 = user?.firstName?.[0]?.toUpperCase() || 'U';
  const initial2 = user?.lastName?.[0]?.toUpperCase() || '';
  const initials = `${initial1}${initial2}`;

  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'];
  const colorIndex = (initial1.charCodeAt(0) % colors.length);
  const avatarClass = colors[colorIndex] || 'bg-primary';

  return (
    <header className="h-16 w-full bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline/10 flex items-center justify-between px-4 lg:px-10 z-30 sticky top-0 transition-all">
      <div className="flex-1 flex items-center">
        <button
          onClick={handleToggle}
          className="p-2 mr-4 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all duration-300 group"
          aria-label="Toggle Sidebar"
        >
          <Menu
            size={22}
            className={`transition-transform duration-500 ${isSidebarCollapsed ? '' : 'rotate-180'}`}
          />
        </button>
      </div>

      <div className="flex items-center space-x-6">
        <ThemeToggleButton className="px-2.5 py-1.5" showLabel={false} />

        <Link to="/notifications" className="relative p-2 rounded-xl flex hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all duration-300">
          <span className="material-symbols-outlined text-[24px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-[16px] bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <Link to="/profile" className="flex items-center pl-6 border-l border-outline/20 hover:opacity-80 transition-opacity">
          <div className="hidden md:flex flex-col items-end mr-3">
            <span className="text-sm font-bold text-on-surface leading-tight">{user?.firstName} {user?.lastName}</span>
            <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-wider opacity-60">Account</span>
          </div>
          <div className={`w-9 h-9 rounded-xl ${avatarClass} text-white flex items-center justify-center font-bold shadow-lg shadow-black/20 shrink-0`}>
            {initials}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
