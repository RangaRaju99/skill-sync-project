import { LayoutGrid, Star, Compass, Archive, Clock } from 'lucide-react';

export type GroupTabType = 'all' | 'my_groups' | 'recommended' | 'inactive' | 'history';

interface GroupTabsProps {
  activeTab: GroupTabType;
  onTabChange: (tab: GroupTabType) => void;
}

export const GroupTabs = ({ activeTab, onTabChange }: GroupTabsProps) => {
  const tabs = [
    { id: 'all', label: 'All Active', icon: LayoutGrid },
    { id: 'my_groups', label: 'My Groups', icon: Star },
    { id: 'recommended', label: 'Recommended', icon: Compass },
    { id: 'inactive', label: 'Inactive', icon: Archive },
    { id: 'history', label: 'History', icon: Clock },
  ];

  return (
    <div className="flex bg-white p-1.5 rounded-[1.5rem] w-fit border border-slate-100 shadow-sm overflow-x-auto max-w-full no-scrollbar">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id as GroupTabType)}
          className={`h-14 px-8 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[2px] flex items-center gap-3 transition-all flex-shrink-0 ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'
            }`}
        >
          <tab.icon size={16} className={activeTab === tab.id ? 'fill-current opacity-20' : ''} />
          {tab.label}
        </button>
      ))}
    </div>
  );
};
