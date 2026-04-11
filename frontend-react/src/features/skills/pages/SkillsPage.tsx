
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSkills } from '@/hooks/useSkills';
import type { SkillDto } from '@/hooks/useSkills';
import { useAdmin } from '@/hooks/useAdmin';
import { useProfile } from '@/hooks/useProfile';
import { useAuthStore } from '@/store/authStore';
import { Loader2, Search, Plus, X, BookOpen, Users, Edit, Trash2, Milestone, TrendingUp, Star, ShieldCheck, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Refined System Components
import SkillCard from '../components/SkillCard';
import RoadmapModal from '../components/RoadmapModal';
import ProgressBar from '../components/ProgressBar';

const DEFAULT_ROADMAP = [
  { id: '1', title: 'Phase 1: Foundations' },
  { id: '2', title: 'Phase 2: Core Mastery' },
  { id: '3', title: 'Phase 3: Deep Dive' },
  { id: '4', title: 'Phase 4: Optimization' },
  { id: '5', title: 'Phase 5: Expert Deployment' }
];

export default function SkillsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { profile } = useProfile();
  const { data: skills, isLoading } = useSkills();
  const { createSkill, updateSkill, deleteSkill, isSkillSaving } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'specialized'>('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<SkillDto | null>(null);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillDto | null>(null);
  const [formData, setFormData] = useState({ skillName: '', category: '', description: '' });
  const [toastMessage, setToastMessage] = useState('');

  // Persistence Logic for Roadmaps
  const [completedStepsMap, setCompletedStepsMap] = useState<Record<number, string[]>>(() => {
    const saved = localStorage.getItem('skill-roadmaps');
    return saved ? JSON.parse(saved) : {};
  });

  // Specialization System (LocalStorage Only as per Constraints)
  const [specializedIds, setSpecializedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('user-specializations');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleSpecialization = (skillId: number, skillName: string) => {
    const isSpecializing = !specializedIds.includes(skillId);
    let updated: number[];
    if (isSpecializing) {
       updated = [...specializedIds, skillId];
       setToastMessage(`${skillName} added to focus 🎉`);
       setTimeout(() => setToastMessage(''), 3000);
    } else {
       updated = specializedIds.filter(id => id !== skillId);
    }
    setSpecializedIds(updated);
    localStorage.setItem('user-specializations', JSON.stringify(updated));
  };

  const updateCompletion = (skillId: number, stepId: string) => {
    const current = completedStepsMap[skillId] || [];
    const updated = current.includes(stepId) 
      ? current.filter(id => id !== stepId)
      : [...current, stepId];
    
    const newMap = { ...completedStepsMap, [skillId]: updated };
    setCompletedStepsMap(newMap);
    localStorage.setItem('skill-roadmaps', JSON.stringify(newMap));
  };

  const isAdmin = user?.roles.includes('ROLE_ADMIN');

  const categories = useMemo(() => {
    if (!skills) return [];
    return [...new Set(skills.map(s => s.category).filter(Boolean))].sort() as string[];
  }, [skills]);

  const filteredSkills = useMemo(() => {
    if (!skills) return [];
    let list = [...skills];
    
    if (activeTab === 'specialized') {
      list = list.filter(s => specializedIds.includes(s.id));
    } else if (selectedCategory) {
      list = list.filter(s => s.category === selectedCategory);
    }

    if (searchQuery.length >= 2) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => s.skillName.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q));
    }
    return list;
  }, [skills, activeTab, selectedCategory, searchQuery, specializedIds]);

  const getRoadmapForSkill = (skill: SkillDto) => {
    const completed = completedStepsMap[skill.id] || [];
    return DEFAULT_ROADMAP.map(step => ({
      ...step,
      completed: completed.includes(step.id)
    }));
  };

  const handleOpenCreate = () => {
    setEditingSkill(null);
    setFormData({ skillName: '', category: '', description: '' });
    setShowForm(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, skill: SkillDto) => {
    e.stopPropagation();
    setEditingSkill(skill);
    setFormData({ skillName: skill.skillName, category: skill.category || '', description: skill.description || '' });
    setShowForm(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('Permanently remove this skill?')) {
      await deleteSkill(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-12 animate-fade-in font-sans mt-4 text-left space-y-12">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-primary-50 text-primary-600 rounded-full w-fit">
             <Milestone size={14} className="fill-current" />
             <span className="text-[10px] font-black uppercase tracking-[3px]">Learning System</span>
          </div>
          <div className="space-y-1">
             <h1 className="text-5xl font-black tracking-tight text-slate-900 uppercase italic leading-none">
                Skill Matrix
             </h1>
             <p className="text-slate-400 font-bold text-xl leading-relaxed max-w-2xl mt-4">
               Domain mastery through specialized paths. 
               <span className="text-primary-600"> Select. Track. Advance.</span>
             </p>
          </div>
        </div>
        {isAdmin && (
          <button 
            onClick={handleOpenCreate}
            className="h-16 px-10 bg-primary-600 text-white rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-primary-200 hover:bg-primary-700 hover:scale-105 active:scale-95 transition-all mb-4"
          >
            <Plus className="w-6 h-6" /> Deploy Domain
          </button>
        )}
      </div>

      <div className="space-y-10">
        <div className="space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
             <div className="flex bg-slate-50 p-1.5 rounded-[1.5rem] w-fit border border-slate-100 shadow-inner">
                {[
                  { id: 'all', label: 'All Catalog', icon: BookOpen },
                  { id: 'specialized', label: 'My Specializations', icon: Star }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`h-14 px-8 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[2px] flex items-center gap-3 transition-all ${
                      activeTab === tab.id ? 'bg-white text-primary-600 shadow-xl shadow-primary-600/5' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <tab.icon size={16} className={activeTab === tab.id ? 'fill-current opacity-20' : ''} />
                    {tab.label}
                  </button>
                ))}
             </div>

             <div className="relative group flex-1 max-w-xl">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6 group-focus-within:text-primary-600 transition-colors" />
               <input 
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 placeholder="Filter expertise domains..." 
                 className="w-full h-18 bg-white border border-slate-100 rounded-[1.6rem] pl-16 pr-8 outline-none focus:border-primary-600 focus:shadow-xl focus:shadow-primary-600/5 transition-all font-bold text-lg text-slate-900 shadow-sm"
               />
             </div>
          </div>

          {activeTab === 'all' && categories.length > 0 && (
             <div className="flex flex-wrap gap-2 pt-2 animate-fade-in">
               <button 
                 onClick={() => setSelectedCategory('')}
                 className={`h-11 px-6 rounded-xl text-[9px] font-black uppercase tracking-[1px] transition-all ${!selectedCategory ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'}`}
               >
                 All Groups
               </button>
               {categories.map(cat => (
                 <button 
                   key={cat}
                   onClick={() => setSelectedCategory(cat)}
                   className={`h-11 px-6 rounded-xl text-[9px] font-black uppercase tracking-[1px] transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'}`}
                 >
                   {cat}
                 </button>
               ))}
             </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-32"><Loader2 className="w-12 h-12 text-primary-600 animate-spin" /></div>
        ) : filteredSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSkills.map((skill) => {
               const roadmap = getRoadmapForSkill(skill);
               const completedCount = roadmap.filter(s => s.completed).length;
               const isSpecialized = specializedIds.includes(skill.id);

               return (
                  <SkillCard 
                    key={skill.id}
                    skill={skill}
                    mode={activeTab === 'all' ? 'discovery' : 'specialization'}
                    isSpecialized={isSpecialized}
                    completedModules={completedCount}
                    totalModules={roadmap.length}
                    onAdd={(e) => { e.stopPropagation(); toggleSpecialization(skill.id, skill.skillName); }}
                    onRemove={(e) => { e.stopPropagation(); toggleSpecialization(skill.id, skill.skillName); }}
                    onViewRoadmap={() => {
                       setSelectedSkill(skill);
                       setShowRoadmap(true);
                    }}
                    onContinue={() => {
                        setSelectedSkill(skill);
                        setShowRoadmap(true);
                    }}
                  />
               );
            })}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center text-center space-y-6 bg-slate-50/50 rounded-[4rem] border-2 border-dashed border-slate-100 transition-all">
            <div className="w-24 h-24 bg-white rounded-[3rem] flex items-center justify-center text-slate-200 shadow-sm">
                <Search className="w-10 h-10" />
            </div>
            <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Catalog Node Missing</h3>
                <p className="text-slate-400 font-bold max-w-sm">No expertise modules match your criteria in the matrix scan.</p>
            </div>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory(''); setActiveTab('all'); }}
              className="h-16 px-10 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all"
            >
              Reset Matrix Registry
            </button>
          </div>
        )}
      </div>

      <RoadmapModal 
        isOpen={showRoadmap}
        onClose={() => setShowRoadmap(false)}
        skill={selectedSkill}
        roadmap={selectedSkill ? getRoadmapForSkill(selectedSkill) : []}
        onToggleStep={(stepId) => selectedSkill && updateCompletion(selectedSkill.id, stepId)}
        onFindMentor={() => {
           if (selectedSkill) navigate(`/mentors?skill=${selectedSkill.skillName}`);
        }}
      />

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-drop-in border border-white/20" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-10 text-left">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingSkill ? 'Refine Skill' : 'Deploy Skill'}</h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Matrix Initialization</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-8 text-left">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Standardized Name</label>
                <div className="relative">
                  <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="e.g. Next.js 14" 
                    className="w-full h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] pl-16 pr-6 outline-none focus:border-primary-600 focus:bg-white transition-all font-black text-slate-900"
                    value={formData.skillName}
                    onChange={e => setFormData(p => ({ ...p, skillName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Knowledge Group</label>
                <div className="relative">
                  <span className="material-icons absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 text-xl">category</span>
                  <input 
                    type="text" 
                    placeholder="e.g. Frontend Architecture" 
                    className="w-full h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] pl-16 pr-6 outline-none focus:border-primary-600 focus:bg-white transition-all font-black text-slate-900"
                    value={formData.category}
                    onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Entry Description</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-8 py-6 outline-none focus:border-primary-600 focus:bg-white transition-all font-bold text-slate-900 min-h-[140px] resize-none"
                  placeholder="Internal notes/specifications..."
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                ></textarea>
              </div>

              <button 
                onClick={async () => {
                  if (editingSkill) await updateSkill({ id: editingSkill.id, skill: formData });
                  else await createSkill(formData);
                  setShowForm(false);
                }}
                disabled={!formData.skillName || isSkillSaving}
                className="w-full h-20 bg-primary-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {isSkillSaving ? <Loader2 className="animate-spin w-8 h-8" /> : editingSkill ? 'Synchronize Data' : 'Initialize Deployment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistence Success Toast */}
      <AnimatePresence mode="wait">
        {toastMessage && (
          <motion.div 
            key="toast"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-12 right-12 bg-slate-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl z-[100] border border-white/10 flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
               <Check size={20} />
            </div>
            <p className="text-[12px] font-black uppercase tracking-widest">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
