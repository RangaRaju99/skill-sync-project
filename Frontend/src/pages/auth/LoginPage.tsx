import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGoogleLogin } from '@react-oauth/google';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../../services/axios';
import { useToast } from '../../components/ui/Toast';
import logo from '../../assets/skillsync-logo.png';

const LoginPage = () => {
  // ... existing form hooks ...
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('reason') === 'session_expired') {
      showToast({ message: 'Your session expired. Please sign in again.', type: 'error' });
      const updatedParams = new URLSearchParams(searchParams);
      updatedParams.delete('reason');
      setSearchParams(updatedParams, { replace: true });
    }
  }, [searchParams, setSearchParams, showToast]);

  const loginMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/api/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      dispatch(setCredentials({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      }));
      
      const role = data.user.role;
      if (role === 'ROLE_ADMIN') navigate('/admin');
      else if (role === 'ROLE_MENTOR') navigate('/mentor');
      else navigate('/learner');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Invalid credentials. Please try again.';
      showToast({ message, type: 'error' });
    }
  });

  const oauthMutation = useMutation({
    mutationFn: async (profile: any) => {
      const response = await api.post('/api/auth/oauth-login', profile);
      return response.data;
    },
    onSuccess: (data, variables) => {
      if (data.passwordSetupRequired) {
        navigate('/setup-password', { state: { email: variables.email } });
      } else {
        dispatch(setCredentials({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }));
        const role = data.user.role;
        if (role === 'ROLE_ADMIN') navigate('/admin');
        else if (role === 'ROLE_MENTOR') navigate('/mentor');
        else navigate('/learner');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'OAuth login failed.';
      showToast({ message, type: 'error' });
    }
  });

  const onSubmit = (data: any) => {
    loginMutation.mutate(data);
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Since we're using the Implicit Flow with useGoogleLogin, 
        // we can either get user info from an ID token (if available) 
        // or by calling Google's userInfo endpoint using the access_token.
        
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());

        const profile = {
          provider: 'google',
          providerId: `google-${userInfo.sub}`,
          email: userInfo.email,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name
        };

        oauthMutation.mutate(profile);
      } catch (err) {
        showToast({ message: 'Failed to fetch Google profile.', type: 'error' });
      }
    },
    onError: () => {
      showToast({ message: 'Google Login failed.', type: 'error' });
    }
  });

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-3 mb-4 transition-all">
        <img 
          src={logo} 
          alt="SkillSync Logo" 
          className="w-10 h-10 object-contain grayscale" 
          onError={(e: any) => { e.target.src = 'https://via.placeholder.com/48?text=S'; }} 
        />
        <h1 className="text-3xl font-black tracking-tighter text-on-surface uppercase font-mono">SkillSync</h1>
      </div>
      <p className="technical-label text-on-surface-variant mb-8 text-center px-4 max-w-xs">[ SYSTEM_ACCESS_PORTAL_v1.0 ]</p>

      <div className="w-full bg-surface p-8 md:p-10 blueprint-border shadow-none">
        <div className="flex justify-between items-center mb-8 border-b border-outline-variant pb-2">
          <h2 className="text-xs font-bold text-on-surface uppercase font-mono">LOGIN_SEQUENCE</h2>
          <span className="text-[10px] text-green-500 font-bold font-mono">● ONLINE</span>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="technical-label block mb-2">USER_EMAIL_ADDRESS</label>
            <input 
              type="email" 
              {...register('email', { required: 'Email is required' })} 
              className="w-full h-11 px-4 bg-surface border border-outline focus:bg-primary/5 focus:border-primary outline-none transition-all duration-200 font-mono text-sm" 
              placeholder="name@example.com"
            />
            {errors.email && <p className="text-[10px] text-error mt-1 font-bold font-mono">! ERR: {errors.email.message as string}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="technical-label">ACCESS_PASSWORD</label>
            </div>
            <input 
              type="password" 
              {...register('password', { required: 'Password is required' })} 
              className="w-full h-11 px-4 bg-surface border border-outline focus:bg-primary/5 focus:border-primary outline-none transition-all duration-200 font-mono text-sm" 
              placeholder="••••••••"
            />
            {errors.password && <p className="text-[10px] text-error mt-1 font-bold font-mono">! ERR: {errors.password.message as string}</p>}
            <div className="mt-2 text-right">
              <Link to="/forgot-password" virtual-link="true" className="text-[10px] font-bold text-on-surface-variant hover:text-primary uppercase font-mono underline underline-offset-4">Reset_Password</Link>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loginMutation.isPending} 
            className="mt-4 flex items-center justify-center w-full h-12 gradient-btn text-white disabled:opacity-50"
          >
            {loginMutation.isPending ? (
              <span className="font-mono text-xs animate-pulse">EXECUTING...</span>
            ) : (
              <span className="font-mono">INITIALIZE_SYNC [ENTER]</span>
            )}
          </button>
        </form>


        <div className="mt-6 flex items-center justify-center space-x-4">
          <div className="flex-1 h-px bg-outline-variant/30"></div>
          <span className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">OR CONTINUE WITH</span>
          <div className="flex-1 h-px bg-outline-variant/30"></div>
        </div>

        <button 
          onClick={() => handleGoogleLogin()} 
          disabled={oauthMutation.isPending}
          className="mt-6 flex items-center justify-center w-full h-12 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold rounded-xl shadow-sm border border-outline-variant/30 transition-all duration-200"
        >
          {oauthMutation.isPending ? (
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-on-surface"></span>
          ) : (
            <>
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </>
          )}
        </button>

        <p className="mt-6 text-center text-sm font-semibold text-on-surface-variant">
          Don't have an account? <Link to="/register" className="text-primary hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
