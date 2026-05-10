import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/axios';
import notificationService from '../../services/notificationService';
import type { RootState } from '../../store';
import ThemeToggleButton from '../ui/ThemeToggleButton';

const Navbar = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;
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
  const initials = `${user?.firstName?.[0] || 'U'}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-20 w-full flex items-center justify-between px-8 lg:px-12 z-30"
    >
      <div className="flex-1" />

      <div className="flex items-center gap-6">
        <ThemeToggleButton className="p-2" showLabel={false} />

        <Link to="/notifications" className="relative group">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-white/70 group-hover:text-white transition-colors">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.div>
        </Link>

        <Link to="/profile" className="group">
          <motion.div 
            whileHover={{ x: -4 }}
            className="flex items-center gap-4 pl-4 border-l border-white/10"
          >
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-black text-white tracking-tight uppercase">{user?.firstName} {user?.lastName}</span>
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase opacity-80">Workspace Account</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 p-[1px] shadow-lg group-hover:rotate-6 transition-transform">
              <div className="w-full h-full rounded-[11px] bg-slate-900 flex items-center justify-center text-[13px] font-black text-white">
                {initials}
              </div>
            </div>
          </motion.div>
        </Link>
      </div>
    </motion.header>
  );
};

export default Navbar;
