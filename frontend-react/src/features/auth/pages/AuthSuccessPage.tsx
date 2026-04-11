import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/user.service';

const AuthSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleSuccess = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        console.error('No token found in OAuth success redirect');
        navigate('/auth/login?error=oauth_failed');
        return;
      }

      try {
        // 1. Store token in localStorage
        localStorage.setItem('token', token);

        // 2. Decode user info from token (optional, but good for instant UI)
        let roles: string[] = [];
        let jwtUserId: string | null = null;
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const claims = JSON.parse(window.atob(base64));
          roles = claims.roles || [];
          jwtUserId = claims.userId ? String(claims.userId) : null;
        } catch (e) {
          console.warn('Failed to decode OAuth JWT:', e);
        }

        // 3. Fetch full user profile to ensure state is synchronized
        const response = await userService.getCurrentUser();
        const userData = response.data || response;

        const user = {
          id: String(userData.userId || userData.id || jwtUserId || ''),
          name: userData.name || userData.username || userData.email || '',
          email: userData.email || '',
          username: userData.username,
          roles: roles,
          avatar: userData.profileImageUrl
        };

        // 4. Update global auth store
        setAuth(user, token);

        // 5. Navigate to dashboard or home
        if (roles.includes('ROLE_MENTOR') || roles.includes('ROLE_ADMIN')) {
          navigate('/mentor-dashboard');
        } else {
          navigate('/mentors');
        }
      } catch (error) {
        console.error('Error during OAuth post-processing:', error);
        navigate('/auth/login?error=sync_failed');
      }
    };

    handleSuccess();
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Authenticating with Google...</h2>
          <p className="text-slate-500 font-bold text-sm">Finishing the secure sync of your profile.</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Secure Connection Established
        </div>
      </div>
    </div>
  );
};

export default AuthSuccessPage;
