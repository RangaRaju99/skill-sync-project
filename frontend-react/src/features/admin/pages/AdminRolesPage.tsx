import React, { useMemo } from 'react';
import { ShieldCheck, User, HelpCircle } from 'lucide-react';
import { useAdmin } from '../../../hooks/useAdmin';
import { Icon } from '../../../components/ui/Icon';

interface RoleDefinition {
  id: string;
  name: string;
  badgeContent: React.ReactNode;
  permissions: string;
  tooltipContext: string;
}

const STATIC_ROLES: RoleDefinition[] = [
  { 
     id: 'ADMIN', 
     name: 'Admin', 
     badgeContent: <><div className="w-2 h-2 rounded-full bg-blue-500"></div> <span className="text-blue-700">Admin</span></>, 
     permissions: 'Full System Access',
     tooltipContext: 'Can modify platform settings, perform global moderation, and override standard protocols.'
  },
  { 
     id: 'MENTOR', 
     name: 'Mentor', 
     badgeContent: <><div className="w-2 h-2 rounded-full bg-emerald-500"></div> <span className="text-emerald-700">Mentor</span></>, 
     permissions: 'Groups, Sessions, Content',
     tooltipContext: 'Can manage learning hubs, approve session requests, and generate structured content.'
  },
  { 
     id: 'LEARNER', 
     name: 'Learner', 
     badgeContent: <><div className="w-2 h-2 rounded-full bg-slate-400"></div> <span className="text-slate-700">Learner</span></>, 
     permissions: 'Basic Access',
     tooltipContext: 'Can join groups, consume learning content, and request mentorship sessions.'
  }
];

export default function AdminRolesPage() {
  const { users } = useAdmin();
  
  // Dynamic Distribution Analytics
  // Guaranteeing at least 1 prevents divide-by-zero crashes if the mock backend fails
  const totalUsers = users.length > 0 ? users.length : 1; 

  const roleStats = useMemo(() => {
    const stats: Record<string, number> = {};
    users.forEach((u: any) => {
      // Coerce role string formats safely
      let targetRole = 'LEARNER';
      if (u.role?.toUpperCase().includes('ADMIN')) targetRole = 'ADMIN';
      if (u.role?.toUpperCase().includes('MENTOR')) targetRole = 'MENTOR';
      
      stats[targetRole] = (stats[targetRole] || 0) + 1;
    });
    return stats;
  }, [users]);

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Roles Overview</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Platform role distribution and static access capabilities.</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 flex items-start gap-4 rounded-2xl w-max max-w-2xl">
         <div className="shrink-0 p-2 bg-blue-100 rounded-lg text-blue-600">
            <Icon icon={HelpCircle} size={18} />
         </div>
         <div>
            <h4 className="text-sm font-bold text-blue-900">System Role Mechanics</h4>
            <p className="text-xs font-semibold text-blue-800/80 mt-1">
               Roles in SkillSync are statically defined to guarantee platform security. Instead of modifying core access tiers, manage privileges directly by promoting or demoting individual profiles on the <span className="font-bold underline cursor-pointer">Users hub</span>.
            </p>
         </div>
      </div>

      {/* Simplified SaaS Analytical Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-5 px-8 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="py-5 px-8 text-xs font-semibold text-gray-500 uppercase tracking-wider">Configuration</th>
                <th className="py-5 px-8 text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Distribution</th>
              </tr>
            </thead>
            <tbody>
              {STATIC_ROLES.map((role, idx) => {
                const count = roleStats[role.id] || 0;
                // Cap exact percentage calculation safely for UI tracking.
                const percentage = Math.round((count / totalUsers) * 100);

                return (
                  <tr key={role.id} className={`${idx !== STATIC_ROLES.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50/50 transition-colors group relative`}>
                    <td className="py-7 px-8 align-top">
                       {/* Role Badge and Desktop Tooltip Parent */}
                       <div className="relative inline-block cursor-help">
                          <span className={`px-4 py-2 rounded-xl text-xs font-bold border flex w-max items-center gap-2 bg-gray-50 border-gray-200 transition-all group-hover:shadow-sm`}>
                             {role.badgeContent}
                          </span>
                          
                          {/* Rich Tooltip (Hidden by default, shown on hover relative to the badge wrapper) */}
                          <div className="absolute left-0 mt-3 w-64 bg-slate-800 text-white text-xs font-semibold rounded-xl p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                             <div className="absolute -top-1 left-6 w-3 h-3 bg-slate-800 rotate-45 transform"></div>
                             <p className="relative z-10 leading-relaxed">{role.tooltipContext}</p>
                          </div>
                       </div>
                    </td>
                    
                    <td className="py-7 px-8 align-top">
                       <span className="text-sm font-semibold text-gray-700">{role.permissions}</span>
                    </td>
                    
                    <td className="py-7 px-8 max-w-[250px] align-top">
                       <div className="flex flex-col gap-2">
                           <div className="flex items-center justify-between text-sm">
                              <span className="font-bold text-gray-900 flex items-center gap-2">
                                 <Icon icon={User} size={14} className="text-gray-400" />
                                 {count.toLocaleString()} <span className="font-medium text-gray-500 text-xs uppercase tracking-widest ml-1">users</span>
                              </span>
                              <span className="font-bold text-gray-500">{percentage}%</span>
                           </div>
                           
                           {/* Percentage Visual Bar */}
                           <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                              <div 
                                 className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                    role.id === 'ADMIN' ? 'bg-blue-500' :
                                    role.id === 'MENTOR' ? 'bg-emerald-500' : 'bg-slate-400'
                                 }`}
                                 style={{ width: `${Math.max(percentage, 1)}%` }} // Force small 1% blip for empty categories so they don't look broken
                              />
                           </div>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
