import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '@/services/auth.service';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [emailFocused, setEmailFocused] = useState(false);
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const email = (e.target as any).email.value.trim();

    setLoading(true);
    try {
      await authService.sendOtp(email);
      sessionStorage.setItem('reg_email', email);
      navigate('/auth/verify-otp');
    } catch (err: any) {
      console.error('Registration failed', err);
      setError(err?.response?.data?.message || 'Failed to send OTP.');
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
          <p className="text-xl text-primary-100 mb-12 font-medium">Join our mentor network today</p>

          <div className="space-y-6">
            <div className="flex items-center gap-4 opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-white text-primary-600 border-2 border-white flex items-center justify-center text-sm font-black shrink-0 shadow-lg shadow-white/20">
                1
              </div>
              <span className="text-lg font-bold">Enter Email</span>
            </div>
            <div className="flex items-center gap-4 opacity-50 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-sm font-black shrink-0">
                2
              </div>
              <span className="text-lg font-bold">Verify OTP</span>
            </div>
            <div className="flex items-center gap-4 opacity-50 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-sm font-black shrink-0">
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
            ⚡ SkillSync
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Join SkillSync</h2>
            <p className="text-muted font-medium text-[15px]">Enter your email to receive a verification code</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            
            {/* Email */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-foreground tracking-wide ml-1">Email address</label>
              <div className={`flex items-center bg-surface border-[1.5px] rounded-xl px-4 h-14 transition-all ${emailFocused ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-border-color'} ${error ? 'border-red-500' : ''}`}>
                <span className={`material-icons mr-3 transition-colors ${emailFocused ? 'text-primary-500' : 'text-muted'}`}>email</span>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="you@example.com"
                  onFocus={() => setEmailFocused(true)} 
                  onBlur={() => setEmailFocused(false)} 
                  className="flex-1 bg-transparent border-none text-[15px] font-medium text-foreground outline-none placeholder:text-muted/60"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 p-4 rounded-xl text-sm font-bold">
                <span className="material-icons text-[18px]">error_outline</span>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full h-14 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 dark:shadow-none hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Send OTP</span>
                  <span className="material-icons text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[15px] text-muted font-medium pt-8">
            Already have an account? <Link to="/auth/login" className="text-primary-600 font-bold hover:underline ml-1">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
