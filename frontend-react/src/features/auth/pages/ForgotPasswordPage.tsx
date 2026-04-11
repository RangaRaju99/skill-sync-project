import { Link } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '@/services/auth.service';
import { ArrowLeft, ArrowRight, Mail, ShieldAlert, MailCheck, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

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
          <Icon icon={ArrowLeft} size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to login
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
                <Icon icon={ShieldAlert} size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-foreground mb-2 tracking-tight">Forgot password?</h2>
              <p className="text-muted text-[15px] font-medium">Enter your email and we'll send you a reset code</p>
            </div>
            <form onSubmit={sendOtp} className="space-y-6">
              <Input 
                 label="Email address"
                 type="email" 
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="you@example.com"
                 required
                 leftIcon={<Icon icon={Mail} size={20} />}
                 error={!!error}
              />
              
              {error && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 p-4 rounded-xl text-sm font-bold w-full animate-shake">
                  <Icon icon={AlertCircle} size={18} />
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={!email}
                className="w-full h-14"
                loading={loading}
                rightIcon={<Icon icon={ArrowRight} size={20} />}
              >
                Send Reset Code
              </Button>
            </form>
          </>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                <Icon icon={MailCheck} size={28} className="text-white" />
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
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 p-4 rounded-xl text-sm font-bold w-full animate-shake">
                  <Icon icon={AlertCircle} size={18} />
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
                <Icon icon={Lock} size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-foreground mb-2 tracking-tight">Set new password</h2>
              <p className="text-muted text-[15px] font-medium">Choose a strong password for your account</p>
            </div>
            
            <form onSubmit={resetPassword} className="space-y-6">
              <Input 
                 label="New Password"
                 type={showPwd ? 'text' : 'password'} 
                 value={newPassword}
                 onChange={(e) => setNewPassword(e.target.value)}
                 placeholder="Min 8 characters"
                 required
                 leftIcon={<Icon icon={Lock} size={20} />}
                 rightIcon={
                    <button type="button" onClick={() => setShowPwd(!showPwd)}>
                      <Icon icon={showPwd ? EyeOff : Eye} size={20} />
                    </button>
                 }
                 error={!!error}
              />
              
              {error && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 p-4 rounded-xl text-sm font-bold w-full animate-shake">
                  <Icon icon={AlertCircle} size={18} />
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={!newPassword}
                className="w-full h-14"
                loading={loading}
                rightIcon={<Icon icon={ArrowRight} size={20} />}
              >
                Reset Password
              </Button>
            </form>
          </>
        )}

        {/* Done Step */}
        {step === 'done' && (
          <div className="flex flex-col items-center gap-4 text-center py-4 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-2">
              <Icon icon={CheckCircle} size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Password reset!</h2>
            <p className="text-muted font-medium text-[15px] mb-4">Your password has been updated successfully.</p>
            <Link to="/auth/login" className="w-full">
               <Button className="w-full h-14" rightIcon={<Icon icon={ArrowRight} size={20} />}>
                  Sign In Now
               </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
