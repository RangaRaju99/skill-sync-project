import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Users, Activity, Zap, 
  ChevronRight, Command, X, Shield, Database,
  Terminal, UserPlus, Trash2, Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const commands = [
    { id: 'usr', title: 'Find Inhabitants', subtitle: 'Search the global user registry', icon: <Users className="w-4 h-4" />, category: 'Registry' },
    { id: 'mnt', title: 'Verify Experts', subtitle: 'Review pending mentor applications', icon: <Shield className="w-4 h-4" />, category: 'Security' },
    { id: 'skl', title: 'Initialize Domain', subtitle: 'Create a new skill matrix node', icon: <Zap className="w-4 h-4" />, category: 'Operations' },
    { id: 'stat', title: 'System Pulse', subtitle: 'View real-time engine statistics', icon: <Activity className="w-4 h-4" />, category: 'Intelligence' },
    { id: 'db', title: 'Matrix Distribution', subtitle: 'Analyze role weightings', icon: <Database className="w-4 h-4" />, category: 'Intelligence' },
    { id: 'set', title: 'Terminal Config', subtitle: 'Adjust command center parameters', icon: <Terminal className="w-4 h-4" />, category: 'System' },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) || 
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(filteredCommands[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (cmd: typeof commands[0]) => {
    console.log('Executing Command:', cmd.title);
    // Navigation / Action Logic
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-6 sm:px-0">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.2)] border border-white overflow-hidden animate-modal-in">
        <div className="relative flex items-center p-8 border-b border-slate-50">
          <Search className="w-6 h-6 text-slate-300 mr-4" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-slate-900 placeholder:text-slate-200"
            placeholder="Interrogate system... (e.g. 'Registry')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 italic">
            <Command className="w-3 h-3" /> K
          </div>
        </div>

        <div className="max-h-[450px] overflow-y-auto no-scrollbar p-4">
          {filteredCommands.length > 0 ? (
            <div className="space-y-2">
               {filteredCommands.map((cmd, idx) => (
                 <button
                   key={cmd.id}
                   className={`w-full flex items-center gap-5 p-5 rounded-[1.8rem] transition-all text-left group ${
                     idx === selectedIndex ? 'bg-primary-600 shadow-xl scale-[1.02]' : 'hover:bg-slate-50'
                   }`}
                   onClick={() => handleSelect(cmd)}
                   onMouseEnter={() => setSelectedIndex(idx)}
                 >
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                     idx === selectedIndex ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600'
                   }`}>
                      {cmd.icon}
                   </div>
                   <div className="flex-1">
                      <p className={`text-[10px] font-black uppercase tracking-widest italic mb-1 ${idx === selectedIndex ? 'text-white/60' : 'text-slate-400'}`}>
                         {cmd.category}
                      </p>
                      <p className={`text-base font-black tracking-tight uppercase italic ${idx === selectedIndex ? 'text-white' : 'text-slate-900'}`}>
                         {cmd.title}
                      </p>
                      <p className={`text-xs font-medium ${idx === selectedIndex ? 'text-white/80' : 'text-slate-500'}`}>
                         {cmd.subtitle}
                      </p>
                   </div>
                   {idx === selectedIndex && (
                     <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                        <ChevronRight className="w-5 h-5" />
                     </div>
                   )}
                 </button>
               ))}
            </div>
          ) : (
            <div className="py-20 text-center">
               <Shield className="w-16 h-16 text-slate-100 mx-auto mb-6" />
               <p className="text-sm font-black text-slate-300 uppercase italic tracking-widest">Query returned null results</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="px-2 py-1 bg-white rounded border border-slate-100 text-[9px] font-black text-slate-400">↑↓</div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Navigate</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="px-2 py-1 bg-white rounded border border-slate-100 text-[9px] font-black text-slate-400">ENTER</div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Execute</span>
              </div>
           </div>
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
              SkillSync Matrix Engine <Globe className="w-3 h-3" />
           </p>
        </div>
      </div>
    </div>
  );
}
