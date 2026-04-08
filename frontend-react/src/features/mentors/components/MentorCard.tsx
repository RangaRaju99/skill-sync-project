
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { Star, Users, Banknote, ShieldCheck, Zap, Heart, MessageSquare, Info, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HighlightMatch from './HighlightMatch';

export interface UserProfileDto {
  userId: number;
  email: string;
  username: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  skills?: string;
}

export interface MentorProfileDto {
  id: number;
  userId: number;
  name?: string;
  username?: string;
  user?: UserProfileDto;
  status: string;
  isApproved: boolean;
  specialization: string;
  yearsOfExperience: number;
  hourlyRate: number;
  availabilityStatus: string;
  rating: number;
  totalStudents: number;
  bio?: string;
}

interface MentorCardProps {
  mentor: MentorProfileDto;
  onView: (id: number) => void;
  onBook: (id: number) => void;
  viewMode?: 'grid' | 'list';
  searchQuery?: string;
}

export default function MentorCard({ mentor, onView, onBook, viewMode = 'grid', searchQuery = '' }: MentorCardProps) {
  const { user: currentUser } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showQuickPreview, setShowQuickPreview] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorite_mentors') || '[]');
    setIsFavorite(favorites.includes(mentor.id));
  }, [mentor.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem('favorite_mentors') || '[]');
    let updated;
    if (favorites.includes(mentor.id)) {
      updated = favorites.filter((id: number) => id !== mentor.id);
      setIsFavorite(false);
    } else {
      updated = [...favorites, mentor.id];
      setIsFavorite(true);
    }
    localStorage.setItem('favorite_mentors', JSON.stringify(updated));
  };

  const isOwnProfile = currentUser?.id !== undefined && Number(currentUser.id) === Number(mentor.userId);

  const getInitials = () => {
    const name = mentor.name || mentor.username || 'M';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  // Static tags logic
  const tags = [];
  if (mentor.rating >= 4.5) tags.push({ label: 'Top Mentor', color: 'bg-amber-500/10 text-amber-600', icon: Award });
  if (mentor.totalStudents > 50) tags.push({ label: 'Popular', color: 'bg-blue-500/10 text-blue-600', icon: Zap });
  if (mentor.yearsOfExperience > 10) tags.push({ label: 'Expert', color: 'bg-purple-500/10 text-purple-600', icon: ShieldCheck });

  if (viewMode === 'list') {
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card p-4 flex gap-6 items-center hover:border-primary/30 transition-all cursor-pointer group"
        onClick={() => onView(mentor.userId)}
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white text-2xl font-black flex items-center justify-center shrink-0 shadow-lg">
          {getInitials()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-black tracking-tight truncate">
              <HighlightMatch text={mentor.name || mentor.username || ''} match={searchQuery} />
            </h3>
            {tags.slice(0, 1).map((tag, i) => (
              <span key={i} className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${tag.color} flex items-center gap-1`}>
                <tag.icon size={10} />
                {tag.label}
              </span>
            ))}
          </div>
          <p className="text-sm font-bold text-primary truncate">
             <HighlightMatch text={mentor.specialization} match={searchQuery} />
          </p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-xs font-bold"><Star size={12} className="text-amber-400 fill-amber-400" /> {mentor.rating}</div>
            <div className="flex items-center gap-1 text-xs font-bold text-muted"><Users size={12} /> {mentor.totalStudents}</div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 font-black">₹{mentor.hourlyRate}/hr</div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4">
           <button 
            onClick={toggleFavorite}
            className={`p-2.5 rounded-xl border transition-all ${isFavorite ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-surface border-border-color text-muted hover:text-rose-500'}`}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} className={isFavorite ? 'animate-heart-pop' : ''} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onBook(mentor.userId); }}
            className="px-6 h-11 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            Book Now
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 flex flex-col gap-6 cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:border-primary/20 transition-all duration-300 relative group"
      onMouseEnter={() => { setShowQuickPreview(true); }}
      onMouseLeave={() => { setShowQuickPreview(false); }}
      onClick={() => onView(mentor.userId)}
    >
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 text-white text-2xl font-black flex items-center justify-center shadow-xl group-hover:rotate-3 transition-transform">
            {getInitials()}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 ${
            mentor.availabilityStatus.toUpperCase() === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-amber-500'
          }`} />
        </div>

        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={toggleFavorite}
            className={`p-2.5 rounded-2xl border transition-all ${isFavorite ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-surface border-border-color text-muted hover:text-rose-500 hover:border-rose-200 shadow-sm'}`}
          >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} className={isFavorite ? 'animate-heart-pop' : ''} />
          </button>
          <div className="flex gap-1">
             {tags.map((tag, i) => (
                <div key={i} className={`p-1.5 rounded-lg ${tag.color} relative group/tag`}>
                  <tag.icon size={14} />
                  <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded opacity-0 group-hover/tag:opacity-100 transition-opacity pointer-events-none">
                    {tag.label}
                  </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-black tracking-tight text-foreground line-clamp-1">
             <HighlightMatch text={mentor.name || mentor.username || ''} match={searchQuery} />
          </h3>
          <p className="text-sm font-bold text-primary mt-0.5">
             <HighlightMatch text={mentor.specialization} match={searchQuery} />
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 py-3 border-y border-border-color/50">
           <div className="text-center group/stat">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted group-hover/stat:text-amber-500 transition-colors flex items-center justify-center gap-1">
                <Star size={10} fill="#f59e0b" className="text-amber-500" /> Rating
              </p>
              <p className="text-sm font-black mt-1">{mentor.rating}</p>
           </div>
           <div className="text-center group/stat border-x border-border-color/50">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted group-hover/stat:text-blue-500 transition-colors flex items-center justify-center gap-1">
                <Users size={10} /> Students
              </p>
              <p className="text-sm font-black mt-1">{mentor.totalStudents || 0}</p>
           </div>
           <div className="text-center group/stat">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted group-hover/stat:text-emerald-500 transition-colors flex items-center justify-center gap-1">
                <Banknote size={10} /> Price
              </p>
              <p className="text-sm font-black mt-1">₹{mentor.hourlyRate}</p>
           </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-muted">
           <Award size={14} className="text-primary" />
           {mentor.yearsOfExperience} years industrial experience
        </div>
      </div>

      {/* Action System */}
      <div className="flex gap-3 mt-auto pt-2">
        {isOwnProfile ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onView(mentor.userId); }}
            className="w-full h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black text-xs uppercase tracking-[2px] hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
          >
            Manage Profile
          </button>
        ) : (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); onBook(mentor.userId); }}
              className="flex-1 h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-[2px] hover:bg-primary-700 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
            >
              <Zap size={14} className="fill-current" /> Book
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onView(mentor.userId); }}
              className="flex-1 h-12 rounded-2xl bg-surface border border-border-color text-foreground font-black text-xs uppercase tracking-[2px] hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              View
            </button>
          </>
        )}
      </div>

      {/* Hover Preview Overlay */}
      <AnimatePresence>
        {showQuickPreview && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-x-0 bottom-full mb-2 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl z-50 pointer-events-none"
          >
            <div className="flex items-center gap-2 mb-2">
              <Info size={14} className="text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Quick Preview</p>
            </div>
            <p className="text-xs font-medium leading-relaxed italic line-clamp-3">
              "{mentor.bio || `Specializing in ${mentor.specialization} with over ${mentor.yearsOfExperience} years of expertise in high-performance architectures.`}"
            </p>
            <div className="mt-3 flex items-center gap-2">
              <MessageSquare size={12} className="text-emerald-400" />
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Usually responds in 2 hours</p>
            </div>
            <div className="absolute top-full right-8 w-4 h-4 bg-slate-900 transform rotate-45 -mt-2" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
