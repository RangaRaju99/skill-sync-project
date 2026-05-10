import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useTheme } from '../../context/ThemeContext';

interface PageLayoutProps {
  children: ReactNode;
  rightPanel?: ReactNode;
}

const PageLayout = ({ children, rightPanel }: PageLayoutProps) => {
  const role = useSelector((state: RootState) => state.auth.role);
  const activeRole = role || 'ROLE_LEARNER';
  const { isSidebarCollapsed } = useTheme();

  return (
    <div className="flex h-screen bg-surface-container-lowest font-sans text-on-surface overflow-hidden relative">
      {/* Cinematic Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-secondary/10 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      <Sidebar role={activeRole} />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out relative z-10 ${isSidebarCollapsed ? 'ml-20' : 'ml-20 lg:ml-64'
        }`}>
        <Navbar />

        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full p-4 md:p-6 lg:p-8 2xl:p-10 scroll-smooth">
          {rightPanel ? (
            <div className="w-full flex flex-col xl:flex-row gap-6 lg:gap-10">
              <div className="flex-1 min-w-0 flex flex-col gap-6 lg:gap-10">
                {children}
              </div>
              <aside className="w-full xl:w-80 shrink-0 flex flex-col gap-6 lg:gap-8">
                {rightPanel}
              </aside>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 lg:gap-10">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
