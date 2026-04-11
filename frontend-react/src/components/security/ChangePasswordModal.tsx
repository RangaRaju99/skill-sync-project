import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, X, Lock, Shield, AlertTriangle, Check } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useToast } from '@/hooks/useToast';
import { tokenHandler } from '@/utils/tokenHandler';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Password Strength Logic ─────────────────────────────────────
function getPasswordStrength(password: string): { score: number; label: string; color: string; barColor: string } {
  if (!password) return { score: 0, label: '', color: '', barColor: 'bg-slate-200' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: 'text-red-500', barColor: 'bg-red-500' };
  if (score <= 3) return { score, label: 'Medium', color: 'text-amber-500', barColor: 'bg-amber-500' };
  return { score, label: 'Strong', color: 'text-emerald-500', barColor: 'bg-emerald-500' };
}

// ─── Password Input Component ────────────────────────────────────
function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const handleKeyUp = (e: React.KeyboardEvent) => {
    setCapsLock(e.getModifierState('CapsLock'));
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyUp={handleKeyUp}
          placeholder={placeholder}
          autoComplete={autoComplete || 'off'}
          className={`w-full pl-10 pr-10 h-11 bg-white border rounded-xl text-[13px] font-medium outline-none transition-all ${
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
              : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          tabIndex={-1}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {capsLock && (
        <p className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
          <AlertTriangle size={12} /> Caps Lock is ON
        </p>
      )}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}

// ─── Strength Bar Component ──────────────────────────────────────
function PasswordStrengthBar({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  const segments = 5;
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < strength.score ? strength.barColor : 'bg-slate-100'
            }`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-semibold ${strength.color}`}>
        Strength: {strength.label}
      </p>
    </div>
  );
}

// ─── Validation Rules ────────────────────────────────────────────
function getValidationErrors(newPassword: string, confirmPassword: string) {
  const rules = [
    { key: 'length', label: 'At least 8 characters', valid: newPassword.length >= 8 },
    { key: 'number', label: 'Contains a number', valid: /[0-9]/.test(newPassword) },
    { key: 'symbol', label: 'Contains a symbol or uppercase letter', valid: /[^a-z0-9]/i.test(newPassword) && /[A-Z]/.test(newPassword) },
    { key: 'match', label: 'Passwords match', valid: confirmPassword.length > 0 && newPassword === confirmPassword },
  ];
  return rules;
}

// ─── Main Modal ──────────────────────────────────────────────────
export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { showToast } = useToast();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setServerError('');
    }
  }, [isOpen]);

  const rules = getValidationErrors(newPassword, confirmPassword);
  const allValid = oldPassword.length > 0 && rules.every((r) => r.valid);

  const handleSubmit = useCallback(async () => {
    if (!allValid || isLoading) return;
    setIsLoading(true);
    setServerError('');

    try {
      await authService.changePassword(oldPassword, newPassword);
      showToast('Password updated successfully 🔐', 'success');
      onClose();

      // Auto-logout after 2 seconds for security
      setTimeout(() => {
        localStorage.clear(); 
        window.location.href = '/auth/login';
      }, 2000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Something went wrong. Please try again.';
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [allValid, isLoading, oldPassword, newPassword, onClose, showToast]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-7 pt-7 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-slate-900 tracking-tight">
                  Change Password
                </h2>
                <p className="text-[12px] text-slate-400 font-medium">
                  Keep your account secure
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 py-5 space-y-5">
          {/* Server Error */}
          {serverError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-[12px] text-red-600 font-medium">{serverError}</p>
            </div>
          )}

          <PasswordInput
            label="Current Password"
            value={oldPassword}
            onChange={(v) => { setOldPassword(v); setServerError(''); }}
            placeholder="Enter your current password"
            autoComplete="current-password"
          />

          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Choose a strong new password"
            autoComplete="new-password"
          />

          <PasswordStrengthBar password={newPassword} />

          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Re-enter your new password"
            error={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : undefined}
            autoComplete="new-password"
          />

          {/* Live Validation Rules */}
          {newPassword.length > 0 && (
            <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
              {rules.map((rule) => (
                <div key={rule.key} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                      rule.valid
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <Check size={10} strokeWidth={3} />
                  </div>
                  <span
                    className={`text-[12px] font-medium transition-colors ${
                      rule.valid ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Password Tip */}
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            💡 Use at least 8 characters with uppercase letters, numbers, and symbols for a strong password.
          </p>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 h-10 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!allValid || isLoading}
            className="px-5 h-10 text-[13px] font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-75" />
                </svg>
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
