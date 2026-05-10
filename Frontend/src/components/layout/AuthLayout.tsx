import { Outlet } from 'react-router-dom';
import ThemeToggleButton from '../ui/ThemeToggleButton';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface technical-grid relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 z-0">
      <div className="fixed top-4 right-4 z-30">
        <ThemeToggleButton showLabel={false} />
      </div>

      <div className="absolute top-6 left-6 technical-label text-on-surface/20">SECURITY_PROTO: SSL_V3</div>
      <div className="absolute bottom-6 right-6 technical-label text-on-surface/20">AUTH_MODE: ENCRYPTED</div>
      
      <div className="w-full max-w-[440px]">
        <Outlet />
      </div>
    </div>
  );
};


export default AuthLayout;
