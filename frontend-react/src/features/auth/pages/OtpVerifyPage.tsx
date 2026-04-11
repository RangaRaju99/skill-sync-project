import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { Zap, Check, AlertCircle } from 'lucide-react';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';

export default function OtpVerifyPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('reg_email');
    if (!storedEmail) {
      navigate('/auth/register');
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  const verifyOtp = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    setError(null);
    try {
      await authService.verifyOtp({ email, otp });
      navigate('/auth/register-details');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.sendOtp(email);
      alert("OTP Resent!");
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to resend OTP');
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
          <p className="text-xl text-primary-100 mb-12 font-medium">Verify your identity to complete registration</p>

          <div className="space-y-6">
            <div className="flex items-center gap-4 opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white border-2 border-emerald-400 flex items-center justify-center text-sm font-black shrink-0 shadow-lg shadow-emerald-500/20">
                <Icon icon={Check} size={18} />
              </div>
              <span className="text-lg font-bold text-emerald-100">Form submitted</span>
            </div>
            <div className="flex items-center gap-4 opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-white text-primary-600 border-2 border-white flex items-center justify-center text-sm font-black shrink-0 shadow-lg shadow-white/20">
                2
              </div>
              <span className="text-lg font-bold">Verify your email</span>
            </div>
            <div className="flex items-center gap-4 opacity-50 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-sm font-black shrink-0">
                3
              </div>
              <span className="text-lg font-bold">Ready to login</span>
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

          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Verify your email</h2>
            <p className="text-muted font-medium text-[15px]">We sent a 6-digit code to <strong className="text-foreground">{email}</strong></p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center bg-surface border-[1.5px] border-border-color rounded-xl h-16 w-full max-w-[280px] transition-all focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/10">
                 <input 
                    type="text" 
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
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

            <div className="w-full flex flex-col gap-4 mt-2">
              <Button 
                onClick={verifyOtp} 
                disabled={otp.length !== 6}
                className="w-full h-14"
                loading={loading}
              >
                Verify OTP
              </Button>
              <button 
                onClick={resendOtp} 
                className="text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Didn't receive it? Resend OTP
              </button>
            </div>
          </div>

          <p className="text-center text-[15px] text-muted font-medium pt-8 mt-2">
            Wait, I used the wrong email? <Link to="/auth/register" className="text-primary-600 font-bold hover:underline ml-1">Go back</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
