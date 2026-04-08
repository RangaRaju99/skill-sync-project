import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { type GroupDto } from '../../../hooks/useGroups';
import { GroupCard } from './GroupCard';

interface GroupListProps {
  groups: GroupDto[];
  joinedGroupIds: number[];
  newlyCreatedGroupId: number | null;
  onJoinToggle: (e: React.MouseEvent, g: GroupDto) => void;
  onNavigate: (id: number) => void;
  getGroupFocusTag: (description?: string) => { tag: string; color: string };
  isCreator: (g: GroupDto) => boolean;
  onResetFilters: () => void;
}

export const GroupList = ({
  groups,
  joinedGroupIds,
  newlyCreatedGroupId,
  onJoinToggle,
  onNavigate,
  getGroupFocusTag,
  isCreator,
  onResetFilters
}: GroupListProps) => {
  if (groups.length === 0) {
    return (
      <div className="py-32 flex flex-col items-center text-center space-y-6 bg-slate-50/50 rounded-[4rem] border-2 border-dashed border-slate-100 transition-all">
        <div className="w-24 h-24 bg-white rounded-[3rem] flex items-center justify-center text-slate-200 shadow-sm">
          <Search className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">No hubs match criteria</h3>
          <p className="text-slate-400 font-bold max-w-sm">Synchronize with a different sector or adjust your trajectory.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onResetFilters}
            className="h-14 px-8 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs tracking-widest shadow-xl hover:bg-black transition-all uppercase flex items-center justify-center"
          >
            View Active Synchronizations
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-32">
      <AnimatePresence mode="popLayout">
        {groups.map((g) => (
          <GroupCard
            key={g.id}
            group={g}
            isJoined={joinedGroupIds.includes(g.id)}
            isCreator={isCreator(g)}
            isNew={g.id === newlyCreatedGroupId}
            onJoinToggle={onJoinToggle}
            onNavigate={onNavigate}
            getGroupFocusTag={getGroupFocusTag}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
