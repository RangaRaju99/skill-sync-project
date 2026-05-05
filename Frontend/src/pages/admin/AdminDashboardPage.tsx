import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/axios';
import PageLayout from '../../components/layout/PageLayout';
import { GlassCard } from '../../components/ui/GlassCard';
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  Clock, 
  UserCog, 
  UserCheck, 
  Brain, 
  UsersRound,
  ArrowRight
} from 'lucide-react';

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
        <div className="flex flex-col items-center justify-center h-[70vh] text-text-muted">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mb-4"></div>
          <p className="font-medium">Loading dashboard...</p>
        </div>
      </PageLayout>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: <Users className="w-6 h-6 text-brand" />,
      bg: 'bg-brand/10',
    },
    {
      label: 'Approved Mentors',
      value: stats?.totalMentors ?? 0,
      icon: <GraduationCap className="w-6 h-6 text-accent-violet" />,
      bg: 'bg-accent-violet/10',
    },
    {
      label: 'Total Sessions',
      value: stats?.totalSessions ?? 0,
      icon: <Calendar className="w-6 h-6 text-success" />,
      bg: 'bg-success/10',
    },
    {
      label: 'Pending Approvals',
      value: stats?.pendingMentorApprovals ?? 0,
      icon: <Clock className="w-6 h-6 text-warning" />,
      bg: 'bg-warning/10',
    },
  ];

  const quickLinks = [
    {
      title: 'Manage Users',
      description: 'View, search, filter, and manage all platform users',
      icon: <UserCog className="w-6 h-6 text-brand" />,
      path: '/admin/users',
      bg: 'bg-brand/10',
    },
    {
      title: 'Mentor Approvals',
      description: 'Review and approve/reject pending mentor applications',
      icon: <UserCheck className="w-6 h-6 text-accent-violet" />,
      path: '/admin/mentor-approvals',
      bg: 'bg-accent-violet/10',
    },
    {
      title: 'Manage Skills',
      description: 'Add and manage platform skills for mentors',
      icon: <Brain className="w-6 h-6 text-success" />,
      path: '/admin/skills',
      bg: 'bg-success/10',
    },
    {
      title: 'Manage Groups',
      description: 'Create groups, edit group settings, and remove members',
      icon: <UsersRound className="w-6 h-6 text-cyan-500" />,
      path: '/admin/groups',
      bg: 'bg-cyan-500/10',
    },
  ];

  return (
    <PageLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-surface border border-border shadow-sm p-8 lg:p-12">
          {/* Decorative background blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent-violet/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold text-text-main mb-3 tracking-tight">Admin Dashboard</h1>
            <p className="text-text-muted text-lg max-w-2xl">System overview, platform statistics, and quick access to management tools.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => (
            <GlassCard key={card.label} className="group hover:border-brand/30 transition-colors" animateIn={true}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${card.bg} rounded-2xl flex items-center justify-center`}>
                  {card.icon}
                </div>
              </div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">{card.label}</p>
              <p className="text-4xl font-black text-text-main">{card.value}</p>
            </GlassCard>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-extrabold text-text-main mb-6 tracking-tight">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="text-left w-full focus:outline-none"
              >
                <GlassCard className="h-full group hover:border-brand/40 hover:shadow-md hover:bg-surface-hover/50 transition-all duration-300">
                  <div className={`w-14 h-14 ${link.bg} rounded-2xl flex items-center justify-center mb-6`}>
                    {link.icon}
                  </div>
                  <h3 className="text-xl font-bold text-text-main mb-2 group-hover:text-brand transition-colors">{link.title}</h3>
                  <p className="text-sm text-text-muted mb-6 leading-relaxed">{link.description}</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-brand opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
                    Open Tool <ArrowRight className="w-4 h-4" />
                  </div>
                </GlassCard>
              </button>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminDashboardPage;
