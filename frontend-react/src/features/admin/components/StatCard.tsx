import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Icon } from '../../../components/ui/Icon';

interface StatCardProps {
  label: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  icon: React.ReactNode;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, trend, trendUp, icon, color }) => {
  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-300 overflow-hidden relative">
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">{label}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trendUp ? <Icon icon={ArrowUpRight} size={12} /> : <Icon icon={ArrowDownRight} size={12} />}
          {trend}
        </div>
      </div>
    </div>
  );
};
