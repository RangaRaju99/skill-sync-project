import React from 'react';
import { 
  Users, UserCheck, Shield, Zap, Activity, 
  Database, UserPlus, TrendingUp, BarChart, 
  Clock, ArrowUpRight, Ban, UserX, Plus, ShieldCheck, FileText
} from 'lucide-react';
import { useAdmin } from '../../../hooks/useAdmin';
import { StatCard } from '../components/StatCard';
import { ActivityPanel } from '../components/ActivityPanel';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';

export default function AdminDashboardPage() {
  const { stats, activity } = useAdmin();

  const kpiData = [
    { label: 'Total Users', value: stats?.totalInhabitants || 0, trend: '+12.5%', trendUp: true, icon: <Icon icon={Users} size={20} />, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Active Users', value: stats?.activeUsers || 0, trend: '+4.2%', trendUp: true, icon: <Icon icon={UserCheck} size={20} />, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pending Mentors', value: stats?.pendingMentors || 0, trend: '-2.1%', trendUp: false, icon: <Icon icon={Clock} size={20} />, color: 'bg-amber-50 text-amber-600' },
    { label: 'Blocked Users', value: stats?.blockedUsers || 0, trend: 'Stable', trendUp: true, icon: <Icon icon={UserX} size={20} />, color: 'bg-rose-50 text-rose-600' },
  ];

  // Mapping live audit logs to FeedItem format
  const feedItems = activity.slice(0, 8).map((log: any) => {
    let type = 'FLAG';
    let humanLabel = 'Group Flagged';
    
    if (log.action?.includes('BLOCK')) {
       type = 'BLOCK';
       humanLabel = 'User Blocked';
    } else if (log.action?.includes('PROMOTE') || log.action?.includes('ROLE')) {
       type = 'PROMOTE';
       humanLabel = 'User Role Changed';
    } else if (log.action?.includes('LOCK')) {
       type = 'LOCK';
       humanLabel = 'Group Locked';
    }

    return {
      id: log.id?.toString(),
      type: type,
      label: humanLabel,
      description: `Action initiated by ${log.performerEmail}.`,
      timestamp: log.timestamp
    };
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
      <div className="xl:col-span-3 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
              Admin <span className="text-indigo-600 font-black">Dashboard</span>
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-200"></span>
              SkillSync Systems: Online
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" leftIcon={<Icon icon={UserPlus} size={16} />}>
               Add User
            </Button>
            <Button leftIcon={<Icon icon={ShieldCheck} size={16} />}>
               Manage Roles
            </Button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((stat, i) => <StatCard key={i} {...stat} />)}
        </div>

        {/* Growth Matrix */}
        <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-1">Growth Analytics</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User expansion vs previous cycle</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl text-slate-400">
              <Icon icon={TrendingUp} size={20} />
            </div>
          </div>
          <div className="h-[350px] flex items-end justify-between gap-4 px-6 relative">
             {[45, 65, 50, 85, 75, 100, 80, 110, 95, 105, 120, 110, 130].map((h, i) => (
                <div key={i} className="flex-1 bg-slate-50 rounded-t-2xl group/bar relative hover:bg-indigo-50/50 transition-all duration-300">
                   <div className="absolute bottom-0 w-full bg-indigo-600/5 rounded-t-2xl h-full opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                   <div 
                      className="absolute bottom-0 w-full bg-indigo-600 rounded-t-2xl shadow-lg transition-all duration-1000 ease-out" 
                      style={{ height: `${(h / 130) * 100}%` }}
                   ></div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Real-time Activty */}
      <div className="space-y-10">
         <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm sticky top-28">
            <div className="flex items-center justify-between mb-10">
               <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Activity Feed</h2>
               <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            </div>
            
            <ActivityPanel items={feedItems} />

            <Button variant="ghost" className="w-full mt-10" leftIcon={<Icon icon={FileText} size={16} />}>
               View Audit Logs
            </Button>
         </div>
      </div>
    </div>
  );
}
