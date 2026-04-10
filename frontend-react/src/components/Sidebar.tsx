import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useMyMentorProfile } from '../hooks/useMentors';

interface NavItem { label: string; icon: string; route: string; roles?: string[]; }

interface SidebarProps {
  isCollapsed: boolean;
  onNavClick: () => void;
}

const allItems: NavItem[] = [
  { label: 'Growth', icon: 'rocket_launch', route: '/growth' },
  { label: 'Mentors', icon: 'people', route: '/mentors' },
  { label: 'Skills', icon: 'collections_bookmark', route: '/skills' },
  { label: 'My Sessions', icon: 'event_note', route: '/sessions', roles: ['ROLE_LEARNER'] },
  { label: 'Groups', icon: 'groups', route: '/groups' },
  { label: 'Chat', icon: 'chat', route: '/chat' },
  { label: 'Notifications', icon: 'notifications_none', route: '/notifications' },
  { label: 'Profile', icon: 'person_outline', route: '/profile' },
  { label: 'Settings', icon: 'settings', route: '/settings' },
  { label: 'Dashboard', icon: 'dashboard_customize', route: '/mentor-dashboard', roles: ['ROLE_MENTOR'] },
  { label: 'Admin', icon: 'admin_panel_settings', route: '/admin', roles: ['ROLE_ADMIN'] },
];

export default function Sidebar({ isCollapsed, onNavClick }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { data: mentorProfile } = useMyMentorProfile();

  const isMentor = user?.roles?.includes('ROLE_MENTOR') || !!mentorProfile;

  const visibleItems = allItems.filter(item => {
    if (item.roles?.includes('ROLE_MENTOR')) {
      return isMentor;
    }
    return !item.roles || item.roles.some(r => user?.roles?.includes(r));
  });

  return (
    <div className="h-full flex flex-col py-6 px-4 font-sans">

      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 mb-10 overflow-hidden">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary-200 dark:shadow-primary-900/40">
          <span className="material-icons text-white">auto_awesome</span>
        </div>
        {!isCollapsed && (
          <span className="text-xl font-bold tracking-tight text-foreground transition-opacity duration-300">SkillSync</span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.route;
          return (
            <Link
              key={item.route}
              to={item.route}
              onClick={onNavClick}
              className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary-600 dark:hover:text-primary-400 active:scale-[0.98] ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 ring-1 ring-primary-100/50 dark:ring-primary-500/20' : 'text-slate-600 dark:text-slate-400'
                }`}
            >
              <span className={`material-icons-outlined shrink-0 group-hover:scale-110 transition-transform ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="font-medium text-sm tracking-wide">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={() => logout()}
        className="mt-auto group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 active:scale-[0.98]"
      >
        <span className="material-icons-outlined shrink-0 group-hover:rotate-12 transition-transform text-slate-400 dark:text-slate-500 group-hover:text-red-500">logout</span>
        {!isCollapsed && (
          <span className="font-medium text-sm tracking-wide text-slate-500 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400">Logout</span>
        )}
      </button>
    </div>
  );
}
