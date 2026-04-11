import React, { useState } from 'react';
import { MoreHorizontal, ShieldCheck, UserMinus, UserPlus, Ban, Lock, Unlock, Mail } from 'lucide-react';

interface UserTableProps {
  users: any[];
  onAction: (userId: number, type: string) => void;
}

export const ModernUserTable: React.FC<UserTableProps> = ({ users, onAction }) => {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const StatusBadge = ({ status }: { status: string }) => {
    const config: any = {
      ACTIVE: { bg: 'bg-emerald-50 text-emerald-600', label: 'ONLINE' },
      BLOCKED: { bg: 'bg-rose-50 text-rose-600', label: 'ISOLATED' },
      SUSPENDED: { bg: 'bg-amber-50 text-amber-600', label: 'SUSPENDED' }
    };
    const { bg, label } = config[status] || config.ACTIVE;
    return <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${bg}`}>{label}</span>;
  };

  const ActionMenu = ({ user }: { user: any }) => {
    return (
      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden p-2 animate-modal-in">
        {/* Role Logic */}
        {user.role === 'LEARNER' && (
          <button onClick={() => onAction(user.userId, 'PROMOTE')} className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all">
            <UserPlus size={14} /> Promote to Expert
          </button>
        )}
        {user.role === 'MENTOR' && (
          <button onClick={() => onAction(user.userId, 'DEMOTE')} className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all">
            <UserMinus size={14} /> Demote to Node
          </button>
        )}

        {/* Status Logic */}
        {user.status === 'ACTIVE' ? (
          <>
            <button onClick={() => onAction(user.userId, 'SUSPEND')} className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all">
              <Lock size={14} /> Suspend Access
            </button>
            <button onClick={() => onAction(user.userId, 'BLOCK')} className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black text-rose-600 uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-all">
              <Ban size={14} /> Global Block
            </button>
          </>
        ) : (
          <button onClick={() => onAction(user.userId, 'UNBLOCK')} className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 rounded-xl transition-all">
            <Unlock size={14} /> Restore Access
          </button>
        )}
        
        <div className="border-t border-slate-50 my-1"></div>
        <button className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all">
          <Mail size={14} /> Push Alert
        </button>
      </div>
    );
  };

  return (
    <div className="w-full">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-50">
            <th className="p-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Identity Node</th>
            <th className="p-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Access Vector</th>
            <th className="p-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Operational Status</th>
            <th className="p-8 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Direct Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {users.map((user) => (
            <tr key={user.userId} className="group hover:bg-slate-50/30 transition-all">
              <td className="p-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                    {user.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1.5">{user.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="p-8">
                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100 italic transition-all ${user.role === 'ADMIN' ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : 'text-slate-500 bg-white'}`}>
                  {user.role}
                </span>
              </td>
              <td className="p-8">
                <StatusBadge status={user.status} />
              </td>
              <td className="p-8 text-right relative">
                <button 
                  onClick={() => setActiveMenu(activeMenu === user.userId ? null : user.userId)}
                  className="p-3 hover:bg-slate-100 rounded-xl text-slate-400 transition-all active:scale-90"
                >
                  <MoreHorizontal size={20} />
                </button>
                {activeMenu === user.userId && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)}></div>
                    <ActionMenu user={user} />
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
