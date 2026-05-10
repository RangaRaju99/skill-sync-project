import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/axios';
import PageLayout from '../../components/layout/PageLayout';

interface AdminStats {
  totalUsers: number;
  totalMentors: number;
  totalSessions: number;
  pendingMentorApprovals: number;
}

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/admin/stats');
        return res.data as AdminStats;
      } catch {
        return {
          totalUsers: 0,
          totalMentors: 0,
          totalSessions: 0,
          pendingMentorApprovals: 0,
        } as AdminStats;
      }
    },
    staleTime: 30_000,
  });

  if (statsLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PageLayout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } }
  } as const;

  const statCards = [
    {
      label: 'Network Users',
      value: stats?.totalUsers ?? 0,
      icon: 'group',
      color: 'text-blue-400',
    },
    {
      label: 'Active Mentors',
      value: stats?.totalMentors ?? 0,
      icon: 'school',
      color: 'text-violet-400',
    },
    {
      label: 'Total Missions',
      value: stats?.totalSessions ?? 0,
      icon: 'event',
      color: 'text-emerald-400',
    },
    {
      label: 'Pending Intel',
      value: stats?.pendingMentorApprovals ?? 0,
      icon: 'pending_actions',
      color: 'text-amber-400',
    },
  ];

  const quickLinks = [
    {
      title: 'Directory',
      description: 'Global user registry and access control',
      icon: 'manage_accounts',
      path: '/admin/users',
      color: 'text-blue-400',
    },
    {
      title: 'Validations',
      description: 'Review and authorize pending mentor applications',
      icon: 'how_to_reg',
      path: '/admin/mentor-approvals',
      color: 'text-violet-400',
    },
    {
      title: 'Taxonomy',
      description: 'System skills and competency mapping',
      icon: 'psychology',
      path: '/admin/skills',
      color: 'text-emerald-400',
    },
    {
      title: 'Circles',
      description: 'Manage community groups and moderation',
      icon: 'groups',
      path: '/admin/groups',
      color: 'text-cyan-400',
    },
  ];

  return (
    <PageLayout>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-16">
        {/* Header */}
        <motion.section variants={itemVariants} className="relative py-4">
          <div className="absolute -left-12 -top-12 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
          <h1 className="text-6xl font-display font-black text-white tracking-tighter leading-[0.9]">
            Admin <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">Command</span>.
          </h1>
          <p className="text-lg text-white/40 font-bold uppercase tracking-[0.3em] mt-6 flex items-center gap-4">
            <span className="w-12 h-[2px] bg-primary/30" />
            System Control Center
          </p>
        </motion.section>

        {/* Stats Row */}
        <motion.section variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, i) => (
            <div key={i} className="glass-card rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/5 group-hover:border-white/10 transition-all">
                <span className={`material-symbols-outlined text-[24px] ${card.color}`}>{card.icon}</span>
              </div>
              <p className="text-4xl font-display font-black text-white mb-2 tracking-tighter">{card.value}</p>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">{card.label}</p>
            </div>
          ))}
        </motion.section>

        {/* Quick Actions */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-3 mb-10">
            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Operation Modules
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link) => (
              <motion.button
                whileHover={{ y: -8, backgroundColor: 'rgba(255,255,255,0.06)' }}
                whileTap={{ scale: 0.98 }}
                key={link.path}
                onClick={() => navigate(link.path)}
                className="glass-card rounded-[2.5rem] p-8 text-left group transition-all relative overflow-hidden"
              >
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 blur-[40px] group-hover:bg-primary/10 transition-colors" />
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/5 group-hover:border-white/10 transition-all">
                  <span className={`material-symbols-outlined text-[28px] ${link.color}`}>{link.icon}</span>
                </div>
                <h3 className="text-xl font-display font-black text-white mb-3 tracking-tighter uppercase group-hover:text-primary transition-colors">{link.title}</h3>
                <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">{link.description}</p>
                <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 uppercase tracking-widest">
                  Initialize <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </PageLayout>
  );
};

export default AdminDashboardPage;
