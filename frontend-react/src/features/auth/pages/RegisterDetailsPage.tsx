import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { Zap, Check, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export default function RegisterDetailsPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pwdFocused, setPwdFocused] = useState(false);
  const [confirmPwdFocused, setConfirmPwdFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('reg_email');
    if (!storedEmail) {
      navigate('/auth/register');
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords must match");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const response: any = await authService.register({ email, password });
      if (response && response.token) {
        localStorage.setItem('token', response.token);
        
        // Map flattened user data back to our store's User object
        const user = {
          id: String(response.userId),
          name: response.username || response.email,
          email: response.email,
          username: response.username,
          roles: response.roles || []
        };
        
        setAuth(user, response.token);
        sessionStorage.removeItem('reg_email');
        navigate('/mentors');
      } else {
        setError('Invalid response from server. Please try again.');
      }
    } catch (err: any) {
      console.error('Registration failed', err);
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
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
            <Icon icon={Zap} size={40} className="text-white fill-white" />
          </div>
          <h1 className="text-5xl font-extrabold mb-3 tracking-tight">SkillSync</h1>
          <p className="text-xl text-primary-100 mb-12 font-medium">Secure your new account</p>

          <div className="space-y-6">
            <div className="flex items-center gap-4 opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white border-2 border-emerald-400 flex items-center justify-center text-sm font-black shrink-0 shadow-lg shadow-emerald-500/20">
                <span className="material-icons text-[18px]">check</span>
              </div>
              <span className="text-lg font-bold text-emerald-100">Enter Email</span>
            </div>
            <div className="flex items-center gap-4 opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white border-2 border-emerald-400 flex items-center justify-center text-sm font-black shrink-0 shadow-lg shadow-emerald-500/20">
                <span className="material-icons text-[18px]">check</span>
              </div>
              <span className="text-lg font-bold text-emerald-100">Verify OTP</span>
            </div>
            <div className="flex items-center gap-4 opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-white text-primary-600 border-2 border-white flex items-center justify-center text-sm font-black shrink-0 shadow-lg shadow-white/20">
                3
              </div>
              <span className="text-lg font-bold">Set Password</span>
            </div>
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
            <Icon icon={Zap} size={28} className="fill-primary-600" /> SkillSync
          </div>

          <div className="mb-10 text-left">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Set Password</h2>
            <p className="text-muted font-medium text-[15px]">Create a secure password for <strong className="text-foreground">{email}</strong></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
             <Input 
                label="Password"
                type={showPwd ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
                leftIcon={<Icon icon={Lock} size={20} />}
                rightIcon={
                    <button type="button" onClick={() => setShowPwd(!showPwd)}>
                      <Icon icon={showPwd ? EyeOff : Eye} size={20} />
                    </button>
                }
                error={!!error && error.includes('Password')}
             />

             <Input 
                label="Confirm Password"
                type={showConfirmPwd ? 'text' : 'password'} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                leftIcon={<Icon icon={Lock} size={20} />}
                rightIcon={
                    <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)}>
                      <Icon icon={showConfirmPwd ? EyeOff : Eye} size={20} />
                    </button>
                }
                error={error === "Passwords must match"}
                helperText={error === "Passwords must match" ? "Passwords must match" : undefined}
             />
            
            {error && error !== "Passwords must match" && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 p-4 rounded-xl text-sm font-bold w-full animate-shake">
                <Icon icon={AlertCircle} size={18} />
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 mt-4"
              loading={loading}
              disabled={!password || !confirmPassword}
              rightIcon={<Icon icon={CheckCircle} size={20} />}
            >
              Complete Registration
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
