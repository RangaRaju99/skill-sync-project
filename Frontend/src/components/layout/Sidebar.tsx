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
    { name: 'Group', icon: 'groups', path: '/groups' },
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

  const NavItem = ({ item, isBottom = false }: { item: any, isBottom?: boolean }) => {
    const isActive = location.pathname === item.path;
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div className="relative group/navitem" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <Link 
          to={item.path} 
          onClick={() => setIsMobileMenuOpen(false)}
          className={`flex items-center px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden ${
            isActive 
              ? 'text-primary' 
              : 'text-white/40 hover:text-white/80 hover:bg-white/5'
          }`}
        >
          {isActive && (
            <motion.div 
              layoutId="active-pill"
              className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-2xl -z-10"
              initial={false}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
          )}
          
          <span className={`material-symbols-outlined text-2xl transition-all duration-300 ${
            isActive ? 'scale-110' : 'group-hover/navitem:scale-110'
          }`}>
            {item.icon}
          </span>

          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="ml-4 text-sm font-black uppercase tracking-widest whitespace-nowrap"
              >
                {item.name}
              </motion.span>
            )}
          </AnimatePresence>

          {isActive && (
            <motion.div 
              layoutId="active-indicator"
              className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
          )}
        </Link>

        {/* Tooltip */}
        {isSidebarCollapsed && isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 10 }}
            className="absolute left-full top-1/2 -translate-y-1/2 px-3 py-1.5 bg-surface-container-highest border border-white/10 rounded-lg shadow-xl z-50 pointer-events-none"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white whitespace-nowrap">
              {item.name}
            </span>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
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
        className={`fixed left-0 top-0 h-screen bg-surface-container-lowest/95 border-r border-white/5 flex flex-col justify-between z-[50] shadow-2xl backdrop-blur-3xl overflow-hidden ${
          isMobileMenuOpen ? 'flex' : 'hidden lg:flex'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto w-full scrollbar-hide">
          {/* LOGO SECTION */}
          <div className="flex items-center justify-between px-5 h-24 shrink-0 border-b border-white/5">
            <div className="flex items-center">
              <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-xl border border-primary/20 shrink-0">
                <img src={logo} alt="L" className="w-6 h-6 object-contain" onError={(e: any) => { e.target.src = 'https://via.placeholder.com/24'; }} />
              </div>
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-4 flex flex-col"
                  >
                    <span className="text-xl font-display font-black text-white tracking-tighter uppercase italic leading-none">Studio<span className="text-primary text-2xl">.</span></span>
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">{role.replace('ROLE_', '')}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Close Button for Mobile */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 text-white/40 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 w-full px-4 py-8 space-y-3">
          {activeNav.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
      </div>

      {/* BOTTOM SECTION */}
      <div className="w-full shrink-0 p-4 border-t border-white/5 flex flex-col gap-3">
        {role === 'ROLE_LEARNER' && (
          <button 
            onClick={() => {
              navigate('/mentors');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative group overflow-hidden ${
              isSidebarCollapsed ? 'h-12' : 'py-4'
            }`}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="material-symbols-outlined text-xl relative z-10">search</span>
            {!isSidebarCollapsed && (
              <span className="ml-3 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">Find Mentor</span>
            )}
          </button>
        )}

        <NavItem item={{ name: 'Help Center', icon: 'help', path: '/help' }} isBottom />
        
        <button 
          onClick={() => {
            handleLogout();
            setIsMobileMenuOpen(false);
          }}
          className={`w-full flex items-center justify-center lg:justify-start px-4 h-12 rounded-2xl text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-300 group ${
            isSidebarCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">logout</span>
          {!isSidebarCollapsed && (
            <span className="ml-4 text-[10px] font-black uppercase tracking-[0.2em]">Logout</span>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
