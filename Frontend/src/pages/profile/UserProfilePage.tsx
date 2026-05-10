import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, MapPin, Phone, Edit3, Save, X, Lock, Sparkles } from 'lucide-react';
import userService from '../../services/userService';
import PageLayout from '../../components/layout/PageLayout';
import { useToast } from '../../components/ui/Toast';
import type { RootState } from '../../store';
import { updateUserName } from '../../store/slices/authSlice';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const role = useSelector((state: RootState) => state.auth.role);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    phone: '',
    location: '',
  });
  const [canSaveEdits, setCanSaveEdits] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => userService.getMyProfile(),
  });

  useEffect(() => {
    if (!profile) return;
    setFormData({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      bio: profile.bio || '',
      phone: profile.phone || '',
      location: profile.location || '',
    });
  }, [profile]);

  useEffect(() => {
    if (!isEditing) {
      setCanSaveEdits(false);
      return;
    }
    const timer = window.setTimeout(() => setCanSaveEdits(true), 600);
    return () => window.clearTimeout(timer);
  }, [isEditing]);

  const updateProfileMutation = useMutation({
    mutationFn: () => {
      const cleanedPayload = {
        firstName: formData.firstName.trim().length >= 2 ? formData.firstName.trim() : undefined,
        lastName: formData.lastName.trim().length >= 2 ? formData.lastName.trim() : undefined,
        bio: formData.bio.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        location: formData.location.trim() || undefined,
      };
      return userService.updateProfile(cleanedPayload);
    },
    onSuccess: () => {
      showToast({ message: 'Identity Matrix Updated.', type: 'success' });
      setIsEditing(false);
      dispatch(updateUserName({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      }));
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Sync Failed.';
      showToast({ message: msg, type: 'error' });
    },
  });

  const handleSubmit = () => {
    if (!isEditing || !canSaveEdits) return;
    if (formData.firstName.trim() && formData.firstName.trim().length < 2) {
      showToast({ message: 'Minimum 2 characters required for First Name.', type: 'error' });
      return;
    }
    if (formData.lastName.trim() && formData.lastName.trim().length < 2) {
      showToast({ message: 'Minimum 2 characters required for Last Name.', type: 'error' });
      return;
    }
    updateProfileMutation.mutate();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } }
  } as const;

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] animate-pulse italic">Scanning Identity...</div>
        </div>
      </PageLayout>
    );
  }

  const initials = (profile?.firstName?.[0] || '') + (profile?.lastName?.[0] || '');

  return (
    <PageLayout>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-5xl mx-auto space-y-12">
        {/* Header Section */}
        <motion.section variants={itemVariants} className="relative group">
          <div className="absolute -left-20 -top-20 w-96 h-96 bg-primary/10 blur-[120px] -z-10 group-hover:bg-primary/20 transition-colors duration-1000" />
          <div className="glass-card rounded-[3rem] p-12 flex flex-col md:flex-row items-center gap-12 border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <Sparkles className="text-primary/20" size={32} />
            </div>
            
            <div className="relative">
              <div className="w-44 h-44 rounded-[2.5rem] bg-gradient-to-br from-primary to-violet-600 p-[2px] shadow-2xl shadow-primary/20 rotate-3 group-hover:rotate-6 transition-transform duration-500">
                <div className="w-full h-full rounded-[2.4rem] bg-[#0a0514] flex items-center justify-center text-5xl font-black text-white italic tracking-tighter">
                  {initials || 'U'}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center text-primary shadow-xl">
                <Shield size={20} />
              </div>
            </div>

            <div className="text-center md:text-left space-y-4">
              <div>
                <h1 className="text-6xl font-display font-black text-white tracking-tighter uppercase italic leading-[0.8]">
                  {profile?.firstName} <span className="text-primary">{profile?.lastName}</span>
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
                  <span className="px-4 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                    {(role || 'ROLE_LEARNER').replace('ROLE_', '')}
                  </span>
                  <span className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    <Mail size={12} className="text-primary" /> {profile?.email}
                  </span>
                </div>
              </div>
              
              {profile?.profileCompletePct !== undefined && (
                <div className="w-full max-w-xs pt-4">
                  <div className="flex justify-between text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">
                    <span>Identity Sync</span>
                    <span>{profile.profileCompletePct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${profile.profileCompletePct}%` }}
                      className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full" 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
            <div className="glass-card rounded-[2.5rem] p-10 space-y-10 border-white/5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                  <User size={14} className="text-primary" /> Core Identity
                </h2>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-white/60 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Edit3 size={14} /> Modify
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { label: 'First Name', key: 'firstName', icon: User },
                  { label: 'Last Name', key: 'lastName', icon: User },
                  { label: 'Location', key: 'location', icon: MapPin },
                  { label: 'Phone', key: 'phone', icon: Phone },
                ].map((field) => (
                  <div key={field.key} className="space-y-3">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">{field.label}</label>
                    <div className="relative group">
                      <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary transition-colors" size={16} />
                      <input
                        type="text"
                        value={(formData as any)[field.key]}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        disabled={!isEditing}
                        className="w-full h-14 bg-white/[0.02] border border-white/5 rounded-2xl pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-primary/30 focus:bg-white/[0.04] transition-all disabled:opacity-40"
                      />
                    </div>
                  </div>
                ))}
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Bio / Professional Directive</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 text-sm font-bold text-white outline-none focus:border-primary/30 focus:bg-white/[0.04] transition-all disabled:opacity-40 resize-none"
                    placeholder="Initialize professional biography..."
                  />
                </div>
              </div>

              <AnimatePresence>
                {isEditing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 10 }}
                    className="flex gap-4 pt-4"
                  >
                    <button
                      onClick={handleSubmit}
                      disabled={updateProfileMutation.isPending || !canSaveEdits}
                      className="flex-1 h-14 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      <Save size={16} /> Commit Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-8 h-14 bg-white/5 border border-white/10 text-white/40 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                    >
                      <X size={16} /> Abort
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-8">
            <div className="glass-card rounded-[2.5rem] p-8 border-white/5 space-y-8">
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                <Lock size={14} className="text-primary" /> Security Hub
              </h2>
              
              <button
                onClick={() => navigate('/settings/password')}
                className="w-full p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primary/30 hover:bg-white/[0.05] transition-all text-left group"
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Lock size={18} />
                  </div>
                  <p className="font-black text-white text-[11px] uppercase tracking-widest">Update Password</p>
                </div>
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-tighter leading-tight">Rotate security credentials to maintain protocol integrity.</p>
              </button>

              <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-2">System Notice</p>
                <p className="text-[10px] text-white/40 font-bold leading-relaxed">Your account is currently synchronized with the global network. Any changes to your identity will propagate immediately.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </PageLayout>
  );
};

export default UserProfilePage;
