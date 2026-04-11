import React from 'react';
import { Mail, Shield, Trash2, Mail as MailIcon } from 'lucide-react';

interface UserTableProps {
  users: any[];
  isLoading: boolean;
  onRoleChange: (userId: number, role: string) => void;
  onStatusChange: (userId: number, currentStatus: string) => void;
}

export const UserTable: React.FC<UserTableProps> = ({ users, isLoading, onRoleChange, onStatusChange }) => {
  if (isLoading) {
    return (
      <div className="p-20 text-center animate-pulse">
        <div className="h-4 bg-slate-50 rounded-lg w-full mb-4"></div>
        <div className="h-4 bg-slate-50 rounded-lg w-full mb-4"></div>
        <div className="h-4 bg-slate-50 rounded-lg w-full"></div>
      </div>
    );
  }

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="bg-slate-50/50 border-b border-slate-50">
          <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Node Identity</th>
          <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Security Credentials</th>
          <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Rank/Role</th>
          <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Matrix Status</th>
          <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Operational Control</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {users.map((u: any) => (
          <tr key={u.userId} className="hover:bg-slate-50/20 transition-all group">
            <td className="p-8">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-black text-sm shadow-sm">
                  {u.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">{u.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic leading-none">ID: SYS-NODE-{u.userId}</p>
                </div>
              </div>
            </td>
            <td className="p-8">
              <div className="flex items-center gap-2 text-slate-600">
                <MailIcon className="w-4 h-4 text-slate-300" />
                <span className="text-sm font-bold lowercase">{u.email}</span>
              </div>
            </td>
            <td className="p-8">
              <select 
                value={u.role}
                onChange={(e) => onRoleChange(u.userId, e.target.value)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border-none focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer ${
                  u.role === 'ADMIN' ? 'bg-amber-50 text-amber-600 italic' : 
                  u.role === 'MENTOR' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'
                }`}
              >
                <option value="LEARNER">Standard Node</option>
                <option value="MENTOR">Matrix Expert</option>
                <option value="ADMIN">Root Admin</option>
              </select>
            </td>
            <td className="p-8">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                <span className={`text-[10px] font-black uppercase tracking-widest italic ${u.status === 'ACTIVE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {u.status}
                </span>
              </div>
            </td>
            <td className="p-8">
              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => onStatusChange(u.userId, u.status)}
                  className={`p-3 rounded-xl transition-all shadow-sm border border-slate-100 ${u.status === 'ACTIVE' ? 'bg-rose-50 text-rose-500 hover:bg-rose-500' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500'} hover:text-white`}
                  title={u.status === 'ACTIVE' ? "Isolate Node" : "Re-activate Node"}
                >
                  <Shield className="w-4 h-4" />
                </button>
                <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-slate-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
