import { Outlet } from 'react-router-dom';
import ThemeToggleButton from '../ui/ThemeToggleButton';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 z-0">
      {/* Settings/Theme Toggle */}
      <div className="fixed top-6 right-6 z-30">
        <ThemeToggleButton showLabel={false} className="shadow-2xl" />
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Soft Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Subtle Grid Pattern for Light Mode */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
      </div>

      <div className="w-full max-w-[420px] relative">
        {/* Entrance Animation Wrapper */}
        <div className="animate-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
