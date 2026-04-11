import React, { useState, useMemo } from 'react';
import { 
   Users, Activity, Ban, AlertTriangle, GraduationCap, TrendingUp, Download,
   CheckCircle, RefreshCw, XCircle, LineChart as LucideLineChart
} from 'lucide-react';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { 
   LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
   XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { useToast } from '../../../hooks/useToast';
import { useAdmin } from '../../../hooks/useAdmin';

// Centralised premium SaaS color palette
const COLORS = {
  active: '#10b981',    // Emerald
  suspended: '#f59e0b', // Amber 
  blocked: '#ef4444',   // Rose
  admin: '#3b82f6',     // Blue 
  mentor: '#10b981',    // Emerald 
  learner: '#94a3b8',   // Slate
  primary: '#4f46e5',   // Indigo 
  flagged: '#f97316',   // Orange
};

export default function AdminAnalyticsPage() {
  const { showToast } = useToast();
  const { 
     users, 
     groups, 
     useAnalyticsGrowth,
     useAnalyticsStatus,
     useAnalyticsRoles
  } = useAdmin();
  
  // Real working filters
  const [timeRange, setTimeRange] = useState('30D');
  const [userType, setUserType] = useState('ALL');

  // Triggering the tanstack queries inside the Component explicitly properly passing filter args
  const growthQuery = useAnalyticsGrowth(timeRange, userType);
  const statusQuery = useAnalyticsStatus();
  const rolesQuery = useAnalyticsRoles();

  const isGlobalLoading = growthQuery.isLoading || statusQuery.isLoading || rolesQuery.isLoading;
  const hasGlobalError = growthQuery.isError || statusQuery.isError || rolesQuery.isError;

  // Safely extract the raw arrays regardless of axios interception structure
  const rawGrowthData = growthQuery.data?.data || growthQuery.data || [];
  const rawStatusData = statusQuery.data?.data || statusQuery.data || [];
  const rawRolesData = rolesQuery.data?.data || rolesQuery.data || [];

  // Data processing safely
  const chartRolesData = Array.isArray(rawRolesData) ? rawRolesData.map((item: any) => ({
     name: item.name || item.role || 'Unknown',
     value: item.value || item.count || 0,
     color: item.name?.toUpperCase().includes('ADMIN') ? COLORS.admin :
            item.name?.toUpperCase().includes('MENTOR') ? COLORS.mentor : COLORS.learner
  })) : [];

  const chartStatusData = Array.isArray(rawStatusData) ? rawStatusData.map((item: any) => ({
      name: item.name || item.status || 'Unknown',
      value: item.value || item.count || 0,
      fill: item.name?.toUpperCase() === 'ACTIVE' ? COLORS.active : 
            item.name?.toUpperCase() === 'SUSPENDED' ? COLORS.suspended : COLORS.blocked
  })) : [];

  // Compute live KPI metrics explicitly based on synced global user models 
  const kpiMetrics = useMemo(() => {
     if (!users || !Array.isArray(users)) return { total: 0, active: 0, blocked: 0, mentors: 0, totalGroups: 0, flaggedGroups: 0 };
     
     const total = users.length;
     const active = users.filter((u: any) => u.status === 'ACTIVE').length;
     const blocked = users.filter((u: any) => u.status === 'BLOCKED').length;
     const mentors = users.filter((u: any) => u.role === 'MENTOR').length;
     
     const totalGroups = groups?.length || 0;
     const flaggedGroups = groups?.filter((g: any) => g.status === 'FLAGGED').length || 0;
     
     return { total, active, blocked, mentors, totalGroups, flaggedGroups };
  }, [users, groups]);

  // Actual export function triggering CSV blob download correctly
  const handleExport = () => {
    try {
      showToast('Preparing CSV Data export...', 'info');
      
      const csvRows = [];
      // Headers
      csvRows.push(['Metric', 'Value']);
      
      // Data Rows
      csvRows.push(['Total Users', kpiMetrics.total]);
      csvRows.push(['Active Users', kpiMetrics.active]);
      csvRows.push(['Mentors', kpiMetrics.mentors]);
      csvRows.push(['Total Groups', kpiMetrics.totalGroups]);
      csvRows.push(['Blocked Users', kpiMetrics.blocked]);
      csvRows.push(['Flagged Groups', kpiMetrics.flaggedGroups]);
      
      // Convert to CSV
      const csvString = csvRows.map(row => row.join(',')).join('\n');
      
      // Create blob and trigger download natively without needing backend
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `skillsync_analytics_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
          showToast('Analytics Report Successfully Downloaded', 'success');
      }, 500);

    } catch (error) {
       showToast('Failed to export report.', 'error');
    }
  };

  const handleRetry = () => {
      growthQuery.refetch();
      statusQuery.refetch();
      rolesQuery.refetch();
  };

  return (
    <div className="space-y-8 pb-32">
      {/* 🚀 1. Header & Filtering Bar */}
      <div className="bg-white/80 backdrop-blur-md pt-4 pb-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3 uppercase italic">
             Analytics Dashboard <Icon icon={LucideLineChart} size={28} className="text-indigo-600" />
          </h1>
          <p className="text-sm font-bold text-slate-500 mt-1">Track platform growth and activity</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <FilterBar timeRange={timeRange} setTimeRange={setTimeRange} userType={userType} setUserType={setUserType} />

           <Button onClick={handleExport} leftIcon={<Icon icon={Download} size={16} />}>
              Export Report
           </Button>
        </div>
      </div>

      {/* 🔄 2. Backend Sync Status Bar */}
      <div className="flex items-center gap-2 px-1">
          {isGlobalLoading ? (
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-4 py-2 rounded-lg">
                 <Icon icon={RefreshCw} size={16} className="animate-spin" /> Loading data...
              </div>
          ) : hasGlobalError ? (
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-4 py-2 rounded-lg border border-rose-100">
                 <Icon icon={XCircle} size={16} /> Failed to load data
                 <button onClick={handleRetry} className="ml-2 text-[10px] bg-rose-600 text-white px-3 py-1 rounded-md hover:bg-rose-700">Retry</button>
              </div>
          ) : (
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 animate-fade-in">
                 <Icon icon={CheckCircle} size={16} /> Data synced successfully
              </div>
          )}
      </div>

      {/* 🚨 Alert Banners */}
      {kpiMetrics.blocked >= 20 && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg shadow-sm flex items-center gap-3">
             <Icon icon={AlertTriangle} className="text-rose-600" size={20} />
             <p className="text-sm font-bold text-rose-900 uppercase tracking-tight">⚠ {kpiMetrics.blocked} users blocked today — System detecting anomalous activity.</p>
          </div>
      )}

      {/* 🔝 3. Top KPI Metric Cards */}
      {isGlobalLoading && !growthQuery.data ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
             {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-gray-50/80 animate-pulse rounded-2xl border border-gray-100"></div>)}
          </div>
      ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
             <KpiCard title="Total Users" value={kpiMetrics.total} icon={Users} />
             <KpiCard title="Active Users" value={kpiMetrics.active} icon={Activity} />
             <KpiCard title="Blocked Users" value={kpiMetrics.blocked} urgent={kpiMetrics.blocked > 10} icon={Ban} />
             <KpiCard title="Total Groups" value={kpiMetrics.totalGroups} icon={Users} />
             <KpiCard title="Flagged Groups" value={kpiMetrics.flaggedGroups} urgent={kpiMetrics.flaggedGroups > 5} icon={AlertTriangle} />
             <KpiCard title="Mentors" value={kpiMetrics.mentors} icon={GraduationCap} />
          </div>
      )}

      {/* 📈 4. Main User Growth (Line Chart) */}
      <ChartWrapper title={`User Growth (Last ${timeRange})`}>
         {rawGrowthData.length > 0 ? (
            <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rawGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} />
                     <RechartsTooltip content={<CustomTooltip />} />
                     <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '20px' }} />
                     
                     <Line type="monotone" name="New Users per Day" dataKey="users" stroke={COLORS.primary} strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                     <Line type="monotone" name="DAU (Active)" dataKey="active" stroke={COLORS.active} strokeWidth={3} dot={false} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         ) : (
            <div className="h-[400px] flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
               <h4 className="text-lg font-bold text-gray-900 mb-1">No data available yet</h4>
               <p className="text-sm font-medium text-gray-400">Data will appear once users start registering</p>
            </div>
         )}
      </ChartWrapper>

      {/* 📊 5. Lower Diagnostics Row (Roles & Groups) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* Role Distribution Donut Chart */}
         <ChartWrapper title="User Roles Distribution">
            <div className="h-[300px] relative">
               {chartRolesData.length > 0 ? (
                  <>
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                              data={chartRolesData}
                              cx="50%" cy="50%"
                              innerRadius={75} outerRadius={100}
                              paddingAngle={4}
                              dataKey="value"
                              stroke="none"
                           >
                              {chartRolesData.map((entry: any, index: number) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                           </Pie>
                           <RechartsTooltip content={<CustomTooltip />} />
                        </PieChart>
                     </ResponsiveContainer>
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-black text-gray-900">{kpiMetrics.total}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Users</span>
                     </div>
                  </>
               ) : (
                  <div className="flex h-full items-center justify-center">
                     <p className="text-sm font-medium text-gray-400">No data available yet</p>
                  </div>
               )}
            </div>
            {chartRolesData.length > 0 && (
               <div className="flex justify-center flex-wrap gap-4 mt-6">
                  {chartRolesData.map((d: any) => (
                     <div key={d.name} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                        <span className="text-xs font-bold text-gray-600">{d.name}: {d.value}</span>
                     </div>
                  ))}
               </div>
            )}
         </ChartWrapper>

         {/* Group Analytics Bar Chart */}
         <ChartWrapper title="Group Activity">
            <div className="h-[300px] flex-1">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartStatusData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                     <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} />
                     <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#374151', fontWeight: 700 }} width={80} />
                     <RechartsTooltip cursor={{ fill: '#F3F4F6' }} content={<CustomTooltip />} />
                     <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={25}>
                        {chartStatusData.map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </ChartWrapper>
      </div>
    </div>
  );
}


/* ================= REUSABLE COMPONENTS ================= */

const FilterBar = ({ timeRange, setTimeRange, userType, setUserType }: any) => (
   <>
      <div className="p-1 bg-gray-50 border border-gray-100 rounded-xl flex items-center shadow-sm">
         {['7D', '30D', '90D'].map(range => (
            <button 
               key={range}
               onClick={() => setTimeRange(range)}
               className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${timeRange === range ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
               Last {range}
            </button>
         ))}
      </div>
      
      <select 
         value={userType} 
         onChange={e => setUserType(e.target.value)}
         className="bg-white border border-gray-200 rounded-xl py-3 px-5 text-xs font-bold text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
      >
         <option value="ALL">All Types</option>
         <option value="LEARNERS">Learners</option>
         <option value="MENTORS">Mentors</option>
      </select>
   </>
);

const ChartWrapper = ({ title, children }: any) => (
   <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm transition-shadow hover:shadow-md">
      <h3 className="text-base font-extrabold text-gray-900 mb-6">{title}</h3>
      {children}
   </div>
);

const KpiCard = ({ title, value, urgent, icon }: any) => (
  <div className={`bg-white rounded-[2rem] p-6 border shadow-sm transition-all relative overflow-hidden group ${urgent ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50'}`}>
     <div className="flex justify-between items-start mb-4">
        <p className={`text-[10px] font-black uppercase tracking-widest ${urgent ? 'text-rose-500' : 'text-slate-400'}`}>{title}</p>
        <div className={`p-2 rounded-xl transition-colors ${urgent ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
           <Icon icon={icon || TrendingUp} size={16} />
        </div>
     </div>
     <h2 className={`text-4xl font-black tracking-tighter ${urgent ? 'text-rose-600' : 'text-slate-900'}`}>{value.toLocaleString()}</h2>
     <div className={`absolute bottom-[-10px] right-[-10px] opacity-[0.03] transition-transform group-hover:scale-110 ${urgent ? 'text-rose-600' : 'text-slate-900'}`}>
        <Icon icon={icon || TrendingUp} size={80} />
     </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-xl">
        <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">{label}</p>
        <div className="space-y-2">
           {payload.map((entry: any, index: number) => (
             <div key={index} className="flex items-center gap-3">
               <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
               <span className="text-sm font-bold text-gray-700">{entry.name}:</span>
               <span className="text-sm font-black text-gray-900 ml-auto">{entry.value.toLocaleString()}</span>
             </div>
           ))}
        </div>
      </div>
    );
  }
  return null;
};
