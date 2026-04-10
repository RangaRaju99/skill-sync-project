import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../../../services/auth.service';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Globe, GraduationCap, Calendar, Users, Ban } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  const features = [
    { icon: GraduationCap, title: 'Expert Mentors', desc: 'Learn from industry professionals' },
    { icon: Calendar, title: 'Flexible Sessions', desc: 'Book sessions on your schedule' },
    { icon: Users, title: 'Learning Groups', desc: 'Collaborate with peers' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const form = e.target as HTMLFormElement;
    const email = form.email.value.trim();
    const password = form.password.value;

    setLoading(true);
    try {
      const response: any = await authService.login({ email, password });
      if (response && response.token) {
        localStorage.setItem('token', response.token);
        let roles = response.roles || [];
        if (!roles.length) {
          try {
            const base64Url = response.token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const claims = JSON.parse(window.atob(base64));
            roles = claims.roles || [];
          } catch (e) {
            console.warn('Failed to decode JWT roles:', e);
          }
        }

        const user = {
          id: String(response.userId),
          name: response.username || response.email,
          email: response.email,
          username: response.username,
          roles: roles
        };

        setAuth(user, response.token);
        if (roles.includes('ROLE_MENTOR') || roles.includes('ROLE_ADMIN')) {
          navigate('/mentor-dashboard');
        } else {
          navigate('/mentors');
        }
      } else {
        setError('Invalid response from server. Please try again.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50 font-sans isolate">
      {/* Left Panel: Branding */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 items-center justify-center overflow-hidden p-12">
        <div className="relative z-10 text-white max-w-md">
          <div className="w-20 h-20 bg-white/10 rounded-[28px] flex items-center justify-center mb-8 backdrop-blur-xl border border-white/20 shadow-2xl">
            <span className="text-4xl">⚡</span>
          </div>
          <h1 className="text-5xl font-black mb-3 tracking-tighter uppercase italic">SkillSync</h1>
          <p className="text-xl text-indigo-100 mb-12 font-bold tracking-tight">Accelerate your growth today.</p>

          <div className="space-y-8">
            {features.map((f, i) => (
              <div className="flex items-start gap-5 group transition-transform hover:translate-x-1" key={i}>
                <div className="w-12 h-12 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 text-white group-hover:bg-white/20 transition-all">
                  <Icon icon={f.icon} size={22} />
                </div>
                <div>
                  <strong className="block text-lg font-black mb-1 tracking-tight">{f.title}</strong>
                  <p className="text-sm text-indigo-100 font-bold opacity-80">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-500 rounded-full blur-[80px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-indigo-400 rounded-full blur-[80px] opacity-40 animate-pulse"></div>
      </div>

      {/* Right Panel: Form */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative z-[1000] pointer-events-auto">
        <div className="w-full max-w-[440px] bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] border border-slate-100 animate-fade-in relative z-[1001] pointer-events-auto">
          
          <div className="lg:hidden text-2xl font-black text-indigo-600 mb-8 flex items-center gap-2 italic uppercase tracking-tighter">
            ⚡ SkillSync
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h2>
            <p className="text-slate-500 font-bold text-[15px] tracking-tight">Sign in to your account with your credentials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            <Input
              name="email"
              type="email"
              label="Email Address"
              placeholder="you@skillsync.com"
              autoComplete="email"
              required
              leftIcon={<Icon icon={Mail} size={18} />}
            />

            <div className="space-y-1">
              <div className="flex justify-between items-center px-1 mb-1">
                 <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none">Password</label>
                 <Link to="/auth/forgot-password" title="Recover Password" className="text-[11px] text-indigo-600 font-black uppercase tracking-widest hover:text-indigo-700">Forgot?</Link>
              </div>
              <Input
                name="password"
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                leftIcon={<Icon icon={Lock} size={18} />}
                rightIcon={
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="focus:outline-none">
                    <Icon icon={showPwd ? EyeOff : Eye} size={18} />
                  </button>
                }
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-rose-50 text-rose-600 border border-rose-100 p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest animate-shake">
                <Icon icon={Ban} size={16} />
                {error}
              </div>
            )}

            <Button 
               type="submit" 
               className="w-full h-14"
               isLoading={loading}
               rightIcon={<Icon icon={ArrowRight} size={20} />}
            >
              Sign In
            </Button>

            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Or continue with</span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>

            {/* Google OAuth Start */}
            <button 
              type="button" 
              disabled={loading}
              onClick={() => {
                setError(null);
                // Production-ready redirect to Backend OAuth Entry Point
                window.location.href = 'http://api.20.244.84.62.nip.io/oauth2/authorization/google';
              }}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 h-14 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="w-6 h-6 flex items-center justify-center bg-white rounded-lg shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              Continue with Google
            </button>

            {/* Register link */}
            <p className="text-center text-[13px] text-slate-500 font-bold pt-4 tracking-tight">
              Don't have an account? 
              <Link to="/auth/register" className="text-indigo-600 font-black hover:text-indigo-700 transition-colors ml-1.5 uppercase text-xs tracking-widest">Register</Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}
