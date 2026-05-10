import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../../store/slices/authSlice';
import api from '../../services/axios';
import logo from '../../assets/skillsync-logo.png';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  role: 'ROLE_LEARNER' | 'ROLE_MENTOR' | 'ROLE_ADMIN';
}

const Sidebar = ({ role }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isSidebarCollapsed, isMobileMenuOpen, setIsMobileMenuOpen } = useTheme();

  const learnerNav = [
    { name: 'Dashboard', icon: 'grid_view', path: '/learner' },
    { name: 'Mentor Search', icon: 'person_search', path: '/mentors' },
    { name: 'My Sessions', icon: 'event_upcoming', path: '/sessions' },
    { name: 'Groups', icon: 'groups', path: '/groups' },
  ];

  const mentorNav = [
    { name: 'Dashboard', icon: 'grid_view', path: '/mentor' },
    { name: 'My Sessions', icon: 'event_upcoming', path: '/sessions' },
    { name: 'Groups', icon: 'groups', path: '/groups' },
    { name: 'My Availability', icon: 'event_available', path: '/mentor/availability' },
    { name: 'My Profile', icon: 'account_circle', path: '/profile' },
    { name: 'Earnings', icon: 'payments', path: '/mentor/earnings' },
  ];

  const adminNav = [
    { name: 'Dashboard', icon: 'grid_view', path: '/admin' },
    { name: 'Manage Users', icon: 'group', path: '/admin/users' },
    { name: 'Approve Mentors', icon: 'how_to_reg', path: '/admin/mentor-approvals' },
    { name: 'Manage Skills', icon: 'psychology', path: '/admin/skills' },
    { name: 'Manage Groups', icon: 'groups', path: '/admin/groups' },
  ];

  const activeNav = role === 'ROLE_MENTOR' ? mentorNav : role === 'ROLE_ADMIN' ? adminNav : learnerNav;

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      console.warn("Logout request failed cleanly", e);
    } finally {
      dispatch(logout());
      localStorage.clear();
      navigate('/login');
    }
  };

  const NavItem = ({ item }: { item: any }) => {
    const isActive = location.pathname === item.path;
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div className="relative group/navitem" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <Link
          to={item.path}
          onClick={() => setIsMobileMenuOpen(false)}
          className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden ${isActive
            ? 'text-primary'
            : 'text-on-surface-variant/70 hover:text-on-surface hover:bg-white/5'
            }`}
        >
          {isActive && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl -z-10"
              initial={false}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
          )}

          <span className={`material-symbols-outlined text-2xl transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover/navitem:scale-110'
            }`}>
            {item.icon}
          </span>

          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-4 text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap"
              >
                {item.name}
              </motion.span>
            )}
          </AnimatePresence>

          {isActive && (
            <motion.div
              layoutId="active-indicator"
              className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
          )}
        </Link>

        {isSidebarCollapsed && isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 10 }}
            className="absolute left-full top-1/2 -translate-y-1/2 px-3 py-2 bg-surface-container-highest border border-outline rounded-lg shadow-2xl z-[100] pointer-events-none"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface whitespace-nowrap">
              {item.name}
            </span>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isSidebarCollapsed ? 80 : 280,
          x: typeof window !== 'undefined' && window.innerWidth < 1024
            ? (isMobileMenuOpen ? 0 : -280)
            : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed left-0 top-0 h-screen bg-surface-container-lowest border-r border-outline/10 flex flex-col justify-between z-[50] shadow-2xl backdrop-blur-2xl overflow-hidden ${isMobileMenuOpen ? 'flex' : 'hidden lg:flex'
          }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto w-full scrollbar-hide">
          <div className="flex items-center justify-between px-6 h-24 shrink-0">
            <div className="flex items-center">
              <div className="w-10 h-10 flex items-center justify-center bg-primary/20 rounded-xl border border-primary/30 shadow-inner overflow-hidden">
                <img src={logo} alt="S" className="w-6 h-6 object-contain" onError={(e: any) => { e.target.src = 'https://via.placeholder.com/24'; }} />
              </div>
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-4 flex flex-col"
                  >
                    <span className="text-xl font-display font-black text-on-surface tracking-tighter uppercase italic leading-none">SkillSync<span className="text-primary">.</span></span>
                    <span className="text-[9px] font-black text-on-surface-variant/60 uppercase tracking-[0.25em] mt-1.5">{role.replace('ROLE_', '')}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <nav className="flex-1 w-full px-4 py-8 space-y-4">
            {activeNav.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
        </div>

        <div className="w-full shrink-0 p-4 border-t border-outline/10 space-y-3 bg-surface-container-lowest/50 backdrop-blur-xl">
          {role === 'ROLE_LEARNER' && (
            <button
              onClick={() => {
                navigate('/mentors');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group overflow-hidden ${isSidebarCollapsed ? 'h-12' : 'py-3.5'
                }`}
            >
              <span className="material-symbols-outlined text-xl">person_search</span>
              {!isSidebarCollapsed && (
                <span className="ml-3 text-[10px] font-black uppercase tracking-[0.2em]">Explore Mentors</span>
              )}
            </button>
          )}

          <NavItem item={{ name: 'Help Center', icon: 'help', path: '/help' }} />

          <button
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-center lg:justify-start px-4 h-12 rounded-xl text-error/70 hover:text-error hover:bg-error/5 transition-all duration-300 group ${isSidebarCollapsed ? 'justify-center px-0' : ''
              }`}
          >
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">logout</span>
            {!isSidebarCollapsed && (
              <span className="ml-4 text-[10px] font-black uppercase tracking-[0.2em]">Terminate Session</span>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;

export default Sidebar;
