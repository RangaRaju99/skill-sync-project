import React from 'react';
import { Target, TrendingUp, Award } from 'lucide-react';

const GoalTracker: React.FC = () => {
  const goals = [
    { name: 'React Advanced Hooks', progress: 75, color: 'bg-primary' },
    { name: 'System Design Basics', progress: 40, color: 'bg-emerald-500' },
    { name: 'TypeScript Generics', progress: 90, color: 'bg-violet-500' },
  ];

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/15">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="text-primary" size={20} />
          <h3 className="font-bold text-lg text-on-surface">Learning Goals</h3>
        </div>
        <TrendingUp className="text-on-surface-variant" size={18} />
      </div>

      <div className="space-y-6">
        {goals.map((goal, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-on-surface">{goal.name}</span>
              <span className="text-xs font-black text-on-surface-variant">{goal.progress}%</span>
            </div>
            <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
              <div 
                className={`h-full ${goal.color} transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,0,0,0.1)]`} 
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-outline-variant/10">
        <div className="flex items-center gap-3 bg-primary/5 p-3 rounded-xl border border-primary/10">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Award size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Next Milestone</p>
            <p className="text-xs font-bold text-on-surface">Skill Sync Cert: Frontend Pro</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalTracker;
