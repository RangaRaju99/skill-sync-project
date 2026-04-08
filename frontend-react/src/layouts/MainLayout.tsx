import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useMyMentorProfile, useMentors } from '../hooks/useMentors';
import { authService } from '../services/auth.service';
import { useQueryClient } from '@tanstack/react-query';
import { EngagementProvider } from '@/features/engagement/EngagementContext';

export default function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, token, setAuth, addRole } = useAuthStore();
  const { data: mentorProfile } = useMyMentorProfile();
  // Fallback: check if current user appears in the public approved-mentors list
  const { data: allMentors } = useMentors();
  const queryClient = useQueryClient();
  const hasRefreshed = useRef(false);

  useEffect(() => {
    // Already has ROLE_MENTOR in store
    const hasRoleLocally = user?.roles?.includes('ROLE_MENTOR');

    // Detect mentor status from EITHER source:
    // 1. /mentor/profile/me returns their profile (isApproved)
    // 2. Their userId appears in the public approved-mentors list
    const isApprovedMentor = (
      (mentorProfile && mentorProfile.isApproved !== false) ||
      (allMentors && Array.isArray(allMentors) && allMentors.some((m: any) => String(m.userId) === String(user?.id)))
    );

    if (!isApprovedMentor) return;

    // STEP 1: Sync Local State (Instant UI update)
    if (!hasRoleLocally) {
      console.log('[SkillSync] Mentor profile detected! Syncing role locally...');
      addRole('ROLE_MENTOR');
    }

    // STEP 2: Background Token Refresh (Backend Authorization)
    // We only need to refresh if the JWT itself is missing the role claim
    const currentToken = token || localStorage.getItem('token') || '';
    let jwtHasMentor = false;
    try {
      const payload = JSON.parse(window.atob(currentToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      jwtHasMentor = (payload.roles || []).includes('ROLE_MENTOR');
    } catch { /* ignore */ }

    if (!jwtHasMentor && !hasRefreshed.current) {
      hasRefreshed.current = true;
      console.log('[SkillSync] JWT is stale (missing ROLE_MENTOR). Triggering refresh...');

      authService.refreshToken().then((res: any) => {
        const newToken: string | undefined = res?.token;
        if (!newToken) return;

        let freshRoles: string[] = res.roles || [];
        if (!freshRoles.length) {
          try {
            const pl = JSON.parse(window.atob(newToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            freshRoles = pl.roles || [];
          } catch { /* ignore */ }
        }

        const merged = Array.from(new Set([...(user?.roles || []), ...freshRoles]));
        localStorage.setItem('token', newToken);
        setAuth({ ...user!, roles: merged }, newToken);

        // Ensure all dependent queries update with the new JWT
        queryClient.invalidateQueries({ queryKey: ['sessions'] });
        queryClient.invalidateQueries({ queryKey: ['mentor', 'me'] });
        console.log('[SkillSync] JWT refresh complete ✓ Roles:', merged);
      }).catch((err) => {
        console.warn('[SkillSync] JWT refresh failed (backend sync issue):', err);
        // We already added the role locally above, so the UI will still work
      });
    }
  }, [mentorProfile, allMentors, user?.id, user?.roles, token, setAuth, addRole, queryClient]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setIsCollapsed(!isCollapsed);
    } else {
      setMobileMenuOpen(!mobileMenuOpen);
    }
  };


  return (
    <EngagementProvider>
      <div className="flex h-screen overflow-hidden bg-background font-sans transition-colors duration-300">
        {/* Rest of the layout... */}
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col bg-surface border-r border-border-color transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-72'
            }`}
        >
          <Sidebar isCollapsed={isCollapsed} onNavClick={() => setMobileMenuOpen(false)} />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Navbar */}
          <Navbar toggleSidebar={toggleSidebar} />

          {/* Router Content */}
          <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-10 pb-24 lg:pb-10">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>

          {/* Mobile Bottom Nav */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass-effect border-t border-border-color px-6 py-3 z-50 flex justify-between items-center rounded-t-3xl shadow-2xl">
            <Link to="/mentors" className="flex flex-col items-center gap-1 transition-colors hover:text-primary-500 text-slate-500 dark:text-slate-400">
              <span className="material-icons-outlined">search</span>
              <span className="text-[10px] font-medium uppercase tracking-wider">Explore</span>
            </Link>
            <Link to="/sessions" className="flex flex-col items-center gap-1 transition-colors hover:text-primary-500 text-slate-500 dark:text-slate-400">
              <span className="material-icons-outlined">calendar_today</span>
              <span className="text-[10px] font-medium uppercase tracking-wider">Sessions</span>
            </Link>
            <div className="relative -top-6">
              <Link to="/groups" className="flex items-center justify-center w-14 h-14 bg-primary-600 text-white rounded-2xl shadow-xl shadow-primary-100 dark:shadow-primary-900/50 transition-transform active:scale-95">
                <span className="material-icons">group</span>
              </Link>
            </div>
            <Link to="/notifications" className="flex flex-col items-center gap-1 transition-colors hover:text-primary-500 text-slate-500 dark:text-slate-400">
              <span className="material-icons-outlined">notifications</span>
              <span className="text-[10px] font-medium uppercase tracking-wider">Alerts</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center gap-1 transition-colors hover:text-primary-500 text-slate-500 dark:text-slate-400">
              <span className="material-icons-outlined">person</span>
              <span className="text-[10px] font-medium uppercase tracking-wider">Profile</span>
            </Link>
          </nav>

        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <aside
              className="w-72 h-full bg-surface shadow-2xl animate-slide-in"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar onNavClick={() => setMobileMenuOpen(false)} isCollapsed={false} />
            </aside>
          </div>
        )}

      </div>
    </EngagementProvider>
  );
}
