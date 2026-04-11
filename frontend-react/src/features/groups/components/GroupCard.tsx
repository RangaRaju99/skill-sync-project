import { motion } from 'framer-motion';
import { Users, Target, Archive, Search, Star, Activity, Clock, CheckCircle2, Zap, MessageSquare, AlertTriangle } from 'lucide-react';
import { type GroupDto } from '../../../hooks/useGroups';

interface GroupCardProps {
  group: GroupDto;
  isJoined: boolean;
  isCreator: boolean;
  isNew: boolean;
  onJoinToggle: (e: React.MouseEvent, g: GroupDto) => void;
  onNavigate: (id: number) => void;
  getGroupFocusTag: (description?: string) => { tag: string; color: string };
}

export const GroupCard = ({
  group,
  isJoined,
  isCreator,
  isNew,
  onJoinToggle,
  onNavigate,
  getGroupFocusTag
}: GroupCardProps) => {
  const currentMembers = group.currentMembers || group.memberCount || 0;
  const isFull = currentMembers >= group.maxMembers;
  const focus = getGroupFocusTag(group.description);
  const isInactive = group.status === "INACTIVE";
  const isDeleted = group.status === "DELETED";

  // Match reason logic from GroupsPage
  const matchReason = (group as any)._matchReason;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      key={group.id}
      onClick={() => onNavigate(group.id)}
      className={`bg-white rounded-[3rem] p-8 transition-all duration-500 hover:-translate-y-2 cursor-pointer relative group flex flex-col h-full ${isNew
          ? 'border-2 border-primary-400 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)]'
          : isInactive || isDeleted
            ? 'border border-slate-100 shadow-sm opacity-90 grayscale-[0.5] bg-slate-50/80 backdrop-blur-md'
            : 'border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]'
        }`}
    >
      {/* Highlight Badge */}
      {isNew && (
        <div className="absolute -top-3 left-8 px-4 py-1.5 bg-primary-600 text-white font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2 z-10 animate-bounce">
          ✨ Newly Created
        </div>
      )}

      {/* Inactive/Deleted Badge */}
      {(isInactive || isDeleted) && (
        <div className="absolute -top-3 left-8 px-4 py-1.5 bg-slate-800 text-white font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2 z-10">
          <Archive size={10} /> {isDeleted ? 'Deleted History' : 'Archived Hub'}
        </div>
      )}

      {/* Status Ring Header */}
      <div className="flex justify-between items-start mb-8">
        <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center font-black text-2xl uppercase border shadow-inner group-hover:scale-110 transition-transform duration-500 ${isInactive || isDeleted
            ? 'bg-slate-100 text-slate-400 border-slate-200'
            : 'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 border-slate-200'
          }`}>
          {group.name.substring(0, 2)}
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center justify-center bg-white/80 backdrop-blur-sm border border-slate-100 px-4 py-2 rounded-2xl shadow-sm">
            <Users size={14} className="text-slate-400 mr-2" />
            <span className="text-[11px] font-black tracking-widest text-slate-600">{currentMembers} / {group.maxMembers}</span>
          </div>
          <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-lg border flex items-center gap-1.5 ${group.status === 'ACTIVE'
              ? 'text-emerald-500 bg-emerald-50/50 border-emerald-100'
              : 'text-slate-400 bg-slate-100/50 border-slate-200'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${group.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            {group.status === 'ACTIVE' ? 'Synchronizing' : isDeleted ? 'Decommissioned' : 'Standby'}
          </span>
        </div>
      </div>

      {/* Title & Data */}
      <div className="space-y-4 mb-8 flex-1">
        <h3 className={`text-2xl font-black truncate tracking-tight transition-colors duration-500 ${isInactive || isDeleted ? 'text-slate-400' : 'text-slate-900'}`}>{group.name}</h3>
        <p className={`text-sm font-bold leading-relaxed italic line-clamp-2 transition-colors duration-500 ${isInactive || isDeleted ? 'text-slate-400/60' : 'text-slate-500'}`}>
          "{group.description || 'Global learning cluster deployed for synchronized knowledge sharing.'}"
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] rounded-xl border transition-all duration-500 ${focus.color} ${isInactive || isDeleted ? 'opacity-40 saturate-0' : ''}`}>
            <Target size={10} className="inline mr-1" /> {focus.tag}
          </span>
        </div>

        {matchReason === 'archived' || isInactive ? (
          <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100 border border-slate-200 w-fit px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mt-2">
            <Archive size={12} /> Read-only Instance
          </div>
        ) : matchReason === 'skill' ? (
          <div className="flex items-center gap-1.5 text-primary-600 bg-primary-50 border border-primary-100 w-fit px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mt-2 animate-pulse">
            <Star size={12} className="fill-current" /> High Compatibility
          </div>
        ) : group.status === 'ACTIVE' ? (
          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 w-fit px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mt-2 translate-y-0 opacity-100 transition-all">
            <Activity size={12} /> Core Hub
          </div>
        ) : null}
      </div>

      {/* Capacity Bar System */}
      <div className="space-y-2 mt-auto mb-8">
        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-200/30 shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (currentMembers / group.maxMembers) * 100)}%` }}
            transition={{ duration: 1.5, ease: 'circOut' }}
            className={`h-full rounded-full border-r border-white/20 transition-colors duration-1000 ${isInactive || isDeleted ? 'bg-slate-300' : 'bg-slate-900 shadow-[0_0_10px_rgba(15,23,42,0.1)]'}`}
          />
        </div>
      </div>

      {/* Operational Footer */}
      <div className="flex items-center gap-3 pt-2">
        {isInactive || isDeleted ? (
          <div className="flex flex-1 gap-2 group/btn relative">
            {isJoined ? (
              <button
                onClick={(e) => onJoinToggle(e, group)}
                className="h-14 flex-1 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all bg-red-50/50 hover:bg-red-50 text-red-400 hover:text-red-700 border border-red-100/50"
              >
                Leave Sync
              </button>
            ) : group.hasLeftInactive ? (
              <button
                disabled
                className="h-14 flex-1 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 bg-slate-900/10 text-slate-400 border border-slate-200 cursor-not-allowed"
              >
                Left
              </button>
            ) : (
              <button
                disabled
                className="h-14 flex-1 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 bg-slate-100/50 text-slate-400 cursor-not-allowed border border-dashed border-slate-200"
              >
                <Archive size={16} /> View Only
              </button>
            )}

            {/* Tooltip */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-20">
              {group.hasLeftInactive
                ? "Re-enrollment is locked for previously abandoned syncs."
                : "Synchronizations are restricted for inactive nodes."}
            </div>
          </div>
        ) : !isCreator ? (
          <button
            onClick={(e) => onJoinToggle(e, group)}
            disabled={isFull && !isJoined}
            className={`h-14 flex-1 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all duration-300 ${isJoined
                ? 'bg-white text-slate-400 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-100 shadow-sm'
                : isFull
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200/50'
                  : 'bg-slate-900 text-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:-translate-y-1 cursor-pointer'
              }`}
          >
            {isJoined ? <><CheckCircle2 size={16} /> Enrolled</> : isFull ? 'At Capacity' : <><Zap size={16} className="fill-current" /> Join Hub</>}
          </button>
        ) : (
          <span className="flex-1 h-14 flex items-center justify-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-slate-700">
            <Star size={14} className="fill-current text-yellow-400" /> Administrative
          </span>
        )}

        <button
          className="w-14 h-14 bg-white border border-slate-100 text-slate-400 rounded-[1.5rem] flex items-center justify-center hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 shadow-sm hover:shadow-md"
          title="Discussions"
        >
          <MessageSquare size={18} />
        </button>
      </div>


      {/* Next session mock (if active) */}
      {!isInactive && !isDeleted && (
        <div className="absolute top-0 right-10 -translate-y-1/2 bg-amber-400 text-amber-950 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-2 z-10 scale-0 group-hover:scale-100 transition-transform origin-bottom">
          <Clock size={12} /> Sync: 19:00 UTC
        </div>
      )}
    </motion.div>
  );
};
