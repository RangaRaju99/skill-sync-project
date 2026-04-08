import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { useState } from 'react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [emailFocused, setEmailFocused] = useState(false);
  const [pwdFocused, setPwdFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const features = [
    { icon: 'school', title: 'Expert Mentors', desc: 'Learn from industry professionals' },
    { icon: 'event', title: 'Flexible Sessions', desc: 'Book sessions on your schedule' },
    { icon: 'group', title: 'Learning Groups', desc: 'Collaborate with peers' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const email = (e.target as any).email.value.trim();
    const password = (e.target as any).password.value;

    setLoading(true);
    console.log('Starting login for:', email);
    try {
      const response: any = await authService.login({ email, password });
      console.log('Login response received:', response);

      if (response && response.token) {
        console.log('Login successful, setting auth...');
        localStorage.setItem('token', response.token);

        let roles = response.roles || [];
        // If roles not in response, try token
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

        // Map flattened user data back to our store's User object
        const user = {
          id: String(response.userId),
          name: response.username || response.email,
          email: response.email,
          username: response.username,
          roles: roles
        };

        setAuth(user, response.token);

        // Mirror Angular AuthStore: mentor → dashboard, others → mentors list
        if (roles.includes('ROLE_MENTOR') || roles.includes('ROLE_ADMIN')) {
          navigate('/mentor-dashboard');
        } else {
          navigate('/mentors');
        }
      } else {
        console.warn('Login response missing token:', response);
        setError('Invalid response from server. Please try again.');
      }
    } catch (err: any) {
      console.error('Login failed catch block:', err);
      const msg = err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background font-sans">
      {/* Left Panel: Branding */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 items-center justify-center overflow-hidden p-12">
        <div className="relative z-10 text-white max-w-md">
          <div className="w-20 h-20 bg-white/10 rounded-[24px] flex items-center justify-center mb-8 backdrop-blur-xl border border-white/20 shadow-2xl">
            <span className="text-4xl">⚡</span>
          </div>
          <h1 className="text-5xl font-extrabold mb-3 tracking-tight">SkillSync</h1>
          <p className="text-xl text-primary-100 mb-12 font-medium">Connect. Learn. Grow.</p>

          <div className="space-y-8">
            {features.map((f, i) => (
              <div className="flex items-start gap-5 hover:-translate-y-1 transition-transform" key={i}>
                <div className="w-12 h-12 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                  <span className="material-icons text-white">{f.icon}</span>
                </div>
                <div>
                  <strong className="block text-lg font-bold mb-1 tracking-tight">{f.title}</strong>
                  <p className="text-sm text-primary-100 font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-500 rounded-full blur-[80px] opacity-40"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-purple-500 rounded-full blur-[80px] opacity-40"></div>
      </div>

      {/* Right Panel: Form */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-[420px] glass-card p-10 rounded-[2.5xl] animate-fade-in shadow-xl">
          
          {/* Mobile logo */}
          <div className="lg:hidden text-2xl font-extrabold text-primary-600 mb-8 flex items-center gap-2">
            ⚡ SkillSync
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Welcome back</h2>
            <p className="text-muted font-medium text-[15px]">Sign in to continue your learning journey</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-foreground tracking-wide ml-1">Email address</label>
              <div className={`flex items-center bg-surface border-[1.5px] rounded-xl px-4 h-14 transition-all ${emailFocused ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-border-color'}`}>
                <span className={`material-icons mr-3 transition-colors ${emailFocused ? 'text-primary-500' : 'text-muted'}`}>email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className="flex-1 bg-transparent border-none text-[15px] font-medium text-foreground outline-none placeholder:text-muted/60"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[13px] font-bold text-foreground tracking-wide">Password</label>
                <Link to="/auth/forgot-password" className="text-[13px] text-primary-600 font-bold hover:underline">Forgot password?</Link>
              </div>
              <div className={`flex items-center bg-surface border-[1.5px] rounded-xl px-4 h-14 transition-all ${pwdFocused ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-border-color'}`}>
                <span className={`material-icons mr-3 transition-colors ${pwdFocused ? 'text-primary-500' : 'text-muted'}`}>lock</span>
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  onFocus={() => setPwdFocused(true)}
                  onBlur={() => setPwdFocused(false)}
                  className="flex-1 bg-transparent border-none text-[15px] font-medium text-foreground outline-none placeholder:text-muted/60"
                  required
                />
                <button type="button" className="p-1 ml-2 text-muted hover:text-primary-600 transition-colors" onClick={() => setShowPwd(!showPwd)}>
                  <span className="material-icons text-[20px]">{showPwd ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 p-4 rounded-xl text-sm font-bold">
                <span className="material-icons text-[18px]">error_outline</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button 
              type="submit" 
              className="w-full h-14 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 dark:shadow-none hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-icons text-[20px]">arrow_forward</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 text-muted text-sm font-medium">
              <div className="flex-1 h-px bg-border-color"></div>
              <span>or continue with</span>
              <div className="flex-1 h-px bg-border-color"></div>
            </div>

            {/* Google */}
            <button type="button" className="w-full flex items-center justify-center gap-3 bg-card border border-border-color text-foreground h-14 rounded-xl font-bold hover:bg-surface transition-colors">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-[20px] h-[20px]" />
              Sign in with Google
            </button>

            {/* Register link */}
            <p className="text-center text-[15px] text-muted font-medium pt-2">
              Don't have an account? 
              <Link to="/auth/register" className="text-primary-600 font-bold hover:underline ml-1.5">Create one</Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}
