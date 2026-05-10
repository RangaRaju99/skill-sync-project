import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface PageLayoutProps {
  children: ReactNode;
  rightPanel?: ReactNode;
}

const PageLayout = ({ children, rightPanel }: PageLayoutProps) => {
  const role = useSelector((state: RootState) => state.auth.role);
  const activeRole = role || 'ROLE_LEARNER';

  return (
    <div className="flex h-screen bg-transparent font-sans text-on-surface overflow-hidden relative">
      <div className="app-background">
        <div className="glow-orb orb-1" />
        <div className="glow-orb orb-2" />
      </div>

      <Sidebar role={activeRole} />
      
      <div className="flex-1 flex flex-col min-w-0 ml-20 lg:ml-64 transition-all duration-500 ease-in-out relative z-10">
        <Navbar />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full p-6 md:p-8 lg:p-10 2xl:p-12 scroll-smooth">
          {rightPanel ? (
            <div className="w-full flex flex-col xl:flex-row gap-8 lg:gap-10">
              <div className="flex-1 min-w-0 flex flex-col gap-8 lg:gap-10">
                {children}
              </div>
              <aside className="w-full xl:w-96 shrink-0 flex flex-col gap-8">
                {rightPanel}
              </aside>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-8 lg:gap-10">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
