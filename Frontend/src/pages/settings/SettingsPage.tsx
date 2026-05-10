import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import api from '../../services/axios';
import PageLayout from '../../components/layout/PageLayout';
import { useToast } from '../../components/ui/Toast';
import type { RootState } from '../../store';

const SettingsPage = () => {
  const { showToast } = useToast();
  const userEmail = useSelector((state: RootState) => state.auth.user?.email || '');

  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState(userEmail);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const constraints = [
    { label: 'Minimum 8 characters', met: newPassword.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: 'One lowercase letter', met: /[a-z]/.test(newPassword) },
    { label: 'One number', met: /\d/.test(newPassword) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(newPassword) },
  ];
  const allConstraintsMet = constraints.every((rule) => rule.met);
  const otpCode = otp.join('');
  const isOtpComplete = otp.every((digit) => digit !== '');

  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/api/auth/forgot-password', { email }, { _skipErrorRedirect: true } as any);
      return response.data;
    },
    onSuccess: () => {
      showToast({ message: 'Password reset OTP sent to your email.', type: 'success' });
      setStep('otp');
      setOtp(Array(6).fill(''));
      setTimeLeft(300);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to send OTP';
      showToast({ message, type: 'error' });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(
        '/api/auth/verify-password-reset-otp',
        { email, otp: otpCode },
        { _skipErrorRedirect: true } as any,
      );
      return response.data;
    },
    onSuccess: () => {
      showToast({ message: 'OTP verified. Set your new password.', type: 'success' });
      setStep('password');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Invalid OTP';
      showToast({ message, type: 'error' });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(
        '/api/auth/reset-password',
        {
          email,
          otp: otpCode,
          newPassword,
        },
        { _skipErrorRedirect: true } as any,
      );
      return response.data;
    },
    onSuccess: (data: any) => {
      showToast({ message: data?.message || 'Password updated successfully', type: 'success' });
      setStep('email');
      setOtp(Array(6).fill(''));
      setTimeLeft(0);
      setNewPassword('');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to change password';
      showToast({ message, type: 'error' });
    },
  });

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      showToast({ message: 'Email is required', type: 'error' });
      return;
    }

    sendOtpMutation.mutate();
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const next = [...otp];
        next[index] = '';
        setOtp(next);
      }
    }
    if (event.key === 'Enter') {
      handleVerifyOtp();
    }
  };

  const handleVerifyOtp = () => {
    if (!isOtpComplete) {
      showToast({ message: 'Please enter all 6 OTP digits', type: 'error' });
      return;
    }
    verifyOtpMutation.mutate();
  };

  const handleResendOtp = () => {
    if (timeLeft > 0 || sendOtpMutation.isPending) return;
    sendOtpMutation.mutate();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOtpComplete) {
      showToast({ message: 'OTP is required', type: 'error' });
      return;
    }

    if (!allConstraintsMet) {
      showToast({ message: 'Please satisfy all password constraints', type: 'error' });
      return;
    }

    changePasswordMutation.mutate();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  return (
    <PageLayout>
      <div className="w-full animate-in">
        <div className="surface-card p-8 border-primary/10">
          <h1 className="text-4xl font-bold text-on-surface tracking-tight mb-3">Settings</h1>
          <p className="text-lg text-on-surface-variant font-medium opacity-80">
            Secure your professional profile and manage authorization protocols.
          </p>
        </div>

        <div className="surface-card p-10 border-outline/5 mt-8">
          <div className="flex items-center gap-6 mb-10 overflow-x-auto pb-4 no-scrollbar">
            {[
              { id: 'email', label: '1. Identity verification', icon: 'person' },
              { id: 'otp', label: '2. Code Authorization', icon: 'key' },
              { id: 'password', label: '3. Security Update', icon: 'shield_lock' }
            ].map((s) => (
              <div 
                key={s.id} 
                className={`flex items-center gap-3 shrink-0 transition-all ${step === s.id ? 'opacity-100' : 'opacity-30'}`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[18px] material-symbols-outlined ${step === s.id ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  {s.icon}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <div className="max-w-md">
            {step === 'email' && (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-3">Email synchronization</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 bg-surface-container-low px-4 rounded-xl text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 border border-outline/30 focus:border-primary transition-all"
                    required
                    placeholder="Enter system email..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendOtpMutation.isPending}
                  className="btn-primary w-full h-12 shadow-primary/10"
                >
                  {sendOtpMutation.isPending ? 'Synchronizing...' : 'Request Auth Code'}
                </button>
              </form>
            )}

            {step === 'otp' && (
              <div className="space-y-8">
                <div className="flex justify-between gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-full h-16 text-center text-2xl font-bold border border-outline/30 rounded-2xl bg-surface-container-low text-on-surface focus:ring-2 focus:ring-primary transition-all"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={!isOtpComplete || verifyOtpMutation.isPending}
                  className="btn-primary w-full h-12 shadow-primary/10"
                >
                  {verifyOtpMutation.isPending ? 'Verifying...' : 'Authenticate Access'}
                </button>

                <div className="text-center space-y-3 pt-2">
                  <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">
                    {timeLeft > 0 ? `Code expires in ${formatTime(timeLeft)}` : 'Authentication expired'}
                  </p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={timeLeft > 0 || sendOtpMutation.isPending}
                    className={`text-[10px] font-black uppercase tracking-widest transition-all ${timeLeft > 0 ? 'text-on-surface-variant/20' : 'text-primary hover:text-primary-dark underline'}`}
                  >
                    {sendOtpMutation.isPending ? 'Restarting...' : 'Resend Protocol'}
                  </button>
                </div>
              </div>
            )}

            {step === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-3">New Security Protocol</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-12 bg-surface-container-low px-4 pr-12 rounded-xl text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 border border-outline/30 focus:border-primary transition-all"
                      required
                      placeholder="Define new credentials..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-on-surface-variant/40 hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-outline/10 bg-surface-container-lowest p-6 space-y-3">
                  {constraints.map((constraint) => (
                    <p
                      key={constraint.label}
                      className={`flex items-center text-[11px] font-black uppercase tracking-widest ${constraint.met ? 'text-emerald-500' : 'text-on-surface-variant/40'}`}
                    >
                      <span className="material-symbols-outlined text-[14px] mr-3">
                        {constraint.met ? 'verified' : 'radio_button_unchecked'}
                      </span>
                      {constraint.label}
                    </p>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending || !allConstraintsMet}
                  className="btn-primary w-full h-12 shadow-primary/10"
                >
                  {changePasswordMutation.isPending ? 'Encrypting...' : 'Commit Security Update'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SettingsPage;
