import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Camera, Edit3, CheckCircle,
  Shield, LogOut, X, Info, Zap, Award, Eye
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/user.service';
import { notificationService } from '@/services/notification.service';
import { skillService } from '@/services/skill.service';
import type { Skill } from '@/services/skill.service';
import { loadStreakData } from '@/features/growth-dashboard/utils/streakUtils';
import { loadXPData, calculateLevel } from '@/features/growth-dashboard/utils/xpUtils';
import { loadBadgeStates } from '@/features/growth-dashboard/utils/badgeUtils';
import { motion, AnimatePresence } from 'framer-motion';

// New Profile Components
import ProfileForm from '@/components/profile/ProfileForm';
import FloatingSaveBar from '@/components/profile/FloatingSaveBar';
import TodayActivity from '@/features/activity/components/TodayActivity';
import type { ActivityType } from '@/features/activity/components/ActivityItem';



// Skills will be fetched from backend




interface UserActivity {
  id: string;
  type: ActivityType;
  title: string;
  subtitle?: string;
  timestamp: number;
  rawType?: string;
}

export default function ProfilePage() {
  const { user, token, logout, setAuth } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [hintsExpanded, setHintsExpanded] = useState(false);

  const streakInfo = useMemo(() => loadStreakData(), [activities]);
  const xpData = useMemo(() => loadXPData(), [activities]);
  const levelInfo = useMemo(() => calculateLevel(xpData.totalXP), [xpData]);
  const badgesEarned = useMemo(() => loadBadgeStates().filter(s => s.unlocked).length, [activities]);





  // Form states
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    bio: '',
    phoneNumber: '',
    skills: [] as string[]
  });

  const [originalFormData, setOriginalFormData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showUndo, setShowUndo] = useState(false);
  const [previousFormData, setPreviousFormData] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
    fetchActivities();
    fetchAvailableSkills();
  }, []);

  const fetchAvailableSkills = async () => {
    try {
      const skills = await skillService.getAllSkills();
      setAvailableSkills(skills);
    } catch (err) {
      console.error('Failed to fetch available skills', err);
    }
  };


  const fetchActivities = async () => {
    try {
      const res: any = await notificationService.getAll();
      const backendActs = (res.data?.data || res.data || []).map((n: any) => mapNotificationToActivity(n));

      const localData = localStorage.getItem('userActivities');
      let localActivities = localData ? JSON.parse(localData) : [];

      // Migration: Ensure old data doesn't crash us
      localActivities = localActivities.map((a: any) => ({
        ...a,
        iconName: a.iconName || a.icon?.displayName || 'Bell'
      }));

      const combined = [...backendActs, ...localActivities]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 15);

      setActivities(combined);
    } catch (err) {
      console.error('Failed to fetch activities', err);
      const saved = localStorage.getItem('userActivities');
      if (saved) setActivities(JSON.parse(saved));
    }
  };

  const mapNotificationToActivity = (n: any): UserActivity => {
    let type: ActivityType = 'system';
    let title = n.message || 'System Notification';
    let subtitle = '';

    switch (n.type) {
      case 'MENTOR_APPROVED':
      case 'MENTOR_APPLICATION_APPROVED':
        type = 'badge';
        title = '🏆 ' + title;
        subtitle = 'You are now an official mentor!';
        break;
      case 'SESSION_BOOKED':
      case 'SESSION_REQUESTED':
        type = 'system';
        subtitle = 'New session milestone reached';
        break;
      case 'PAYMENT_COMPLETED':
        type = 'badge';
        title = '💎 Premium Status';
        subtitle = 'Transaction successful';
        break;
    }

    let parsedTime = Date.now();
    if (Array.isArray(n.createdAt) && n.createdAt.length >= 5) {
      parsedTime = new Date(n.createdAt[0], n.createdAt[1] - 1, n.createdAt[2], n.createdAt[3], n.createdAt[4]).getTime();
    } else if (n.createdAt) {
      parsedTime = new Date(n.createdAt).getTime();
    }

    return {
      id: `nf-${n.id}`,
      type,
      title,
      subtitle,
      timestamp: parsedTime || Date.now(),
      rawType: n.type // Keep raw type for filtering logic in TodayActivity
    };
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response: any = await userService.getCurrentUser();
      const p = response.data?.data || response.data || response;
      setProfile(p);

      // Try to get avatar from backend, fallback to local cache
      let avatar = p.profileImageUrl || null;
      if (!avatar) {
        const cached = localStorage.getItem(`avatar_cache_${p.email || p.id}`);
        if (cached) {
          avatar = cached;
          console.log('Hydrated avatar from local cache');
        }
      }
      setAvatarUrl(avatar);

      const skillsArray = p.skills ? p.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [];

      const data = {
        username: p.username || p.email?.split('@')[0] || '',
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        bio: p.bio || '',
        phoneNumber: p.phoneNumber || '',
        skills: skillsArray
      };

      setFormData(data);
      setOriginalFormData(data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  // Change Detection System
  useEffect(() => {
    if (!originalFormData) return;

    const isChanged = JSON.stringify(formData) !== JSON.stringify(originalFormData);
    setHasChanges(isChanged);

    if (isChanged && saveStatus === 'saved') {
      setSaveStatus('idle');
    }
  }, [formData, originalFormData, saveStatus]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };



  const calculateCompletion = useMemo(() => {
    if (!profile) return 0;
    const fields = [
      { key: 'username', weight: 15 },
      { key: 'firstName', weight: 15 },
      { key: 'lastName', weight: 10 },
      { key: 'bio', weight: 15 },
      { key: 'phoneNumber', weight: 15 },
      { key: 'skills', weight: 15 },
      { key: 'profileImageUrl', weight: 15 }
    ];

    let total = 0;
    fields.forEach(f => {
      let val;
      if (f.key === 'skills') val = formData.skills;
      else if (f.key === 'profileImageUrl') val = avatarUrl;
      else val = (formData as any)[f.key];

      if (val && (Array.isArray(val) ? val.length > 0 : val.toString().trim().length > 0)) {
        total += f.weight;
      }
    });
    return Math.min(100, total);
  }, [profile, formData, avatarUrl]);

  const level = useMemo(() => {
    if (calculateCompletion < 40) return { label: 'Beginner', icon: '🥉' };
    if (calculateCompletion < 80) return { label: 'Intermediate', icon: '🥈' };
    return { label: 'Pro', icon: '🥇' };
  }, [calculateCompletion]);

  const addActivity = (type: ActivityType, title: string, subtitle?: string) => {
    const act: UserActivity = {
      id: Date.now().toString(),
      type, title, subtitle, timestamp: Date.now()
    };
    const updated = [act, ...activities].slice(0, 15);
    setActivities(updated);
    localStorage.setItem('userActivities', JSON.stringify(updated));

    // Step 10: Micro Feedback Loop (Toast-like notification)
    const xpReward = type === 'profile' ? 20 : 50;
    console.log(`%c +${xpReward} XP ⚡ %c ${title}`, 'color: #7c3aed; font-weight: bold; font-size: 14px', 'color: #10b981; font-weight: bold');
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hasChanges || saving) return;

    setSaving(true);
    setSaveStatus('saving');
    try {
      // Strict Sanitize payload for Spring validation barriers
      const computedName = `${formData.firstName} ${formData.lastName}`.trim();
      const finalName = computedName.length >= 2 ? computedName : (profile?.name || user?.name || user?.username || 'Learner');

      const payload: any = {
        name: finalName,
      };

      // Guard optional fields against constraint minimums
      const uName = formData.username?.trim();
      if (uName && uName.length >= 2) payload.username = uName;

      const bioClean = formData.bio?.trim();
      if (bioClean) payload.bio = bioClean;
      
      const phoneClean = formData.phoneNumber?.replace(/\D/g, '');
      if (phoneClean && phoneClean.length === 10) payload.phoneNumber = phoneClean;

      if (formData.skills && formData.skills.length > 0) {
         payload.skills = formData.skills.join(',');
      }

      if (avatarUrl && !avatarUrl.startsWith('data:image')) {
         payload.profileImageUrl = avatarUrl;
      }

      const response: any = await userService.updateProfile(payload);
      const updated = response.data?.data || response.data || response;

      setProfile(updated);
      setPreviousFormData(originalFormData);
      setOriginalFormData(formData);
      setHasChanges(false);
      setSaveStatus('saved');
      setShowUndo(true);

      setAuth({
        ...user!,
        name: updated.name || user!.name,
        username: updated.username || user!.username,
        avatar: updated.profileImageUrl || user!.avatar
      }, token || localStorage.getItem('token')!);

      addActivity('profile', '✏️ Profile Updated', 'Synchronized identity info');

      if (avatarUrl) {
        localStorage.setItem(`avatar_cache_${updated.email || updated.id}`, avatarUrl);
      }

      // Hide save bar after 3 seconds if saved
      setTimeout(() => {
        if (saveStatus === 'saved') setShowUndo(false);
      }, 5000);

    } catch (err) {
      console.error('Save failed', err);
      setSaveStatus('idle');
    } finally {
      setSaving(false);
    }
  };

  const handleUndo = () => {
    if (previousFormData) {
      setFormData(previousFormData);
      setOriginalFormData(previousFormData);
      setShowUndo(false);
      setSaveStatus('idle');
      addActivity('system', '🔄 Changes Reverted', 'Reverted profile changes');
    }
  };

  const handleDiscard = () => {
    setFormData(originalFormData);
    setHasChanges(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return;
    if (file.size > 1 * 1024 * 1024) {
      alert("File too large (max 1MB for base64 sync)");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setAvatarUrl(base64);

      // Auto-save avatar to backend
      try {
        await userService.updateProfile({
          ...formData,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          skills: formData.skills.join(','),
          profileImageUrl: base64
        });

        // Persist avatar locally

        if (profile) {
          localStorage.setItem(`avatar_cache_${profile.email || profile.id}`, base64);
        }

        addActivity('profile', '📸 Avatar Updated', 'New profile picture set');
      } catch (err) {
        console.error('Avatar sync failed', err);
      }

    };
    reader.readAsDataURL(file);
  };


  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8 animate-pulse">
        <div className="h-24 bg-surface rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-[400px] bg-surface rounded-3xl" />
          <div className="lg:col-span-2 space-y-8">
            <div className="h-[500px] bg-surface rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="p-8 max-w-6xl mx-auto space-y-8 pb-32"
    >
      {/* Profile Completion Banner */}
      <div className={`glass-card p-6 rounded-[32px] border-l-4 transition-all ${calculateCompletion === 100 ? 'border-emerald-500/50' : 'border-primary/50'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold flex items-center gap-2">
              {calculateCompletion === 100 ? <Award className="text-emerald-500" /> : <Zap className="text-primary animate-pulse" />}
              {calculateCompletion === 100 ? 'Profile Complete!' : `Profile ${calculateCompletion}% complete — Level: ${level.label} ${level.icon}`}
            </h3>
            <p className="text-sm text-muted">
              {calculateCompletion === 100
                ? 'You are all set to connect with mentors and peers!'
                : "Complete your profile to reach 'Pro' status and get better matches."}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setHintsExpanded(!hintsExpanded)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${hintsExpanded
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-surface border border-border-color text-muted hover:text-foreground dark:text-white'
                }`}
            >
              {hintsExpanded ? '🔽 Hide Details' : '🔍 View Completion Details'}
            </button>
          </div>
        </div>

        <div className="mt-6 h-3 bg-surface rounded-full overflow-hidden border border-border-color shadow-inner">
          <div
            className={`h-full transition-all duration-1000 ease-out rounded-full ${calculateCompletion < 40 ? 'bg-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.4)]' :
              calculateCompletion < 80 ? 'bg-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.4)]' :
                'bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
              }`}
            style={{ width: `${calculateCompletion}%` }}
          />
        </div>

        <AnimatePresence>
          {hintsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-8 pt-8 border-t border-border-color/50 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Progress Breakdown */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Progress breakdown</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Profile Picture', completed: !!avatarUrl },
                      { label: 'Bio Completed', completed: !!formData.bio },
                      { label: 'Email Verified', completed: !!profile?.email },
                      { label: 'Skills Added', completed: formData.skills.length > 0 },
                      { label: 'Phone Number', completed: !!formData.phoneNumber },
                      { label: 'Username Set', completed: !!formData.username }
                    ].map((item, idx) => (
                      <div key={idx} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${item.completed
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'
                        : 'bg-surface border-border-color text-muted'
                        }`}>
                        {item.completed ? (
                          <div className="w-5 h-5 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle size={14} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                            <X size={14} />
                          </div>
                        )}
                        <span className="text-xs font-bold">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insights & Rewards */}
                <div className="flex flex-col justify-center space-y-6">
                  {calculateCompletion === 100 ? (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[28px] space-y-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                          <Award size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-emerald-600 dark:text-emerald-400">Profile Master unlocked!</h4>
                          <p className="text-xs text-emerald-600/70 font-bold uppercase tracking-wider">Achievement earned 🎉</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-emerald-500/20 flex items-start gap-3">
                        <Zap size={16} className="text-emerald-500 mt-1 shrink-0" />
                        <p className="text-sm text-emerald-700/80 dark:text-emerald-300 font-medium">
                          Everything completed! You're ready to go 🚀. Your profile is fully optimized for mentor matching.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="p-6 bg-primary/5 border border-primary/20 rounded-[28px] space-y-4">
                      <div className="flex items-center gap-4 text-primary">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
                          <Info size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black">Complete Your Identity</h4>
                          <p className="text-xs opacity-70 font-bold uppercase tracking-wider">Why it matters 💡</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted font-medium pt-2">
                        Complete profiles get <span className="text-primary font-black">3x more</span> mentor responses 🚀. Finalize your details to reach 'Pro' status.
                      </p>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                      >
                        🚀 Complete Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-8">
          <div className="glass-card p-10 rounded-[40px] text-center relative overflow-hidden group">
            {/* Background Gradient */}
            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent" />

            <div className="relative z-10 space-y-8">
              {/* Avatar with Glow (HERO PROFILE) */}
              <div className="relative inline-block mt-4">
                <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full scale-125 animate-pulse-slow" />
                <div className="w-40 h-40 rounded-[48px] bg-surface border-4 border-white dark:border-slate-800 p-2 backdrop-blur-2xl transition-all duration-500 group-hover:scale-105 relative z-10 shadow-2xl overflow-hidden">
                  <div className="w-full h-full rounded-[40px] overflow-hidden bg-foreground/10 flex items-center justify-center text-4xl font-black text-muted relative group/avatar">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      (formData.firstName?.charAt(0) || user?.email?.charAt(0) || '?').toUpperCase()
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <Camera className="text-white" size={32} />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary text-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-20 border-4 border-card"
                >
                  <Camera size={20} />
                </button>
                <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleAvatarChange} />
              </div>

              {/* Identity Signals */}
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">{formData.firstName} {formData.lastName || 'Raju'}</h2>
                <p className="text-primary font-black text-sm tracking-widest uppercase">@{formData.username || 'rajubhai'}</p>

                <div className="flex flex-col items-center gap-2 pt-4">
                  <div className="flex items-center gap-2 px-5 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-full">
                    <span className="text-lg">🔥</span>
                    <span className="text-sm font-black italic">{streakInfo.currentStreak} Day Streak</span>
                  </div>
                  <div className="flex items-center gap-2 px-5 py-2 bg-primary/10 border border-primary/20 text-primary rounded-full">
                    <span className="text-base">{levelInfo.icon}</span>
                    <span className="text-sm font-black uppercase tracking-wider">Level {levelInfo.level} — {levelInfo.title}</span>
                  </div>
                </div>
              </div>

              {/* Identity Badges (NEW 🔥) */}
              <div className="flex flex-wrap justify-center gap-2">
                <div className="px-4 py-1.5 bg-surface-dark border border-border-color rounded-xl flex items-center gap-2">
                  <span className="text-xs">🧠</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Learner</span>
                </div>
                <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-600">
                  <span className="text-xs">✅</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                </div>
                <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-2 text-primary">
                  <span className="text-xs">🔥</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                </div>
              </div>

              {/* Profile Strength Block Bar (NEW 🔥) */}
              <div className="space-y-3 px-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted">Profile Strength</span>
                  <span className="text-[10px] font-black text-primary">{calculateCompletion}%</span>
                </div>
                <div className="flex gap-1.5 overflow-hidden">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-3 flex-1 rounded-sm transition-all duration-700 ${i < Math.round((calculateCompletion / 100) * 10)
                        ? 'bg-primary shadow-[0_0_8px_rgba(124,58,237,0.5)]'
                        : 'bg-border-color'
                        }`}
                      style={{ transitionDelay: `${i * 30}ms` }}
                    />
                  ))}
                </div>
              </div>

              {/* Stats & Metadata (NEW 🔥) */}
              <div className="pt-8 border-t border-border-color/50 space-y-6">
                 <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <span className="text-xl block mb-1">🔥</span>
                    <p className="text-sm font-black leading-none">{streakInfo.bestStreak}</p>
                    <p className="text-[8px] font-black uppercase tracking-wider text-muted mt-1">Best Streak</p>
                  </div>
                  <div className="w-[1px] h-8 bg-border-color/50" />
                  <div className="text-center">
                    <span className="text-xl block mb-1">🏆</span>
                    <p className="text-sm font-black leading-none">{badgesEarned}</p>
                    <p className="text-[8px] font-black uppercase tracking-wider text-muted mt-1">Badges</p>
                  </div>
                  <div className="w-[1px] h-8 bg-border-color/50" />
                  <div className="text-center">
                    <span className="text-xl block mb-1">⭐</span>
                    <p className="text-sm font-black leading-none">{xpData.totalXP}</p>
                    <p className="text-[8px] font-black uppercase tracking-wider text-muted mt-1">Total XP</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 text-sm text-muted bg-surface/50 p-4 rounded-[20px] border border-border-color/50">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-xl">🔥</div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none opacity-60">Session Presence</p>
                    <p className="text-base font-black text-foreground dark:text-white mt-1">Active for {streakInfo.totalActiveDays} days</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-5 bg-foreground text-background dark:bg-white dark:text-slate-900 rounded-[28px] text-xs font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                >
                  ✏️ Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Today Activity Snapshot (Layer 1) */}
          <TodayActivity activities={activities} />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-10 rounded-[32px] space-y-10 relative overflow-hidden">
            <div className="flex items-center justify-between gap-4 flex-wrap pb-8 border-b border-border-color">
              <div className="space-y-1">
                <h3 className="text-2xl font-black tracking-tight">Account Details</h3>
                <p className="text-sm text-muted font-medium">Manage your public and private information</p>
              </div>
              <div className="flex items-center bg-surface border border-border-color p-1 rounded-2xl self-start">
                <button
                  onClick={() => setIsEditing(false)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${!isEditing ? 'bg-primary shadow-lg text-white' : 'text-muted hover:text-foreground dark:text-white'}`}
                >
                  <Eye size={14} /> Preview
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${isEditing ? 'bg-primary shadow-lg text-white' : 'text-muted hover:text-foreground dark:text-white'}`}
                >
                  <Edit3 size={14} /> Edit Mode
                </button>
              </div>
            </div>

            <ProfileForm
              formData={formData}
              email={profile?.email || ''}
              isEditing={isEditing}
              onFieldChange={handleFieldChange}
              availableSkills={availableSkills}
              skillSearchQuery={skillSearchQuery}
              onSkillSearchChange={setSkillSearchQuery}
            />

            {/* Floating Save System */}
            <FloatingSaveBar
              isVisible={hasChanges || saveStatus === 'saved'}
              onSave={handleSave}
              onCancel={handleDiscard}
              isLoading={saving}
              status={saveStatus}
              showUndo={showUndo}
              onUndo={handleUndo}
              onClose={() => {
                setSaveStatus('idle');
                setShowUndo(false);
                setIsEditing(false);
              }}
            />
          </div>

          {/* Quick Actions (Mock) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-8 rounded-[32px] flex items-center justify-between group hover:border-purple-500/20 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center p-3.5 group-hover:bg-purple-500/20">
                  <Shield className="text-purple-500" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-widest">Security</h4>
                  <p className="text-xs text-muted font-bold">Manage your password</p>
                </div>
              </div>
              <button className="text-[10px] font-black uppercase tracking-[2px] opacity-20 group-hover:opacity-100 transition-opacity">Update</button>
            </div>

            <div className="glass-card p-8 rounded-[32px] flex items-center justify-between group hover:border-amber-500/20 transition-all" onClick={logout}>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center p-3.5 group-hover:bg-amber-500/20">
                  <LogOut className="text-amber-500" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-widest">Session</h4>
                  <p className="text-xs text-muted font-bold">Sign out of profile</p>
                </div>
              </div>
              <button className="text-[10px] font-black uppercase tracking-[2px] opacity-20 group-hover:opacity-100 transition-opacity">Log Out</button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
