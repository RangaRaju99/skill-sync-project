import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
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

  // Fetch user profile
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

    // Prevent accidental immediate submit when switching from Edit button to Save button.
    const timer = window.setTimeout(() => setCanSaveEdits(true), 600);
    return () => window.clearTimeout(timer);
  }, [isEditing]);

  // Update profile mutation
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
      showToast({ message: 'Profile updated successfully', type: 'success' });
      setIsEditing(false);
      dispatch(updateUserName({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      }));
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update profile';
      showToast({ message: msg, type: 'error' });
    },
  });


  const handleSubmit = () => {
    if (!isEditing || !canSaveEdits) {
      return;
    }

    if (formData.firstName.trim() && formData.firstName.trim().length < 2) {
      showToast({ message: 'First name must be at least 2 characters.', type: 'error' });
      return;
    }

    if (formData.lastName.trim() && formData.lastName.trim().length < 2) {
      showToast({ message: 'Last name must be at least 2 characters.', type: 'error' });
      return;
    }

    updateProfileMutation.mutate();
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg text-gray-500">Loading profile...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="w-full space-y-8 animate-in">
        {/* Header */}
        <div className="surface-card p-8 border-primary/10">
          <h1 className="text-4xl font-bold text-on-surface tracking-tight mb-3">My Profile</h1>
          <p className="text-lg text-on-surface-variant font-medium max-w-2xl opacity-80 leading-relaxed">
            Manage your professional identity, bio, and account details. Keep your profile updated for better mentor matches.
          </p>
        </div>

        {/* Profile Card */}
        <div className="surface-card p-10 border-outline/5">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Profile Picture */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative group">
                <div className="w-40 h-40 rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-5xl font-black border border-primary/20 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                  {(profile?.firstName?.[0] || '') + (profile?.lastName?.[0] || '') || 'U'}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white border-4 border-surface shadow-lg">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
              </div>
              <div className="text-center mt-6">
                <h3 className="text-xl font-bold text-on-surface">
                  {[profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Network User'}
                </h3>
                <p className="text-sm font-medium text-on-surface-variant opacity-60 mt-1">{profile?.email}</p>
                <div className="mt-4">
                  <span className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/10">
                    {(role || 'ROLE_LEARNER').replace('ROLE_', '')}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="flex-1">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] px-1">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!isEditing}
                    className="w-full h-12 bg-surface-container-low px-4 rounded-xl text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 border border-outline/30 focus:border-primary transition-all disabled:opacity-40"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] px-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!isEditing}
                    className="w-full h-12 bg-surface-container-low px-4 rounded-xl text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 border border-outline/30 focus:border-primary transition-all disabled:opacity-40"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] px-1">Professional Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full bg-surface-container-low p-4 rounded-xl text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary/20 border border-outline/30 focus:border-primary transition-all disabled:opacity-40 resize-none leading-relaxed"
                    placeholder="Describe your expertise and skills..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] px-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full h-12 bg-surface-container-low px-4 rounded-xl text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 border border-outline/30 focus:border-primary transition-all disabled:opacity-40"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] px-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    disabled={!isEditing}
                    className="w-full h-12 bg-surface-container-low px-4 rounded-xl text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 border border-outline/30 focus:border-primary transition-all disabled:opacity-40"
                    placeholder="City, Country"
                  />
                </div>

                <div className="md:col-span-2 pt-6">
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="btn-primary w-full h-14"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={updateProfileMutation.isPending || !canSaveEdits}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 btn-secondary h-14"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="surface-card p-8 border-outline/5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-on-surface">Account Details</h2>
            {profile?.profileCompletePct !== undefined && (
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Completion: {profile.profileCompletePct}%</span>
                <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${profile.profileCompletePct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => navigate('/settings/password')}
            className="w-full text-left p-6 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all border border-outline/10 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-on-surface group-hover:text-primary transition-colors">Security Settings</p>
                <p className="text-xs font-medium text-on-surface-variant opacity-60 mt-1">Update your password regularly to keep your account secure.</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
            </div>
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default UserProfilePage;
