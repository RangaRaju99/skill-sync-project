import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import api from '../../services/axios';
import logo from '../../assets/skillsync-logo.png';

interface SidebarProps {
  role: 'ROLE_LEARNER' | 'ROLE_MENTOR' | 'ROLE_ADMIN';
}

const Sidebar = ({ role }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const learnerNav = [
    { name: 'Dashboard', icon: 'grid_view', path: '/learner' }, 
    { name: 'Mentors', icon: 'person_search', path: '/mentors' },
    { name: 'Sessions', icon: 'event_upcoming', path: '/sessions' },
    { name: 'Groups', icon: 'groups', path: '/groups' },
  ];

  const mentorNav = [
    { name: 'Studio', icon: 'grid_view', path: '/mentor' },
    { name: 'Sessions', icon: 'event_upcoming', path: '/sessions' },
    { name: 'Availability', icon: 'event_available', path: '/mentor/availability' },
    { name: 'Earnings', icon: 'payments', path: '/mentor/earnings' },
  ];

  const adminNav = [
    { name: 'Command', icon: 'grid_view', path: '/admin' },
    { name: 'Users', icon: 'group', path: '/admin/users' },
    { name: 'Approvals', icon: 'how_to_reg', path: '/admin/mentor-approvals' },
    { name: 'Skills', icon: 'psychology', path: '/admin/skills' },
  ];

  const activeNav = role === 'ROLE_MENTOR' ? mentorNav : role === 'ROLE_ADMIN' ? adminNav : learnerNav;

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      console.warn("Logout failed", e);
    } finally {
      dispatch(logout());
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <aside className="fixed left-6 top-6 bottom-6 w-20 lg:w-64 z-[100] pointer-events-none">
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="h-full w-full bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex flex-col justify-between overflow-hidden shadow-2xl pointer-events-auto relative"
      >
        {/* Subtle internal glow */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-primary/10 blur-3xl -z-10" />
        
        <div className="flex flex-col flex-1 overflow-y-auto w-full scrollbar-hide">
          {/* BRAND */}
          <div className="flex items-center justify-center lg:justify-start lg:px-8 h-24 shrink-0 border-b border-white/5">
            <img src={logo} alt="SkillSync" className="w-10 h-10 object-contain drop-shadow-2xl" />
            <div className="hidden lg:flex flex-col ml-4">
              <span className="text-xl font-black text-white tracking-tighter leading-none">Studio</span>
              <span className="text-[9px] font-bold text-primary uppercase tracking-[0.3em] mt-1">{role.replace('ROLE_', '')}</span>
            </div>
          </div>

          {/* NAV */}
          <nav className="flex-1 w-full px-3 lg:px-4 py-8 space-y-3">
            {activeNav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.name} to={item.path} className="block relative group">
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`flex items-center justify-center lg:justify-start px-4 py-3.5 rounded-2xl transition-all duration-300 relative ${
                      isActive 
                        ? 'text-white' 
                        : 'text-white/40 hover:text-white/80'
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeNav"
                        className="absolute inset-0 bg-primary/20 border border-primary/30 rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                      />
                    )}
                    <span className={`material-symbols-outlined text-2xl relative z-10 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    <span className="hidden lg:inline ml-4 text-[13px] font-bold uppercase tracking-widest relative z-10">{item.name}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM */}
        <div className="w-full shrink-0 p-4 lg:p-6 space-y-2 border-t border-white/5 bg-black/20">
          <Link to="/help" className="flex items-center justify-center lg:justify-start px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all group">
            <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">help</span>
            <span className="hidden lg:inline ml-4 text-[11px] font-black uppercase tracking-widest">Help</span>
          </Link>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center lg:justify-start px-4 py-3 rounded-xl text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all group"
          >
            <span className="material-symbols-outlined text-2xl group-hover:-translate-x-1 transition-transform">logout</span>
            <span className="hidden lg:inline ml-4 text-[11px] font-black uppercase tracking-widest">Exit</span>
          </button>
        </div>
      </motion.div>
    </aside>
  );
};

export default Sidebar;
