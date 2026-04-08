import { Link } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '@/services/auth.service';

type Step = 'email' | 'otp' | 'reset' | 'done';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const progressWidth = () => {
    return { email: '33%', otp: '66%', reset: '100%', done: '100%' }[step];
  };

  const sendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      await authService.sendForgotPasswordOtp(email);
      setStep('otp');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (otpCode: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.verifyForgotPasswordOtp(email, otpCode);
      setStep('reset');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword(email, newPassword);
      setStep('done');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 font-sans relative overflow-hidden">
      
      {/* Decorative blobs for centered page */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-indigo-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-purple-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-[440px] glass-card p-8 sm:p-10 rounded-[2.5xl] animate-fade-in shadow-xl relative z-10">
        <Link to="/auth/login" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-primary-600 transition-colors mb-8 group">
          <span className="material-icons text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span> Back to login
        </Link>

        {step !== 'done' && (
          <div className="h-1.5 bg-surface border border-border-color rounded-full mb-8 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-indigo-600 transition-all duration-500 ease-out rounded-full" 
              style={{ width: progressWidth() }}
            ></div>
          </div>
        )}

        {/* Email Step */}
        {step === 'email' && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-600/30">
                <span className="material-icons text-white text-[28px]">lock_reset</span>
              </div>
              <h2 className="text-2xl font-extrabold text-foreground mb-2 tracking-tight">Forgot password?</h2>
              <p className="text-muted text-[15px] font-medium">Enter your email and we'll send you a reset code</p>
            </div>
            <form onSubmit={sendOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-foreground tracking-wide ml-1">Email address</label>
                <div className={`flex items-center bg-surface border-[1.5px] rounded-xl px-4 h-14 transition-all ${focused ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-border-color'}`}>
                  <span className={`material-icons mr-3 transition-colors ${focused ? 'text-primary-500' : 'text-muted'}`}>email</span>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    onFocus={() => setFocused(true)} 
                    onBlur={() => setFocused(false)} 
                    className="flex-1 bg-transparent border-none text-[15px] font-medium text-foreground outline-none placeholder:text-muted/60"
                    required
                  />
                </div>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 p-4 rounded-xl text-sm font-bold w-full">
                  <span className="material-icons text-[18px]">error_outline</span>
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={!email || loading}
                className="w-full h-14 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 dark:shadow-none hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 
                  <><span>Send Reset Code</span><span className="material-icons text-[20px]">arrow_forward</span></>}
              </button>
            </form>
          </>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                <span className="material-icons text-white text-[28px]">mark_email_read</span>
              </div>
              <h2 className="text-2xl font-extrabold text-foreground mb-2 tracking-tight">Check your email</h2>
              <p className="text-muted text-[15px] font-medium">We sent a 6-digit code to <strong className="text-foreground">{email}</strong></p>
            </div>
            
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center bg-surface border-[1.5px] border-border-color rounded-xl h-16 w-full max-w-[280px] transition-all focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/10">
                 <input 
                    type="text" 
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setOtp(val);
                      if (val.length === 6) verifyOtp(val);
                    }}
                    placeholder="------"
                    className="w-full bg-transparent border-none text-center text-3xl tracking-[12px] font-black text-foreground outline-none"
                 />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 p-4 rounded-xl text-sm font-bold w-full">
                  <span className="material-icons text-[18px]">error_outline</span>
                  {error}
                </div>
              )}

              <button 
                onClick={() => sendOtp()} 
                type="button"
                className="text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors mt-2"
              >
                Resend code
              </button>
            </div>
          </>
        )}

        {/* Reset Step */}
        {step === 'reset' && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                <span className="material-icons text-white text-[28px]">lock</span>
              </div>
              <h2 className="text-2xl font-extrabold text-foreground mb-2 tracking-tight">Set new password</h2>
              <p className="text-muted text-[15px] font-medium">Choose a strong password for your account</p>
            </div>
            
            <form onSubmit={resetPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-foreground tracking-wide ml-1">New Password</label>
                <div className={`flex items-center bg-surface border-[1.5px] rounded-xl px-4 h-14 transition-all ${focused ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-border-color'}`}>
                  <span className={`material-icons mr-3 transition-colors ${focused ? 'text-primary-500' : 'text-muted'}`}>lock</span>
                  <input 
                    type={showPwd ? 'text' : 'password'} 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    onFocus={() => setFocused(true)} 
                    onBlur={() => setFocused(false)} 
                    className="flex-1 bg-transparent border-none text-[15px] font-medium text-foreground outline-none placeholder:text-muted/60"
                    required
                  />
                  <button type="button" className="p-1 ml-2 text-muted hover:text-primary-600 transition-colors" onClick={() => setShowPwd(!showPwd)}>
                    <span className="material-icons text-[20px]">{showPwd ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 p-4 rounded-xl text-sm font-bold w-full">
                  <span className="material-icons text-[18px]">error_outline</span>
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={!newPassword || loading}
                className="w-full h-14 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 dark:shadow-none hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 
                  <><span>Reset Password</span><span className="material-icons text-[20px]">arrow_forward</span></>}
              </button>
            </form>
          </>
        )}

        {/* Done Step */}
        {step === 'done' && (
          <div className="flex flex-col items-center gap-4 text-center py-4 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-2">
              <span className="material-icons text-[40px] text-white">check</span>
            </div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Password reset!</h2>
            <p className="text-muted font-medium text-[15px] mb-4">Your password has been updated successfully.</p>
            <Link 
              to="/auth/login" 
              className="w-full h-14 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 dark:shadow-none hover:-translate-y-0.5 active:translate-y-0 transition-all mt-2"
            >
              <span>Sign In Now</span><span className="material-icons text-[20px]">arrow_forward</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
