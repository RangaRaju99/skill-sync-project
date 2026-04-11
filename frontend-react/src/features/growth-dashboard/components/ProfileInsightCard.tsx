
import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

const ProfileInsightCard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Smart logic for profile suggestions
  const getInsight = () => {
    const profile = user as any; 
    const skillsCount = profile?.skills?.split(',').filter(Boolean).length || 0;
    const hasBio = !!profile?.bio;
    
    if (skillsCount < 3) {
      return {
        text: "Profiles with 3+ skills get 2x more mentor responses. Add more skills to stand out!",
        cta: "Add Skills",
        route: "/profile"
      };
    }
    
    if (!hasBio) {
      return {
        text: "User with professional bios see higher engagement. Tell your story to the community!",
        cta: "Update Bio",
        route: "/profile"
      };
    }

    return {
      text: "You're doing great! Keep sharing your progress to build your personal brand 🚀",
      cta: "View Profile",
      route: "/profile"
    };
  };

  const insight = getInsight();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="glass-card rounded-3xl p-6 relative overflow-hidden group border-l-4 border-l-amber-500"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:rotate-12 transition-transform">
          <Lightbulb size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-black uppercase tracking-widest text-foreground dark:text-white mb-2">Insight</h4>
          <p className="text-xs font-black italic tracking-tight leading-relaxed text-muted-foreground mb-4">
            {insight.text}
          </p>
          
          <button 
            onClick={() => navigate(insight.route)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/60 transition-colors group/btn"
          >
            {insight.cta}
            <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none" />
    </motion.div>
  );
};

export default ProfileInsightCard;
