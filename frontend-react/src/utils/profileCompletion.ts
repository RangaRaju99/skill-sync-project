import type { UserProfileDto } from '../hooks/useProfile';

export function calculateCompletion(profile: UserProfileDto | null | undefined): number {
  if (!profile) return 0;
  let score = 0;
  const total = 6;
  if (profile.username) score++;
  if (profile.email) score++;
  if (profile.firstName) score++;
  if (profile.lastName) score++;
  if (profile.bio) score++;
  if (profile.skills && profile.skills.length > 0) score++;
  return Math.round((score / total) * 100);
}

export function getMissingFields(profile: UserProfileDto | null | undefined): { key: string; label: string }[] {
  if (!profile) return [];
  const missing = [];
  if (!profile.username) missing.push({ key: 'username', label: 'Username' });
  if (!profile.firstName) missing.push({ key: 'firstName', label: 'First Name' });
  if (!profile.lastName) missing.push({ key: 'lastName', label: 'Last Name' });
  if (!profile.bio) missing.push({ key: 'bio', label: 'Bio' });
  if (!profile.phoneNumber) missing.push({ key: 'phoneNumber', label: 'Phone Number' });
  if (!profile.skills || profile.skills.length === 0) missing.push({ key: 'skills', label: 'Skills' });
  return missing;
}
