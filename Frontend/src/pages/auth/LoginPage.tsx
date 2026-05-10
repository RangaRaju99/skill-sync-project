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
    <div className="flex flex-col items-center w-full">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="w-16 h-16 bg-surface-container-low rounded-3xl flex items-center justify-center border border-outline/10 shadow-sm mb-6 group hover:rotate-3 transition-transform duration-500">
          <img
            src={logo}
            alt="SkillSync"
            className="w-10 h-10 object-contain"
            onError={(e: any) => { e.target.src = 'https://via.placeholder.com/40'; }}
          />
        </div>
        <h1 className="text-3xl font-display font-bold text-on-surface tracking-tight mb-2">Welcome Back</h1>
        <p className="text-on-surface-variant font-medium opacity-80 text-sm max-w-[280px]">
          Continue your growth journey by connecting with expertise.
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full surface-card p-8 md:p-10 shadow-xl shadow-black/[0.02] dark:shadow-none animate-in border-outline/5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant px-1">Email Address</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full h-12 px-4 bg-surface-container-low border border-outline/30 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/30 font-medium"
              placeholder="name@company.com"
            />
            {errors.email && <p className="text-xs text-error font-bold px-1">{errors.email.message as string}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">Password</label>
              <Link to="/forgot-password" className="text-[11px] font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-colors">
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              {...register('password', { required: 'Password is required' })}
              className="w-full h-12 px-4 bg-surface-container-low border border-outline/30 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/30 font-medium"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-xs text-error font-bold px-1">{errors.password.message as string}</p>}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full h-14 btn-primary text-base shadow-primary/20 hover:shadow-primary/40 mt-2"
          >
            {loginMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="flex-1 h-px bg-outline/10"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40">or continue with</span>
          <div className="flex-1 h-px bg-outline/10"></div>
        </div>

        <button
          onClick={() => handleGoogleLogin()}
          disabled={oauthMutation.isPending}
          className="mt-8 w-full h-14 btn-secondary text-sm border-outline/20 hover:bg-surface-container-highest/10"
        >
          {oauthMutation.isPending ? (
            <div className="w-5 h-5 border-2 border-on-surface/30 border-t-on-surface rounded-full animate-spin" />
          ) : (
            <div className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Google SSO</span>
            </div>
          )}
        </button>

        <div className="mt-10 text-center">
          <p className="text-sm font-medium text-on-surface-variant opacity-60">
            New to SkillSync? <Link to="/register" className="text-primary font-bold hover:underline">Create an account</Link>
          </p>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-12 flex gap-8 text-[11px] font-black uppercase tracking-widest text-on-surface-variant/40">
        <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
        <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
        <Link to="/help" className="hover:text-primary transition-colors">Support</Link>
      </div>
    </div>
  );
};

export default LoginPage;
