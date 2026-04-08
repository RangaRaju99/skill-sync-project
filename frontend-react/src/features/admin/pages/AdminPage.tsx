import { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useSkills } from '@/hooks/useSkills';
import { Plus, Search, Shield, User, Trash2, Edit2, ShieldCheck, Activity, Globe, Zap, Settings, BarChart3, Database, Loader2, X, BookOpen } from 'lucide-react';
import type { MentorDto } from '@/hooks/useMentors';
import type { SkillDto, CreateSkillRequest } from '@/hooks/useSkills';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'mentors' | 'skills'>('mentors');
  const { 
    pendingMentors, isPendingMentorsLoading, approveMentor, rejectMentor,
    createSkill, updateSkill, deleteSkill, isSkillSaving 
  } = useAdmin();
  const { data: skills, isLoading: isSkillsLoading } = useSkills();
  const [filter, setFilter] = useState('');
  
  // Skill Modal State
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillDto | null>(null);
  const [skillFormData, setSkillFormData] = useState<CreateSkillRequest>({
    skillName: '',
    category: '',
    description: ''
  });

  const stats = [
    { label: 'Pending Experts', value: pendingMentors?.length || 0, icon: <User className="w-5 h-5" />, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Node Capacity', value: skills?.length || 0, icon: <Database className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'System Uptime', value: '99.9%', icon: <Activity className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600' },
    { label: 'Global Reach', value: '124+', icon: <Globe className="w-5 h-5" />, color: 'bg-violet-50 text-violet-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-12 animate-fade-in font-sans mt-4 text-left">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <Shield className="w-8 h-8 text-primary-600" />
             <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-tight uppercase italic">
               System <span className="text-primary-600">Command</span>
             </h1>
          </div>
          <p className="text-slate-500 font-bold text-lg">Central hub for operational oversight and domain management.</p>
        </div>
        
        <div className="flex gap-3 p-1.5 bg-slate-100/50 rounded-[1.5rem] w-fit">
           <button 
             onClick={() => setActiveTab('mentors')}
             className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeTab === 'mentors' ? 'bg-white shadow-xl text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             <Zap className="w-4 h-4" /> Pending Registry
           </button>
           <button 
             onClick={() => setActiveTab('skills')}
             className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeTab === 'skills' ? 'bg-white shadow-xl text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             <Database className="w-4 h-4" /> Domain Matrix
           </button>
        </div>
      </div>

      {statSection(stats)}

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden animate-drop-in">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
           <div className="relative group max-w-md w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-primary-600 transition-colors" />
              <input 
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder={activeTab === 'mentors' ? "Search human capital..." : "Filter domain nodes..."}
                className="w-full h-16 bg-white border border-slate-100 rounded-[1.5rem] pl-16 pr-8 outline-none focus:border-primary-600 transition-all font-bold text-slate-900"
              />
           </div>
           
           <button 
             onClick={() => {
               if (activeTab === 'skills') {
                 setEditingSkill(null);
                 setSkillFormData({ skillName: '', category: '', description: '' });
                 setShowSkillForm(true);
               }
             }}
             className="h-16 px-10 bg-primary-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-4"
           >
              <Plus className="w-5 h-5" /> {editingSkill ? 'Update Data' : `Initialize ${activeTab === 'mentors' ? 'Node' : 'Domain'}`}
           </button>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'mentors' ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Expert Entity</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Specialization Matrix</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status Vector</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Operational Rate</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Command</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(isPendingMentorsLoading) ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-10 py-8"><div className="h-8 bg-slate-100 rounded-xl w-full"></div></td>
                    </tr>
                  ))
                ) : (
                  pendingMentors?.filter((m: MentorDto) => m.specialization.toLowerCase().includes(filter.toLowerCase())).map((m: MentorDto) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-8">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black group-hover:scale-110 transition-transform">
                               {m.specialization.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="space-y-0.5">
                               <p className="text-sm font-black text-slate-900 leading-none">Expert Node #{m.id}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Verification</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-10 py-8">
                         <span className="bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-100 group-hover:border-primary-100 transition-colors">
                            {m.specialization}
                         </span>
                      </td>
                      <td className="px-10 py-8">
                         <div className={`flex items-center gap-2 ${m.availabilityStatus === 'APPROVED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                            <div className={`w-2 h-2 rounded-full animate-pulse ${m.availabilityStatus === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{m.availabilityStatus}</span>
                         </div>
                      </td>
                      <td className="px-10 py-8">
                         <p className="text-sm font-black text-slate-900 tracking-tighter italic">₹{m.hourlyRate}/Hr</p>
                      </td>
                      <td className="px-10 py-8">
                         <div className="flex gap-2">
                           <button 
                             onClick={() => approveMentor(m.id)}
                             className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                             title="Approve Expert"
                           >
                              <ShieldCheck className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => {
                                if (confirm('Reject this application?')) rejectMentor(m.id);
                             }}
                             className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                             title="Reject Application"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Domain Node</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Classifier</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Creation Vector</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Visibility</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Command</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isSkillsLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-10 py-8"><div className="h-8 bg-slate-100 rounded-xl w-full"></div></td>
                    </tr>
                  ))
                ) : (
                  skills?.filter((s: SkillDto) => s.skillName.toLowerCase().includes(filter.toLowerCase())).map((s: SkillDto) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-8">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary-50 rounded-[0.8rem] flex items-center justify-center text-primary-600 font-black text-xs uppercase tracking-tighter">
                               {s.skillName.slice(0, 2).toUpperCase()}
                            </div>
                            <p className="text-sm font-black text-slate-900 tracking-tight uppercase italic">{s.skillName}</p>
                         </div>
                      </td>
                      <td className="px-10 py-8">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.category || 'GENERAL'}</span>
                      </td>
                      <td className="px-10 py-8">
                         <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{new Date().toLocaleDateString()}</p>
                      </td>
                      <td className="px-10 py-8">
                         <div className="flex items-center gap-2 text-primary-500">
                            <Globe className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">Matrix Universal</span>
                         </div>
                      </td>
                      <td className="px-10 py-8">
                         <div className="flex gap-2">
                           <button 
                             onClick={() => {
                               setEditingSkill(s);
                               setSkillFormData({ skillName: s.skillName, category: s.category || '', description: s.description || '' });
                               setShowSkillForm(true);
                             }}
                             className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                             title="Edit Domain"
                           >
                             <Edit2 className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => {
                               if (confirm(`Decommission ${s.skillName} from matrix?`)) {
                                 deleteSkill(s.id);
                               }
                             }}
                             className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                             title="Delete Domain"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-10 p-12 bg-slate-900 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
         <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-[1.8rem] flex items-center justify-center border border-white/20 backdrop-blur-md">
               <Settings className="w-8 h-8 text-white animate-spin-slow" />
            </div>
            <div>
               <h4 className="text-xl font-black text-white tracking-tight uppercase italic">Core Orchestration</h4>
               <p className="text-[9px] font-black text-primary-400 uppercase tracking-[0.3em] mt-1">Status: Operational · Matrix: v25.4.0</p>
            </div>
         </div>
         <button className="relative z-10 h-16 px-12 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all active:scale-95 shadow-xl">
            System Reboot
         </button>
      </div>

      {showSkillForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowSkillForm(false)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-drop-in border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-10 text-left">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingSkill ? 'Refine Skill' : 'Deploy Skill'}</h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Matrix Initialization Vector</p>
              </div>
              <button onClick={() => setShowSkillForm(false)} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all">
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
                    value={skillFormData.skillName}
                    onChange={e => setSkillFormData((p: any) => ({ ...p, skillName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Knowledge Group</label>
                <div className="relative">
                  <Activity className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="e.g. Frontend Architecture" 
                    className="w-full h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] pl-16 pr-6 outline-none focus:border-primary-600 focus:bg-white transition-all font-black text-slate-900"
                    value={skillFormData.category}
                    onChange={e => setSkillFormData((p: any) => ({ ...p, category: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Entry Description</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-8 py-6 outline-none focus:border-primary-600 focus:bg-white transition-all font-bold text-slate-900 min-h-[120px] resize-none"
                  placeholder="Internal notes/specifications..."
                  value={skillFormData.description}
                  onChange={e => setSkillFormData((p: any) => ({ ...p, description: e.target.value }))}
                ></textarea>
              </div>

              <button 
                onClick={async () => {
                  if (editingSkill) await updateSkill({ id: editingSkill.id, skill: skillFormData });
                  else await createSkill(skillFormData);
                  setShowSkillForm(false);
                }}
                disabled={!skillFormData.skillName || isSkillSaving}
                className="w-full h-20 bg-primary-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {isSkillSaving ? <Loader2 className="animate-spin w-8 h-8" /> : editingSkill ? 'Synchronize Data' : 'Initialize Deployment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function statSection(stats: any[]) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((s: any, i: number) => (
        <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all duration-500">
           <div className="flex items-center justify-between mb-4">
              <div className={`${s.color} p-3 rounded-xl shadow-sm`}>{s.icon}</div>
              <BarChart3 className="w-4 h-4 text-slate-200" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight">{s.value}</h4>
           </div>
        </div>
      ))}
    </div>
  );
}
