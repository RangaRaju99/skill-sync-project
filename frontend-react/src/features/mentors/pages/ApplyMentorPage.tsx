import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplyMentor, useMyMentorProfile } from '@/hooks/useMentors';
import { useSkills, groupSkillsByCategory } from '@/hooks/useSkills';
import { useAuthStore } from '@/store/authStore';
import { Loader2, Rocket, ShieldCheck, Search, X, CheckCircle2, DollarSign, Clock, Layout } from 'lucide-react';

export default function ApplyMentorPage() {
  const navigate = useNavigate();
  const { addRole } = useAuthStore();
  const { data: myProfile, isLoading: isCheckingProfile } = useMyMentorProfile();
  const { data: skillsData } = useSkills();
  const { mutateAsync: apply, isPending: isApplying } = useApplyMentor();

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [form, setForm] = useState({ yearsOfExperience: 0, hourlyRate: 0, bio: '' });

  const groupedSkills = useMemo(() => skillsData ? groupSkillsByCategory(skillsData) : [], [skillsData]);

  const filteredCategories = useMemo(() => {
    const q = skillSearch.toLowerCase().trim();
    if (!q) return groupedSkills;
    return groupedSkills.map(cat => ({
      ...cat,
      skills: cat.skills.filter(s => s.name.toLowerCase().includes(q))
    })).filter(cat => cat.skills.length > 0);
  }, [groupedSkills, skillSearch]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const isFormValid = selectedSkills.length > 0 && form.yearsOfExperience >= 0 && form.hourlyRate >= 5 && form.hourlyRate <= 500 && form.bio.length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSkills.length === 0) {
      alert('Please select at least one skill from the list below.');
      return;
    }
    if (form.bio.length < 10) {
      alert('Bio must be at least 10 characters long.');
      return;
    }
    if (form.hourlyRate < 5) {
      alert('Hourly rate must be at least ₹5.');
      return;
    }
    if (!isFormValid) return;
    try {
      await apply({
        specialization: selectedSkills.join(', '),
        yearsOfExperience: form.yearsOfExperience,
        hourlyRate: form.hourlyRate,
        bio: form.bio
      });
      addRole('ROLE_MENTOR');
    } catch (err: any) {
      console.error('Failed to apply:', err);
      const msg = err.response?.data?.message || 'Application failed. Please check your inputs.';
      alert(msg);
    }
  };

  const statusInfo = (status: string) => {
    const maps: Record<string, any> = {
      'PENDING': { bg: 'bg-amber-500', text: 'text-amber-600', icon: <Clock className="w-8 h-8 text-white" />, msg: "Our curators are reviewing your profile. We'll update you here soon." },
      'APPROVED': { bg: 'bg-emerald-500', text: 'text-emerald-600', icon: <ShieldCheck className="w-8 h-8 text-white" />, msg: "Welcome to the inner circle! Your mentor capabilities are now fully unlocked." },
      'REJECTED': { bg: 'bg-red-500', text: 'text-red-600', icon: <X className="w-8 h-8 text-white" />, msg: "Your application was declined. You can re-apply once you have more experience." }
    };
    return maps[status] || maps['PENDING'];
  };

  if (isCheckingProfile) {
    return (
      <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing Records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-12 animate-fade-in font-sans mt-4 text-left">
      <button 
        onClick={() => navigate('/mentors')}
        className="flex items-center gap-2 text-slate-400 hover:text-primary-600 font-bold text-xs uppercase tracking-widest transition-all mb-12"
      >
        <span className="material-icons text-sm">arrow_back</span>
        Back to Expert Directory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left: Benefits & Branding */}
        <div className="lg:col-span-5 space-y-10 sticky top-24">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-primary-200">
            <Rocket className="w-10 h-10" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">
              Elevate your career as a <span className="text-primary-600 decoration-primary-200 underline underline-offset-8">Mentor</span>
            </h1>
            <p className="text-slate-500 text-xl font-bold leading-relaxed max-w-md">
              Monetize your expertise, inspire others, and join a global network of top-tier professionals.
            </p>
          </div>

          <div className="space-y-8">
            {[
              { icon: <DollarSign className="w-5 h-5" />, title: "Monetize Skillsets", desc: "Turn your experience into a consistent revenue stream with hourly sessions." },
              { icon: <Layout className="w-5 h-5" />, title: "Global Impact", desc: "Connect with students worldwide and bridge the professional gap." },
              { icon: <ShieldCheck className="w-5 h-5" />, title: "Verified Prestige", desc: "Receive an official verification badge increasing trust and visibility." }
            ].map((b, i) => (
              <div key={i} className="flex gap-6 group">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:border-primary-100 transition-all shadow-sm">
                  {b.icon}
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-800 uppercase tracking-tighter">{b.title}</h4>
                  <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-xs">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 bg-emerald-50/50 border border-emerald-100 rounded-[2.5rem] flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            <p className="text-[11px] font-black text-emerald-700 uppercase tracking-[0.1em] leading-relaxed">
              Fast approval cycle: Our curators review applications within 48 hours.
            </p>
          </div>
        </div>

        {/* Right: Interaction Area */}
        <div className="lg:col-span-7">
          {myProfile ? (
            <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl animate-drop-in text-center space-y-12">
              <div className="space-y-6">
                <div className={`w-24 h-24 mx-auto rounded-[2.5rem] flex items-center justify-center shadow-2xl ${statusInfo(myProfile.status).bg} shadow-primary-200`}>
                  {statusInfo(myProfile.status).icon}
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase italic">Application {myProfile.status}</h2>
                  <p className="text-slate-500 font-bold text-lg px-12 leading-relaxed">{statusInfo(myProfile.status).msg}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pb-2">
                {[
                  { label: "Internal Status", val: myProfile.status, color: statusInfo(myProfile.status).text },
                  { label: "Hourly Rate", val: `₹${myProfile.hourlyRate}/hr` },
                  { label: "Experience", val: `${myProfile.yearsOfExperience} Years` },
                  { label: "Timestamp", val: new Date(myProfile.createdAt).toLocaleDateString() }
                ].map((s, i) => (
                  <div key={i} className="bg-slate-50/80 p-6 rounded-[2rem] border border-slate-100 text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className={`text-lg font-black ${s.color || 'text-slate-900'}`}>{s.val}</p>
                  </div>
                ))}
              </div>

              {myProfile.status === 'APPROVED' && (
                <button onClick={() => navigate('/admin')} className="w-full h-20 bg-primary-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-primary-100 hover:scale-[1.02] active:scale-95 transition-all">
                  Launch Dashboard
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl animate-drop-in space-y-12">
              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                    <Layout className="w-6 h-6 text-primary-600" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Domain Calibration</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                      {selectedSkills.map(s => (
                        <div key={s} className="bg-indigo-600 text-white py-2 pl-4 pr-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-indigo-100 animate-fade-in group">
                          {s}
                          <button type="button" onClick={() => toggleSkill(s)} className="bg-indigo-700/50 p-1 rounded-lg hover:bg-white hover:text-indigo-600 transition-all">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="relative group">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-primary-600 transition-colors" />
                      <input 
                        value={skillSearch}
                        onChange={e => setSkillSearch(e.target.value)}
                        placeholder="Scan for specialized skills (e.g. Kubernetes, Figma)..." 
                        className="w-full h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] pl-16 pr-6 outline-none focus:border-primary-600 focus:bg-white transition-all font-bold text-slate-900"
                      />
                    </div>

                    <div className="max-h-[320px] overflow-y-auto space-y-8 pr-4 custom-scrollbar rounded-2xl border border-slate-50/50 p-4">
                      {filteredCategories.map(cat => (
                        <div key={cat.category} className="space-y-4">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] pl-1">{cat.category}</p>
                          <div className="flex flex-wrap gap-2.5">
                            {cat.skills.map(s => {
                              const active = selectedSkills.includes(s.name);
                              return (
                                <button 
                                  key={s.id}
                                  type="button" 
                                  onClick={() => toggleSkill(s.name)}
                                  className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all active:scale-95 ${active ? 'bg-primary-600 text-white border-primary-600 shadow-xl shadow-primary-100' : 'bg-white border-slate-100 text-slate-400 hover:border-primary-200'}`}
                                >
                                  {s.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                    <DollarSign className="w-6 h-6 text-primary-600" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Operational Parameters</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Practice Span (Yrs)</label>
                      <input 
                        type="number" 
                        value={form.yearsOfExperience || ''}
                        onChange={e => setForm(p => ({ ...p, yearsOfExperience: Number(e.target.value) }))}
                        className="w-full h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] px-8 outline-none focus:border-primary-600 focus:bg-white transition-all font-black text-slate-900" 
                        placeholder="8" 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Hourly Equity (₹)</label>
                      <input 
                        type="number" 
                        value={form.hourlyRate || ''}
                        onChange={e => setForm(p => ({ ...p, hourlyRate: Number(e.target.value) }))}
                        className="w-full h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] px-8 outline-none focus:border-primary-600 focus:bg-white transition-all font-black text-slate-900" 
                        placeholder="Max 500" 
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Strategic Bio / Pitch</label>
                    <textarea 
                      value={form.bio}
                      onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                      rows={4} 
                      className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-8 outline-none focus:border-primary-600 focus:bg-white transition-all font-bold text-slate-900 resize-none leading-relaxed" 
                      placeholder="Why should students choose you? (min 10 chars)"
                    ></textarea>
                    <div className="flex justify-end pr-2">
                       <span className={`text-[10px] font-black uppercase tracking-widest ${form.bio.length < 10 ? 'text-red-400' : 'text-slate-300'}`}>
                          {form.bio.length} Base Units {form.bio.length < 10 && "· Below Threshold"}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    disabled={isApplying}
                    type="submit"
                    className={`w-full h-20 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${isFormValid ? 'bg-primary-600 shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1' : 'bg-slate-300 cursor-pointer hover:bg-slate-400'}`}
                  >
                    {isApplying ? <Loader2 className="w-8 h-8 animate-spin" /> : <Rocket className="w-6 h-6" />}
                    Initialize Application
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
