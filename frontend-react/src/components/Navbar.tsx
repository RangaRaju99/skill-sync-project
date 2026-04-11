import { useAuthStore } from '../store/authStore';
import { useMyMentorProfile } from '../hooks/useMentors';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import ThemeBuilder from '../theme/ThemeBuilder';

interface NavbarProps {
  toggleSidebar: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const { user, logout } = useAuthStore();
  const { data: mentorProfile } = useMyMentorProfile();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [themeBuilderOpen, setThemeBuilderOpen] = useState(false);
  const [contextMode, setContextMode] = useState(false);
  const [hoverNavbar, setHoverNavbar] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { mode, setMode, resolvedMode } = useTheme();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    const handleEnterContext = () => setContextMode(true);
    const handleExitContext = () => { setContextMode(false); setHoverNavbar(false); };
    
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener('enter-context-mode', handleEnterContext);
    window.addEventListener('exit-context-mode', handleExitContext);
    
    return () => {
       document.removeEventListener("mousedown", handleClickOutside);
       window.removeEventListener('enter-context-mode', handleEnterContext);
       window.removeEventListener('exit-context-mode', handleExitContext);
    };
  }, []);

  const isHidden = contextMode && !hoverNavbar;

  const initial = user?.name ? user.name[0].toUpperCase() : '?';
  const role = user?.roles?.includes('ROLE_ADMIN') ? 'Administrator' :
    user?.roles?.includes('ROLE_MENTOR') ? 'Mentor' : 'Learner';

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/auth/login');
  };

  return (
    <>
      {/* Invisible Hover Zone for Context Mode */}
      {contextMode && (
        <div 
          className="fixed top-0 left-0 w-full h-10 z-[250]"
          onMouseEnter={() => setHoverNavbar(true)}
          onMouseLeave={() => setHoverNavbar(false)}
        />
      )}

      <nav 
        onMouseEnter={() => contextMode && setHoverNavbar(true)}
        onMouseLeave={() => contextMode && setHoverNavbar(false)}
        className={`h-16 glass-effect border-b border-white/20 sticky top-0 z-[200] px-6 lg:px-10 flex items-center justify-between shadow-sm transition-transform duration-300 ease-in-out ${isHidden ? '-translate-y-full' : 'translate-y-0'}`}
      >

        {/* Left: Mobile Menu Toggle + Desktop Search/Breadcrumb */}
        <div className="flex items-center gap-4 lg:gap-8">
          <button
            onClick={toggleSidebar}
            className="lg:flex p-2 rounded-xl hover:bg-slate-100 transition-colors hidden text-slate-500 hover:text-primary-600 focus:outline-none"
            aria-label="Toggle Sidebar">
            <span className="material-icons-outlined">menu_open</span>
          </button>

          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-500 active:bg-slate-100 transition-colors"
            aria-label="Mobile Sidebar Toggle">
            <span className="material-icons-outlined">menu</span>
          </button>

          {/* Brand (Mobile Only) */}
          <span className="lg:hidden text-xl font-bold tracking-tight text-primary-600">SkillSync</span>
        </div>

        {/* Center: Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full group">
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">search</span>
            <input
              type="text"
              placeholder="Search mentors or skills..."
              className="w-full bg-slate-100/50 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all outline-none text-slate-600"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">

          {/* Become Mentor Button */}
          {!user?.roles?.includes('ROLE_MENTOR') && !mentorProfile?.id && !user?.roles?.includes('ROLE_ADMIN') && (
            <Link to="/mentors/apply" className="hidden sm:flex items-center bg-primary-600 text-white rounded-xl px-4 py-2 text-sm font-semibold shadow-lg shadow-primary-100 hover:bg-primary-700 transition-all active:scale-95">
              <span className="material-icons-outlined text-base mr-2">verified_user</span>
              Become Mentor
            </Link>
          )}

          {/* Theme Studio Button */}
          <button
            onClick={() => setThemeBuilderOpen(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-primary-600 hover:bg-white/80 dark:hover:bg-slate-700 transition-all"
            aria-label="Open Theme Studio"
          >
            <span className="material-icons-outlined">palette</span>
          </button>

          {/* Quick Dark/Light Toggle */}
          <button
            onClick={() => setMode(resolvedMode === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl text-slate-500 hover:text-primary-600 hover:bg-white/80 dark:hover:bg-slate-700 transition-all"
            aria-label="Toggle Theme"
          >
            <span className="material-icons-outlined">
              {resolvedMode === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="p-2 rounded-xl text-slate-500 hover:text-primary-600 hover:bg-white/80 dark:hover:bg-slate-700 transition-all group relative">
              <span className="material-icons-outlined">notifications</span>
            </button>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="h-10 w-10 overflow-hidden ring-2 ring-white/50 ring-offset-2 ring-offset-slate-100 rounded-xl hover:scale-105 transition-all shadow-md active:scale-95 bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-primary-200"
            >
              <span className="text-white font-bold text-sm tracking-tighter">{initial}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-3 w-64 glass-card shadow-2xl animate-drop-in z-[300] py-1 border border-white/20 bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden">
                <div className="px-4 py-3 flex items-center gap-3 border-b border-white/10 mb-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary-100">
                    {initial}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-bold text-slate-800 truncate leading-none">{user?.name}</p>
                    <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-1 block">{role}</span>
                  </div>
                </div>

                <div className="px-2 space-y-0.5 font-sans">
                  <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-white/50 hover:text-primary-600 transition-colors">
                    <span className="material-icons-outlined text-base">account_circle</span>
                    Profile
                  </Link>
                  <Link to="/sessions" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-white/50 hover:text-primary-600 transition-colors">
                    <span className="material-icons-outlined text-base">calendar_view_day</span>
                    My Sessions
                  </Link>
                  <button
                    onClick={() => { setDropdownOpen(false); setThemeBuilderOpen(true); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-white/50 hover:text-primary-600 transition-colors"
                  >
                    <span className="material-icons-outlined text-base">palette</span>
                    Theme Studio
                  </button>
                </div>

                <div className="border-t border-white/10 mt-2 px-2 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50/50 hover:text-red-600 transition-colors"
                  >
                    <span className="material-icons-outlined text-base">logout</span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Theme Builder Panel */}
      <ThemeBuilder open={themeBuilderOpen} onClose={() => setThemeBuilderOpen(false)} />
    </>
  );
}
